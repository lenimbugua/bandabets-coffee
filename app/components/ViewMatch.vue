<script setup>
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import AppTabPanel from "@/components/ui/AppTabPanel.vue";
import { useHead } from "@unhead/vue";
import { computed, onUnmounted, ref, toRefs, watch } from "vue";
import { onBeforeRouteLeave, useRoute } from "vue-router";
import { useGeniusGameTracker } from "../composables/useGeniusGameTracker";
import { useIconNames } from "../composables/useIconNames";
import { useMatchesStore } from "../stores/matches";
import BetBuilder from "./BetBuilder.vue";
import { useCompetionsStore } from "@/stores/competitions";
import EmptyState from "./EmptyState.vue";
import AppIcons from "./icons/AppIcons.vue";
import MatchDetails from "./MatchDetails.vue";
import MatchDetailsMatch from "./MatchDetailsMatch.vue";

const route = useRoute();

// Reactive, not a one-shot read: navigating from one match's details to
// another (betslip panel, search) stays on the same route record, so this
// component is REUSED — setup does not re-run. A frozen matchId left the
// old match's poll interval overwriting the store every tick, flipping the
// page back to the previous match.
const matchId = computed(() => route.params.id);

// Batch E SSR-hazard fix (docs/superpowers/plans/2026-08-04-nuxt-migration-phase-2.md
// §9): useRuntimeConfig() must sit at the top of setup, not below the
// setInterval/performInitialFetch calls it used to follow — if this file is
// ever reordered again, keeping the composable call first means it can
// never accidentally end up hoisted to module scope (rule 2, "nuxt
// instance unavailable").
const { public: config } = useRuntimeConfig();
const pollFrequency = parseInt(config.livePollInterval)
  ? parseInt(config.livePollInterval)
  : 10000;

const { setMatchId } = useSportsQueryParamsStore();
const { selectCompetitions } = useCompetionsStore();
const { isGeniusGameTrackerSport } = useGeniusGameTracker(matchId.value);

const { betBuilderIcon, solarDocumentTextBroken, statsIcon } = useIconNames();

const prematchTabs = ref([
  {
    name: "Markets",
    alias: "Markets",
    icon: solarDocumentTextBroken,
    isHot: false,
  },
  {
    name: "BetBuilder",
    alias: "Bet Builder",
    icon: betBuilderIcon,
    isHot: true,
  },
  {
    name: "stats",
    alias: "Stats",
    icon: statsIcon,
    isHot: false,
  },
]);

const liveTabs = ref([
  {
    name: "Markets",
    alias: "Markets",
    icon: solarDocumentTextBroken,
    isHot: false,
  },
  {
    name: "stats",
    alias: "Stats",
    icon: statsIcon,
    isHot: false,
  },
]);

const { matchDetails, pending } = toRefs(useMatchesStore());

const { pollMatchDetails, fetchMatchDetails } = useMatchesStore();

useHead({
  script: [
    {
      type: "application/ld+json",
      key: "match-details-schema",
      children: computed(() => {
        const m = matchDetails.value;
        if (!m) return "{}";
        const baseUrl = "https://bandabets.com";
        const slug = m.homeTeam && m.awayTeam
          ? `${m.homeTeam} vs ${m.awayTeam}`
          : "Sports Match";
        return JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SportsEvent",
          name: slug,
          url: `${baseUrl}${route.path}`,
          eventStatus: m.isLiveCoverage
            ? "https://schema.org/EventInProgress"
            : "https://schema.org/EventScheduled",
          startDate: m.startTime ?? new Date().toISOString(),
          competitor: [
            { "@type": "SportsTeam", name: m.homeTeam ?? "Home Team" },
            { "@type": "SportsTeam", name: m.awayTeam ?? "Away Team" },
          ],
          organizer: {
            "@type": "Organization",
            name: "Bandabets",
            url: baseUrl,
          },
        });
      }),
    },
  ],
});

// SSR-hazard fix: this used to be a synchronous, un-awaited
// performInitialFetch() call. During SSR that's a floating promise the
// render never sees, so the markup serialised the empty `pending` state —
// ssr:true bought nothing. Awaiting useAsyncData makes Nuxt wait for the
// real fetch before finishing the server render.
// lazy: on client-side navigation the route changes immediately and the
// pending skeleton shows while the fetch runs — without it, Vue Router
// suspends navigation on this await and the OLD page sits frozen until the
// API responds, which reads as the app being slow. SSR is unaffected: the
// server still fetches before rendering, so direct visits stay fully
// rendered for SEO.
// fetchMatchDetails (not pollMatchDetails) even for live matches: it sets
// `pending`, which drives the skeleton; the poll variant is silent by design
// and belongs only to the background interval below.
await useAsyncData(
  `match-details-${matchId.value}`,
  async () => {
    await fetchMatchDetails(matchId.value);
    return true;
  },
  { lazy: true }
);

