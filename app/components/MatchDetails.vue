<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { storeToRefs } from "pinia";
import { ref, toRefs } from "vue";
import { useMatchesStore } from "../stores/matches";
import { useBetslipStore } from "../stores/sports-betslip";
import EarlyPayoutBadge from "./EarlyPayoutBadge.vue";
import EarlyWinIcon from "./EarlyWinIcon.vue";
import TheButton from "./TheButton.vue";
import TwoUpIcon from "./TwoUpIcon.vue";

const { toggleMarketOutcomes, fetchMatchDetailsSubtype } = useMatchesStore();
const { betslip } = storeToRefs(useBetslipStore());

const {
  matchDetails,
  marketGroups,
  subtypePending,
  subtypeLoadingId,
  matchDetailIsLive,
} = toRefs(useMatchesStore());

const formCustomId = (parent_match_id, sub_type_id, outcome_name, index) => {
  return `${parent_match_id}${sub_type_id}${outcome_name}${index}`;
};

function hasMatches(matchDetail) {
  const outcomes = matchDetail?.matchOutcomes;
  if (!outcomes) {
    return false;
  }
  return outcomes.length > 0;
}

// Everything below addresses markets by subTypeId, never by v-for index:
// the rendered list is group-filtered, so positions here don't line up with
// positions in matchDetails.markets.
function fetchMatches(market) {
  if (hasMatches(market)) {
    toggleMarketOutcomes(market.subTypeId);
    return;
  }

  fetchMatchDetailsSubtype(market.subTypeId);
}

function isOpened(market) {
  if (!market) {
    return false;
  }
  if (market.isOpened !== undefined) {
    return market.isOpened;
  }
  return hasMatches(market);
}

function subtypeIsLoading(subType) {
  return (
    subtypePending.value &&
    String(subtypeLoadingId.value) === String(subType)
  );
}

const selectedGroup = ref(0);

function setSelectedgroup(groupId) {
  selectedGroup.value = groupId;
}

function filterByGroupId(dataArray, groupId) {
  if (selectedGroup.value == 0) {
    return dataArray;
  }
  return dataArray.filter((item) => item.groupId === groupId);
}

function marketHasSelection(market) {
  return betslip.value.some(
    (item) =>
      item.parentMatchId === matchDetails.value?.parentMatchId &&
      item.subTypeId === parseInt(market.subTypeId)
  );
}
</script>
<template>
  <div class="px-3 pb-4">
    <!-- Market group filter pills -->
    <div
      class="sticky top-[5.5rem] md:top-[10rem] z-55 rounded-xl mb-3 filter-bar"
    >
      <AppTabs
        role="tablist"
        aria-label="Match market filters"
        class="flex gap-1.5 px-3 py-2.5 w-full scrollbar-hide overflow-x-auto"
      >
        <AppTab v-slot="{ selected, attrs }" as="template" @click="setSelectedgroup(0)">
          <button
            :class="[
              selected
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:bg-surface-interactive hover:text-foreground',
            ]"
            class="px-3.5 py-1.5 rounded-lg text-[0.65rem] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus:outline-hidden"
            v-bind="attrs"
          >
            All
          </button>
        </AppTab>
        <AppTab
          v-for="tab in marketGroups"
          :key="tab.groupId"
          v-slot="{ selected, attrs }"
          as="template"
          @click="setSelectedgroup(tab.groupId)"
        >
          <button
            :class="[
              selected
                ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                : 'text-muted-foreground hover:bg-surface-interactive hover:text-foreground',
            ]"
            class="px-3.5 py-1.5 rounded-lg text-[0.65rem] font-medium whitespace-nowrap transition-all duration-150 cursor-pointer focus:outline-hidden"
            v-bind="attrs"
          >
            {{ tab.groupName }}
          </button>
        </AppTab>
      </AppTabs>
    </div>

    <!-- Market cards -->
    <div class="space-y-2">
      <div
        v-for="market in filterByGroupId(matchDetails.markets, selectedGroup)"
        :key="market.subTypeId"
        class="market-card rounded-xl overflow-hidden"
        :class="[
          marketHasSelection(market) ? 'ring-1 ring-brand-bright/15' : '',
        ]"
      >
        <!-- Market header -->
        <div
          class="market-header flex items-center justify-between px-3 py-2 cursor-pointer select-none"
          @click="fetchMatches(market)"
        >
          <div class="flex items-center gap-2 min-w-0">
            <span
              v-if="marketHasSelection(market)"
              class="w-1 h-1 rounded-full bg-brand-bright shrink-0"
            ></span>
            <span class="text-[0.62rem] font-medium text-gray-500 dark:text-white/60 truncate leading-tight uppercase tracking-wide">
              {{ market.oddType }}
            </span>
            <div
              v-if="market?.twoGoalUpActive"
              class="flex items-center gap-0.5 shrink-0"
            >
              <EarlyWinIcon />
              <EarlyPayoutBadge />
              <TwoUpIcon />
            </div>
          </div>

          <div class="flex items-center gap-1.5 shrink-0">
            <span
              v-if="isOpened(market) && market.matchOutcomes"
              class="text-[0.5rem] font-medium text-gray-400 dark:text-white/50 tabular-nums"
            >
              {{ market.matchOutcomes.length }}
            </span>
            <Icon
              name="tabler:chevron-down"
              :class="isOpened(market) ? 'rotate-180' : ''"
              class="w-3 h-3 text-gray-400 dark:text-white/50 transition-transform duration-200"
            />
          </div>
        </div>

        <!-- Loading skeleton -->
        <div v-if="subtypeIsLoading(market.subTypeId)" class="px-3.5 py-3">
          <AnimatePulse :rows="1" />
        </div>

        <!-- Outcomes grid -->
        <div
          v-if="isOpened(market)"
          class="grid gap-1.5 px-3 pb-3 pt-1"
          :class="[
            market.matchOutcomes.length % 3 === 0
              ? 'grid-cols-3'
              : 'grid-cols-2',
          ]"
        >
          <TheButton
            v-for="outcome in market.matchOutcomes"
            :key="
              formCustomId(
                matchDetails.parentMatchId,
                market.subTypeId,
                outcome.outcomeName,
                outcome.outcomeId
              )
            "
            :outcome="outcome"
            :season-id="matchDetails.homeTeam"
            :home-team="matchDetails.homeTeam"
            :custom-id="
              formCustomId(
                matchDetails.parentMatchId,
                market.subTypeId,
                outcome.outcomeName,
                outcome.outcomeId
              )
            "
            :away-team="matchDetails.awayTeam"
            :start-time="matchDetails.startTime"
            :sport-id="matchDetails.sportId"
            :competition-id="matchDetails.competitionId"
            :sub-type-id="parseInt(market.subTypeId)"
            :parent-match-id="matchDetails.parentMatchId"
            :competition-name="matchDetails.competitionName"
            :country-name="matchDetails.countryName"
            :two-goal-up-active="market?.twoGoalUpActive"
            :sport-name="matchDetails.sportName"
            :is-match-detail="true"
            :live="matchDetailIsLive ? 1 : 0"
          />
        </div>
      </div>
    </div>
  </div>
  <EmptyState v-if="!matchDetails" />
</template>

<style scoped>
.filter-bar {
  background: color-mix(in oklch, var(--card) 90%, transparent);
  backdrop-filter: blur(12px);
}

.market-card {
  background: white;
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.03);
}
[data-theme="dark"] .market-card {
  background: var(--card);
  box-shadow: none;
}

.market-header {
  background: transparent;
}
</style>
