// Maps a banner JPEG path to its pre-generated WebP srcset. Pure string
// work — the .webp files themselves are produced by scripts/optimize-banners.mjs
// and committed as static assets (see package.json's "banners:optimize").
export function useBannerImage() {
  function bannerSources(jpgPath) {
    // A missing or misnamed .jpg extension means there's no matching
    // pre-generated .webp set (scripts/optimize-banners.mjs only ever reads
    // *.jpg) — fall back to the plain source instead of building a srcset
    // that 404s.
    if (!jpgPath.endsWith(".jpg")) {
      return { src: jpgPath, srcset: null };
    }

    const base = jpgPath.replace(/\.jpg$/, "");
    const srcset = [640, 960, 1280, 1600]
      .map((width) => `${base}-${width}.webp ${width}w`)
      .join(", ");

    return { src: jpgPath, srcset };
  }

  return { bannerSources };
}
