<script setup>
import { useFormatScores } from "@/composables/useFormatScores";
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useLiveMatchesStore } from "@/stores/live-matches";
import { useBetslipStore } from "@/stores/sports-betslip.js";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();
const liveMatchesStore = useLiveMatchesStore();
const { previewMatches, previewPending, sports } = storeToRefs(liveMatchesStore);
const { goToMatchDetails } = useMatchDetails();
const { homeScore, awayScore } = useFormatScores();
const { selectedMatchIds } = storeToRefs(useBetslipStore());
const selectedSport = ref("");
const selectedMarketIndex = ref(0);

onMounted(() => {
  liveMatchesStore.getLiveSports();
  liveMatchesStore.getPreviewLiveMatches();
});

const liveSports = computed(() => {
  return sports.value.filter((s) => s.sportId !== "");
});

const marketTabs = [
  { label: "1X2", index: 0 },
  { label: "Over/Under", index: 1 },
  { label: "Double Chance", index: 2 },
  { label: "1st Half", index: 3 },
];

const flatMatches = computed(() => {
  const result = [];
  for (const competition of previewMatches.value) {
    if (!competition.matches) continue;
    for (const match of competition.matches) {
      result.push({
        ...match,
        competitionName: competition.competitionName,
        countryName: competition.countryName,
        sportName: competition.sportName,
        sportId: competition.sportId,
      });
      if (result.length >= 6) return result;
    }
  }
  return result;
});

const liveCount = computed(() => {
  let count = 0;
  for (const comp of previewMatches.value) {
    count += comp.matches?.length || 0;
  }
  return count;
});

const formCustomId = (parentMatchId, subTypeId, outcomeName, index) => {
  return `${parentMatchId}${subTypeId}${outcomeName}${index}`;
};

function getMarket(match) {
  if (!match.markets?.length) return null;
  return match.markets[selectedMarketIndex.value] || match.markets[0];
}

function getMarketGridCols(match) {
  const market = getMarket(match);
  return market?.matchOutcomes?.length || 3;
}

function getOutcomeLabels(match) {
  const market = getMarket(match);
  if (!market?.matchOutcomes?.length) return ["1", "X", "2"];
  return market.matchOutcomes.map((o) => o.outcomeName || "");
}

function selectSport(sportId) {
  const newSport = selectedSport.value === sportId ? "" : sportId;
  selectedSport.value = newSport;
  liveMatchesStore.getPreviewLiveMatches(newSport);
}
</script>

