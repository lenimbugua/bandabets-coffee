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
//   6. Union + dedupe the extracted rules across routes. `@layer utilities`
//      and `@layer base` get special handling: each route's copy of these
//      is a *whole* top-level unit that differs slightly route to route (a
//      different subset of Tailwind utilities/element resets is used per
//      page), so a naive whole-block dedup keeps every route's copy
//      whole — most of the artifact's bytes. Instead their INNER rules are
//      deduped individually and re-assembled into one `@layer utilities`
//      and one `@layer base` block, ordered to match entry.*.css's own
//      intra-layer rule order (Tailwind utilities are order-dependent —
//      see buildOrderedDedupedLayerBlock's comment). Everything else is
//      deduped as a whole top-level unit, first-seen order, as before.
//      Finally write the artifact, print a byte-budget summary, and
//      enforce a 15 KB gzip ceiling.
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
// Fix round 3: added /terms-and-conditions (SSR, indexable — was missing
// legal-page typography utilities like list-disc/pl-6/max-w-5xl/
// text-blue-600, visibly unstyled on cold first paint) and /match-details
// (see the fetch-status comment in the harvest loop below for why this
// literal path is expected to 404, and what it's actually harvesting).
const ROUTES = [
  "/",
  "/promotions",
  "/share-bets",
  "/login",
  "/leagues",
  "/terms-and-conditions",
  "/match-details",
];
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

// --- intra-layer dedup for @layer utilities / @layer base ------------------
// A given route's `@layer utilities{...}` (and `@layer base{...}`) is one
// *whole* top-level unit as far as splitTopLevelRules is concerned. Which
// Tailwind utilities/element resets a page actually uses differs slightly
// route to route, so that whole unit's text differs slightly route to
// route too — meaning a plain whole-unit dedup (comparing each route's
// entire `@layer utilities{...}` string against the others) essentially
// never finds an exact match, and every route's copy survives into the
// union intact. That was the bulk of this artifact's bytes before this
// fix. The rules below split those two layers' bodies into their own
// inner rules (with the same brace-aware splitTopLevelRules used
// everywhere else) and dedup *those*, then reassemble a single
// `@layer utilities{...}` / `@layer base{...}` block per layer.
//
// Rule text is compared via normalizeForComparison (whitespace-insensitive)
// rather than exact string equality: the KEPT rule text always comes from
// entry.*.css itself (see buildOrderedDedupedLayerBlock), never from
// Beasties' regenerated output, so the two sides of the comparison (a rule
// harvested from a route's Beasties output vs. that same rule as it
// appears in entry.*.css) only need to match on content, not on
// Beasties' own re-stringification whitespace — sidestepping any risk of
// Beasties' internal CSS printer reformatting a rule just enough that an
// exact-string comparison would miss it.
function normalizeForComparison(rule) {
  return rule.replace(/\s+/g, "");
}

// Splits a selector list on top-level commas — i.e. NOT commas nested
// inside `:is(...)`, `:where(...)`, `:not(...)`, attribute-selector
// brackets, or quoted attribute values (`[data-x="a,b"]`) — the same
// depth-tracking approach as splitTopLevelRules, just over `(`/`[` instead
// of `{`.
function splitSelectorList(selectorText) {
  const selectors = [];
  let buf = "";
  let depth = 0;
  let i = 0;
  const n = selectorText.length;
  while (i < n) {
    const ch = selectorText[i];
    if (ch === '"' || ch === "'") {
      const quote = ch;
      let j = i + 1;
      while (j < n && selectorText[j] !== quote) {
        if (selectorText[j] === "\\") j++;
        j++;
      }
      j = Math.min(j + 1, n);
      buf += selectorText.slice(i, j);
      i = j;
      continue;
    }
    if (ch === "(" || ch === "[") {
      depth++;
      buf += ch;
      i++;
      continue;
    }
    if (ch === ")" || ch === "]") {
      depth = Math.max(0, depth - 1);
      buf += ch;
      i++;
      continue;
    }
    if (ch === "," && depth === 0) {
      const trimmed = buf.trim();
      if (trimmed) selectors.push(trimmed);
      buf = "";
      i++;
      continue;
    }
    buf += ch;
    i++;
  }
  const rest = buf.trim();
  if (rest) selectors.push(rest);
  return selectors;
}

