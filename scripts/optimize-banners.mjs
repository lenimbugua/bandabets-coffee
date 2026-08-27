// Generates WebP variants of the banner JPEGs used by TheBanner.vue.
//
// Dev-only tool: sharp is a devDependency and this script is never run at
// runtime. Its outputs (the .webp files) are committed as static assets, so
// production builds never depend on sharp being installed.
//
// Usage: pnpm banners:optimize
import { readdirSync, statSync } from "node:fs";
import { basename, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const bannersDir = fileURLToPath(
  new URL("../public/banners/banda/", import.meta.url),
);
const widths = [640, 960, 1280, 1600];

const jpgFiles = readdirSync(bannersDir).filter((file) => {
  if (extname(file).toLowerCase() !== ".jpg") return false;
  if (!statSync(join(bannersDir, file)).isFile()) return false;
  return true;
});

for (const file of jpgFiles) {
  const base = basename(file, extname(file));
  const inputPath = join(bannersDir, file);

  for (const width of widths) {
    const outputPath = join(bannersDir, `${base}-${width}.webp`);
    const info = await sharp(inputPath)
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(outputPath);
    console.log(`${base}-${width}.webp: ${info.size} bytes`);
  }
}