<template>
  <div class="live-preview-container rounded-xl overflow-hidden">
    <!-- Header -->
    <div class="rounded-t-xl">
      <!-- Row 1: "Live" + sport tabs -->
      <div class="flex items-center gap-3 px-3 pt-3 pb-1.5 overflow-x-auto scrollbar-hide">
        <span class="text-base font-bold text-gray-900 dark:text-white italic shrink-0">Live</span>
        <div class="w-px h-4 bg-gray-300 dark:bg-white/20 shrink-0"></div>
        <div class="flex items-center gap-3">
          <button
            v-for="sport in liveSports"
            :key="sport.sportId"
            class="text-[0.75rem] font-semibold whitespace-nowrap shrink-0 transition-colors cursor-pointer"
            :class="[
              selectedSport === sport.sportId
                ? 'text-red-500'
                : selectedSport === '' && liveSports[0]?.sportId === sport.sportId
                  ? 'text-red-500'
                  : 'text-gray-500 dark:text-white/60 hover:text-gray-700 dark:hover:text-white/80',
            ]"
            @click="selectSport(sport.sportId)"
          >
            {{ sport.sportName }}
          </button>
        </div>
        <RouterLink
          :to="{ name: 'live', params: { sport: 'soccer' } }"
          class="hidden lg:flex items-center gap-1 ml-auto text-[0.75rem] font-semibold text-red-500 hover:text-red-400 transition-colors shrink-0"
        >
          All Live Events ({{ liveCount }})
          <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
        </RouterLink>
      </div>

      <!-- Row 2: Market pills -->
      <div class="flex items-center gap-2 px-3 pb-2 overflow-x-auto scrollbar-hide">
        <button
          v-for="tab in marketTabs"
          :key="tab.index"
          class="market-pill shrink-0 px-3 py-1 rounded-full text-[0.7rem] font-semibold whitespace-nowrap transition-colors cursor-pointer"
          :class="[
            selectedMarketIndex === tab.index
              ? 'bg-red-500 text-white'
              : 'market-pill-inactive',
          ]"
          @click="selectedMarketIndex = tab.index"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- Column header with search -->
      <ColumnHeaderSearch
        v-if="flatMatches.length > 0"
        :matches="flatMatches"
        :outcome-labels="getOutcomeLabels(flatMatches[0])"
        :is-live="true"
        variant="live"
      />
    </div>

    <!-- Content -->
    <div class="rounded-b-xl overflow-hidden">

      <!-- Loading skeleton -->
      <div v-if="previewPending" class="space-y-px">
        <div v-for="i in 3" :key="i" class="px-3 py-4">
          <div class="h-3 w-3/4 bg-gray-100 dark:bg-white/5 rounded animate-pulse mb-3"></div>
          <div class="flex items-center gap-3">
            <div class="w-[55%] space-y-1.5">
              <div class="h-3 w-4/5 bg-gray-100 dark:bg-white/5 rounded animate-pulse"></div>
              <div class="h-3 w-3/5 bg-gray-100 dark:bg-white/5 rounded animate-pulse"></div>
            </div>
            <div class="w-[45%] grid grid-cols-3 gap-1.5">
              <div class="h-8 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse"></div>
              <div class="h-8 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse"></div>
              <div class="h-8 bg-gray-100 dark:bg-white/5 rounded-md animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Match rows -->
      <div v-else-if="flatMatches.length > 0" class="live-match-list divide-y divide-gray-100 dark:divide-white/5">
        <div
          v-for="(match, idx) in flatMatches"
          :key="match.parentMatchId"
          class="px-3 py-2.5"
          :class="[
            selectedMatchIds.has(match.parentMatchId) ? 'match-selected' : idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-white/1.5' : '',
          ]"
        >
          <!-- Row 1: time + period + competition + markets count -->
          <div
            class="flex items-center gap-1.5 mb-2 min-w-0 cursor-pointer"
            @click="goToMatchDetails(match, router, true)"
          >
            <span class="text-[0.7rem] font-bold text-red-500 shrink-0">
              {{ match.periodicTime || "—" }}
            </span>
            <span class="text-[0.7rem] font-semibold text-gray-900 dark:text-white shrink-0">
              {{ match.statusDesc || "" }}
            </span>
            <span class="text-[0.65rem] text-gray-500 dark:text-white/40 truncate min-w-0">
              {{ match.countryName }} - {{ match.competitionName }}
            </span>
            <span
              class="text-[0.65rem] text-red-500 font-medium shrink-0 ml-auto"
            >
              +{{ match.marketCount || 0 }}&gt;
            </span>
          </div>

          <!-- Row 2-3: teams + scores + odds -->
          <div class="flex items-center">
            <!-- Left: teams + scores -->
            <div
              class="w-[55%] pr-2 space-y-0.5 cursor-pointer"
              @click="goToMatchDetails(match, router, true)"
            >
              <div class="flex items-center justify-between">
                <span class="text-[0.8rem] font-medium text-gray-900 dark:text-white truncate mr-2">
                  {{ match.homeTeam }}
                </span>
                <span class="text-[0.8rem] font-bold text-red-500 tabular-nums shrink-0">
                  {{ homeScore(match.result) }}
                </span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[0.8rem] font-medium text-gray-900 dark:text-white truncate mr-2">
                  {{ match.awayTeam }}
                </span>
                <span class="text-[0.8rem] font-bold text-red-500 tabular-nums shrink-0">
                  {{ awayScore(match.result) }}
                </span>
              </div>
            </div>

            <!-- Right: odds buttons -->
            <div class="w-[45%]">
              <div
                v-if="getMarket(match)?.matchOutcomes?.length"
                :class="`grid-cols-${getMarketGridCols(match)}`"
                class="grid gap-1.5"
              >
                <TheButton2
                  v-for="outcome in getMarket(match).matchOutcomes"
                  :key="outcome.outcomeId"
                  :outcome="outcome"
                  :season-id="match.homeTeam"
                  :home-team="match.homeTeam"
                  :sport-id="match.sportId || ''"
                  :two-goal-up-active="getMarket(match)?.twoGoalUpActive || false"
                  :custom-id="formCustomId(match.parentMatchId, outcome.marketId, outcome.outcomeName, outcome.outcomeId)"
                  :away-team="match.awayTeam"
                  :start-time="match.startTime || ''"
                  :competition-id="match.competitionId || 0"
                  :sub-type-id="parseInt(outcome.marketId) || 0"
                  :competition-name="match.competitionName || ''"
                  :country-name="match.countryName || ''"
                  :sport-name="match.sportName || ''"
                  :parent-match-id="match.parentMatchId"
                  :live="1"
                />
              </div>
              <div
                v-else
                :class="`grid-cols-${getMarketGridCols(match)}`"
                class="grid gap-1.5"
              >
                <button
                  v-for="i in getMarketGridCols(match)"
                  :key="i"
                  class="locked-odds-btn flex flex-col justify-center items-center p-1 h-full min-h-10 shadow-md rounded-md transition-colors opacity-50"
                  @click="goToMatchDetails(match, router, true)"
                >
                  <span class="text-xs text-gray-400 dark:text-white/25 leading-none mb-0.5">—</span>
                  <Icon name="tabler:lock" class="w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- Empty state -->
      <BaseEmptyState
        v-else
        icon="tabler:broadcast"
        title="No live matches"
        description="Live events will appear here"
        size="sm"
        compact
      />

      <!-- Footer -->
      <div class="px-3 py-2.5 border-t border-gray-100 dark:border-white/5 lg:hidden">
        <RouterLink
          :to="{ name: 'live', params: { sport: 'soccer' } }"
          class="flex items-center justify-end gap-1 text-[0.75rem] font-semibold text-red-500"
        >
          All Live Events ({{ liveCount }})
          <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