// Fix round 2: interaction-gated rules — `:hover`/`:active` and their
// Tailwind `group-hover:`/`peer-hover:` variant forms — can only ever take
// effect after a user starts interacting with the page, so they can never
// affect first paint/LCP. Task 2's review measured keeping them as a
// local LCP +220 ms / TBT +150 ms parse-cost regression (67 hover/
// group-hover rule occurrences, inside a `@layer utilities` that was 84%
// of the artifact's bytes) — pure dead weight the browser has to parse
// before the deferred stylesheet even lands. `:focus`/`:focus-visible` are
// deliberately NOT matched here: a keyboard user can tab into an
// interactive element and needs its focus styling before the deferred
// stylesheet arrives, unlike a mouse hover/click which can't happen until
// the page is already interactive.
//
// Tailwind v4 compiles a hover/active/group-hover/peer-hover variant class
// name with the variant's colon escaped in the class name itself (e.g.
// `.hover\:bg-accent`, `.group-hover\:translate-x-0\.5`), followed by the
// actual (unescaped) `:hover`/`:active` pseudo-class that gates it —
// group-hover/peer-hover specifically compile to something like
// `.group-hover\:X:is(:where(.group):hover *)`, which still contains a
// literal, unescaped `:hover`. Checking for both the escaped
// variant-prefix marker AND the bare pseudo-class (rather than either
// alone) is redundant by construction against today's Tailwind output,
// but keeps this robust to either shape changing independently in a
// future Tailwind version.
const INTERACTIVE_VARIANT_PREFIX_RE =
  /\b(?:hover|active|group-hover|peer-hover)\\:/;
const INTERACTIVE_PSEUDO_RE = /(?<!\\):(?:hover|active)\b/;
function isInteractionOnlySelector(selector) {
  return (
    INTERACTIVE_VARIANT_PREFIX_RE.test(selector) ||
    INTERACTIVE_PSEUDO_RE.test(selector)
  );
}

// Recursively flattens an array of top-level chunks (as splitTopLevelRules
// produces them) all the way down to leaf (single-selector){declarations}
// units, each individually re-wrapped in the exact chain of at-rule
// headers (`@media`/`@supports`/etc.) it was nested under. Comparing at
// any coarser granularity than this is unsafe, for two independent
// reasons Beasties' output can restructure relative to entry.*.css's own
// text:
//   1. Beasties' CSS printer (`compress: true` is the default) can
//      coalesce originally-*separate* same-condition at-rules — e.g. two
//      distinct `@media (hover:hover){...}` blocks placed at different
//      points in entry.*.css — into one combined block in its output.
//      Treating "one @media chunk" as one comparable unit (an earlier
//      version of this script did) meant a merged block from Beasties'
//      output would then match *neither* of entry.*.css's two separate
//      blocks, byte for byte or normalized — silently dropping every rule
//      inside both from the final artifact.
//   2. Beasties trims comma-separated selector *lists* down to only the
//      selectors that matched something in a given route's DOM. E.g.
//      entry.*.css has one combined rule
//      `.border,.border-0{border-style:var(--tw-border-style)}`; a route
//      that only uses `.border` gets Beasties output containing
//      `.border{border-style:var(--tw-border-style)}` alone — which never
//      matches the combined selector text on the entry.*.css side either
//      (verified: this was silently dropping ~45 genuinely-critical
//      utility rules, including plain ones like `.border` itself).
// Flattening every rule down to one-selector-per-unit, on both sides of
// the comparison (see getEntryLayerInnerRulesInOrder and the per-route
// harvest loop), sidesteps both regardless of how either side happens to
// group sibling rules or selectors. Splitting a `.a,.b{decl}` rule into
// adjacent `.a{decl}` / `.b{decl}` units is behaviorally identical per the
// CSS cascade (same specificity, same source position for each), so this
// only costs a little compactness (repeated declaration blocks / at-rule
// conditions), never correctness.
function flattenToLeafUnits(chunks) {
  const out = [];
  for (const chunk of chunks) {
    const braceIndex = chunk.indexOf("{");
    if (braceIndex === -1) {
      out.push(chunk); // bare statement, e.g. "@layer components;"
      continue;
    }
    const head = chunk.slice(0, braceIndex).trim();
    const body = chunk.slice(braceIndex + 1, chunk.lastIndexOf("}"));
    if (head.startsWith("@")) {
      for (const leaf of flattenToLeafUnits(splitTopLevelRules(body))) {
        out.push(`${head}{${leaf}}`);
      }
      continue;
    }
    const declBlock = `{${body}}`;
    for (const selector of splitSelectorList(head)) {
      // Fix round 2: drop hover/active-only selectors here — see the
      // comment above isInteractionOnlySelector. Filtering at this single
      // point (rather than after the union is built) automatically keeps
      // both sides of every comparison in this file in sync: neither the
      // per-route harvest nor entry.*.css's own ordering ever sees these
      // selectors, so there's nothing to separately reconcile afterward.
      if (isInteractionOnlySelector(selector)) continue;
      out.push(`${selector}${declBlock}`);
    }
  }
  return out;
}