// Same-route navigation (details → details) reuses this component, so the
// param change is the only signal a different match was requested. Covers
// back/forward between two match URLs too, where goToMatchDetails never runs.
watch(matchId, (id) => {
  if (!id) return;
  fetchMatchDetails(id);
});

// SSR-hazard fix: this setInterval used to run unconditionally at setup —
// i.e. it executed during SSR too. Its only cleanup, onBeforeRouteLeave
// below, never fires on the server, so every request leaked one live
// timer into the Node process, each polling forever. Guard with
// import.meta.client (or move to onMounted) so it only ever starts in the
// browser.
let intervalId = null;
if (import.meta.client) {
  intervalId = setInterval(() => {
    if (matchDetails?.value?.isLiveCoverage) {
      pollMatchDetails(matchId.value);
    }
  }, pollFrequency);
}

onBeforeRouteLeave(() => {
  setMatchId("");
  clearInterval(intervalId);
  selectCompetitions([]);
});

// onBeforeRouteLeave never fires when only params change, and a keyed
// remount would skip it entirely — clear on unmount too so no poll
// interval can outlive the component.
onUnmounted(() => {
  clearInterval(intervalId);
});
</script>
<template>
  <div>
    <div
      class="view-match-container w-full mt-2 md:mt-0 overflow-hidden rounded-2xl md:rounded-none"
    >
      <!-- Header bar: stays put while loading so navigation feels anchored -->
      <div
        class="sticky top-0 z-55 header-bar"
      >
        <div class="flex items-center justify-between px-4 h-12">
          <button
            aria-label="Go back"
            class="p-2 -ml-2 rounded-xl text-gray-500 dark:text-white/65 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer active:scale-95"
            @click="$router.go(-1)"
          >
            <Icon name="tabler:chevron-left" class="w-5 h-5" />
          </button>
          <span class="text-[0.68rem] font-semibold tracking-[0.1em] uppercase text-gray-500 dark:text-white/65">
            Match Details
          </span>
          <div class="w-9"></div>
        </div>
      </div>

      <MatchDetailsSkeleton v-if="pending" />

      <div v-else-if="matchDetails">
        <MatchDetailsMatch :match-details />

        <AppTabs>
          <!-- Tab navigation -->
          <div
            role="tablist"
            aria-label="Match detail tabs"
            class="sticky top-12 md:top-24 lg:top-30 z-55 flex gap-2 mx-3 mt-4 mb-3 overflow-x-auto scrollbar-hide"
          >
            <AppTab
              v-for="tab in matchDetails.isLiveCoverage
                ? liveTabs
                : prematchTabs"
              :key="tab.name"
              v-slot="{ selected, attrs }"
              as="template"
            >
              <button
                :class="[
                  selected
                    ? 'tab-active bg-brand-bright/10 text-brand-bright font-semibold'
                    : 'tab-idle text-gray-500 dark:text-white/65 hover:text-gray-600 dark:hover:text-white/80',
                ]"
                class="relative flex items-center gap-1.5 px-4 py-2 rounded-xl text-[0.65rem] font-medium tracking-[0.02em] whitespace-nowrap transition-all duration-200 cursor-pointer focus:outline-hidden"
                v-bind="attrs"
              >
                <AppIcons :icon-name="tab.icon" icon-css="h-3.5 w-3.5 opacity-60" />
                <span>{{ tab.alias }}</span>
                <span
                  v-if="tab.isHot"
                  class="px-1.5 py-0.5 rounded-md bg-gold-bright text-[oklch(15%_0.04_258)] text-[0.4rem] font-bold leading-none uppercase tracking-wider"
                >
                  New
                </span>
              </button>
            </AppTab>
          </div>

          <div>
            <AppTabPanel>
              <MatchDetails />
            </AppTabPanel>
            <AppTabPanel v-if="!matchDetails.isLiveCoverage">
              <BetBuilder />
            </AppTabPanel>
            <AppTabPanel>
              <GeniusGameTracker v-if="isGeniusGameTrackerSport()" />
            </AppTabPanel>
          </div>
        </AppTabs>
      </div>
      <EmptyState v-else />
    </div>
  </div>
</template>

<style scoped>
.view-match-container {
  background: var(--background);
}
[data-theme="dark"] .view-match-container {
  background: var(--background);
}

.header-bar {
  background: color-mix(in oklch, var(--surface-elevated) 95%, transparent);
  backdrop-filter: blur(12px);
}
[data-theme="dark"] .header-bar {
  background: var(--card);
  backdrop-filter: blur(12px);
}

.tab-idle {
  background: color-mix(in oklch, var(--surface-sunken) 60%, transparent);
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .tab-idle {
  background: oklch(100% 0 0 / 0.06);
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.12);
}
.tab-idle:hover {
  background: color-mix(in oklch, var(--surface-sunken) 80%, transparent);
}
[data-theme="dark"] .tab-idle:hover {
  background: oklch(100% 0 0 / 0.1);
}

.tab-active {
  box-shadow: 0 1px 3px oklch(70% 0.19 142 / 0.1);
}
</style>