.live-preview-container {
  background: white;
  border: 1px solid var(--border);
  box-shadow:
    0 1px 2px oklch(0% 0 0 / 0.04),
    0 2px 8px oklch(0% 0 0 / 0.02);
}
[data-theme="dark"] .live-preview-container {
  background: oklch(100% 0 0 / 0.03);
  border-color: transparent;
  box-shadow: none;
}

/* Market pills - inactive state */
.market-pill-inactive {
  background: var(--surface-interactive);
  color: var(--muted-foreground);
}
[data-theme="dark"] .market-pill-inactive {
  background: oklch(100% 0 0 / 0.1);
  color: oklch(100% 0 0 / 0.6);
}

/* Selected match highlight */
.match-selected {
  background: oklch(55% 0.19 142 / 0.06);
}
[data-theme="dark"] .match-selected {
  background: oklch(55% 0.19 142 / 0.08);
}

/* Locked odds buttons */
.locked-odds-btn {
  background: var(--surface-elevated);
}
.locked-odds-btn:hover {
  background: var(--surface-active);
}
[data-theme="dark"] .locked-odds-btn {
  background: oklch(100% 0 0 / 0.05);
}
[data-theme="dark"] .locked-odds-btn:hover {
  background: oklch(100% 0 0 / 0.1);
}
</style>