// Pulls the leaf rules (see flattenToLeafUnits) of every top-level
// `@layer <layerName>{...}` block in `css` (there's normally exactly one
// per name in entry.*.css, but this concatenates all of them, in source
// order, just in case) as an ordered array of raw rule strings straight
// from `css` — i.e. entry.*.css's own text, not anything Beasties touched.
function getEntryLayerInnerRulesInOrder(css, layerName) {
  const layerHeadRe = new RegExp(`^@layer\\s+${layerName}\\b`, "i");
  const innerRules = [];
  for (const chunk of splitTopLevelRules(css)) {
    const braceIndex = chunk.indexOf("{");
    if (braceIndex === -1) continue; // e.g. a bare "@layer components;" statement
    const head = chunk.slice(0, braceIndex).trim();
    if (!layerHeadRe.test(head)) continue;
    const body = chunk.slice(braceIndex + 1, chunk.lastIndexOf("}"));
    innerRules.push(...flattenToLeafUnits(splitTopLevelRules(body)));
  }
  return innerRules;
}

// Tailwind's utility layer (and, to a lesser extent, base) is intra-layer
// source-order dependent — e.g. a later `.px-2{padding-inline:...}` can
// override an earlier `.p-4{padding:...}`'s inline padding at equal
// specificity purely because it comes later in the layer. Ordering the
// deduped union by first-seen-across-routes would scramble that (route 2's
// first new utility could easily be one that comes *before* one of route
// 1's utilities in entry.*.css). Instead: walk entry.*.css's OWN rule
// order for this layer once, and keep each of its rules that showed up in
// `harvestedNormalized` (the union of every route's harvested inner rules
// for this layer, keyed by normalizeForComparison) — this reproduces
// entry.*.css's exact intra-layer cascade order, filtered down to only the
// rules some route actually needed. Returns null if nothing was harvested.
function buildOrderedDedupedLayerBlock(
  layerName,
  entryCss,
  harvestedNormalized,
) {
  const entryInner = getEntryLayerInnerRulesInOrder(entryCss, layerName);
  const seenKeys = new Set();
  const kept = [];
  for (const rule of entryInner) {
    const key = normalizeForComparison(rule);
    if (seenKeys.has(key)) continue; // entry.*.css itself had an exact dup
    if (!harvestedNormalized.has(key)) continue; // no route needed this rule
    seenKeys.add(key);
    kept.push(rule);
  }
  return kept.length === 0 ? null : `@layer ${layerName}{${kept.join("")}}`;
}

