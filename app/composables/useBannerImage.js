// Maps a banner JPEG path to its pre-generated WebP srcset. Pure string
// work — the .webp files themselves are produced by scripts/optimize-banners.mjs
// and committed as static assets (see package.json's "banners:optimize").
export function useBannerImage() {
  function bannerSources(jpgPath) {
    const base = jpgPath.replace(/\.jpg$/, "");
    const srcset = [640, 960, 1280].map((width) => `${base}-${width}.webp ${width}w`).join(", ");

    return { src: jpgPath, srcset };
  }

  return { bannerSources };
}
