# Lighthouse performance plan — 2026-08-27

Spec: the Lighthouse report pasted in chat on 2026-08-27 and the assessment
approved by the user ("proceed"). No separate spec file; the tables in the
assessment are the requirements and are restated per task below.

## Context

Nuxt 4.5.1 SSR app (`app/` is srcDir, JS only, no TypeScript, no test
framework). Design system in `app/assets/css/style.css`. Production runs
`node .output/server/index.mjs` in a Docker image owned by another team —
**nothing may require a change to that image** (no native binaries at
runtime, no new env vars). The Lighthouse run was against a Vercel preview
of the home page (`/`).

Home-page banner carousels: `app/components/TheBanner.vue` (desktop) and
`app/components/mobile/HeroBanner.vue` (mobile). Both render a Swiper with an
`items` array whose first entry is `/banners/banda/starter-free-bet.jpg`, and
both put `loading="lazy"` on every slide's `<img>`. Source JPEGs live in
`public/banners/banda/` (9 files, 1600×533 except `placeholder.jpg` at
1997×666, 170–300 KB each).

Fonts: `nuxt.config.js` `app.head.link` loads Hanken Grotesk from
`fonts.googleapis.com` (the only font family used — `--font-sans` and
`--font-display` in `style.css` both resolve to it).

## Global Constraints

- JavaScript only. No TypeScript, no `.ts` files.
- Runtime dependencies: only `@nuxt/fonts` may be added. `sharp` may be added
  as a **devDependency only**, used by a one-off script; it must not be
  imported by anything under `app/` or `server/`.
- Do not edit `Dockerfile`, CI, or anything under `docs/INFRA-HANDOFF.md`
  except to append a short note where a task says so.
- Use semantic design tokens; do not add literal colours.
- Every task ends with `pnpm build` exiting 0. Where a task says to check the
  rendered HTML, start the built server on a spare port
  (`PORT=3123 node .output/server/index.mjs &`), `curl -s http://localhost:3123/`,
  inspect, then kill the server. Never leave a server running.
- One commit per task on the current branch, message in the repo's
  `type: summary` style, ending with
  `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`.
- Do not push. The controller pushes.

## Task 1: Optimised banner images (WebP + srcset)

Goal: cut the ~1,074 KiB of banner JPEG transfer by serving WebP at sizes that
match the displayed width, with the original JPEG as the fallback.

1. Add `sharp` as a devDependency (`pnpm add -D sharp`).
2. Create `scripts/optimize-banners.mjs`. For every `*.jpg` directly inside
   `public/banners/banda/` (do not recurse, skip files that already end in
   `-<width>.webp`), write `public/banners/banda/<basename>-640.webp`,
   `<basename>-960.webp`, and `<basename>-1280.webp` using `sharp(file)
   .resize({ width: W, withoutEnlargement: true }).webp({ quality: 80 })`.
   Print one line per output with its byte size. The script must be
   idempotent (re-running overwrites).
3. Add `"banners:optimize": "node scripts/optimize-banners.mjs"` to
   `package.json` scripts. Run it once and **commit the generated `.webp`
   files** — they are static assets, the script is a tool, and production
   builds must not depend on sharp.
4. Create `app/composables/useBannerImage.js` exporting
   `useBannerImage()` which returns `bannerSources(jpgPath)` →
   `{ src: jpgPath, srcset: "<base>-640.webp 640w, <base>-960.webp 960w, <base>-1280.webp 1280w" }`
   where `<base>` is `jpgPath` without its `.jpg` extension. Pure string
   work, no I/O.
