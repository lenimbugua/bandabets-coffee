<script setup>
import { useFormatScores } from "@/composables/useFormatScores";
import { useLiveMatchesStore } from "@/stores/live-matches";
import { useMatches2Store } from "@/stores/matches2";
import { ref, toRefs } from "vue";
import { useRouter } from "vue-router";
import { useMatchDetails } from "../../composables/useMatchDetails";
const { goToMatchDetails } = useMatchDetails();

const { homeScore, awayScore } = useFormatScores();
const { getDefaultMarket } = toRefs(useMatches2Store());

const formCustomId = (parent_match_id, sub_type_id, outcome_name, index) => {
  return `${parent_match_id}${sub_type_id}${outcome_name}${index}`;
};

const router = useRouter();

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

const { matches, pending } = toRefs(useLiveMatchesStore());
const isOpened = ref(false);
</script>
<template>
  <AnimatePulse v-if="pending" :rows="10" />
  <EmptyState v-else-if="!matches?.length" />
  <div
    v-for="i in 4"
    v-else
    :key="i"
    class="mb-2 rounded-md dark:bg-surface-sunken bg-white border border-gray-100 dark:border-0 shadow-sm overflow-hidden cursor-pointer"
  >
    <div
      class="px-3 py-0.5 bg-gray-50 dark:bg-card flex justify-between items-center"
    >
      <div class="flex items-center">
        <span class="text-xs text-gray-700 dark:text-gray-300"
          >English Premier League</span
        >
      </div>
      <div class="flex gap-5 text-gray-500 dark:text-gray-300">
        <button type="button" :aria-label="isOpened ? 'Collapse competition' : 'Expand competition'" class="cursor-pointer" @click="isOpened = !isOpened">
          <Icon name="tabler:chevron-up" v-if="!isOpened" class="h-5 w-5" />
          <Icon name="tabler:chevron-down" v-else class="h-5 w-5" />
        </button>
      </div>
    </div>
    <div
      v-if="!isOpened"
      class="border-t dark:border-card border-gray-100"
    >
      <div
        v-for="match in matches"
        :key="match.parentMatchId"
        class="px-3 py-1.5 border-b border-gray-50 dark:border-card"
      >
        <div class="flex justify-between items-center">
          <div
            class="gap-1 flex items-center cursor-pointer"
            role="button"
            :aria-label="'View match: ' + match.homeTeam + ' vs ' + match.awayTeam"
            tabindex="0"
            @click="goToMatchDetails(match, router, false)"
          >
            <div class="text-xs text-red-600">
              <span>{{ match.periodicTime }}' H1</span>
            </div>
            <div
              class="bg-red-600 text-white text-[0.5rem] font-black px-0.5 h-2.5 text-center flex justify-center items-center rounded-xs"
            >
              live
            </div>
            <div
              class="flex items-center gap-0 leading-none font-semibold text-xs text-gray-900 dark:text-slate-400"
            >
              <SportsIcons :size="'h-4 w-4'" :icon="match.sportName" />
              <div class="text-ellipsis whitespace-nowrap overflow-hidden">
                {{ match.competitionName }}
              </div>
            </div>
          </div>
          <div
            class="flex items-center text-gray-500 dark:text-gray-400 text-xs italic cursor-pointer"
            role="button"
            :aria-label="'View more markets for ' + match.homeTeam + ' vs ' + match.awayTeam"
            tabindex="0"
            @click="goToMatchDetails(match, router, false)"
          >
            <span class="text-xs text-gray-500 dark:text-slate-400 mr-2"
              >+{{ match.marketCount }}</span
            >
            <i class="el-icon"
              ><Icon name="tabler:chevron-right" class="h-4 w-4" aria-hidden="true"
            /></i>
          </div>
        </div>
        <div class="flex justify-between items-center gap-3 py-0.5">
          <div
            class="space-y-0 flex flex-col flex-1 min-w-0 text-gray-900 dark:text-slate-400 cursor-pointer"
            role="button"
            :aria-label="'View score details: ' + match.homeTeam + ' vs ' + match.awayTeam"
            tabindex="0"
            @click="goToMatchDetails(match, router, false)"
          >
            <div class="flex items-center gap-0.5 text-sm">
              <span class="text-red-600 font-black">
                {{ homeScore(match.result) }}
              </span>
              <span class="text-left truncate">{{ match.homeTeam }}</span>
              <span
                class="h-3.5 text-center flex justify-between items-center bg-yellow-600 text-xs text-gray-950 rounded-sm p-0.5"
                >2</span
              >
            </div>
            <div class="flex items-center gap-0.5 text-sm text-left truncate">
              <span class="text-red-600 font-black">{{
                awayScore(match.result)
              }}</span>
              <span>{{ match.awayTeam }}</span>
              <span
                class="h-3.5 text-center flex justify-between items-center bg-yellow-600 text-xs text-gray-950 rounded-sm p-0.5"
                >1</span
              >
              <span
                class="h-3.5 text-center flex justify-between items-center bg-red-600 text-xs text-gray-950 rounded-sm p-0.5"
                >1</span
              >
            </div>
          </div>
          <div class="flex justify-end space-x-1">
            <!-- <BetNowButton
              v-if="!filterBySubTypeId(match?.markets)?.matchOutcomes?.length"
              @click="goToMatchDetails(match, router, false)"
            />
            <BetNowButton
              v-if="outcomeIsLocked(match?.markets[0]?.status)"
              @click="goToMatchDetails(match, router, false)"
            /> -->
            <TheButton
              v-for="outcome in filterBySubTypeId(match?.markets).matchOutcomes"
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
        <div class="flex justify-between">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="text-gray-500 dark:text-slate-300 h-3 w-3"
            viewBox="0 0 24 24"
          >
            <g
              fill="none"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-miterlimit="10"
              stroke-width="1.5"
            >
              <path d="m.75 23.25l11-5.5l11.5 5.5" />
              <path
                d="M17.332 20.414c-1.116 1.421-3.248 2.436-5.582 2.436s-4.368-.89-5.586-2.31m5.586-2.79V1.457m9 6.406c-1.4.6-3.1.5-4.4-.2c-1.4-.8-3.1-.9-4.6-.1v-6.3c1.5-.7 3.2-.7 4.6.1c1.3.8 3 .9 4.4.2z"
              />
            </g>
          </svg>
          <OpenMatchStatButton :match-id="match.parentMatchId" />
        </div>
      </div>
    </div>
  </div>
</template>
