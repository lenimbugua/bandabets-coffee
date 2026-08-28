<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import AppTabPanel from "@/components/ui/AppTabPanel.vue";
import { ref, toRefs } from "vue";
import { useBetBuilderStore } from "../stores/betbuilder";
import { useMatchesStore } from "../stores/matches";
import BetBuilderButton from "./BetBuilderButton.vue";
import BetBuilderSlip from "./BetBuilderSlip.vue";
import { useRoute } from "vue-router";

const route = useRoute();

const { toggleMarketOutcomes, fetchMatchDetailsSubtype } = useMatchesStore();

const {
  matchDetails,
  subtypePending,
  subTypeId,
} = toRefs(useMatchesStore());

const { markDisabledWithFallbackMatching, fetchBetBuilderMatches } =
  useBetBuilderStore();
const { data, getSelectionByParentMatchId } = toRefs(useBetBuilderStore());

const tabs = ref([]);

function hasMatches(matchDetail) {
  const outcomes = matchDetail?.matchOutcomes;
  if (!outcomes) {
    return false;
  }
  return outcomes.length > 0;
}
function fetchMatches(market, index) {
  if (hasMatches(market)) {
    toggleMarketOutcomes(index);
    return;
  }

  fetchMatchDetailsSubtype(market.subTypeId, index);
}

function isOpened(index) {
  const matchDetail = data?.value?.markets[index];
  if (!matchDetail) {
    return false;
  }

  if (matchDetail["isOpened"]) {
    return matchDetail.isOpened;
  }
  return hasMatches(matchDetail);
}

function subtypeIsLoading(subType) {
  return subtypePending.value && subTypeId.value === subType;
}

const selectedGroup = ref(0);

function filterByGroupId(dataArray, groupId) {
  if (selectedGroup.value == 0) {
    return dataArray;
  }
  return dataArray.filter((item) => item.groupId === groupId);
}

function setButtonSelected() {
  if (getSelectionByParentMatchId?.value(route.params.id)?.length > 0) {
    fetchBetBuilderMatches();
    return;
  }

  markDisabledWithFallbackMatching(matchDetails.value, null);
}

setButtonSelected();

// --- Table layout helpers for 2-column markets ---

function isTableMarket(market) {
  const outcomes = market.matchOutcomes;
  if (!outcomes) return false;
  return outcomes.length > 2 && outcomes.length % 3 !== 0;
}

function is3ColumnMarket(market) {
  const outcomes = market.matchOutcomes;
  if (!outcomes) return false;
  return outcomes.length % 3 === 0;
}

function groupOutcomePairs(outcomes) {
  const pairs = [];
  for (let i = 0; i < outcomes.length; i += 2) {
    const pair = [outcomes[i]];
    if (i + 1 < outcomes.length) pair.push(outcomes[i + 1]);
    pairs.push(pair);
  }
  return pairs;
}

function getColumnHeader(outcomes, colIndex) {
  if (!outcomes || outcomes.length < 2) return '';
  const alias = outcomes[colIndex]?.outcomeNameAlias || outcomes[colIndex]?.outcomeName || '';
  return alias.replace(/[\d.:]+/g, '').trim();
}