// --- Step 3: boot the built server on port 3131 ------------------------------
// Port-3131 collision failure modes: if something else already holds 3131
// when Nitro's server tries to listen, Nitro/Node's own EADDRINUSE
// generally kills the child process almost immediately — that surfaces
// here via waitForServer's childProcess.exitCode/signalCode check below
// (fast, explicit failure) rather than the 30s timeout path. What this
// does NOT detect: a *stale foreign* server that's already listening on
// 3131 and happens to answer HTTP requests (e.g. a leftover process from
// an unrelated tool) — waitForServer would treat its response as "ready"
// and this script would silently harvest critical CSS from whatever that
// other server serves instead of failing loudly. Nothing else in this repo
// uses 3131 (dev is 5079, preview/build defaults elsewhere), so this is an
// accepted risk rather than something worth guarding against here.
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
  // `@layer utilities` / `@layer base` get pulled out of the normal
  // whole-top-level-unit dedup above and deduped at the inner-rule level
  // instead — see buildOrderedDedupedLayerBlock's comment for why. Each
  // set holds normalizeForComparison(rule) keys, unioned across every
  // route. UTILITIES_PLACEHOLDER/BASE_PLACEHOLDER get spliced into
  // unionRules (once, at the position the layer first appears — i.e.
  // matching entry.*.css's own top-level layer order relative to
  // `@layer properties`/`@layer theme`, which stay in the plain "other"
  // bucket since their content doesn't vary by route) and are swapped for
  // the real, ordered, deduped block once every route has been processed.
  const UTILITIES_PLACEHOLDER = "@__CRITICAL_CSS_UTILITIES__;";
  const BASE_PLACEHOLDER = "@__CRITICAL_CSS_BASE__;";
  const utilitiesHarvestedNormalized = new Set();
  const baseHarvestedNormalized = new Set();
  let utilitiesPlaceholderAdded = false;
  let basePlaceholderAdded = false;

  for (const route of ROUTES) {
    const res = await fetch(`http://localhost:${PORT}${route}`);
    // Fix round 3: "/match-details" is deliberately in ROUTES even though
    // it 404s — it isn't a real route (the actual match-details path is
    // /sports/:sport/:country/:league/:matchSlug(.*)-:id, a fused dynamic
    // segment nuxt.config.js's pages:extend hook rewrites onto, and
    // exercising it for real needs live match data this local build has
    // no access to). Fetching the literal "/match-details" string lands on
    // Nuxt's catch-all 404 page (app/pages/[...slug].vue) instead, which
    // is exactly the point: that page is real, frequently-hit content
    // (broken links, typos, stale bookmarks) with its own substantial
    // styling (min-h-dvh, py-24, bg-linear-to-*, shadow-xl, ...) that was
    // otherwise never captured. 404 is Nuxt's correct, intentional status
    // for that page, so it's allowed through here; anything else
    // unexpected (5xx, a route that's actually broken) still fails loudly.
    if (!res.ok && res.status !== 404) {
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
    let addedOtherForRoute = 0;
    let newUtilitiesInnerForRoute = 0;
    let newBaseInnerForRoute = 0;
    for (const rule of routeRules) {
      const braceIndex = rule.indexOf("{");
      const head = braceIndex === -1 ? rule : rule.slice(0, braceIndex).trim();

      if (/^@layer\s+utilities\b/i.test(head)) {
        const body = rule.slice(braceIndex + 1, rule.lastIndexOf("}"));
        for (const inner of flattenToLeafUnits(splitTopLevelRules(body))) {
          const key = normalizeForComparison(inner);
          if (utilitiesHarvestedNormalized.has(key)) continue;
          utilitiesHarvestedNormalized.add(key);
          newUtilitiesInnerForRoute++;
        }
        if (!utilitiesPlaceholderAdded) {
          unionRules.push(UTILITIES_PLACEHOLDER);
          utilitiesPlaceholderAdded = true;
        }
        continue;
      }

      if (/^@layer\s+base\b/i.test(head)) {
        const body = rule.slice(braceIndex + 1, rule.lastIndexOf("}"));
        for (const inner of flattenToLeafUnits(splitTopLevelRules(body))) {
          const key = normalizeForComparison(inner);
          if (baseHarvestedNormalized.has(key)) continue;
          baseHarvestedNormalized.add(key);
          newBaseInnerForRoute++;
        }
        if (!basePlaceholderAdded) {
          unionRules.push(BASE_PLACEHOLDER);
          basePlaceholderAdded = true;
        }
        continue;
      }

      if (seenRuleStrings.has(rule)) continue;
      seenRuleStrings.add(rule);
      unionRules.push(rule);
      addedOtherForRoute++;
    }

    const routeBytes = Buffer.byteLength(newStyleContent, "utf8");
    routeResults.push({
      route,
      routeBytes,
      addedOtherForRoute,
      newUtilitiesInnerForRoute,
      newBaseInnerForRoute,
    });
  }

  // --- Step 5 fallback: [data-theme="light"] blocks not already harvested ---
  // Defense-in-depth only (see extractLightThemeBlocks' comment above) —
  // checked against everything harvested so far, across all three buckets
  // (the "other" bucket plus both layer buckets), since these rules live
  // inside `@layer utilities` in entry.*.css and are expected to already
  // be captured there via allowRules (verified: this normally adds 0).
  const entryCss = readFileSync(entryCssPath, "utf8");
  const allHarvestedNormalized = new Set([
    ...utilitiesHarvestedNormalized,
    ...baseHarvestedNormalized,
    ...[...seenRuleStrings].map(normalizeForComparison),
  ]);
  // Fix round 3: extractLightThemeBlocks() unwraps @layer but doesn't
  // otherwise flatten — a comma-selector light-theme rule would stay one
  // combined chunk (duplicating content already present per-selector via
  // the utilities-layer harvest above, since normalizeForComparison keys
  // wouldn't match a combined chunk against its own split-apart
  // selectors), and it never runs the interaction-pseudo trim, so a
  // future `[data-theme=light] .hover\:x:hover{...}` rule would sneak
  // into the artifact ungated by isInteractionOnlySelector. Piping through
  // flattenToLeafUnits (which both flattens to one-selector-per-unit AND
  // applies the interaction trim, per fix round 2) keeps this fallback
  // consistent with how everything else in the union is compared.
  const lightThemeBlocks = flattenToLeafUnits(
    extractLightThemeBlocks(entryCss),
  );
  let lightThemeAdded = 0;
  for (const block of lightThemeBlocks) {
    const key = normalizeForComparison(block);
    if (allHarvestedNormalized.has(key)) continue;
    allHarvestedNormalized.add(key);
    seenRuleStrings.add(block);
    unionRules.push(block);
    lightThemeAdded++;
  }

  // --- Step 6: assemble the deduped @layer utilities/@layer base blocks -----
  // and write the artifact -----------------------------------------------
  const utilitiesBlock = buildOrderedDedupedLayerBlock(
    "utilities",
    entryCss,
    utilitiesHarvestedNormalized,
  );
  const baseBlock = buildOrderedDedupedLayerBlock(
    "base",
    entryCss,
    baseHarvestedNormalized,
  );
  const assembledRules = unionRules
    .map((rule) => {
      if (rule === UTILITIES_PLACEHOLDER) return utilitiesBlock;
      if (rule === BASE_PLACEHOLDER) return baseBlock;
      return rule;
    })
    .filter((rule) => rule);

  const generatedAt = new Date().toISOString();
  const header = `/* generated by scripts/extract-critical-css.mjs from ${entryCssBasename} on ${generatedAt}; regenerate with: pnpm critical:extract (requires a fresh pnpm build) */\n`;
  const body = assembledRules.join("\n");
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
      `  ${r.route.padEnd(14)} ${String(r.routeBytes).padStart(7)} B raw   (+${r.addedOtherForRoute} other, +${r.newUtilitiesInnerForRoute} utilities-inner, +${r.newBaseInnerForRoute} base-inner)`,
    );
  }
  console.log(
    `  [data-theme=light] fallback (from ${entryCssBasename}): +${lightThemeAdded} rules`,
  );
  console.log(
    `[critical:extract] deduped: ${assembledRules.length} top-level units ` +
      `(${utilitiesHarvestedNormalized.size} unique utilities-layer rules, ` +
      `${baseHarvestedNormalized.size} unique base-layer rules, ` +
      `${seenRuleStrings.size} other)`,
  );
  console.log(
    `[critical:extract] union: ${rawBytes} B raw, ${gzipBytes} B gzip`,
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
