<script setup>
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useRouter } from "vue-router";
import { useFormatDates } from "../composables/useFormatDates";
import TwoUpIcon from "./TwoUpIcon.vue";

defineProps({
  item: {
    type: Object,
    required: true,
  },
  index: {
    type: Number,
    required: true,
  },
  deleteAnItemFromBetslip: {
    type: Function,
    required: true,
  },
});
const router = useRouter();

const { goToMatchDetails } = useMatchDetails();

const { humanFriendlyDate } = useFormatDates();
</script>
<template>
  <div class="px-2.5 py-2">
    <div class="flex items-start justify-between gap-2">
      <!-- Left: match info -->
      <div
        class="min-w-0 flex-1 cursor-pointer"
        @click="goToMatchDetails(item, router, item.live)"
      >
        <!-- Builder badge + teams -->
        <div class="flex items-center gap-1.5 mb-1">
          <span class="text-[0.55rem] font-bold uppercase tracking-wide text-blue-500 bg-blue-500/10 px-1 py-px rounded shrink-0">
            Builder
          </span>
          <span class="text-[0.7rem] font-medium text-gray-600 dark:text-white/40 truncate">
            {{ item.homeTeam }} vs {{ item.awayTeam }}
          </span>
        </div>

        <!-- Selections -->
        <BetBuilderSelections
          class="w-full"
          :selections="item.selections"
        />

        <!-- Time -->
        <div class="text-[0.6rem] text-gray-500 dark:text-white/25 mt-1">
          Starts {{ humanFriendlyDate(item.startTime) }}
        </div>
      </div>

      <!-- Right: close + odds -->
      <div class="flex flex-col items-end justify-between gap-2 shrink-0 pt-0.5">
        <button
          class="w-4 h-4 flex items-center justify-center text-gray-400 dark:text-white/20 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
          @click="deleteAnItemFromBetslip(item.customId)"
        >
          <Icon name="tabler:x" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <div class="flex items-center gap-1">
          <TwoUpIcon
            v-if="item?.twoGoalUpActive && item?.outcomeName !== 'x'"
          />
          <span class="odds-badge">
            {{ item.oddValue }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.odds-badge {
  padding: 0.125rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
}
[data-theme="dark"] .odds-badge {
  background: color-mix(in oklch, var(--primary) 12%, transparent);
  color: var(--primary);
}
</style>
