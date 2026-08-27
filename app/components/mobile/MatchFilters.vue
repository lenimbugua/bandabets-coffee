<script setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useMatches2Store } from "@/stores/matches2";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import CalendarDropdown from "../CalendarDropdown.vue";
import ColumnHeaderSearch from "../ColumnHeaderSearch.vue";
import HighlitsTab from "../HighlitsTab.vue";
import LeaguesButton from "../LeaguesButton.vue";
import MarketSection from "../MarketSection.vue";
import SportsTabs from "../SportsTabs.vue";

/* Ported from Rada's MatchFilters. Tabs and Countries both filter the set, so
   they sit together on the left; the date picker stays anchored right. The
   market chips own the row below. */
defineProps({
  sticky: { type: Boolean, default: true },
  // Offset from the top of the scroll container when sticky (height of the
  // pinned header block above it). Falls back to the legacy 8rem value.
  stickyTop: { type: String, default: "8rem" },
  containerClass: { type: String, default: "" },
});

/* The tabs, Countries, Today and the market picker all describe a result set.
   With no results there is nothing to filter, so the whole strip goes rather
   than sitting above an empty state.

   Kept visible while pending: the filters shouldn't flicker out and back on
   every fetch, only when a fetch genuinely returns nothing. */
const { matches, pending } = storeToRefs(useMatches2Store());
/* In the grid (Popular) layout the result set is competitions, not matches —
   matches may legitimately be empty there, and hiding the strip would also
   hide the tabs needed to leave the layout. */
const { layout } = storeToRefs(useSportsQueryParamsStore());
const { getDefaultMarket } = storeToRefs(useMatches2Store());

/* Labels for the column-header bar, derived from the selected market's
   outcomes (mirrors SportsFilterBar). */
const outcomeLabels = computed(() => {
  if (!matches.value?.length) return ["1", "X", "2"];
  const marketId = "" + getDefaultMarket.value;
  for (const match of matches.value) {
    if (!match?.markets?.length) continue;
    const market = match.markets.find((m) => m.subTypeId === marketId);
    if (market?.matchOutcomes?.length) {
      return market.matchOutcomes.map((o) => o.outcomeName || "");
    }
  }
  return ["1", "X", "2"];
});
</script>

<template>
  <div
    :class="[
      'match-filters max-md:overflow-hidden',
      sticky ? 'sticky z-40' : '',
      containerClass || 'mx-3 rounded-t-xl',
    ]"
    :style="sticky ? { top: stickyTop } : null"
  >
    <!-- Sports filter — Rada's SportsTabSection: the label and the sport tabs
         share the top row, split by a hairline divider. Sits outside the
         has-results guard so the section never collapses to nothing. -->
    <div
      class="pr-2 py-1 flex items-center border-b border-border w-full overflow-x-auto scrollbar-hide bg-inherit"
    >
      <!-- The label pins to the left gutter while the tabs scroll under it.
           bg-inherit carries the section's own background down so the chips
           pass behind an opaque label rather than showing through it. -->
      <div
        class="sticky left-0 z-10 shrink-0 flex items-center pl-2 pr-2 mr-2 border-r border-border bg-inherit"
      >
        <span class="italic font-bold text-xl text-foreground">Sports</span>
      </div>
      <SportsTabs />
    </div>

    <template v-if="pending || matches?.length || layout === 'grid'">
    <div class="flex items-center justify-between gap-1.5 sm:gap-2 px-2 sm:px-3 pt-1">
      <div class="flex items-center gap-1 sm:gap-2 min-w-0">
        <HighlitsTab class="min-w-0" />
        <LeaguesButton class="shrink-0" />
      </div>
      <CalendarDropdown class="shrink-0" />
    </div>
    <div class="px-3 pt-1.5 pb-1">
      <MarketSection />
    </div>

    <!-- Column header: search + outcome labels over the odds columns -->
    <ColumnHeaderSearch
      v-if="layout !== 'grid' && matches?.length"
      :matches="matches"
      :outcome-labels="outcomeLabels"
    />
    </template>
  </div>
</template>

<style scoped>
.match-filters {
  background: white;
  border: 1px solid oklch(0% 0 0 / 0.06);
  border-bottom: none;
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.05),
    0 4px 16px oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .match-filters {
  background: var(--surface-elevated);
  border-color: transparent;
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.12),
    0 4px 16px oklch(0% 0 0 / 0.2);
}
</style>
