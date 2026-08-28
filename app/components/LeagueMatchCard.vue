<script setup>
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useCompetionsStore } from "@/stores/competitions";
import { useBetslipStore } from "@/stores/sports-betslip";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import { storeToRefs } from "pinia";
import { toRefs } from "vue";
import { useRouter } from "vue-router";
import { useFormatDates } from "../composables/useFormatDates";
import { useMatches2Store } from "../stores/matches2";
import EmptyState from "./EmptyState.vue";

const { goToMatchDetails } = useMatchDetails();
const { selectedMatchIds } = storeToRefs(useBetslipStore());
const router = useRouter();
const { scrollId } = toRefs(useSportsQueryParamsStore());
const { getDefaultMarket } = toRefs(useMatches2Store());

const formCustomId = (parent_match_id, sub_type_id, outcome_name, index) => {
  return `${parent_match_id}${sub_type_id}${outcome_name}${index}`;
};

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

const { humanFriendlyDate } = useFormatDates();
const { competitions, pending } = toRefs(useCompetionsStore());

function outcomeIsLocked(status) {
  return status === -1;
}
</script>
<template>
  <AnimatePulse v-if="pending" :rows="10" />
  <EmptyState v-else-if="!competitions?.length" />

  <div
    v-for="competition in competitions"
    v-else
    :key="competition.competitionId"
    class="mx-2 my-2.5 bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 rounded-xl overflow-hidden"
  >
    <!-- Competition header -->
    <div
      class="px-3 py-2.5 bg-gray-100/50 dark:bg-white/5 flex justify-between items-center"
      :class="!competition.isOpened ? 'border-b border-gray-100 dark:border-white/5' : ''"
    >
      <span class="text-xs font-semibold text-gray-600 dark:text-gray-400">
        {{ competition.competitionName }}
      </span>
      <button
        type="button"
        class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
        :aria-label="competition.isOpened ? 'Expand ' + competition.competitionName : 'Collapse ' + competition.competitionName"
        @click="competition.isOpened = !competition.isOpened"
      >
        <Icon name="tabler:chevron-up" v-if="!competition.isOpened" class="h-4.5 w-4.5" />
        <Icon name="tabler:chevron-down" v-else class="h-4.5 w-4.5" />
      </button>
    </div>

    <!-- Matches -->
    <div v-if="!competition.isOpened" class="divide-y divide-gray-100 dark:divide-white/5">
      <div
        v-for="(match, idx) in competition.matches"
        :key="match.parentMatchId"
        :class="[
          `match${match.parentMatchId}`,
          { 'animate-highlight-fade': match.parentMatchId === scrollId },
          selectedMatchIds.has(match.parentMatchId) ? 'match-selected' : idx % 2 === 1 ? 'bg-gray-50/50 dark:bg-white/1.5' : '',
        ]"
        class="px-3 py-2.5"
      >
        <!-- Date + more markets -->
        <div class="flex justify-between items-center mb-2">
          <div
            class="flex items-center gap-1.5 cursor-pointer"
            role="button"
            :aria-label="'View date for ' + match.homeTeam + ' vs ' + match.awayTeam"
            tabindex="0"
            @click="goToMatchDetails(match, router, false)"
          >
            <TwoUpIcon v-if="match?.markets[0]?.twoGoalUpActive" />
            <span class="text-[0.65rem] text-gray-400 dark:text-gray-500">
              {{ humanFriendlyDate(match.startTime) }}
            </span>
          </div>
          <div
            class="flex items-center gap-0.5 text-brand-bright font-semibold cursor-pointer"
            role="button"
            :aria-label="'View more markets for ' + match.homeTeam + ' vs ' + match.awayTeam"
            tabindex="0"
            @click="goToMatchDetails(match, router, false)"
          >
            <span class="text-[0.7rem]">+{{ match.marketCount }}</span>
            <Icon name="tabler:chevron-right" class="h-3.5 w-3.5" />
          </div>
        </div>

        <!-- Teams + odds -->
        <div class="flex items-center gap-2">
          <div
            class="w-[35%] shrink-0 min-w-0 space-y-1 cursor-pointer"
            role="button"
            :aria-label="'View details: ' + match.homeTeam + ' vs ' + match.awayTeam"
            tabindex="0"
            @click="goToMatchDetails(match, router, false)"
          >
            <div class="text-[0.8rem] font-semibold text-gray-800 dark:text-gray-200 truncate">{{ match.homeTeam }}</div>
            <div class="text-[0.8rem] font-semibold text-gray-800 dark:text-gray-200 truncate">{{ match.awayTeam }}</div>
          </div>
          <div class="flex-1 flex items-center gap-1">
            <template v-if="!filterBySubTypeId(match?.markets)?.matchOutcomes?.length || outcomeIsLocked(match?.markets[0]?.status)">
              <button
                v-for="i in 3"
                :key="'lock-'+i"
                class="flex-1 flex flex-col justify-center items-center py-2.5 px-2 rounded-lg min-w-[3.2rem] opacity-50 cursor-pointer odd-btn-locked"
                @click="goToMatchDetails(match, router, false)"
              >
                <span class="text-[0.6rem] leading-none mb-0.5 text-gray-400 dark:text-white/30">—</span>
                <Icon name="tabler:lock" class="w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
              </button>
            </template>
            <TheButton
              v-for="outcome in filterBySubTypeId(match?.markets).matchOutcomes"
              v-else
              :key="outcome.id"
              :outcome="outcome"
              :season-id="match.homeTeam"
              :home-team="match.homeTeam"
              :sport-id="match.sportId"
              :two-goal-up-active="match?.markets[0]?.twoGoalUpActive"
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
              :competition-name="match.competitionName"
              :country-name="match.countryName"
              :sport-name="match.sportName"
              :parent-match-id="match.parentMatchId"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.match-selected {
  background: oklch(70% 0.19 142 / 0.05);
  border-radius: 0.625rem;
}
[data-theme="dark"] .match-selected {
  background: oklch(70% 0.19 142 / 0.08);
}
.odd-btn-locked {
  background: var(--surface-sunken);
  border: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .odd-btn-locked {
  background: oklch(100% 0 0 / 0.06);
  border-color: transparent;
}
</style>
