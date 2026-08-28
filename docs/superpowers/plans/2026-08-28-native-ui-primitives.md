# Native UI primitives (round 8) — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Bring Tailwind/Nuxt to their latest patch releases, drop `clsx`/`tailwind-merge`, convert generic inline SVG glyphs to `@nuxt/icon` Tabler icons, and replace `@headlessui/vue` with four small native components (dialog, tabs, menu, listbox) — with no visible or accessibility regression.

**Architecture:** Nuxt 4.5 SSR app, JavaScript only, Tailwind CSS 4 (CSS-first config in `app/assets/css/style.css`), icons via `@nuxt/icon` + `@iconify-json/tabler` (161 existing `<Icon name="tabler:…">` sites; heroicons/lucide were migrated 2026-08-07). Headless UI is used in 63 files: 28 `Dialog` modals (every one wrapped as `TransitionRoot :show as="template"` → `TransitionChild` overlay + `TransitionChild` panel → `Dialog` → `DialogPanel`/`DialogTitle`), 26 `TabGroup`s (`Tab as="template" v-slot="{ selected }"`, `TabPanels`/`TabPanel`), 4 `Menu`s and 3 `Listbox`es. `cn()` (`app/lib/utils.js`, clsx + tailwind-merge) has 15 callers, all `base + (cond ? a : b)` with no conflicting utilities. Custom pictogram sets (`SportsIcons`, `CasinoIcons`, `SecondaryNavIcons`, `MainCategoryIcons`, `NavLinksIcons`, `BetIcon`, `app/components/icons/`, `logos/`) are brand artwork and stay inline SVG (user decision 2026-08-28).

**Tech Stack:** Nuxt 4.5.x, Vue 3.5 (`<Teleport>`, `<Transition>`), Tailwind 4.3.x, `@nuxt/icon`; round-4 real-data harness for smoke tests.

**Spec:** Chat 2026-08-28 (sizing + "Generic UI glyphs only"). Versions at plan time: tailwindcss 4.3.1 → 4.3.3, @tailwindcss/vite → 4.3.3, nuxt 4.5.1 → 4.5.2.

## Global Constraints
- JavaScript only; **no new dependencies**; semantic design tokens only (no literal colours); do not edit `Dockerfile`, CI, or `docs/INFRA-HANDOFF.md`.
- Preserve every existing class, event binding, `v-if`/`v-else`, `aria-*`, and slot content when swapping a tag; only the tag/import changes unless the task says otherwise.
- Accessibility parity for Headless UI replacements: dialogs keep `role="dialog" aria-modal="true"`, Escape closes, focus moves into the panel on open and returns on close, body scroll locked while open; tabs keep `role="tablist"/"tab"/"tabpanel"`, `aria-selected`, roving `tabindex` with Left/Right/Home/End; menus/listboxes keep `role="menu"/"menuitem"` or `role="listbox"/"option"`, `aria-expanded`, Escape/outside-click close, Up/Down/Enter.
- One commit per task (per batch for Task 4) on `main`, `type: summary` style ending with `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`. Never commit `.env`. Do not push. Never leave a server or proxy running.
- Every task ends with `pnpm build` exiting 0 and, where stated, the smoke script below run against the built server.

