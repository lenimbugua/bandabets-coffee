<script setup>
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useFormatDates } from "../composables/useFormatDates";
import { useFormatScores } from "../composables/useFormatScores";


const { goToMatchDetails } = useMatchDetails();

const { formatDate } = useFormatDates();
const { homeScore, awayScore } = useFormatScores();

const { resource } = storeToRefs(useSportsQueryParamsStore());

const formCustomId = (parent_match_id, sub_type_id, outcome_name, index) => {
  return `${parent_match_id}${sub_type_id}${outcome_name}${index}`;
};

const router = useRouter();
defineProps({
  matches: {
    type: Array,
    required: true,
  },
});

function isLive() {
  return resource.value === "live";
}

function outcomeIsLocked(status) {
  return status === -1;
}
</script>
<template>
  <div
    v-for="match in matches"
    :key="match.id"
    class="group/match w-full hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-all duration-150"
  >
    <div
      class="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-white/4"
    >
      <!-- Teams + meta -->
      <div
        class="flex-col w-1/2 md:w-1/3 cursor-pointer space-y-1.5"
        role="button"
        :aria-label="'View details: ' + match.homeTeam + ' vs ' + match.awayTeam"
        tabindex="0"
        @click="goToMatchDetails(match, router, false)"
      >
        <div class="space-y-1 text-[0.8rem] font-medium leading-none">
          <div class="text-gray-800 dark:text-white/70">{{ match.homeTeam }}</div>
          <div class="text-gray-800 dark:text-white/70">{{ match.awayTeam }}</div>
        </div>
        <div class="flex items-center gap-2 text-[0.6rem] font-bold text-gray-400 dark:text-white/30">
          <div v-if="isLive()">
            <span class="text-red-500">{{ match.statusDesc }}</span>
            <span class="ml-0.5">{{ match.periodicTime }}'</span>
          </div>
          <div v-else>
            {{ formatDate(match.startTime) }}
          </div>
          <span class="text-gray-300 dark:text-white/15">+{{ match.marketCount }}</span>
        </div>
      </div>

      <!-- Scores + Markets -->
      <div class="w-1/2 md:w-2/3 flex justify-end items-center py-1 gap-3">
        <!-- Live scores -->
        <div
          v-if="isLive()"
          class="flex flex-col items-center gap-1 text-sm font-black text-gray-600 dark:text-white/50"
        >
          <span>{{ homeScore(match.result) }}</span>
          <span>{{ awayScore(match.result) }}</span>
        </div>

        <!-- Market 1 (always visible) -->
        <div class="w-full md:w-1/3 flex gap-1 text-xs justify-end items-center">
          <template v-if="outcomeIsLocked(match?.markets[0]?.status)">
            <button v-for="i in 3" :key="'lock0-'+i" class="flex-1 flex flex-col justify-center items-center py-2.5 px-2 rounded-lg min-w-[3.2rem] opacity-50 odd-btn-locked" @click="goToMatchDetails(match, router, false)">
              <span class="text-[0.6rem] leading-none mb-0.5 text-gray-400 dark:text-white/30">—</span>
              <Icon name="tabler:lock" class="w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
            </button>
          </template>
          <TheButton
            v-for="outcome in match?.markets[0]?.matchOutcomes"
            v-else
            :key="outcome.id"
            :outcome="outcome"
            :season-id="match.homeTeam"
            :home-team="match.homeTeam"
            :sport-id="match.sportId"
            :custom-id="
              formCustomId(
                match.parentMatchId,
                match.markets[0].subTypeId,
                outcome.outcomeName,
                outcome.outcomeId
              )
            "
            :away-team="match.awayTeam"
            :start-time="match.startTime"
            :competition-id="match.competitionId"
            :sub-type-id="match.markets[0]?.subTypeId"
            :parent-match-id="match.parentMatchId"
          />
        </div>

        <!-- Market 2 (md+) -->
        <div class="w-1/3 hidden md:flex gap-1 text-xs justify-end items-center">
          <template v-if="outcomeIsLocked(match?.markets[1]?.status)">
            <button v-for="i in 3" :key="'lock1-'+i" class="flex-1 flex flex-col justify-center items-center py-2.5 px-2 rounded-lg min-w-[3.2rem] opacity-50 odd-btn-locked" @click="goToMatchDetails(match, router, false)">
              <span class="text-[0.6rem] leading-none mb-0.5 text-gray-400 dark:text-white/30">—</span>
              <Icon name="tabler:lock" class="w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
            </button>
          </template>
          <TheButton
            v-for="outcome in match?.markets[1]?.matchOutcomes"
            v-else
            :key="outcome.id"
            :outcome="outcome"
            :season-id="match.homeTeam"
            :home-team="match.homeTeam"
            :sport-id="match.sportId"
            :custom-id="
              formCustomId(
                match.parentMatchId,
                match.markets[1].subTypeId,
                outcome.outcomeName,
                outcome.outcomeId
              )
            "
            :away-team="match.awayTeam"
            :start-time="match.startTime"
            :competition-id="match.competitionId"
            :sub-type-id="match.markets[1]?.subTypeId"
            :parent-match-id="match.parentMatchId"
          />
        </div>

        <!-- Market 3 (xl+) -->
        <div class="w-1/3 hidden xl:flex gap-1 text-xs justify-end items-center">
          <template v-if="outcomeIsLocked(match?.markets[2]?.status)">
            <button v-for="i in 3" :key="'lock2-'+i" class="flex-1 flex flex-col justify-center items-center py-2.5 px-2 rounded-lg min-w-[3.2rem] opacity-50 odd-btn-locked" @click="goToMatchDetails(match, router, false)">
              <span class="text-[0.6rem] leading-none mb-0.5 text-gray-400 dark:text-white/30">—</span>
              <Icon name="tabler:lock" class="w-3.5 h-3.5 text-gray-400 dark:text-white/30" aria-hidden="true" />
            </button>
          </template>
          <TheButton
            v-for="outcome in match?.markets[2]?.matchOutcomes"
            v-else
            :key="outcome.id"
            :outcome="outcome"
            :season-id="match.homeTeam"
            :home-team="match.homeTeam"
            :sport-id="match.sportId"
            :custom-id="
              formCustomId(
                match.parentMatchId,
                match.markets[2].subTypeId,
                outcome.outcomeName,
                outcome.outcomeId
              )
            "
            :away-team="match.awayTeam"
            :start-time="match.startTime"
            :competition-id="match.competitionId"
            :sub-type-id="match.markets[2]?.subTypeId"
            :parent-match-id="match.parentMatchId"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.odd-btn-locked {
  background: var(--surface-sunken);
  border: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .odd-btn-locked {
  background: oklch(100% 0 0 / 0.06);
  border-color: transparent;
}
</style>