5. In `TheBanner.vue` and `mobile/HeroBanner.vue`, replace each slide's
   `<img :src="item.image" …>` with
   ```html
   <picture>
     <source type="image/webp" :srcset="bannerSources(item.image).srcset" :sizes="BANNER_SIZES" />
     <img :src="item.image" … (keep every existing attribute and class) />
   </picture>
   ```
   Define `BANNER_SIZES` once per component. Measure the real rendered
   width of the carousel container at the `lg` breakpoint and on a 390 px
   mobile viewport from the surrounding layout classes (the Lighthouse run
   showed 616 px on desktop), and set `sizes` accordingly, e.g.
   `"(min-width: 1024px) 616px, 100vw"` — use the measured value, not this
   example, and say in the report how you measured it.
   The `<picture>` must not change layout: the `<img>` keeps its classes
   (`w-full h-full object-cover …` / `w-full aspect-[3/1] …`), and any
   `@click` stays on the `<img>`.
6. Verification: `pnpm build` passes; `ls public/banners/banda/*.webp | wc -l`
   equals 27; curl the built home page and confirm the first slide contains
   `<source type="image/webp"` with a `srcset` naming `-640.webp`, `-960.webp`,
   `-1280.webp`; report the byte sizes of `starter-free-bet.jpg` vs
   `starter-free-bet-640.webp` and `-960.webp`.

## Task 2: LCP banner priority

Goal: the first banner slide is the LCP element on the home page; the browser
must discover it from the HTML and fetch it at high priority.

1. In `TheBanner.vue` and `mobile/HeroBanner.vue`, the slide loop must expose
   the index (`v-for="(item, index) in items"`). On the `<img>`:
   `:loading="index === 0 ? 'eager' : 'lazy'"` and
   `:fetchpriority="index === 0 ? 'high' : undefined"`. `decoding="async"`
   stays on all slides.
2. Add a preload for the first slide in **whichever of the two components
   is actually rendered** for a given viewport. First determine how the two
   are gated (a `v-if` on a breakpoint composable vs. both rendered and hidden
   with CSS) by reading the layout/page that mounts them, and state the answer
   in the report. Then:
   - If only one mounts per viewport: in each component,
     `useHead({ link: [{ rel: "preload", as: "image", href: items[0].image, imagesrcset: bannerSources(items[0].image).srcset, imagesizes: BANNER_SIZES, fetchpriority: "high" }] })`.
   - If both mount and are hidden with CSS: add the preload in only one place
     (the page or layout that mounts them) using a `media` attribute so each
     viewport preloads exactly one image, and explain the choice.
   Nuxt's `useHead` is auto-imported. `bannerSources` and `BANNER_SIZES` come
   from Task 1.
3. Verification: `pnpm build` passes; curl the built home page and confirm
   (a) exactly one `<link rel="preload" as="image"` per rendered carousel, with
   `imagesrcset` and `fetchpriority="high"`, and (b) the first slide `<img>`
   has `loading="eager"` and `fetchpriority="high"` while the second slide has
   `loading="lazy"` and no `fetchpriority`. Paste the matching HTML fragments in
   the report.

## Task 3: Self-hosted fonts via @nuxt/fonts

Goal: remove the render-blocking cross-origin Google Fonts stylesheet and the
second cross-origin hop for the `.woff2`, by serving Hanken Grotesk
same-origin with `font-display: swap`.

1. `pnpm add @nuxt/fonts`. Add `"@nuxt/fonts"` to `modules` in
   `nuxt.config.js`.
2. Configure it explicitly so the build does not depend on CSS scanning
   guesses:
   ```js
   fonts: {
     families: [
       { name: "Hanken Grotesk", provider: "google", weights: [400, 500, 600, 700, 800], styles: ["normal"] },
     ],
     defaults: { weights: [400], styles: ["normal"] },
   },
   ```
   Check the installed module's README/types for the current option names and
   adjust if they differ; note any deviation in the report.
3. In `nuxt.config.js` `app.head.link`, remove the three Google Fonts entries
   (the two `preconnect`s to `fonts.googleapis.com`/`fonts.gstatic.com` and the
   `stylesheet`). Leave every other link entry untouched.
