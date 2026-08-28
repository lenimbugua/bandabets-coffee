<script setup>
import { useBetslip } from "@/composables/useBetslip";
import { useLoginStore } from "@/stores/login";
import { useProfileStore } from "@/stores/profile";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import TotalOdds from "./TotalOdds.vue";

const props = defineProps({
  setStake: {
    type: Function,
    required: true,
  },
  stake: {
    type: Number,
    required: true,
  },
  totalOdds: {
    type: Number,
    default: 0,
  },
});

const { isAuthenticated } = storeToRefs(useLoginStore());
const { balance } = storeToRefs(useProfileStore());

const { stakeAmounts } = useBetslip();
const selectedStakeAmount = ref(props.stake);

function updateStake(amount) {
  selectedStakeAmount.value = amount;
  props.setStake(amount);
}

function formatStakeLabel(amount) {
  if (amount >= 1000) {
    const k = amount / 1000;
    return k % 1 === 0 ? `${k}K` : `${k}K`;
  }
  return amount;
}
</script>

<template>
  <div class="space-y-2">
    <!-- Balance + Total Odds -->
    <div class="flex items-center justify-between">
      <div
        v-if="balance && isAuthenticated"
        class="flex items-center gap-1.5 text-[0.7rem] text-gray-500 dark:text-white/40"
      >
        <Icon name="tabler:wallet" class="w-3.5 h-3.5" aria-hidden="true" />
        <span class="font-bold text-gray-700 dark:text-white/60 font-odds tabular-nums">
          {{ parseFloat(balance).toFixed("2") }}
        </span>
        <span class="text-[0.6rem]">KES</span>
      </div>
      <TotalOdds :total-odds />
    </div>

    <!-- Quick stake pills -->
    <div class="flex gap-1.5">
      <button
        v-for="stakeAmount in stakeAmounts"
        :key="stakeAmount"
        type="button"
        :aria-label="'Set stake to ' + stakeAmount"
        :class="[
          selectedStakeAmount == stakeAmount
            ? 'bg-brand-bright/15 border-brand-bright/30 text-brand-bright'
            : 'bg-gray-100 dark:bg-white/5 border-transparent text-gray-600 dark:text-white/50 hover:bg-gray-200 dark:hover:bg-white/8',
        ]"
        class="flex-1 py-1.5 rounded-md text-[0.7rem] font-bold text-center border transition-colors cursor-pointer"
        @click="updateStake(stakeAmount)"
      >
        {{ formatStakeLabel(stakeAmount) }}
      </button>
    </div>

    <!-- Stake input -->
    <div class="flex items-center justify-between gap-3">
      <span class="text-[0.7rem] font-bold text-gray-600 dark:text-white/40">Stake</span>
      <div class="relative flex-1 flex items-center gap-1.5">
        <button
          type="button"
          aria-label="Decrease stake"
          class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/8 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white/60 transition-colors cursor-pointer"
          @click="updateStake(Math.max(0, Number(selectedStakeAmount) - 10))"
        >
          <Icon name="tabler:minus" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <div class="relative flex-1">
          <span class="absolute inset-y-0 left-0 flex items-center pl-2.5 text-[0.65rem] font-medium text-gray-400 dark:text-white/25 pointer-events-none">
            KES
          </span>
          <input
            v-model="selectedStakeAmount"
            type="number"
            aria-label="Stake amount in KES"
            class="w-full pl-10 pr-3 py-2 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/8 text-right text-[0.85rem] font-bold text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-bright/30 focus:border-brand-bright/30 transition-all stake-input font-odds tabular-nums"
            required
            @input="updateStake(selectedStakeAmount)"
          />
        </div>
        <button
          type="button"
          aria-label="Increase stake"
          class="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200/80 dark:border-white/8 text-gray-500 dark:text-white/40 hover:bg-gray-200 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-white/60 transition-colors cursor-pointer"
          @click="updateStake(Number(selectedStakeAmount) + 10)"
        >
          <Icon name="tabler:plus" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.stake-input::-webkit-outer-spin-button,
.stake-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.stake-input[type="number"] {
  -moz-appearance: textfield;
}
</style>
