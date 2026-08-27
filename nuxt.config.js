import { fileURLToPath } from "node:url";
import { readdirSync, existsSync, readFileSync } from "node:fs";
import tailwindcss from "@tailwindcss/vite";

const phase2PlaceholderFile = fileURLToPath(
  new URL("./app/components/PhaseTwoPlaceholder.vue", import.meta.url),
);

// Lighthouse round 6: directory the client build writes its CSS chunks to,
// used by the build:manifest hook's content-based scoped-CSS check below.
// nuxt.options.buildDir isn't in scope inside the hook, so this is resolved
// relative to this config file instead (same pattern as phase2PlaceholderFile).
const clientCssDir = fileURLToPath(
  new URL("./.nuxt/dist/client/_nuxt/", import.meta.url),
);

// Lighthouse round 6: a chunk's CSS can be 100% component-scoped rules
// (Vue SFC `<style scoped>` output — `[data-v-xxxxxxxx]` selectors, plus
// `@keyframes <name>-<8-hex>` for scoped keyframe animations) even when the
// chunk itself is named after a composable (e.g. useFlyToBetslip.js) rather
// than a .vue file, so it escapes the name-based check above. Nuxt's
// features.inlineStyles already inlines that same CSS as a server-rendered
// <style> whenever the owning component renders, so the chunk's
// <link rel="stylesheet"> is redundant regardless of chunk name. Test the
// actual CSS content: after stripping comments and scoped-keyframes blocks
// and any @media/@supports wrapper (by treating `@...{` prefixes as
// transparent), every remaining rule's FULL, comma-separated selector list
// must be entirely `[data-v-` selectors (a mixed list like `.a[data-v-x],
// .b{...}` would otherwise leak `.b` as a global rule). An empty result
// after stripping means there was no actual CSS to judge, so treat that as
// NOT scoped-only (do not strip). Round 6 fix round 1: dev mode's synthetic
// client manifest only ever contains entry chunks (see writeManifest's
// devClientManifest upstream), so this disk-read branch is never reached
// during `nuxt dev` — it only runs for the real manifest built by `nuxt build`.
function isScopedOnlyCss(css) {
  const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const withoutKeyframes = withoutComments.replace(
    /@keyframes\s+[\w-]+-[0-9a-f]{8}\s*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g,
    "",
  );
  const withoutAtRuleWrappers = withoutKeyframes.replace(/@[^{]*\{/g, "");
  const rules = withoutAtRuleWrappers
    .split("}")
    .map((rule) => rule.trim())
    .filter(Boolean);
  if (rules.length === 0) return false;
  return rules.every((rule) => {
    const selectorList = rule.split("{")[0];
    return selectorList
      .split(",")
      .map((selector) => selector.trim())
      .filter(Boolean)
      .every((selector) => selector.includes("[data-v-"));
  });
}

// Lighthouse round 3: the build:manifest hook below needs to tell which CSS
// chunks belong to a `.vue` SFC (already inlined as <style> by Nuxt's
// features.inlineStyles default, so their <link rel="stylesheet"> is
// redundant) versus a plain .js module (composable, vendor package) whose
// CSS is NOT inlined and must keep its link. The obvious signal —
// `chunk.src` — only exists on manifest entries Vite treats as an
// entry/dynamic-import boundary (pages/layouts, confirmed via
// `pages/index.vue`-style keys). Ordinary components split into their own
// chunk via `cssCodeSplit` but reached only through STATIC imports get no
// `src` at all in the manifest — just a bare `name` (the file's basename,
// e.g. "SportsBetslip", "BandaLogo"), verified by dumping raw manifest
// entries during this task. So for those `src`-less chunks only, `name` is
// matched against the real `.vue` basenames on disk instead.
//
// Round 3, fix round 1: a bare basename can collide — "index", "[name]" and
// other filenames repeat across app/pages, app/components, etc., and a
// same-named vendor/composable chunk could in principle share one too. Any
// basename that isn't unique under app/ is dropped from the Set entirely,
// so the name-fallback only ever fires for a basename that unambiguously
// identifies one single `.vue` file.
const appVueBasenames = (() => {
  const counts = new Map();
  const walk = (dir) => {
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = `${dir}/${entry.name}`;
      if (entry.isDirectory()) walk(full);
      else if (entry.name.endsWith(".vue")) {
        const base = entry.name.slice(0, -4);
        counts.set(base, (counts.get(base) || 0) + 1);
      }
    }
  };
  walk(fileURLToPath(new URL("./app", import.meta.url)));
  const unique = new Set();
  for (const [base, count] of counts) if (count === 1) unique.add(base);
  return unique;
})();

// Route names that carried `meta: { requiresAuth: true }` in the deleted
// baseline router (`git show 81ae85f:src/router/index.js`), sourced by
// grepping every uncommented `requiresAuth: true` and reading the enclosing
// route object's `name`. app/middleware/auth.global.js checks
// `to.matched.some(r => r.meta?.requiresAuth)` on every navigation — it's
// generic and needs no per-route wiring beyond this meta flag being set. Of
// the 13 names found, 11 are registered as routes in Phase 1 (10 here, plus
// "my-bets" which has its own real stub page — see app/pages/my-bets.vue).
// "virtual-league" and "bet-placed" are NOT registered as routes anywhere in
// Phase 1 (neither here nor as a real page) — see docs/PHASE-2-NOTES.md for
// that gap; there is nothing to attach `requiresAuth` to until Phase 2
// creates those pages.
// "profile", "deposit", "withdraw", "self-exclusion" and "join-affiliate"
// now set requiresAuth directly in their own definePageMeta (Batch C) —
// same for "bet-details" and "my-bets"/"bet-placed" (Batch E), and now
// "pari-league"/"pari-turbo"/"pari-virtual-jackpot"/"playon" (Batch F —
// see app/pages/virtual-games/nai-league.vue etc.). Empty for now; kept
// declared (rather than deleted) because the pages:extend hook below still
// references it for whichever of "leaderboard"/"share-happiness" ends up
// shipping requiresAuth: true — neither is in this Set today (Batch D
// oversight, out of scope for Batch F/G to fix), so their placeholders
// currently resolve without the auth gate the baseline's commented-out
// route carried.
const phase2RequiresAuthNames = new Set([]);

// Phase 1 route-name scaffold. DELETE EACH ENTRY as Phase 2 ports the real
// page for that name — this list should shrink to empty over time.
//
// These route names are referenced by RouterLink/router.push calls in the
// shared chrome (Footer's legalLinks, TheDepositBar, HeaderLinks, ...) and
// in views not yet converted to Nuxt pages. vue-router 4 THROWS
// "No match for {name: ...}" when resolving an unmatched name — not just a
// console warning — which was aborting SSR for every page that mounts that
// chrome (i.e. all of them, via app/layouts/default.vue and auth.vue).
// Registering name + a real path here is enough to satisfy resolve()
// without porting the real view yet. Paths are sourced from the deleted
// src/router/index.js (`git show 81ae85f:src/router/index.js`), not
// invented, so Phase 2 can swap in the real page without changing URLs.
// Batch F removed "aviator", "games" (never a real baseline name — see the
// git-blame note this replaced), "pari-league", "pari-turbo",
// "pari-virtual-jackpot" and "playon": all six now have real pages under
// app/pages/ (casino-home.vue, casino/[name].vue, crash/[name].vue,
// virtual-games/[name].vue, aviator.vue, virtual-games/index.vue,
// virtual-games/nai-*.vue, virtual-games/playon.vue, virtual-league.vue —
// plan §10).
//
// The three product-gated routes below (commented out in the baseline
// router, never shipped by Batch D — plan §8.2) are still undecided, so
// they stay placeholders. Their backing src/ files were resolved anyway so
// src/ could be deleted in Batch G (plan's explicit instruction: relocate
// into app/ only if live code imports the file directly, delete
// otherwise):
//   - leaderboard (src/views/LeaderBoard.vue): one live call site
//     (a `router.push({name: "leaderboard"})`, a route-NAME push, not a
//     component import, in a mobile component that was itself dead —
//     unmounted anywhere — and has since been deleted).
//     Nothing in app/ imports LeaderBoard.vue itself, so it was deleted.
//     The placeholder below keeps that push from throwing.
//   - share-happiness (src/views/festive/ShareZaKrisii.vue): four live
//     call sites push { name: "share-happiness" } (ThePromos.vue,
//     promo-strip/ChristmassStrip.vue, promos/ShareKrisii.vue x2) — same
//     situation, route-NAME pushes only. Nothing in app/ imports
//     ShareZaKrisii.vue or any of its 9 src/views/festive/ dependencies
//     (FestiveTabs, HowToWin, ShareButton, LeaderBoards, MyStats,
//     AffiliateFAQs, LeaderboardPlayers, LeaderboardPrizes,
//     SparkleLoader — verified by grepping app/ for each filename), so all
//     17 src/views/festive/ files were deleted rather than relocated. The
//     placeholder below keeps all four pushes from throwing.
//   - welcome-gift (src/views/WelcomeGift.vue): zero live call sites
//     outside commented-out code (app/components/VerifyAccount.vue:71,
//     TheLanding.vue, MobileTest.vue). Kept as a placeholder anyway rather
//     than removed, since app/components/WelcomeGiftStrip.vue:42 still
//     links { name: "welcome-gift" } (dead but unexercised — the strip
//     itself isn't rendered anywhere live either); removing the
//     placeholder here would be an unrelated scope decision Batch F/G
//     wasn't asked to make.
//
// Batch G (plan §11, "teardown"): the instruction there is to delete this
// whole scaffold — phase2Placeholders, phase2RequiresAuthNames,
// phase2RealStubPaths, toNitroPatterns(), phase2NoindexRouteRules and
// app/components/PhaseTwoPlaceholder.vue — ONLY once this array is empty.
// It is not: these three product-gated routes have no product decision on
// record, so the scaffold stays, deliberately, until whoever makes that
// call ships or drops each one.
const phase2Placeholders = [
  { name: "leaderboard", path: "/leaderboard" },
  { name: "share-happiness", path: "/share-happiness" },
  { name: "welcome-gift", path: "/welcome-gift" },
];

// The three real stub pages (their own .vue files under app/pages/, created
// in an earlier triage round because the shared chrome references these
// names directly) are placeholders too and must never be indexed either.
// "casino-home" moved out in Batch F — see the explicit permanent
// routeRules entry for it below instead.
const phase2RealStubPaths = ["/login", "/signup", "/my-bets"];

const NOINDEX_HEADERS = { "X-Robots-Tag": "noindex, nofollow" };

// vue-router path syntax (":name", optional "?", regex-fused segments like
// ":matchSlug(.*)-:id") isn't valid Nitro/radix3 routeRules-key syntax.
// Convert each phase2Placeholders path to one or more radix3-safe patterns:
// static segments pass through untouched; any segment containing ":" or "("
// becomes a same-position "*" (a single-segment wildcard, not "**", so
// pattern DEPTH is preserved — this is what keeps match-details'
// /sports/*/*/*/* from ever matching the 4-segment country route
// /sports/[sport]/[country]/[league]). A trailing "?" (vue-router's
// optional-param marker, e.g. share-bets' ":code?") has no radix3
// equivalent, so it's expanded into two patterns: with and without that
// segment.
function toNitroPatterns(routerPath) {
  const segments = routerPath.split("/").filter(Boolean);
  const isWildcardSegment = (s) => /[:()]/.test(s);
  const last = segments.at(-1) || "";
  if (last.endsWith("?")) {
    const base = segments.slice(0, -1).map((s) => (isWildcardSegment(s) ? "*" : s));
    return [`/${base.join("/")}`, `/${[...base, "*"].join("/")}`];
  }
  return [`/${segments.map((s) => (isWildcardSegment(s) ? "*" : s)).join("/")}`];
}

// Every scaffold route (placeholders + the four real stub pages), keyed to
// { headers: { "X-Robots-Tag": "noindex, nofollow" } } — generated from the
// same phase2Placeholders/phase2RealStubPaths source of truth used by the
// pages:extend hook below, so the route list and the noindex list can't
// drift apart. An HTTP header (unlike useSeoHead's <meta name="robots">,
// which lives in a <script setup> that never executes server-side for
// mode:"client" pages — Nuxt's pageToClientOnly returns ServerPlaceholder
// on the server) is JS-independent and reaches crawlers regardless.
//
// "match-details" no longer appears in phase2Placeholders at all (Batch E
// shipped the real page — see the pages:extend rewrite below) and
// server/middleware/phase2-match-details-noindex.js, which used to give it
// a hand-written regex-based noindex header instead of a routeRules entry
// (because Nitro's routeRules matcher doesn't respect segment-count depth
// for dynamic patterns and would have wrongly noindexed
// /sports/football and /sports/live/football too), has been deleted.
// match-details is now fully indexable via the "/sports/**": { ssr: true }
// routeRule below, same as every other real /sports/ route.
const phase2NoindexRouteRules = {};
for (const { path } of phase2Placeholders) {
  for (const pattern of toNitroPatterns(path)) {
    phase2NoindexRouteRules[pattern] = { headers: NOINDEX_HEADERS };
  }
}
for (const path of phase2RealStubPaths) {
  phase2NoindexRouteRules[path] = { ssr: false, headers: NOINDEX_HEADERS };
}

export default defineNuxtConfig({
  compatibilityDate: "2026-08-04",
  devtools: { enabled: true },

  hooks: {
    "pages:extend"(pages) {
      // Batch E: match-details' real path
      // (/sports/:sport/:country/:league/:matchSlug(.*)-:id) fuses two
      // params into one path segment, which file-based routing cannot
      // express. app/pages/match-details.vue is a stand-in filename —
      // Nuxt auto-discovers it at the default path "/match-details";
      // rewrite that in place. See plan §9.
      const matchDetailsPage = pages.find((p) => p.path === "/match-details");
      if (matchDetailsPage) {
        matchDetailsPage.path =
          "/sports/:sport/:country/:league/:matchSlug(.*)-:id";
        matchDetailsPage.name = "match-details";
      }

      for (const { name, path } of phase2Placeholders) {
        pages.push({
          name,
          path,
          file: phase2PlaceholderFile,
          // Client-only: these are placeholders, never meant to be
          // server-rendered or indexed. Precise per-route rendering mode,
          // so it isn't at the mercy of the "/sports/**": { ssr: true }
          // routeRule below (match-details and countries both live under
          // /sports/**).
          mode: "client",
          meta: {
            robots: "noindex,nofollow",
            ...(phase2RequiresAuthNames.has(name) && { requiresAuth: true }),
          },
        });
      }
    },

    // Lighthouse round 2, Task 4: chunks that are only ever reached via a
    // dynamic import (lazy-hydrated sections, lazily-mounted modals) must not
    // be modulepreload'ed in the SSR HTML — the browser fetches them when the
    // hydration strategy / v-if fires. Without this, every SSR-rendered
    // component's chunk is preloaded before first paint even when its
    // hydration is deferred.
    //
    // Round 2 final review: pages/ and layouts/ chunks are dynamic imports
    // too (Nuxt page/layout components), but the CURRENT route's page chunk
    // and layout chunk are needed before hydration can even start — they are
    // not "lazy" in the sense this hook targets. Stripping their preload
    // hints forced the browser to discover them only after the entry chunk
    // executed, adding one extra sequential round-trip before hydration.
    // Leave those alone; only strip component-level dynamic entries (lazily
    // mounted modals, lazily hydrated sections).
    "build:manifest": (manifest) => {
      for (const key in manifest) {
        const chunk = manifest[key];
        const src = chunk.src ?? "";
        if (/(^|\/)(pages|layouts)\//.test(src)) continue;
        if (chunk.isDynamicEntry && !chunk.isEntry) {
          chunk.preload = false;
          chunk.prefetch = false;
        }
      }
      // Round 3: a .vue module's CSS is inlined as <style> by
      // features.inlineStyles, so its <link rel="stylesheet"> is redundant.
      // Pages and layouts are .vue modules too and get the same treatment.
      // Pages/layouts carry `chunk.src` ending in ".vue" (they're reached
      // via Nuxt's own dynamic-import boundary); ordinary components split
      // into their own chunk via cssCodeSplit but reached only through
      // static imports have no `src` at all — just `name`, the file's
      // basename. Fix round 1: only fall back to the `name` match when
      // `src` is absent (a chunk that DOES carry a `src` is judged on that
      // alone), and appVueBasenames itself already excludes any basename
      // that isn't unique under app/ — see the comment on its declaration.
      for (const key in manifest) {
        const chunk = manifest[key];
        if (chunk.isEntry) continue;
        const isVueModule = chunk.src
          ? chunk.src.endsWith(".vue")
          : appVueBasenames.has(chunk.name ?? "");
        const hasCss = Array.isArray(chunk.css) && chunk.css.length;
        if (isVueModule && hasCss) {
          chunk.css = [];
          continue;
        }
        // Round 6: name-based match missed it (e.g. a composable chunk) —
        // fall back to reading the chunk's actual CSS off disk and testing
        // whether every rule in it is component-scoped (see isScopedOnlyCss
        // above). Files that aren't on disk yet just fail the check below.
        if (hasCss) {
          const allScopedOnly = chunk.css.every((file) => {
            const abs = `${clientCssDir}${file.split("/").pop()}`;
            if (!existsSync(abs)) return false;
            return isScopedOnlyCss(readFileSync(abs, "utf8"));
          });
          if (allScopedOnly) {
            chunk.css = [];
          }
        }
      }
    },
  },

  modules: [
    "@pinia/nuxt",
    "pinia-plugin-persistedstate/nuxt",
    "@vueuse/nuxt",
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/fonts",
  ],

  // Self-hosts Hanken Grotesk (the app's only font family — see
  // app/assets/css/style.css --font-sans/--font-display) instead of
  // fetching it from Google at request time. Font files are downloaded at
  // `pnpm build` time and emitted into `.output/public/_fonts/`; the
  // runtime container makes no requests to Google. Explicit `families`
  // avoids relying on the module's CSS-scanning guess.
  fonts: {
    families: [
      {
        name: "Hanken Grotesk",
        provider: "google",
        weights: [400, 500, 600, 700, 800],
        styles: ["normal"],
      },
    ],
    defaults: { weights: [400], styles: ["normal"] },
  },

  icon: {
    serverBundle: { collections: ["tabler"] },
    fallbackToApi: false,
    // Without this, every <Icon> — client AND server — resolves via
    // shared.js's loadIcon(), which always tries the network path first
    // (@nuxt/icon's runtime plugin registers the local `/api/_nuxt_icon`
    // route via `_api.setFetch($fetch.native)`, which is ofetch's raw,
    // un-wrapped platform fetch with no Nuxt base-URL injection — Node's
    // native fetch() cannot resolve that relative URL during SSR, so
    // every icon fails to load and every <Icon> renders as an empty
    // span: 0 CSS mask rules in <head>, no stroke-width anywhere).
    // scan:true makes @nuxt/icon statically scan the app for every
    // `collection:name` string (exactly the tabler:* usages verified in
    // Task 7's whitelist audit) and pre-generate a client-bundle module
    // that calls the real iconify addIcon() for each one, synchronously,
    // before any lookup. shared.js's loadIcon() calls
    // initClientBundle(_addIcon) first and only falls through to the
    // (broken) network fetch if _getIcon(name) still misses afterward —
    // so a complete client bundle means the fetch path is never
    // exercised for any icon actually used in the app, on server or
    // client. This works for both, keeps fallbackToApi:false intact
    // (still zero calls to the real Iconify CDN — restricted prod
    // egress), and needs no change to `provider` (stays default
    // "server"): any icon somehow missed by the scan still falls back
    // to the local /api/_nuxt_icon route exactly as before, so this is
    // additive, not a behavior change for the happy path.
    clientBundle: {
      // Scope the scan to app source: the default globs sweep docs/*.md
      // prose too, pulling never-used icon names into the client bundle.
      scan: {
        globInclude: ["app/**/*.vue", "app/**/*.js"],
      },
    },
  },

  pinia: {
    storesDirs: ["./app/stores/**"],
  },

  // pinia-plugin-persistedstate/nuxt defaults to cookie storage for any
  // store that doesn't set an explicit `persist.storage`. Only login.js
  // (session token) should use cookies so the server can read it; every
  // other persisted store (betslip, theme, nav state, ...) must stay on
  // localStorage as it did under plain Vite, or its state would ride along
  // on every HTTP request. login.js overrides this default explicitly.
  piniaPluginPersistedstate: {
    storage: "localStorage",
  },

  css: ["~/assets/css/style.css"],

  routeRules: {
    "/": { ssr: true },
    "/leagues": { ssr: true },
    "/promotions": { ssr: true },
    "/sports/**": { ssr: true },

    // --- Batch A: legal trio — indexable, SSR (not build-time prerendered) --
    // Live, already-indexed URLs. Removed from phase2Placeholders above, so
    // they no longer get a generated noindex routeRule; these three must
    // stay fully indexable.
    //
    // DEVIATION FROM PLAN: the plan specifies `{ prerender: true }`. That is
    // not usable today — `pnpm build` fails prerendering ANY route in this
    // app (verified against the already-shipped, unrelated `/promotions`
    // page, not just these three new pages): Nitro's build-time prerender
    // crawl throws "Cannot read properties of undefined (reading 'state')"
    // out of @pinia/nuxt's `app:rendered` hook (`nuxtApp.$pinia` is
    // undefined at that point, specifically inside the separate
    // `.nuxt/prerender/` bundle Nitro builds for the crawl) — reproducible
    // with a single prerender route, so it isn't a concurrency race either.
    // This is a pre-existing incompatibility between this repo's pinia
    // (^4.0.2) / @pinia/nuxt (1.0.1) / nitropack (2.13.4) versions and
    // Nitro's prerender crawler, not something Batch A introduced — no
    // routeRules anywhere in this codebase used `prerender: true` before.
    // `ssr: true` (identical to `/`, `/leagues`, `/promotions`, `/sports/**`
    // above) produces the same fully server-rendered, indexable HTML per
    // request and is sufficient to satisfy the urgent requirement (real
    // <title>, canonical, no noindex). Revisit `prerender: true` once the
    // upstream bug is fixed or the pinia/nitro versions are updated.
    "/terms-and-conditions": { ssr: true },
    "/privacy-policy": { ssr: true },
    "/responsible-gambling": { ssr: true },

    // --- Batch B: auth — permanent noindex, ssr:false ------------------------
    // change-password / forgot-password / reset-password / verify-account
    // just left phase2Placeholders (removed above), so they no longer get a
    // generated noindex routeRule. useSeoHead({robots:"noindex,nofollow"})
    // inside these pages is NOT a substitute — under ssr:false Nuxt's
    // pageToClientOnly returns ServerPlaceholder and <script setup> never
    // runs server-side, so no <meta name="robots"> reaches a crawler.
    // These four permanent rules are the only thing that actually keeps
    // them out of the index — mirrors what phase2RealStubPaths already does
    // for /login and /signup (untouched, still real: not scaffolding).
    "/change-password": { ssr: false, headers: NOINDEX_HEADERS },
    "/forgot-password": { ssr: false, headers: NOINDEX_HEADERS },
    "/reset-password": { ssr: false, headers: NOINDEX_HEADERS },
    "/verify-account": { ssr: false, headers: NOINDEX_HEADERS },

    // --- Batch C: account — permanent noindex, ssr:false --------------------
    // profile / deposit / sort-deposit / withdraw / self-exclusion / bonus /
    // join-affiliate just left phase2Placeholders (removed above, except
    // "bonus" which was never registered there at all — it 404'd in Phase 1
    // with no generated noindex routeRule of any kind). All seven are
    // private account pages; useSeoHead's robots meta does NOT reach
    // crawlers under ssr:false (pageToClientOnly / ServerPlaceholder), so
    // these permanent header rules are the only real guard.
    "/profile": { ssr: false, headers: NOINDEX_HEADERS },
    "/profile/exclude": { ssr: false, headers: NOINDEX_HEADERS },
    "/deposit": { ssr: false, headers: NOINDEX_HEADERS },
    "/sort-deposit": { ssr: false, headers: NOINDEX_HEADERS },
    "/withdraw": { ssr: false, headers: NOINDEX_HEADERS },
    "/bonus": { ssr: false, headers: NOINDEX_HEADERS },
    "/join-affiliate": { ssr: false, headers: NOINDEX_HEADERS },

    // --- Batch D: static tail ------------------------------------------------
    // /promotion-details/:name and /sports/soccer/countries just left
    // phase2Placeholders above and become indexable — countries already
    // falls under "/sports/**": { ssr: true } below; promotion-details gets
    // the app's default ssr:true with no explicit rule needed.
    // /share-feedback ships client-only (mode: "client" in the plan) and
    // stays permanently noindex for the same reason as the Batch B/C
    // pages: useSeoHead's robots meta never reaches the server under
    // ssr:false.
    "/share-feedback": { ssr: false, headers: NOINDEX_HEADERS },

    // --- Batch E: match & bet -------------------------------------------------
    // match-details just left phase2Placeholders above and is deliberately
    // given NO entry here: it's the app's most SEO-valuable dynamic page
    // and falls under "/sports/**": { ssr: true } below like every other
    // real /sports/ route. server/middleware/phase2-match-details-noindex.js
    // (which used to force-noindex this URL shape) has been deleted.
    //
    // bet-details and bet-placed are private, ssr:false pages — permanent
    // noindex, same reasoning as every other Batch B/C/D private page.
    // bet-placed was never registered anywhere in Phase 1 (no placeholder,
    // no real stub, no routeRule) — this is a brand new entry, not a
    // removal.
    "/bet-details": { ssr: false, headers: NOINDEX_HEADERS },
    "/bet-placed": { ssr: false, headers: NOINDEX_HEADERS },
    // share-bets just left phase2Placeholders above. It's PUBLIC (the
    // baseline carried no robots directive on it at all — confirmed no
    // noindex, so it must end up indexable), but BookedBets.vue's setup
    // runs two SSR-unsafe operations (loadSharedBetslip()+openModal() and
    // fetchBethub(), both flagged in plan §9), so it stays ssr:false
    // WITHOUT a noindex header — absence of a noindex directive is enough
    // for it to be indexable; nothing here tells crawlers to skip it.
    "/share-bets": { ssr: false },
    "/share-bets/**": { ssr: false },

    // --- Batch F: games --------------------------------------------------------
    // All eleven game routes are private, iframe/canvas embeds with nothing
    // to index — permanent ssr:false + noindex, same reasoning as every
    // other Batch B/C/D/E private page. "casino-home" replaces its old
    // phase2RealStubPaths entry (removed above) with this explicit rule,
    // same shape as before. useCasino/useCasinoStore's circular import
    // (plan §F.7) needs a live Nuxt instance + router just to construct the
    // store, so every one of these pages must stay client-only — making
    // any of them ssr:true would pull useRuntimeConfig/useRouter into
    // server-side store construction across the module cycle.
    "/casino-home": { ssr: false, headers: NOINDEX_HEADERS },
    "/aviator": { ssr: false, headers: NOINDEX_HEADERS },
    // /casino/:name and /crash/:name are single dynamic segments — "*" is
    // radix3's one-segment wildcard (see toNitroPatterns' own comment
    // above for why "**" would be wrong here: it must not swallow deeper
    // paths, though neither of these has any today).
    "/casino/*": { ssr: false, headers: NOINDEX_HEADERS },
    "/crash/*": { ssr: false, headers: NOINDEX_HEADERS },
    "/virtual-league": { ssr: false, headers: NOINDEX_HEADERS },
    // /virtual-games covers the bare index ("virtuals"); /virtual-games/**
    // covers every path under it — the four static Kiron/Playon routes
    // (nai-league, nai-turbo, nai-virtual-jackpot, playon) AND the dynamic
    // /virtual-games/:name ("play-virtuals-games") fallback. All of them
    // are ssr:false + noindex, so one glob is enough; static-vs-dynamic
    // ranking (plan §F.4) is a Nuxt page-routing concern and is unaffected
    // by this Nitro-level rule matching all of them identically.
    "/virtual-games": { ssr: false, headers: NOINDEX_HEADERS },
    "/virtual-games/**": { ssr: false, headers: NOINDEX_HEADERS },

    // Every Phase-2 placeholder path (scaffold + the three remaining real
    // stub pages) generated above: ssr:false where applicable plus an
    // X-Robots-Tag noindex header on all of them. See
    // phase2NoindexRouteRules.
    ...phase2NoindexRouteRules,

    // --- Batch 0.2: restore the baseline redirects -------------------------
    // Restored from the deleted baseline router
    // (`git show 81ae85f:src/router/index.js:566-612`). The baseline
    // comment there said the authoritative 301s lived in
    // docker/config/app/nginx/conf.d/default.conf; `docker/` no longer
    // exists in this repo, so these routeRules are now the ONLY surviving
    // copy of this redirect layer. Real 301s (the baseline's own were
    // client-side 200s via vue-router `redirect`).
    //
    // Old pari-* / siaka-* virtual-game paths -> the "nai-*" names this app
    // actually uses.
    "/virtual-games/pari-league": {
      redirect: { to: "/virtual-games/nai-league", statusCode: 301 },
    },
    "/virtual-games/pari-turbo": {
      redirect: { to: "/virtual-games/nai-turbo", statusCode: 301 },
    },
    "/virtual-games/pari-virtual-jackpot": {
      redirect: { to: "/virtual-games/nai-virtual-jackpot", statusCode: 301 },
    },
    "/virtual-games/siaka-league": {
      redirect: { to: "/virtual-games/nai-league", statusCode: 301 },
    },
    "/virtual-games/siaka-turbo": {
      redirect: { to: "/virtual-games/nai-turbo", statusCode: 301 },
    },
    "/virtual-games/siaka-virtual-jackpot": {
      redirect: { to: "/virtual-games/nai-virtual-jackpot", statusCode: 301 },
    },
    // The old site had a sports lobby at /sports; this app has /sports/:sport.
    "/sports": { redirect: { to: "/sports/soccer", statusCode: 301 } },
    // Aviator has its own dedicated page.
    "/crash-games/aviator": { redirect: { to: "/aviator", statusCode: 301 } },
    // NOTE: "/crash-games/:name" -> "/crash/:name" is a function-shaped
    // redirect (needs the dynamic :name segment) and cannot be expressed as
    // a static routeRules value — see server/routes/crash-games/[name].js.
    //
    // Old lobbies. This app has a single casino lobby at /casino-home; the
    // /casino/:name and /crash/:name game routes are unaffected.
    "/casino": { redirect: { to: "/casino-home", statusCode: 301 } },
    "/crash": { redirect: { to: "/casino-home", statusCode: 301 } },
    // Retired features, kept resolving because the URLs are still indexed:
    // instant games were pulled, and the freebet/welcome-gift pages are
    // disabled.
    "/instant": { redirect: { to: "/casino-home", statusCode: 301 } },
    "/instant/live": { redirect: { to: "/casino-home", statusCode: 301 } },
    "/welcome-promotions": { redirect: { to: "/promotions", statusCode: 301 } },
    "/freebet": { redirect: { to: "/promotions", statusCode: 301 } },
    // The previous bandabets.com served every page under a /ke country prefix.
    // Strip it so indexed URLs and bookmarks keep resolving after the
    // cutover. Only the bare "/ke" path is handled here as a static
    // routeRule; "/ke/:pathMatch(.*)*" (preserving query + hash) is a
    // function-shaped redirect deferred to Batch G per the Phase 2 plan
    // (§4, 0.2) — a catch-all Nitro handler at this stage could swallow
    // paths that later batches haven't ported yet.
    "/ke": { redirect: { to: "/", statusCode: 301 } },
  },

  app: {
    head: {
      htmlAttrs: { lang: "en", class: "scroll-smooth scrollbar-hide" },
      bodyAttrs: { "data-theme": "dark" },
      title: "Bandabets Kenya – Bet on All Sports & Top Odds",
      meta: [
        { charset: "UTF-8" },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1.0",
        },
        {
          name: "description",
          content:
            "Bet from as low as KSh 10 and win big with Bandabets! Enjoy on sports bets, thrilling casino games, huge jackpots, and virtual sports action.",
        },
        {
          name: "keywords",
          content:
            "bet, betting, online betting, online sports betting, sports betting",
        },
        { name: "application-name", content: "Bandabets" },
        { property: "og:site_name", content: "Bandabets Kenya" },
        { property: "og:locale", content: "en_KE" },
        { property: "fb:pages", content: "524814560726004" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:site", content: "@Bandabets" },
        {
          name: "theme-color",
          content: "#1a120a",
          media: "(prefers-color-scheme: dark)",
        },
        {
          name: "theme-color",
          content: "#fdf8f3",
          media: "(prefers-color-scheme: light)",
        },
        { name: "msapplication-TileColor", content: "#1a120a" },
      ],
      link: [
        { rel: "icon", href: "/favicon.ico", sizes: "any" },
        // Vector first — modern browsers prefer it and it stays crisp on
        // hi-dpi tab strips; the PNG/ICO entries below are the fallback.
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "icon", type: "image/png", sizes: "32x32", href: "/favicon-32x32.png" },
        { rel: "icon", type: "image/png", sizes: "16x16", href: "/favicon-16x16.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        // imagedelivery.net and storage.googleapis.com preconnects removed
        // (Task 5, Lighthouse perf): neither host is requested by the
        // home-page render tree. imagedelivery.net is only referenced by
        // formatStuff().formCloudflareImage (documented idle) and by
        // components with zero template usages anywhere in the app
        // (TopLeagues.vue, HotSection.vue, BetBuilderCompetition.vue,
        // mobile/TopLeaguesGrid.vue) or reachable only via /casino-home
        // (CasinoGameCard.vue), not the home page. storage.googleapis.com
        // is only the BRAND_LOGO string embedded in JSON-LD structured data
        // (useOrganizationSchema.js), which the browser never fetches.
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
    build: {
      // Lighthouse round 3: CSS is split per chunk again so the render-
      // blocking entry stylesheet only carries what the entry needs
      // (~36 KB gzip instead of ~54 KB for every route's CSS merged). Nuxt's
      // default `features.inlineStyles` already inlines each .vue module's
      // CSS as a <style> tag in the SSR HTML, so the matching per-component
      // <link rel="stylesheet"> would be pure duplication on first load —
      // the build:manifest hook (hooks section) strips those links for .vue
      // chunks. On first load, .vue CSS that the SSR render used is already
      // inlined as <style>; any stripped stylesheet for a component not
      // rendered on the server is re-added after hydration by Vite's
      // preload helper, because the route chunk's dependency list includes
      // the CSS files of every shared chunk (measured: 12 component
      // <link>s present in the document after hydration on /, and modal
      // components opened client-side have their scoped rules). Non-.vue
      // CSS (swiper-vue, useFlyToBetslip) is not inlined and keeps its
      // link, so it is never unstyled before hydration either.
      cssCodeSplit: true,
    },
  },

  nitro: {
    // Emit .gz/.br next to every public asset and serve them with the right
    // Content-Encoding. Round 3 (vite.build.cssCodeSplit:true) went back to
    // per-chunk CSS files (entry + a handful of non-.vue chunks per route),
    // so this still matters for the entry stylesheet and JS chunks alike.
    // Works with any front proxy.
    compressPublicAssets: { gzip: true, brotli: true },
  },

  runtimeConfig: {
    public: {
      appVersion: "",
      matchesUrl: "",
      instantUrl: "",
      authUrl: "",
      betUrl: "",
      casinoUrl: "",
      cmsUrl: "",
      virtualUrl: "",
      virtualLeaguesUrl: "",
      kironLiteUrl: "",
      affiliateUrl: "",
      affiliateApiUrl: "",
      geniusGameTrackerUrl: "",
      onesignalAppId: "",
      depositTax: "",
      withdrawTax: "",
      aviatorGameId: "",
      aviatrixGameId: "",
      footballxGameId: "",
      hakiLeagueGameId: "",
      hakiTurboGameId: "",
      kironJackpotGameId: "",
      jetxGameId: "",
      virtualGameId: "",
      crashRoyaleGameId: "",
      virtualSpinGameId: "",
      maestroGameId: "",
      paybillNo: "",
      tenantCode: "",
      propellerAid: "",
      propellerTid: "",
      livePollInterval: "",
      ussdActivateAccount: "",
    },
  },
});
