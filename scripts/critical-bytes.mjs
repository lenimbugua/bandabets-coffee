// scripts/critical-bytes.mjs
// Sums the gzip size of everything the home page HTML preloads before first
// paint: every <link rel="modulepreload"> chunk, the entry <script type="module">,
// and every <link rel="stylesheet">. Sizes come from the .gz siblings that
// nitro.compressPublicAssets writes next to each file in .output/public.
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
const css = new Set(hrefs(/<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"/g));

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