4. The module downloads font files at **build** time into the output and
   rewrites `@font-face` in the CSS. Append a 3-line note to
   `docs/INFRA-HANDOFF.md` under a heading `## Fonts (2026-08-27)` stating
   that `pnpm build` now needs outbound HTTPS to `fonts.googleapis.com` /
   `fonts.gstatic.com` on the **build** machine only, and that the runtime
   container makes no font requests to Google.
5. Verification: `pnpm build` passes; `.output/public/_fonts/` (or wherever the
   module emits — say where) contains at least one `.woff2`; curl the built
   home page and confirm it contains no `fonts.googleapis.com` or
   `fonts.gstatic.com` string, and that the CSS/HTML contains an `@font-face`
   for `Hanken Grotesk` with `font-display: swap`. Confirm the built server
   starts and serves `/` with HTTP 200.

## Task 4: Fewer render-blocking stylesheets

Goal: the home page currently ships 13 render-blocking `<link rel="stylesheet">`
requests — one per SSR-rendered component (`TheLogo.css`, `TheButton.css`,
`ColumnHeaderSearch.css`, …) plus `entry.css`. Reduce that to at most 2 on the
home page without breaking styling on client-side navigation.

1. Baseline first: build, start the server, curl `/`, count
   `<link rel="stylesheet"` occurrences and `<style` occurrences, and record
   both numbers in the report.
2. Investigate Nuxt 4.5.1's actual behaviour for `features.inlineStyles`
   (read the installed `@nuxt/schema` defaults and the Nuxt docs bundled in
   `node_modules/nuxt` — do not rely on memory; Nuxt 3 and Nuxt 4 differ here).
   Then try, in order, measuring after each with the same curl+count:
   a. `features: { inlineStyles: true }` in `nuxt.config.js`.
   b. If component stylesheets are still emitted as blocking `<link>`s even
      though their content is inlined (Nuxt is known to do this for
      hydration/navigation), set `vite: { build: { cssCodeSplit: false } }`
      so all CSS collapses into `entry.css` — one blocking request — and
      remove `inlineStyles` again if it no longer helps.
   Keep whichever configuration meets the ≤2 target with the smallest total
   CSS transfer on `/`; report the numbers for each attempt. Explain the
   trade-off you chose in one paragraph in the report.
3. Verification: `pnpm build` passes; curl `/` shows ≤2 `<link rel="stylesheet"`;
   also curl `/sports/soccer` (a different page) and confirm it returns 200 and
   its stylesheet count is also ≤2 — client-nav styling cannot be checked with
   curl, so state explicitly that it was not verified in a browser.

## Task 5: Preconnect hygiene

Goal: drop the two unused preconnects and add one for the API origin the first
paint waits on.

1. Confirm by grep across `app/`, `server/`, and `nuxt.config.js` that no code
   requests `https://imagedelivery.net` or `https://storage.googleapis.com` at
   page load (note: `formatStuff().formCloudflareImage` references
   imagedelivery but is documented as idle while banners are local). Record
   what the grep found. If a host really is unused on the home page, remove
   its `preconnect` from `app.head.link` in `nuxt.config.js`.
2. Add a preconnect for the matches API origin at runtime, since the host is
   env-driven (`runtimeConfig.public.matchesUrl`): in `app/app.vue`,
   ```js
   const { public: config } = useRuntimeConfig();
   const apiOrigin = (() => { try { return new URL(config.matchesUrl).origin; } catch { return null; } })();
   useHead({ link: apiOrigin ? [{ rel: "preconnect", href: apiOrigin, crossorigin: "" }] : [] });
   ```
   Keep it defensive: an unset or malformed `NUXT_PUBLIC_MATCHES_URL` must not
   throw during SSR.
3. Verification: `pnpm build` passes; curl the built home page with
   `NUXT_PUBLIC_MATCHES_URL=https://web.api.siakabet.com` set and confirm a
   `<link rel="preconnect" href="https://web.api.siakabet.com"` is present and
   the removed hosts are absent; also run once with `NUXT_PUBLIC_MATCHES_URL=`
   (empty) and confirm `/` still returns 200 with no preconnect for the API.