function getSpecifier(outcome) {
  if (!outcome) return '';
  const spec = outcome.specifiers;
  if (spec) {
    if (spec.includes('=')) {
      const firstPair = spec.split(',')[0];
      return firstPair.split('=')[1] || '';
    }
    const numMatch = spec.match(/([\d.:]+)/);
    if (numMatch) return numMatch[1];
  }
  const alias = outcome.outcomeNameAlias || outcome.outcomeName || '';
  const numMatch = alias.match(/([\d.:]+)/);
  return numMatch ? numMatch[1] : '';
}
</script>
<template>
  <div>
    <AppTabs>
      <!-- Tab bar (hidden when tabs array is empty) -->
      <div
        v-if="tabs.length"
        role="tablist"
        aria-label="Bet builder markets"
        class="flex gap-2 px-4 py-2.5 border-b border-gray-100/60 dark:border-white/4 bg-card"
      >
        <AppTab
          v-for="(tab, index) in tabs"
          :key="index"
          v-slot="{ selected, attrs }"
          as="template"
        >
          <button
            :class="[
              selected
                ? 'bg-gold-bright/10 text-gold-bright border-gold-bright/15 font-semibold'
                : 'text-gray-400 dark:text-white/25 border-transparent hover:bg-gray-50 dark:hover:bg-white/3 hover:text-gray-600 dark:hover:text-white/45',
            ]"
            class="px-3.5 py-1.5 rounded-lg text-[0.6rem] font-medium tracking-[0.08em] uppercase whitespace-nowrap border transition-all duration-200 cursor-pointer focus:outline-hidden"
            v-bind="attrs"
          >
            {{ tab }}
          </button>
        </AppTab>
      </div>

      <div class="overflow-y-auto scrollbar-hide max-h-[calc(100vh-4rem)]">
        <div>
          <AppTabPanel class="w-full">
            <!-- Sticky slip counter -->
            <div
              class="sticky top-0 z-40 bg-white dark:bg-background border-b border-gray-100/60 dark:border-white/4"
            >
              <BetBuilderSlip :parent-match-id="data.parentMatchId" />
            </div>

            <!-- Premium market modules -->
            <div class="px-3 pt-2 pb-4 space-y-2">
              <div
                v-for="(market, index) in filterByGroupId(
                  data.markets,
                  selectedGroup
                )"
                :key="market.name"
                class="market-module rounded-xl bg-white dark:bg-white/[0.015] overflow-hidden transition-all duration-200"
              >
                <!-- Market header row -->
                <div
                  class="flex items-center justify-between px-4 py-3 cursor-pointer group"
                  @click="fetchMatches(market, index)"
                >
                  <div class="flex items-center gap-2.5 min-w-0">
                    <Icon
                      name="tabler:chevron-down"
                      :class="isOpened(index) ? 'rotate-180' : ''"
                      class="w-3 h-3 text-gray-400 dark:text-white/15 shrink-0 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:text-gray-500 dark:group-hover:text-white/25"
                    />
                    <span class="text-[0.7rem] font-semibold text-gray-600 dark:text-white/55 truncate tracking-[0.02em]">
                      {{ market.oddType }}
                    </span>
                  </div>

                  <span class="text-[0.5rem] font-medium text-gray-400 dark:text-white/12 shrink-0 tabular-nums">
                    {{ isOpened(index) && market.matchOutcomes?.length ? market.matchOutcomes.length : '' }}
                  </span>
                </div>

                <div v-if="subtypeIsLoading(market.subTypeId)" class="px-4 pb-3">
                  <AnimatePulse :rows="1" />
                </div>

                <!-- 3-COLUMN MARKET (1X2 style) -->
                <div
                  v-if="isOpened(index) && market.matchOutcomes?.length && is3ColumnMarket(market)"
                  class="grid grid-cols-3 gap-1.5 px-3 pb-3"
                >
                  <BetBuilderButton
                    v-for="outcome in market.matchOutcomes"
                    :key="outcome.outcomeId"
                    :outcome="outcome"
                    :season-id="data.homeTeam"
                    :multi-bet-market-name="market.multiBetMarketName"
                    :home-team="data.homeTeam"
                    :custom-id="outcome.multiBetOutcomeName"
                    :away-team="data.awayTeam"
                    :start-time="data.startTime"
                    :sport-id="data.sportId"
                    :competition-id="data.competitionId"
                    :sub-type-id="parseInt(market.subTypeId)"
                    :parent-match-id="data.parentMatchId"
                    :competition-name="data.competitionName"
                    :country-name="data.countryName"
                    :two-goal-up-active="market?.twoGoalUpActive"
                    :sport-name="data.sportName"
                    :is-match-detail="true"
                    :show-label="true"
                  />
                </div>

                <!-- TABLE MARKET (Over/Under style with headers + specifiers) -->
                <div
                  v-else-if="isOpened(index) && market.matchOutcomes?.length && isTableMarket(market)"
                  class="px-3 pb-3"
                >
                  <!-- Column headers -->
                  <div class="grid grid-cols-[2.5rem_1fr_1fr] gap-1.5 mb-2 items-center">
                    <div></div>
                    <span class="text-center text-[0.6rem] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-white/25">
                      {{ getColumnHeader(market.matchOutcomes, 0) }}
                    </span>
                    <span class="text-center text-[0.6rem] font-medium tracking-[0.08em] uppercase text-gray-400 dark:text-white/25">
                      {{ getColumnHeader(market.matchOutcomes, 1) }}
                    </span>
                  </div>

                  <!-- Outcome rows -->
                  <div
                    v-for="(pair, pairIdx) in groupOutcomePairs(market.matchOutcomes)"
                    :key="pairIdx"
                    class="grid grid-cols-[2.5rem_1fr_1fr] gap-1.5 mb-1.5 items-center"
                  >
                    <span class="text-[0.7rem] font-medium text-gray-500 dark:text-white/35 text-center tabular-nums">
                      {{ getSpecifier(pair[0]) }}
                    </span>
                    <BetBuilderButton
                      v-for="outcome in pair"
                      :key="outcome.outcomeId"
                      :outcome="outcome"
                      :season-id="data.homeTeam"
                      :multi-bet-market-name="market.multiBetMarketName"
                      :home-team="data.homeTeam"
                      :custom-id="outcome.multiBetOutcomeName"
                      :away-team="data.awayTeam"
                      :start-time="data.startTime"
                      :sport-id="data.sportId"
                      :competition-id="data.competitionId"
                      :sub-type-id="parseInt(market.subTypeId)"
                      :parent-match-id="data.parentMatchId"
                      :competition-name="data.competitionName"
                      :country-name="data.countryName"
                      :two-goal-up-active="market?.twoGoalUpActive"
                      :sport-name="data.sportName"
                      :is-match-detail="true"
                      :show-label="false"
                    />
                  </div>
                </div>

                <!-- 2-COLUMN FLAT (simple binary markets) -->
                <div
                  v-else-if="isOpened(index) && market.matchOutcomes?.length"
                  class="grid grid-cols-2 gap-1.5 px-3 pb-3"
                >
                  <BetBuilderButton
                    v-for="outcome in market.matchOutcomes"
                    :key="outcome.outcomeId"
                    :outcome="outcome"
                    :season-id="data.homeTeam"
                    :multi-bet-market-name="market.multiBetMarketName"
                    :home-team="data.homeTeam"
                    :custom-id="outcome.multiBetOutcomeName"
                    :away-team="data.awayTeam"
                    :start-time="data.startTime"
                    :sport-id="data.sportId"
                    :competition-id="data.competitionId"
                    :sub-type-id="parseInt(market.subTypeId)"
                    :parent-match-id="data.parentMatchId"
                    :competition-name="data.competitionName"
                    :country-name="data.countryName"
                    :two-goal-up-active="market?.twoGoalUpActive"
                    :sport-name="data.sportName"
                    :is-match-detail="true"
                    :show-label="true"
                  />
                </div>
              </div>
            </div>
          </AppTabPanel>
        </div>
      </div>
    </AppTabs>
  </div>

  <EmptyState v-if="!data" />
</template>

<style scoped>
.market-module {
  border: 0.5px solid oklch(50% 0.03 258 / 0.12);
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.03);
}
[data-theme="dark"] .market-module {
  border-color: oklch(60% 0.03 258 / 0.06);
  box-shadow: none;
}
</style>
