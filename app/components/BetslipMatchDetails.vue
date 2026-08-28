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
  <div class="px-3 py-2.5">
    <div class="flex items-start justify-between gap-2">
      <!-- Left: match info -->
      <div
        class="min-w-0 flex-1 cursor-pointer"
        @click="goToMatchDetails(item, router, item.live)"
      >
        <!-- Teams + live badge -->
        <div class="flex items-center gap-1.5 mb-1">
          <span class="text-xs text-gray-600 dark:text-white/50 truncate">
            {{ item.homeTeam }} vs {{ item.awayTeam }}
          </span>
          <span
            v-if="item.live"
            class="inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-red-500 bg-red-500/10 shrink-0"
          >Live</span>
        </div>

        <!-- Pick: outcome + market -->
        <div class="flex items-center gap-1.5">
          <span class="text-sm font-bold text-gray-900 dark:text-white">
            {{ item.outcomeName }}
          </span>
          <span class="w-1 h-1 rounded-full bg-gray-300 dark:bg-white/20 shrink-0"></span>
          <span class="text-xs text-gray-500 dark:text-white/40">
            {{ item.oddType }}
          </span>
        </div>

        <!-- Time -->
        <p class="text-[10px] text-gray-400 dark:text-white/30 mt-1">
          {{ item.live ? 'Started' : 'Starts' }} {{ humanFriendlyDate(item.startTime) }}
        </p>
      </div>

      <!-- Right: close + odds -->
      <div class="flex flex-col items-end justify-between gap-2 shrink-0 pt-0.5">
        <button
          class="w-5 h-5 flex items-center justify-center rounded text-gray-400 dark:text-white/25 hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
          @click="deleteAnItemFromBetslip(item.customId)"
        >
          <Icon name="tabler:x" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <div class="flex items-center gap-1">
          <TwoUpIcon
            v-if="item?.twoGoalUpActive && item?.outcomeName !== 'x'"
          />
          <span class="px-2 py-0.5 rounded-md text-xs font-bold tabular-nums bg-brand-bright/10 text-brand-bright">
            {{ item.oddValue }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>
