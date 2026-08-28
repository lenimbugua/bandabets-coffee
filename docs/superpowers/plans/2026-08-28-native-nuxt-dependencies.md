# Native-Nuxt dependency removal (Lighthouse round 7) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove the four dependencies that Nuxt/the platform already covers — `axios` (→ Nuxt's built-in `$fetch`/ofetch), `@vueuse/core` + `@vueuse/nuxt` (→ three small native composables), `crypto-js` (→ Web Crypto), `@neoconfetti/vue` (unused) — without changing any call site's behaviour, and measure the byte/CPU effect.

**Architecture:** Nuxt 4.5.1 SSR app, JavaScript only. All HTTP goes through one factory, `app/services/API.js` (`API(service)` → axios instance; 90 call sites in 33 files use only `.get(url, cfg)` / `.post(url, body, cfg)` with `params`, `headers`, one basic `auth`, and read `response.data` (245 sites), `response.status` (1), `err.response.data.{statusMessage,message,statusCode,status}` (~45), `err.response.status` (1)). The migration therefore replaces the factory with a thin axios-shaped adapter over `$fetch.raw` so **no call site changes**. VueUse is used for `useMediaQuery` (via `useScreenSizes` + the `provideSSRWidth(390)` plugin that makes SSR render the mobile branch), `useClipboard` (3 sites, `{ copy, copied }`), `useDark`/`useToggle` (centralised in `useThemeSwitch`), and `useIntersectionObserver` in the legacy `app/components/Lazy.vue`. `crypto-js` is used only by `useEncryption.js` (PBKDF2-SHA1 100 iterations, AES-256-CBC, hex output — must stay byte-identical; reference ciphertexts exist in the round-2 report).

**Tech Stack:** Nuxt 4.5.1 (ofetch built in), Vue 3.5, Web Crypto; round-4 real-data harness for verification.

**Spec:** Chat 2026-08-28 (assessment + "proceed"). Measured motivation: the chunk preloaded on every page carries axios (~35 KB gzip) and crypto-js subpaths (~10 KB); VueUse's `useDark` was the round-5 forced-reflow source; `$fetch`/ofetch is already in the bundle for Nuxt itself, so axios is pure duplication.

