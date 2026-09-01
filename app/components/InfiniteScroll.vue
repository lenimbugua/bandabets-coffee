<script setup>
import { storeToRefs } from "pinia";
import { useMatches2Store } from "../stores/matches2";
import { useSportsQueryParamsStore } from "../stores/sports-query-params";
import LeagueMatchCard from "./LeagueMatchCard.vue";

const { matches, pending } = storeToRefs(useMatches2Store());
// layout was referenced in the template but never destructured here, so
// `layout == 'grid'` was always false and the Popular tab never reached
// LeagueMatchCard. Rada destructures it; this restores that tab's content.
const { page, layout } = storeToRefs(useSportsQueryParamsStore());

defineProps({
  flat: {
    type: Boolean,
    default: false,
  },
  // Desktop-only opt-in (DesktopSportsLayout passes this; MobileSportsLayout
  // and LeagueCard do not, so their rendering is byte-for-byte unchanged).
  // With it on, the trailing "load more" skeleton below only appears for
  // page > 0 (an actual infinite-scroll fetch), not the first page load.
  //
  // Without it: both AnimatePulse blocks key off `pending` alone, so on the
  // very first fetch (pending=true, page==0) they render simultaneously —
  // a 10-row skeleton PLUS an unguarded 7-row one, 17 rows total. Whatever
  // real content lands (a shorter match list, or the empty state) then has
  // to shrink away all 17 rows' worth of height in one shot. Because CLS is
  // area-weighted, that shrink scores far worse on the wide desktop card
  // than on the narrow mobile one, even though the underlying defect is
  // identical on both — confirmed via a Lighthouse trace (layout-shift
  // culprit `div.sports-filter-card`, the same element PSI blamed) and a
  // live DOM measurement (card height 1707px while both skeletons show,
  // collapsing to a few hundred px once the fetch settles).
  desktop: {
    type: Boolean,
    default: false,
  },
});
</script>

<template>
  <LeagueMatchCard v-if="layout == 'grid'" />
  <div v-else>
    <EmptyState v-if="matches?.length == 0 && !pending" />
    <AnimatePulse v-if="pending && page == 0" :rows="10" />
    <div v-else :class="[flat ? '' : 'matches-list rounded-xl overflow-hidden', 'divide-y divide-gray-200/70 dark:divide-white/5']">
      <MatchTwo v-for="match in matches" :key="match.parentMatchId" :match="match" />
    </div>
    <AnimatePulse v-if="pending && (!desktop || page > 0)" class="z-1" :rows="7" />
  </div>
</template>

<style scoped>
.matches-list {
  background: white;
  border: 1px solid oklch(0% 0 0 / 0.06);
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.05),
    0 4px 16px oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .matches-list {
  background: var(--card);
  border-color: transparent;
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.1);
}
</style>