### Server + proxy recipe (smoke tests)
```bash
cd /Users/leonardmbugua/Desktop/bandabet
pnpm build 2>&1 | tail -2                                   # 400000 ms timeout
node scripts/dev-cors-proxy.mjs 3999 > /dev/null 2>&1 & echo $! > /tmp/bandabet-proxy.pid
while IFS= read -r l; do case "$l" in \#*|"") continue;; esac; k="${l%%=*}"; v="${l#*=}"; export "${k// /}=${v## }"; done < .env
export NUXT_PUBLIC_MATCHES_URL=http://localhost:3999/web.api.siakabet.com NUXT_PUBLIC_BET_URL=http://localhost:3999/bet.api.siakabet.com NUXT_PUBLIC_CASINO_URL=http://localhost:3999/soft.gaming.siakabet.com NUXT_PUBLIC_AUTH_URL=http://localhost:3999/auth.api.siakabet.com
PORT=3131 node .output/server/index.mjs > /dev/null 2>&1 & echo $! > /tmp/bandabet-r8.pid
sleep 4
# … checks …
kill "$(cat /tmp/bandabet-r8.pid)" "$(cat /tmp/bandabet-proxy.pid)"
```
Headless-browser details are in the shared context file next to the briefs. **Modal smoke** (used by Tasks 1 and 4): puppeteer, mobile viewport, `/`: open each of `login`, `deposit`, `betslip`, `search` via `…$pinia._s.get("modal-store").openModal(type)`; assert `[role=dialog]` present with `aria-modal="true"`, `document.activeElement` is inside it, `document.body.style.overflow === "hidden"` (or the app's own lock), press Escape → dialog gone, focus back on `body`/the opener; no console errors.

---

### Task 1: Patch-bump Tailwind and Nuxt

**Files:** `package.json`, `pnpm-lock.yaml`

- [ ] `pnpm up tailwindcss@latest @tailwindcss/vite@latest nuxt@latest` (patch releases only; if `pnpm up` proposes a *major/minor* jump for anything else, do not take it — pin to the 4.3.x / 4.5.x lines). Print the resulting versions from `package.json`.
- [ ] `pnpm build` exits 0; Server + proxy recipe: `/`, `/leagues`, `/sports/soccer`, `/promotions` return 200; run the **modal smoke**; `node scripts/critical-bytes.mjs http://localhost:3131/` (record; expect ≈ `js_gzip=235KB css_gzip=35KB`); puppeteer screenshot of `/` at mobile saved to the scratchpad and eyeballed for obvious breakage (report what you saw).
- [ ] Commit `chore: bump tailwindcss and nuxt to latest patch releases`.

---

### Task 2: Remove `clsx` / `tailwind-merge`

**Files:** the 15 `cn(` sites (`grep -rn '\bcn(' app --include='*.vue'` — all under `app/components/bonus/`), delete `app/lib/utils.js`, `package.json`/lockfile.

- [ ] For each `:class="cn(a, cond ? b : c)"` / `cn(a, cond && b)` rewrite to Vue's native array form: `:class="[a, cond ? b : c]"` / `:class="[a, cond && b]"` (falsy entries are ignored by Vue). Keep the class strings verbatim. Remove the `cn` imports.
- [ ] `grep -rn "\bcn(\|lib/utils\|clsx\|tailwind-merge" app` → empty. `pnpm remove clsx tailwind-merge`. Build. Server + proxy recipe: `/bonus` is `ssr:false`, so use puppeteer (mobile) to load `/bonus`, wait 3 s, and assert the tabs render (`document.querySelectorAll('button').length > 0`) and no console errors; screenshot to scratchpad.
- [ ] Commit `refactor: replace cn() with native Vue class bindings and drop clsx/tailwind-merge`.

---

### Task 3: Generic inline SVGs → `<Icon name="tabler:…">`

**Scope rule (user decision):** convert only *generic UI glyphs* that have an unambiguous Tabler equivalent: chevrons/arrows (`tabler:chevron-{left,right,up,down}`, `tabler:arrow-*`), close (`tabler:x`), search (`tabler:search`), check (`tabler:check`), copy (`tabler:copy`), plus/minus, info/alert (`tabler:info-circle`, `tabler:alert-triangle`), lock (`tabler:lock`), eye/eye-off, star, user, phone, calendar, clock, share, download, external-link, refresh, trash, edit, menu (`tabler:menu-2`), dots (`tabler:dots`), moon/sun (`tabler:moon-stars`, `tabler:sun`), bulb (`tabler:bulb`), gift, trophy, heart/thumb-up. **Leave** anything brand-specific or ambiguous (sport balls, casino/game art, custom badges, the pictogram components listed in the Architecture, `logos/`, `app/components/icons/`, `MobileFooterV2.vue` per the 2026-08-07 plan's non-goal).

**Files:** the ~60 files from `grep -rc '<svg' app/components app/pages app/layouts | grep -v ":0"` minus the excluded sets (246 tags). Many are single-icon wrapper components (`ArrowUpSolid.vue`, `ArrowRightSolid.vue`, `ArrowDownSolid.vue`, `ThePadlock.vue`, `MoonStarsIcon.vue`, `LightBulbIcon.vue`, `ShareIdeaIcon.vue`, `EarlyWinIcon.vue`, `OneCutIcon.vue`, `TwoUpIcon.vue`, `SoccerIcon.vue`…) — for those, replace the component's *internals* with a single `<Icon>` when the glyph is generic (arrows, padlock, moon-stars, bulb, share); keep brand ones (`EarlyWinIcon`, `OneCutIcon`, `TwoUpIcon`, `SoccerIcon`) untouched.

- [ ] **Batch A (wrapper components + `app/components/*.vue` files with 1 tag), Batch B (`mobile/`, `casino/`, `profile/`, `affiliate/`, `haki-league/`, `new-league/`, `promo-strip/`, `cashout/`), Batch C (the multi-tag files: `ExploreContent.vue` 11, `HotSection.vue` 10, `casino/CasinoHeroBanner.vue` 7, `CustomerSupportModal.vue` 6, `profile/ProfileLinks.vue` 13 — convert only generic glyphs inside them).** For each `<svg …>…</svg>` decide generic vs brand from the path data/context; when generic, replace with `<Icon name="tabler:<name>" class="<same size/color classes>" aria-hidden="true" />` (keep any `aria-label`/`role` that was on the svg; keep `v-if`/`:class`). Verify every `tabler:` name exists: `node -e 'const c=require("@iconify-json/tabler/icons.json");for(const n of process.argv.slice(1))if(!c.icons[n])console.log("MISSING",n)' <names>`.
- [ ] After each batch: `pnpm build` exits 0; `grep -c '<svg' <touched files>` shows the expected residual (brand-only); Server + proxy recipe + puppeteer mobile screenshot of `/` and one page from the batch; record in the report a table `file → glyphs converted / left (why)`.
- [ ] One commit per batch: `refactor(icons): convert generic inline SVGs to tabler icons (batch A|B|C)`.

---

### Task 4: Replace `@headlessui/vue` with native primitives (5 batches)

**New files** (`app/components/ui/`): `AppDialog.vue`, `AppTabs.vue` + `AppTab.vue` + `AppTabPanel.vue`, `AppMenu.vue`, `AppListbox.vue`. Nuxt auto-registers them as `UiAppDialog` etc.; import explicitly in consumers (`@/components/ui/AppDialog.vue`) to match the codebase's style.

**Batch 4.0 — primitives (no consumers yet).**
- `AppDialog.vue`: props `open` (Boolean), `initialFocus` (Element|null), `static` (Boolean — when true, outside click does not close), `panelClass`, `overlayClass`, `zClass` (default `z-50`); emits `close`. Template: `<Teleport to="body"><Transition name="app-dialog" appear><div v-if="open" class="fixed inset-0" :class="zClass" role="dialog" aria-modal="true" :aria-labelledby="titleId"><div class="fixed inset-0" :class="overlayClass" @click="!static && $emit('close')" /><div ref="panel" tabindex="-1" :class="panelClass"><slot :title-id="titleId" /></div></div></Transition></Teleport>`. Behaviour: on open → remember `document.activeElement`, lock body scroll (`document.body.style.overflow = "hidden"`; restore previous value on close, and only if no other dialog is open — keep a module-level counter), move focus to `initialFocus` or the first focusable in the panel or the panel itself; `keydown.Escape` → emit `close`; `Tab` cycles within the panel (focus trap: on Tab at last focusable → first, Shift+Tab at first → last); on close → restore focus to the remembered element. Transition classes in a scoped style: overlay fade 150 ms, panel fade+scale 150 ms — matching the most common `TransitionChild` classes in the codebase (`grep -rh -A6 "<TransitionChild" app | grep -oE '(enter|leave)[a-z-]*="[^"]*"' | sort | uniq -c | sort -rn | head` — copy the dominant set).
- `AppTabs.vue`: props `modelValue` (Number, selected index), `defaultIndex`, `vertical`; provides `{ selected, select, registerTab, registerPanel }`; emits `update:modelValue`/`change`. `AppTab.vue`: renders `<button role="tab" :aria-selected :tabindex="selected ? 0 : -1" :id :aria-controls>` **or**, when the consumer needs a custom root (Headless UI's `as="template"` + `v-slot="{ selected }"` — 9 sites), exposes `v-slot="{ selected, attrs }"` and renders the slot with `v-bind="attrs"` on the consumer's element (document this in the component comment). Keyboard: ArrowLeft/Right (Up/Down when `vertical`), Home, End move focus and select. `AppTabPanel.vue`: `role="tabpanel"`, `:hidden="!selected"`, `:aria-labelledby`.
- `AppMenu.vue` (button + items): `role="menu"`, `aria-haspopup`, `aria-expanded`, outside click + Escape close, Up/Down/Home/End roving focus over `[role=menuitem]`, Enter/Space activates; slots `button` and default (items), item helper `AppMenuItem` optional — keep it minimal: a `v-slot="{ close }"` on the default slot is enough for the 4 consumers if they render plain `<button role="menuitem">`s (read them first and choose).
- `AppListbox.vue`: `modelValue`, `options` via slot with `{ selected, select }`; `role="listbox"`/`option`, `aria-selected`, Up/Down/Enter/Escape, outside click close.
- Verify with a throwaway page? No — verify in Batch 4.1's smoke. Commit `feat(ui): native dialog, tabs, menu and listbox primitives`.

**Batch 4.1 — dialogs part 1 (14 files), 4.2 — dialogs part 2 (14 files).** For each modal: replace `TransitionRoot :show="x" as="template"` → `<AppDialog :open="x" @close="closeModal" …>`, drop both `TransitionChild`s (their classes move to `overlayClass`/`panelClass`), `Dialog … @close` → the `@close` on `AppDialog` (`static` where the original used `static`; `:initial-focus` passthrough), `DialogPanel` → the panel content (its classes → `panelClass`), `DialogTitle` → `<h2 :id="titleId">` via the slot prop (keep classes). **Preserve** the modal's own gating (`modalType === X && showModal`) and `afterCloseFunction` behaviour. After each batch: build; **modal smoke** for every modal type the batch touched that can be opened from `/` via the modal store (list them from `useModalTypes.js`), plus the Tab-cycle check (focus stays inside), plus a desktop 1350 px check for one modal; the round-3 CSS client-nav proof is not needed. Commit per batch.

**Batch 4.3 — tabs (26 files).** `TabGroup` → `AppTabs` (`:selected-index` → `v-model`/`:default-index`, `@change` kept), `TabList` → `<div role="tablist" …same classes>`, `Tab` → `AppTab` (custom-root sites use the slot form), `TabPanels`/`TabPanel` → `AppTabPanel`s. Smoke: `/sports/soccer` (SportsTabs/MarketsTab), `/my-bets` is auth-gated → skip, `/casino-home` CasinoTabs (ssr:false; wait for hydration), `/leagues`: arrow-key navigation moves `aria-selected` (puppeteer `keyboard.press("ArrowRight")`), panels swap. Commit.

**Batch 4.4 — menus/listboxes (7 files) + removal.** Migrate `CalendarPopover`, `HoursTab`, `MarketSort`, `SortByTimeAndLeague`, `TheCalendar`, `TheLeagues`, `live/LiveSortByMenu`. Then `grep -rn "@headlessui" app` → empty; `pnpm remove @headlessui/vue`; build; full modal smoke + tabs smoke again; `critical-bytes`; Lighthouse 1 run (devtools throttling) for the record. Commit `refactor: remove @headlessui/vue`.

### Task 5 (controller): final review, results section, push.

## Self-review
- Coverage: four asks → Tasks 1–4; user's icon-scope decision encoded in Task 3's scope rule.
- Placeholders: none — each batch names its files, transformation and verification; the only judgement calls (generic vs brand glyph; custom-root tabs) have explicit rules.
- Consistency: `AppDialog`'s `@close` maps to the existing `closeModal` handlers; modal gating logic untouched; Tabs keep `@change`.

## Results (2026-08-29)

| Task | Commits | Outcome |
|---|---|---|
| 1 Patch bumps | `dd3b9f2` | tailwindcss 4.3.1→4.3.3, @tailwindcss/vite →4.3.3, nuxt 4.5.1→4.5.2 |
| 2 `cn()` removal | `e3bba35`, `d046336` | 15 call sites → native `:class` arrays; `clsx` + `tailwind-merge` removed (two BottomNav bindings made mutually exclusive after review) |
| 3 Icons (A/B/C) | `c4995be`, `16dc1a6`, `0c1bf62`, `6887dba`, `4e8fa6f`, `21ef657` | **172 generic inline SVGs → `<Icon name="tabler:…">`**; 188 inline tags remain — the sport/casino/category pictogram sets and brand art the user chose to keep |
| 4.0 Primitives | `189efd0`, `cfa059f`, `2ac3d0d` (+ round 3) | `app/components/ui/`: `AppDialog`, `AppTabs`/`AppTab`/`AppTabPanel`, `AppMenu`, `AppListbox` — focus trap, scroll-lock counter, document-level Escape/Tab with a dialog stack, roving tabindex, clamp on shrink, `useId`-based labelling |
| 4.1–4.2 Dialogs | `08650c5`, `ec3a236` | 28 modals; first-open focus now works (it never did with the lazy-mounted modals); body scroll lock added (the app never had one) |
| 4.3 Tabs | `0d55bcb` | 25 files, 26 groups; arrow/Home/End keyboard navigation verified on 14 tablists |
| 4.4 Menus/listboxes + removal | `052c378`, `d8ff7a7` | 7 files; `@headlessui/vue` removed |

Measured on the built server (live data via the proxy, devtools throttling): critical JS **232 → 218 KB gzip**, `modulepreload` 71 → 68; Lighthouse **perf 88 / a11y 100** (one run; a11y was 95 at the start of the round).

Runtime dependencies now: `@iconify-json/tabler @nuxt/fonts @nuxt/icon @pinia/nuxt dompurify mixpanel-browser nuxt pinia pinia-plugin-persistedstate sweetalert2 swiper vue`.

Review-driven fixes worth knowing about: primitives got three fix rounds (document-level key handling + focusable filter + tab clamp + consumer ids; open-on-mount focus; nested-tablist scoping + Enter/Space activation); `SearchModal` deliberately does not pass `static` (Headless UI's `static` was only a render flag and the original closed on backdrop click); `MarketSort`/`TheLeagues` bound `v-model` to a setter-less computed before — they now hold a local selection (the store has no selection state to mirror).