## Global Constraints
- JavaScript only; no new dependencies; semantic tokens only; do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- **No call-site behaviour change**: every `response.data` / `err.response.data.*` read must keep working; error toasts must show the same server `statusMessage`.
- One commit per task on `main`, `type: summary` style ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`. Do not push. Never leave a server or proxy running.
- `.env` is `KEY= value` — load it with the loop below, never `source` it.

### Real-data verification recipe (server + proxy)
```bash
cd /Users/leonardmbugua/Desktop/bandabet
S=/private/tmp/claude-501/-Users-leonardmbugua-Desktop-bandabet/061355ed-1815-4f05-8b7f-e992313d2dc0/scratchpad
pnpm build 2>&1 | tail -2                                   # 400000 ms timeout
node scripts/dev-cors-proxy.mjs 3999 > /dev/null 2>&1 & echo $! > /tmp/bandabet-proxy.pid
while IFS= read -r l; do case "$l" in \#*|"") continue;; esac; k="${l%%=*}"; v="${l#*=}"; export "${k// /}=${v## }"; done < .env
export NUXT_PUBLIC_MATCHES_URL=http://localhost:3999/web.api.siakabet.com NUXT_PUBLIC_BET_URL=http://localhost:3999/bet.api.siakabet.com NUXT_PUBLIC_CASINO_URL=http://localhost:3999/soft.gaming.siakabet.com NUXT_PUBLIC_AUTH_URL=http://localhost:3999/auth.api.siakabet.com
PORT=3131 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-r7.pid
sleep 4
node scripts/critical-bytes.mjs http://localhost:3131/
# … checks …
kill "$(cat /tmp/bandabet-r7.pid)" "$(cat /tmp/bandabet-proxy.pid)"
```
Headless-browser details (puppeteer path, Chrome path, viewport) are in the shared context file next to the task briefs. Current critical-bytes line to compare against: run it once on the unmodified build at the start of Task 1 and record it as BASELINE.

---

### Task 1: Replace axios with an axios-shaped adapter over `$fetch`

**Files:**
- Modify: `app/services/API.js` (rewrite; keep every named export)
- Modify: `package.json`, `pnpm-lock.yaml` (`pnpm remove axios`)

**Interfaces:**
- Produces: `API(service)` → `{ get(url, config?), post(url, body?, config?) }`. Both resolve to `{ data, status, headers }` and reject with an error whose `response` is `{ data, status, headers }` (so `err.response.data.statusMessage` keeps working) and whose `message` is the server message when available. `config` supports `params` (object → query string), `headers` (object), `auth` (`{ username, password }` → `Authorization: Basic …`). Named exports (`matchesBaseURL`, `authBaseURL`, …, `MATCHES_PATH`, `BET_PATH`) unchanged.

- [ ] **Step 1: Baseline** — run the recipe on the unmodified build; record the `critical-bytes` line as BASELINE. Also record which chunk contains axios: `grep -l "isAxiosError\|XMLHttpRequest" .output/public/_nuxt/*.js | grep -v '\.gz$\|\.br$'`.

- [ ] **Step 2: Rewrite `app/services/API.js`**

Read the current file first and keep its header constants verbatim. Replace the default export with:
```js
// Round 7 (native Nuxt): the previous axios instance duplicated the ofetch
// client Nuxt already ships. This adapter keeps axios's call shape —
// `.get(url, { params, headers })`, `.post(url, body, { headers, auth })`,
// `response.data`, `err.response.data.statusMessage` — so no call site
// changes, while the transport is Nuxt's $fetch.
function toResponse(raw) {
  return { data: raw._data, status: raw.status, headers: raw.headers };
}

function toAxiosLikeError(error) {
  // ofetch's FetchError carries the parsed body on .data and the Response on
  // .response; callers read err.response.data.* and err.response.status.
  const response = error?.response
    ? { data: error.data, status: error.status ?? error.response.status, headers: error.response.headers }
    : undefined;
  const wrapped = new Error(
    error?.data?.statusMessage || error?.data?.message || error?.message || "Request failed",
  );
  wrapped.response = response;
  wrapped.cause = error;
  return wrapped;
}

function buildHeaders(config = {}) {
  const headers = { ...(config.headers || {}) };
  if (config.auth) {
    const { username = "", password = "" } = config.auth;
    headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
  }
  return headers;
}

export default (service = matchesBaseURL) => {
  const config = useRuntimeConfig();
  const baseURL = config.public[service];
  if (!baseURL) {
    throw new Error(
      `API(): no runtime config value for "${service}". ` +
        `Set NUXT_PUBLIC_${service.replace(/[A-Z]/g, (c) => "_" + c).toUpperCase()}.`,
    );
  }
  const request = async (method, url, body, cfg = {}) => {
    try {
      const raw = await $fetch.raw(url, {
        baseURL,
        method,
        query: cfg.params,
        headers: buildHeaders(cfg),
        body,
      });
      return toResponse(raw);
    } catch (error) {
      throw toAxiosLikeError(error);
    }
  };
  return {
    get: (url, cfg) => request("GET", url, undefined, cfg),
    post: (url, body, cfg) => request("POST", url, body, cfg),
  };
};
```
Notes the implementer must honour: `btoa` exists in Node 18+ and browsers; `$fetch` is a Nuxt auto-import (global) — confirm the server build resolves it (it does in Nuxt 4; if the SSR build complains, `import { $fetch } from "ofetch"` — ofetch is a Nuxt dependency, not a new one). ofetch serialises a plain-object `body` as JSON and sets `content-type` automatically, matching axios; for `FormData`/string bodies it passes through — grep the call sites for non-object bodies (`grep -rn "new FormData\|URLSearchParams" app`) and report.

- [ ] **Step 3: `pnpm remove axios`** and confirm `grep -rn "axios" app` is empty.

- [ ] **Step 4: Verify against the live API (server + proxy up)** — a puppeteer script at the mobile viewport:
  1. `/` renders ≥ 10 match cards (`[aria-label^="View details"]`) and ≥ 1 casino tile (`img[width="300"]`) — proves GET with `params` and the `response.data.data.matches` shape.
  2. Open the login modal via the modal store (`…$pinia._s.get("modal-store").openModal("login")`), type an obviously invalid phone/password into the inputs, submit, wait 3 s, and read the error toast text (`document.querySelector(".swal2-toast, .colored-toast")?.textContent` and/or the store's `error` via `$pinia._s.get("login-store").error`) — proves POST with basic `auth` and the `err.response.data.statusMessage` path (expect the server's rejection message, not `"Request failed"` or `undefined`). Do not use real credentials.
  3. `node scripts/critical-bytes.mjs http://localhost:3131/` — expect `js_gzip` down ≥ 25 KB vs BASELINE; the chunk from Step 1 no longer matches `XMLHttpRequest`.
  Paste all outputs.

- [ ] **Step 5: Commit** — `refactor: replace axios with an axios-shaped adapter over Nuxt's $fetch`.

---

### Task 2: Replace VueUse with native composables

**Files:**
- Create: `app/composables/useMediaQuery.js`, `app/composables/useClipboard.js`
- Modify: `app/composables/useScreenSizes.js`, `app/composables/useThemeSwitch.js`, `app/plugins/ssr-width.js`, the 3 `useClipboard` call sites (`app/components/community-bets/CopyCode.vue` + 2 others from `grep -rl useClipboard app`), the 17 files importing `@vueuse/core` (most import only `useMediaQuery`/`useClipboard`/`useDark` — replace each import with the native composable; `Lazy.vue`'s `useIntersectionObserver` → inline `IntersectionObserver` in that file, keeping its props/behaviour)
- Modify: `nuxt.config.js` (remove `"@vueuse/nuxt"` from `modules`), `package.json`/`pnpm-lock.yaml` (`pnpm remove @vueuse/core @vueuse/nuxt`)

**Interfaces:**
- `useMediaQuery(query)` → `Ref<boolean>`. Server: evaluated against the SSR width (390 px) for `(min-width: Npx)` / `(max-width: Npx)`; `false` for anything else (e.g. `prefers-color-scheme`). Client: first value from the same SSR rule (to match the server-rendered branch, exactly what `provideSSRWidth` did), then switched to `window.matchMedia(query)` in `onMounted` with a `change` listener removed on scope dispose.
- `useClipboard({ source } = {})` → `{ copy(text?), copied, isSupported, text }`; `copied` true for 1500 ms after a successful copy (VueUse default); `copy()` without an argument copies `unref(source)`.
- `useThemeSwitch()` keeps its keys; `isDark` becomes a plain shared `ref` that mirrors to `document.body.dataset.theme` (`"dark"`/`"light"`) and persists to `localStorage["vueuse-color-scheme"]` (same key, so existing users keep their stored value); default `"dark"`. Writes only on the client.

- [ ] **Step 1: `useMediaQuery.js`**
```js
// Native replacement for VueUse's useMediaQuery + provideSSRWidth. The SSR
// width (390 px, mobile-first) decides the first render on both server and
// client so the layout branch hydration keeps is the one the server sent;
// window.matchMedia takes over after mount.
export const SSR_WIDTH = 390;

function evaluateForWidth(query, width) {
  const min = /\(min-width:\s*([\d.]+)px\)/.exec(query);
  const max = /\(max-width:\s*([\d.]+)px\)/.exec(query);
  if (!min && !max) return false;
  return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
}

export function useMediaQuery(query) {
  const matches = ref(evaluateForWidth(query, SSR_WIDTH));
  if (import.meta.client) {
    onMounted(() => {
      const mql = window.matchMedia(query);
      const update = () => { matches.value = mql.matches; };
      update();
      mql.addEventListener("change", update);
      onScopeDispose(() => mql.removeEventListener("change", update));
    });
  }
  return matches;
}
```
`useScreenSizes.js` runs `useMediaQuery` inside a detached `effectScope` outside a component (see its comments) — `onMounted` is not available there. So in `useMediaQuery`, when `getCurrentInstance()` is null, subscribe immediately instead of in `onMounted` (guard with `import.meta.client`), and register cleanup with `onScopeDispose` when a scope exists. Keep the SSR-width first value in both cases so hydration matches. Update `useScreenSizes.js` to import from `./useMediaQuery` (or rely on auto-import) and delete `app/plugins/ssr-width.js` (its comment block's rationale moves into `useMediaQuery.js`'s header comment, condensed to the essentials: why 390 and the hydration reason).

- [ ] **Step 2: `useClipboard.js`**
```js
export function useClipboard({ source, copiedDuring = 1500 } = {}) {
  const isSupported = ref(import.meta.client && !!navigator.clipboard);
  const text = ref("");
  const copied = ref(false);
  let timer = null;
  async function copy(value = unref(source)) {
    if (value == null) return;
    await navigator.clipboard.writeText(String(value));
    text.value = String(value);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => { copied.value = false; }, copiedDuring);
  }
  return { copy, copied, isSupported, text };
}
```
Update the three call sites' imports (they call `copy(x)` explicitly and read `copied` — no other changes).

- [ ] **Step 3: theme without `useDark`** — in `useThemeSwitch.js` replace the VueUse import and `themeRef()` with a shared `ref` + a client-only `applyTheme(value)` that sets `document.body.dataset.theme` and `localStorage.setItem("vueuse-color-scheme", value)`; initialise on the client from `localStorage.getItem("vueuse-color-scheme")` (`"light"` → light, anything else → dark) inside the first client call; keep `toggleDark = () => (isDark.value = !isDark.value)` and a `watch(isDark, v => applyTheme(v ? "dark" : "light"), { immediate: import.meta.client })`. Keep the SSR-safety comment (never write on the server). Behaviour to preserve: `app.vue` calls `switchToDark()` on mount, so the page is dark unless toggled in-session.

- [ ] **Step 4: remaining `@vueuse/core` imports** — `grep -rn "@vueuse" app nuxt.config.js` must end empty. `Lazy.vue`: replace `useIntersectionObserver(targetEl, cb, { rootMargin })` with a native observer created in `onMounted`/disposed in `onBeforeUnmount`, keeping the existing `stop()` semantics. Remove `"@vueuse/nuxt"` from `modules`; `pnpm remove @vueuse/core @vueuse/nuxt`.

- [ ] **Step 5: Verify** — build + recipe; SSR HTML of `/` still renders the mobile branch (`curl -s http://localhost:3131/ | grep -c 'class="sports-matches'` ≥ 1, same as before); puppeteer mobile: after load `document.body.dataset.theme === "dark"`, `main` present, match cards ≥ 10; desktop 1350 px: the desktop layout renders (`.sports-filter-card` or `SportsBetslipPanel` markup present — pick a selector that exists only in the desktop branch and state it); copy button on the share-bet page is out of scope for browser testing — instead unit-check `useClipboard` with `node -e` mocking `navigator.clipboard` (copy sets `copied` true then false after 1500 ms). `critical-bytes` line recorded.

- [ ] **Step 6: Commit** — `refactor: replace VueUse with native media-query, clipboard and theme composables`.

---

### Task 3: `crypto-js` → Web Crypto

**Files:**
- Modify: `app/composables/useEncryption.js`, `app/composables/useRegister.js` (2 `encryptData` calls → `await`), `app/stores/utm.js` (`getUtm` becomes async), `app/middleware/tracking.global.js` (`await getUtm(to)`), `package.json`/`pnpm-lock.yaml` (`pnpm remove crypto-js`)

**Interfaces:**
- `encryptData(data)` → `Promise<string|undefined>` (hex ciphertext, byte-identical to before); `decrypteData(hex)` → `Promise<string|undefined>`.

- [ ] **Step 1: Reference ciphertexts** — from the round-2 Task 6 report (or regenerate with the *current* `crypto-js` implementation before touching it): `encryptData("hunter2")` and `encryptData({ utm_source: "x", utm_medium: "y" })`. Record both hex strings.
- [ ] **Step 2: Rewrite `useEncryption.js`** with Web Crypto: `crypto.subtle.importKey("raw", utf8(keyValue), "PBKDF2", false, ["deriveKey"])` → `deriveKey({ name: "PBKDF2", salt: utf8(salt), iterations: 100, hash: "SHA-1" }, …, { name: "AES-CBC", length: 256 }, false, ["encrypt","decrypt"])` (crypto-js's PBKDF2 default hasher is **SHA-1** and its `keySize: 256/32` = 256-bit key — both must match), `iv = utf8(ivKey)` (16 bytes), `encrypt({ name: "AES-CBC", iv }, key, utf8(JSON.stringify(data)))` → hex. AES-CBC in Web Crypto uses PKCS#7 padding like crypto-js. Node 24 has `globalThis.crypto` so the equivalence test runs with plain `node`.
- [ ] **Step 3: Equivalence** — `node -e` importing the new module: both outputs must equal the references exactly, and `await decrypteData(await encryptData("hunter2"))` → `"\"hunter2\""`. If SHA-1 vs SHA-256 or padding differs, the hex will differ — fix, do not proceed on a mismatch.
- [ ] **Step 4: Async call sites** — `useRegister.js`: `password: await encryptData(password.value)` etc. inside its async function; `utm.js` `async getUtm(to)` with `this.extra = await encryptData(utmParams)`; `tracking.global.js` → `export default defineNuxtRouteMiddleware(async (to) => { …; await getUtm(to); … })`. Confirm `grep -rn "encryptData\|decrypteData" app` shows only awaited uses.
- [ ] **Step 5: Verify** — build; `pnpm remove crypto-js`; `grep -rn crypto-js app` empty; server + proxy: `/` still 200 and, with `?utm_source=test&utm_medium=x` on the URL, the utm store's `extra` (read via `$pinia._s.get("utm-store").extra` in puppeteer) is a 32+-char hex string; `critical-bytes` line recorded.
- [ ] **Step 6: Commit** — `refactor: derive the auth payload cipher with Web Crypto instead of crypto-js`.

---

### Task 4: Remove unused packages

- [ ] `grep -rn "neoconfetti" app` → empty (0 import sites measured 2026-08-28). `pnpm remove @neoconfetti/vue`. Also check `clsx` and `tailwind-merge` (1 file each): if the one file is `app/utils/cn.js`-style and `cn()` has ≥ 1 caller, keep both; if `cn()` has no callers, remove the util and both packages — state the count.
- [ ] `pnpm build` exits 0; commit `chore: remove unused dependencies`.

### Task 5 (controller): final `critical-bytes` + real-data Lighthouse; results section.

## Self-review
- Coverage: assessment items 1–4 → Tasks 1–4; measurement → baseline in T1 + T5.
- Placeholders: none; each task has code or exact rules and a concrete verification.
- Consistency: `API()` return shape `{data,status,headers}` matches the 245 `response.data` and 1 `response.status` reads; error `response.{data,status}` matches the ~45 `err.response.*` reads; `useMediaQuery` keeps the 390 px SSR rule that `provideSSRWidth` provided; `useClipboard` keeps `{copy, copied}`; `useThemeSwitch` keys unchanged.

## Results (2026-08-28, commits a261865..1d28a75)

| Stage | modulepreload | JS gzip | Notes |
|---|---|---|---|
| Before | 83 | 261 KB | |
| T1 axios → `$fetch` adapter | 83 | 246 KB | axios chunk (44.7 KB raw) gone; both login error shapes verified live |
| T2 VueUse → native | 83 | 241 KB | 22 files; no hydration warnings mobile/desktop; scope-cleanup bug found in review and fixed (`e049604`) |
| T3 crypto-js → Web Crypto | 83 | **235 KB** | ciphertexts byte-identical (PBKDF2-**SHA-256** — crypto-js 4.2 default; the plan's SHA-1 assumption was wrong) |
| T4 `@neoconfetti/vue` removed | 83 | 235 KB | unused |

Lighthouse, live data via proxy, devtools throttling, same machine as the round-6 A/B (that session's head medians: perf 73, LCP 2638, TBT 776, longest 597):

| Run | Perf | LCP | TBT | SI | script eval | longest task |
|---|---|---|---|---|---|---|
| 1 | 84 | 2268 | 428 | 2955 | 512 | 317 |
| 2 | 85 | 2250 | 407 | 2937 | 500 | 283 |
| 3 | 95 | 2298 | 0 | 2967 | 29 | 273 |
| **median** | **85** | 2268 | **407** | 2955 | 500 | **283** |

Run 3 is an outlier (script evaluation 29 ms — the XHRs answered before hydration so the render fell outside the TBT window); the two consistent runs still show TBT −45 % and the longest task −50 % against the round-6 session. Removing three libraries that every page evaluated at startup (axios, VueUse, crypto-js) is what moved the post-hydration long task, which no rendering experiment in rounds 4–6 could.

Remaining runtime dependencies and why they stay: `@headlessui/vue` (63 files, a11y-critical, lazy-loaded with the modals), `pinia` + persistedstate (the native Nuxt state layer), `@nuxt/fonts`/`@nuxt/icon` (native modules), `clsx` + `tailwind-merge` (`cn()` has 15 callers), `dompurify` (sanitising CMS HTML), `mixpanel-browser` (deferred to idle), `sweetalert2` (loaded on first toast), `swiper` (community-bets/affiliate pages only).

### Post-review fix (`fcd0c49`)
The whole-branch review found that axios also mirrored the HTTP status onto the error itself (`err.status`), and 18 store call sites branch on it (`401` → reopen login, `422`/`400` → cashout/betslip/sharebet handling). The plan's call-site audit had only inventoried `err.response.*`. The adapter now sets `wrapped.status = response?.status` (undefined on network errors, as axios did); proven live by an anonymous `placeBet()` reaching its `status == 401` branch and opening the login modal. **Lesson for future transport changes:** grep `\.status\b` on caught errors, not just `.response.*`. Also noted: `app/components/ViewMatch.vue` calls the adapter inside `useAsyncData`, so match-detail SSR exercises `$fetch` on the server — safe, but worth including in any adapter regression pass.
