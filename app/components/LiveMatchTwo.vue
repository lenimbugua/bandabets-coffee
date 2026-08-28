<script setup>
import { useFormatScores } from "../composables/useFormatScores";
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useBetslipStore } from "@/stores/sports-betslip";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useMatches2Store } from "../stores/matches2";

import TwoUpIcon from "./TwoUpIcon.vue";

const { goToMatchDetails } = useMatchDetails();
const { getDefaultMarket } = storeToRefs(useMatches2Store());
const { resource } = storeToRefs(useSportsQueryParamsStore());
const { selectedMatchIds } = storeToRefs(useBetslipStore());
const { homeScore, awayScore } = useFormatScores();

const formCustomId = (parent_match_id, sub_type_id, outcome_name, index) => {
  return `${parent_match_id}${sub_type_id}${outcome_name}${index}`;
};

const router = useRouter();
defineProps({
  match: {
    type: Object,
    required: true,
  },
});

function isLive() {
  return resource.value === "live";
}

function filterBySubTypeId(data) {
  if (!data.length) {
    return [];
  }
  let item = data.find(
    (item) => item.subTypeId === "" + getDefaultMarket.value
  );
  if (!item) {
    return [];
  }
  return item;
}
</script>
<template>
  <div
    :class="[
      selectedMatchIds.has(match.parentMatchId) ? 'match-selected' : '',
    ]"
    class="live-match-row py-2.5 px-3"
  >
    <!-- Row 1: Competition + live status -->
    <div
      class="flex items-center justify-between mb-1.5 cursor-pointer"
      role="button"
      :aria-label="'View competition: ' + match.competitionName"
      tabindex="0"
      @click="goToMatchDetails(match, router, isLive())"
    >
      <div class="flex items-center gap-1.5 min-w-0">
        <SportsIcons :size="'h-3.5 w-3.5'" :icon="match.sportName" class="shrink-0 opacity-40" />
        <span class="text-[0.6rem] font-medium text-gray-500 dark:text-white/40 truncate uppercase tracking-wide">
          {{ match.competitionName }}
        </span>
      </div>
      <div class="flex items-center gap-1.5 shrink-0 ml-2">
        <TwoUpIcon v-if="match?.markets[0]?.twoGoalUpActive" />
        <span class="text-[0.6rem] font-semibold text-live">{{ match.statusDesc }}</span>
        <span class="text-[0.6rem] font-medium text-gray-500 dark:text-white/40 tabular-nums">{{ match.periodicTime }}'</span>
      </div>
    </div>

    <!-- Row 2: Teams + scores + odds -->
    <div class="flex items-center gap-2">
      <!-- Teams + scores (left) -->
      <div
        class="flex-1 min-w-0 cursor-pointer"
        role="button"
        :aria-label="'View details: ' + match.homeTeam + ' vs ' + match.awayTeam"
        tabindex="0"
        @click="goToMatchDetails(match, router, isLive())"
      >
        <div class="flex items-center justify-between gap-2 mb-1">
          <span class="text-[0.8rem] font-medium text-gray-900 dark:text-white/85 truncate">
            {{ match.homeTeam }}
          </span>
          <span class="text-[0.8rem] font-bold text-live tabular-nums shrink-0">
            {{ homeScore(match.result) }}
          </span>
        </div>
        <div class="flex items-center justify-between gap-2">
          <span class="text-[0.8rem] font-medium text-gray-900 dark:text-white/85 truncate">
            {{ match.awayTeam }}
          </span>
          <span class="text-[0.8rem] font-bold text-live tabular-nums shrink-0">
            {{ awayScore(match.result) }}
          </span>
        </div>
      </div>

      <!-- Odds (right) -->
      <div class="flex items-center gap-1.5 shrink-0">
        <div
          v-if="!filterBySubTypeId(match?.markets)?.matchOutcomes?.length"
          class="flex items-center gap-1.5"
        >
          <button
            v-for="i in 3"
            :key="i"
            class="flex-1 flex flex-col justify-center items-center py-2.5 px-2 rounded-lg min-w-[3.2rem] opacity-50 cursor-pointer odd-btn-locked"
            @click="goToMatchDetails(match, router, isLive())"
          >
            <span class="text-[0.6rem] leading-none mb-0.5 text-gray-400 dark:text-white/30">—</span>
            <Icon name="tabler:lock" class="w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
          </button>
        </div>

        <TheButton
          v-for="outcome in filterBySubTypeId(match?.markets).matchOutcomes"
          v-else
          :key="outcome.id"
          :outcome="outcome"
          :season-id="match.homeTeam"
          :home-team="match.homeTeam"
          :sport-id="match.sportId"
          :custom-id="
            formCustomId(
              match.parentMatchId,
              outcome.marketId,
              outcome.outcomeName,
              outcome.outcomeId
            )
          "
          :away-team="match.awayTeam"
          :start-time="match.startTime"
          :competition-id="match.competitionId"
          :sub-type-id="parseInt(outcome.marketId)"
          :parent-match-id="match.parentMatchId"
          :competition-name="match.competitionName"
          :country-name="match.countryName"
          :two-goal-up-active="match?.markets[0]?.twoGoalUpActive"
          :sport-name="match.sportName"
          :live="1"
        />

        <div
          class="shrink-0 cursor-pointer text-[0.65rem] font-semibold text-live whitespace-nowrap pl-1 flex items-center gap-0.5"
          role="button"
          :aria-label="'View more markets for ' + match.homeTeam + ' vs ' + match.awayTeam"
          tabindex="0"
          @click="goToMatchDetails(match, router, isLive())"
        >
          +{{ match.marketCount }}
          <Icon name="tabler:chevron-right" class="w-3 h-3" aria-hidden="true" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.live-match-row {
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
.live-match-row:last-child {
  border-bottom: none;
}
[data-theme="dark"] .live-match-row {
  border-bottom-color: oklch(100% 0 0 / 0.05);
}
.live-match-row:nth-child(even) {
  background: var(--surface-sunken);
}
[data-theme="dark"] .live-match-row:nth-child(even) {
  background: oklch(100% 0 0 / 0.02);
}

.match-selected {
  background: oklch(70% 0.19 142 / 0.04);
  box-shadow: inset 0 0 0 1.5px oklch(70% 0.19 142 / 0.2);
  border-radius: 0.625rem;
}
[data-theme="dark"] .match-selected {
  background: oklch(70% 0.19 142 / 0.06);
  box-shadow: inset 0 0 0 1.5px oklch(70% 0.19 142 / 0.25);
}
.odd-btn-locked {
  background: var(--surface-elevated);
  border: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .odd-btn-locked {
  background: oklch(100% 0 0 / 0.06);
  border-color: transparent;
}
</style>
