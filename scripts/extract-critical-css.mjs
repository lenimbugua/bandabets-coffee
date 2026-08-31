// Extracts the critical (above-the-fold) CSS for a fixed set of SSR routes
// and writes the union as a single, committed artifact:
// server/assets/critical.css. Task 2 inlines that file into a <style> tag
// injected at the very top of <head> so first paint doesn't wait on the
// deferred/non-critical stylesheet round trip.
//
// Pipeline:
//   1. Sanity-check a fresh `pnpm build` exists (.output/public/_nuxt/entry.*.css
//      + .output/server/index.mjs).
//   2. Load .env (KEY= value, space after "=") into process.env so the child
//      server process can resolve NUXT_PUBLIC_* / API base URLs the same way
//      `pnpm dev`/`pnpm preview` would.
//   3. Boot .output/server/index.mjs on port 3131 and poll it until ready.
//   4. Fetch the SSR HTML for a handful of representative routes.
//   5. Run Beasties per route to compute which rules from the page's own
//      <link rel="stylesheet"> are actually used above the fold.
//   6. Union + dedupe the extracted rules across routes, write the artifact,
//      print a byte-budget summary, and enforce a 15 KB gzip ceiling.
//
// Usage: pnpm critical:extract (requires a fresh `pnpm build` first)
import {
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
  globSync,
} from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { spawn } from "node:child_process";
import { gzipSync } from "node:zlib";
import Beasties from "beasties";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = 3131;
const ROUTES = ["/", "/promotions", "/share-bets", "/login", "/leagues"];
const GZIP_BUDGET_BYTES = 15 * 1024;
// This app's design-system `[data-theme="light"]` token overrides
// (app/assets/css/style.css's Semantics layer) live inside Tailwind's
// `@layer utilities { ... }` in the built entry.*.css and don't match any
// element in the SSR'd DOM (dark is the default theme — see CLAUDE.md's
// Design System section), so Beasties' normal "does this selector match
// something in the document" critical-path analysis would never keep them
// on its own. `allowRules` (verified against node_modules/beasties/README.md
// and, empirically, against the actual extracted output — see the report)
// force-keeps them regardless: `rule.filterSelectors` runs `allowRules`
// per selector *before* falling back to DOM matching, and a `@layer`
// wrapper doesn't block that — every `[data-theme=light]` rule in
// entry.*.css does come through. extractLightThemeBlocks() below is kept
// as a redundant, defense-in-depth fallback (it re-derives the same rules
// directly from entry.*.css and is a pure no-op once dedup runs, since
// everything it finds is already present via allowRules) rather than the
// load-bearing mechanism.
const LIGHT_THEME_SELECTOR_RE = /\[data-theme=(?:"|')?light(?:"|')?\]/;

function fail(message) {
  console.error(`[critical:extract] ${message}`);
  process.exit(1);
}

// --- Step 1: sanity-check a fresh build exists ------------------------------
const publicDir = join(rootDir, ".output", "public");
const serverEntry = join(rootDir, ".output", "server", "index.mjs");
const entryCssMatches = globSync(join(publicDir, "_nuxt", "entry.*.css"));
if (entryCssMatches.length === 0 || !existsSync(serverEntry)) {
  fail(
    "no .output/public/_nuxt/entry.*.css and/or .output/server/index.mjs found — run `pnpm build` first.",
  );
}
const entryCssPath = entryCssMatches[0];
const entryCssBasename = entryCssPath.split("/").pop();

// --- Step 2: load .env (KEY= value, space after "=") into process.env -------
// Same "loop-load, don't `source`" approach as this repo's other
// env-reading tooling: .env uses `KEY= value` with a space after "=", which
// breaks a naive `source .env` (the shell treats the leading space as part
// of a new word). Read + parse it ourselves instead, only setting keys that
// aren't already set in the environment.
function loadDotEnv(path) {
  if (!existsSync(path)) return;
  const lines = readFileSync(path, "utf8").split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = line.indexOf("=");
    if (eqIndex === -1) continue;
    const key = line.slice(0, eqIndex).trim();
    if (!key || process.env[key] !== undefined) continue;
    const value = line.slice(eqIndex + 1).replace(/^ /, "");
    process.env[key] = value;
  }
}
loadDotEnv(join(rootDir, ".env"));

// --- brace-aware top-level CSS rule splitter --------------------------------
// Splits a CSS string into top-level units, keeping each unit intact
// (a plain `selector{...}` rule, or a whole `@media`/`@supports`/`@layer{...}`
// at-rule including everything nested inside it). Skips over `/* ... */`
// comments and quoted strings so braces inside them don't desync the depth
// counter.
function splitTopLevelRules(css) {
  const rules = [];
  let buf = "";
  let depth = 0;
  let i = 0;
  const n = css.length;
  while (i < n) {
    const ch = css[i];
    if (ch === "/" && css[i + 1] === "*") {
      const end = css.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? n : end + 2;
      buf += css.slice(i, commentEnd);
      i = commentEnd;
      continue;
    }
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < n && css[j] !== quote) {
        if (css[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, n);
      buf += css.slice(i, j);
      i = j;
      continue;
    }
    if (ch === "{") {
      depth++;
      buf += ch;
      i++;
      continue;
    }
    if (ch === "}") {
      depth = Math.max(0, depth - 1);
      buf += ch;
      i++;
      if (depth === 0) {
        const trimmed = buf.trim();
        if (trimmed) rules.push(trimmed);
        buf = "";
      }
      continue;
    }
    if (ch === ";" && depth === 0) {
      buf += ch;
      const trimmed = buf.trim();
      if (trimmed) rules.push(trimmed);
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  const rest = buf.trim();
  if (rest) rules.push(rest);
  return rules;
}

// Defense-in-depth fallback for LIGHT_THEME_SELECTOR_RE / allowRules above:
// recursively pulls every `[data-theme="light"]` (or unquoted
// `[data-theme=light]`, which is what the minified build output actually
// uses) leaf rule directly out of entry.*.css's own text, regardless of how
// deep it's nested under `@supports`/`@media`/`@layer`, and adds any that
// aren't already in the union via allowRules (in practice: none — this is a
// no-op safety net, not the primary mechanism). `@layer` wrappers are unwrapped
// (their surviving children are spliced up as top-level rules) rather than
// preserved: un-layered CSS always wins the cascade over layered CSS
// regardless of layer declaration order, so dropping the `@layer` wrapper
// here only ever makes these token overrides take effect *more* reliably,
// and since they're static custom-property values identical to what the
// real (layered) stylesheet will declare once it loads, there's no
// observable behavior difference — just resilience against this file's
// `@layer` wrapper ever accidentally establishing a bogus early cascade
// order for names the real stylesheet declares later. Other at-rule
// wrappers (`@supports`, `@media`) are preserved around only their
// surviving children, since those affect *whether* a rule applies, not
// cascade priority among unlayered rules.
function extractLightThemeBlocks(css) {
  function filterChunk(chunk) {
    const braceIndex = chunk.indexOf("{");
    if (braceIndex === -1) return [];
    const head = chunk.slice(0, braceIndex).trim();
    const closeIndex = chunk.lastIndexOf("}");
    const body = chunk.slice(braceIndex + 1, closeIndex);
    if (head.startsWith("@")) {
      const kept = splitTopLevelRules(body).flatMap(filterChunk);
      if (kept.length === 0) return [];
      if (/^@layer\b/i.test(head)) return kept;
      return [`${head}{${kept.join("")}}`];
    }
    return LIGHT_THEME_SELECTOR_RE.test(head) ? [chunk.trim()] : [];
  }
  return splitTopLevelRules(css).flatMap(filterChunk);
}

// --- Step 3: boot the built server on port 3131 ------------------------------
async function waitForServer(url, timeoutMs, childProcess, getOutput) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (childProcess.exitCode !== null || childProcess.signalCode !== null) {
      throw new Error(
        `server process exited before becoming ready (code=${childProcess.exitCode}, signal=${childProcess.signalCode}):\n${getOutput()}`,
      );
    }
    try {
      const res = await fetch(url);
      if (res.ok || res.status < 500) return;
    } catch {
      // not up yet
    }
    await new Promise((resolve) => setTimeout(resolve, 300));
  }
  throw new Error(
    `server did not respond at ${url} within ${timeoutMs}ms:\n${getOutput()}`,
  );
}

const server = spawn(process.execPath, [serverEntry], {
  cwd: rootDir,
  env: { ...process.env, PORT: String(PORT), NITRO_PORT: String(PORT) },
  stdio: ["ignore", "pipe", "pipe"],
});
let serverOutput = "";
server.stdout.on("data", (chunk) => (serverOutput += chunk));
server.stderr.on("data", (chunk) => (serverOutput += chunk));

async function stopServer() {
  if (server.exitCode !== null || server.signalCode !== null) return;
  server.kill();
  await new Promise((resolve) => {
    server.once("exit", resolve);
    setTimeout(resolve, 5000);
  });
  if (server.exitCode === null && server.signalCode === null) {
    server.kill("SIGKILL");
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
}

// fail() above calls process.exit(1) directly, which is only safe to use
// before the server child process exists (Step 1's build check). Once the
// server is running, exiting synchronously would skip the `finally` below
// and leak the child process on port 3131 — so everything from here on
// throws instead, and is turned into exit code 1 only after the server has
// been stopped.
let exitCode = 0;
try {
  await waitForServer(
    `http://localhost:${PORT}/`,
    30_000,
    server,
    () => serverOutput,
  );

  // --- Step 4 + 5: fetch each route's SSR HTML and run Beasties -------------
  const routeResults = [];
  const seenRuleStrings = new Set();
  const unionRules = [];

  for (const route of ROUTES) {
    const res = await fetch(`http://localhost:${PORT}${route}`);
    if (!res.ok) {
      throw new Error(
        `GET ${route} returned ${res.status} — is the build healthy?`,
      );
    }
    const html = await res.text();
    // Only harvest from the app's own critical bundle (entry.*.css). The
    // page also links public/css/noncritical.css (a *different* stylesheet
    // a previous perf round deliberately deferred via
    // media="print" onload="this.media='all'" — see nuxt.config.js). Leaving
    // that <link> in would let Beasties re-harvest content that was already
    // intentionally pushed out of the critical path, working against that
    // earlier optimization. Stripping it here doesn't change what Beasties
    // can see of entry.*.css at all — it only removes the second, unrelated
    // stylesheet from consideration.
    const htmlEntryOnly = html.replace(
      /<link[^>]*href="\/css\/noncritical\.css[^"]*"[^>]*>/g,
      "",
    );

    const originalStyleContents = new Set(
      [...htmlEntryOnly.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(
        (m) => m[1],
      ),
    );

    const beasties = new Beasties({
      path: publicDir,
      external: true,
      pruneSource: false,
      reduceInlineStyles: false,
      // Force-keep [data-theme="light"] rules even though nothing in this
      // particular SSR'd DOM currently carries data-theme="light" (dark is
      // the default theme — see CLAUDE.md's Design System section) and
      // Beasties' normal critical-path analysis would otherwise drop them
      // as unused — a client-side theme toggle during the
      // deferred-stylesheet window must not go unstyled. Verified this
      // actually retains all of entry.*.css's [data-theme=light] rules,
      // including ones nested under `@layer utilities`/`@supports`: see the
      // report for how this was checked. extractLightThemeBlocks() below is
      // a redundant defense-in-depth fallback, not compensating for a gap.
      allowRules: [LIGHT_THEME_SELECTOR_RE],
      logLevel: "silent",
    });

    let processed;
    try {
      processed = await beasties.process(htmlEntryOnly);
    } catch (err) {
      throw new Error(
        `Beasties failed processing ${route}: ${err?.message || err}`,
        {
          cause: err,
        },
      );
    }

    const newStyleContent = [
      ...processed.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g),
    ]
      .map((m) => m[1])
      .filter((content) => !originalStyleContents.has(content))
      .join("\n");

    const routeRules = splitTopLevelRules(newStyleContent);
    let addedForRoute = 0;
    for (const rule of routeRules) {
      if (seenRuleStrings.has(rule)) continue;
      seenRuleStrings.add(rule);
      unionRules.push(rule);
      addedForRoute++;
    }

    const routeBytes = Buffer.byteLength(newStyleContent, "utf8");
    routeResults.push({ route, routeBytes, newRuleCount: addedForRoute });
  }

  // --- Step 5 fallback: [data-theme="light"] blocks Beasties dropped --------
  const entryCss = readFileSync(entryCssPath, "utf8");
  const lightThemeBlocks = extractLightThemeBlocks(entryCss);
  let lightThemeAdded = 0;
  for (const block of lightThemeBlocks) {
    if (seenRuleStrings.has(block)) continue;
    seenRuleStrings.add(block);
    unionRules.push(block);
    lightThemeAdded++;
  }

  // --- Step 6: write the artifact ---------------------------------------------
  const generatedAt = new Date().toISOString();
  const header = `/* generated by scripts/extract-critical-css.mjs from ${entryCssBasename} on ${generatedAt}; regenerate with: pnpm critical:extract (requires a fresh pnpm build) */\n`;
  const body = unionRules.join("\n");
  const artifact = header + body + "\n";

  if (/<\/style/i.test(artifact)) {
    throw new Error(
      "generated critical.css contains a literal `</style` substring — refusing to write it (Task 2 inlines this into a <style> tag; this would break out of it).",
    );
  }

  const rawBytes = Buffer.byteLength(artifact, "utf8");
  const gzipBytes = gzipSync(Buffer.from(artifact, "utf8")).length;

  console.log("[critical:extract] per-route critical bytes:");
  for (const r of routeResults) {
    console.log(
      `  ${r.route.padEnd(14)} ${String(r.routeBytes).padStart(7)} B raw   (+${r.newRuleCount} new rules)`,
    );
  }
  console.log(
    `  [data-theme=light] fallback (from ${entryCssBasename}): +${lightThemeAdded} rules`,
  );
  console.log(
    `[critical:extract] union: ${rawBytes} B raw, ${gzipBytes} B gzip (${unionRules.length} deduped rules)`,
  );

  if (gzipBytes > GZIP_BUDGET_BYTES) {
    throw new Error(
      `union critical CSS is ${gzipBytes} B gzip, over the ${GZIP_BUDGET_BYTES} B budget — this means the route set or Beasties config is capturing too much (e.g. whole utility layers), not that the budget should be raised.`,
    );
  }

  const outPath = join(rootDir, "server", "assets", "critical.css");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, artifact, "utf8");
  console.log(`[critical:extract] wrote ${outPath}`);
} catch (err) {
  console.error(`[critical:extract] ${err?.message || err}`);
  exitCode = 1;
} finally {
  await stopServer();
}
process.exit(exitCode);
