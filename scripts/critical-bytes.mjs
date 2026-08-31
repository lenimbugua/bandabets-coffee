// scripts/critical-bytes.mjs
// Sums the gzip size of everything the home page HTML preloads before first
// paint: every <link rel="modulepreload"> chunk, the entry <script type="module">,
// and every actually render-blocking <link rel="stylesheet">. Sizes come
// from the .gz siblings that nitro.compressPublicAssets writes next to each
// file in .output/public.
// Lighthouse round 7, Task 2: a stylesheet <link> whose media attribute
// doesn't match the current viewport (media="print" being the deliberate
// case here — see nuxt.config.js's app.head.link defer-noncritical entry)
// is fetched but does NOT block rendering, same as Lighthouse's own
// render-blocking-resources audit treats it. A bare href-matching regex
// can't tell the difference, so this only counts <link rel="stylesheet">
// tags with no media attribute (the common case) or media="all"/"screen".
// Usage: node scripts/critical-bytes.mjs http://localhost:3123/
import { readFileSync, statSync } from "node:fs";
import { gzipSync } from "node:zlib";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const url = process.argv[2];
if (!url) {
  console.error("usage: node scripts/critical-bytes.mjs <url>");
  process.exit(1);
}
const root = join(dirname(fileURLToPath(import.meta.url)), "..", ".output", "public");

const html = await (await fetch(url)).text();
const hrefs = (re) => [...html.matchAll(re)].map((m) => m[1]);
const js = new Set([
  ...hrefs(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g),
  ...hrefs(/<script[^>]+type="module"[^>]+src="([^"]+)"/g),
]);
// <noscript> fallback links (the defer-noncritical <noscript> in
// nuxt.config.js's app.head) only apply with JS disabled — Lighthouse and
// real users here always have JS on, so strip <noscript> content before
// counting, or its fallback <link> would double as a phantom blocking tag.
const htmlScriptingEnabled = html.replace(/<noscript>[\s\S]*?<\/noscript>/g, "");
const isBlockingMedia = (tag) => {
  const m = tag.match(/media="([^"]*)"/);
  return !m || m[1] === "all" || m[1] === "screen";
};
const css = new Set(
  [...htmlScriptingEnabled.matchAll(/<link\s+[^>]*rel="stylesheet"[^>]*>/g)]
    .map((m) => m[0])
    .filter(isBlockingMedia)
    .flatMap((tag) => [...tag.matchAll(/href="([^"]+)"/g)].map((h) => h[1])),
);

const gz = (href) => {
  const p = join(root, href.replace(/^\//, ""));
  try {
    return statSync(p + ".gz").size;
  } catch {
    return gzipSync(readFileSync(p)).length;
  }
};
const sum = (set) => [...set].reduce((s, h) => s + gz(h), 0);
const kb = (n) => Math.round(n / 1024);

console.log(
  `modulepreload=${js.size - 1} js_gzip=${kb(sum(js))}KB stylesheets=${css.size} css_gzip=${kb(sum(css))}KB html_gzip=${kb(gzipSync(Buffer.from(html)).length)}KB`,
);
