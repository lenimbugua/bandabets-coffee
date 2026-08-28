<script setup>
import { useDepositStore } from "@/stores/deposit.js";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";

const { closeModal } = useModalStore();
const { pending } = storeToRefs(useDepositStore());
</script>

<template>
  <div class="space-y-2.5">
    <!-- Deposit button -->
    <button
      class="deposit-btn w-full py-2.5 font-semibold text-sm text-white rounded-xl transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      type="submit"
      :disabled="pending"
    >
      <TheButtonSpin v-if="pending" />
      <span v-else class="flex items-center justify-center gap-2">
        <Icon name="tabler:credit-card" class="w-4 h-4" aria-hidden="true" />
        Deposit Now
      </span>
    </button>

    <!-- Bonus caption -->
    <div class="flex items-center justify-center gap-1.5 text-[0.65rem] text-gray-500 dark:text-gray-400">
      <Icon name="tabler:star" class="w-3.5 h-3.5 text-brand-bright" aria-hidden="true" />
      <span>Bonus on first deposit</span>
    </div>

    <!-- Failed deposit link -->
    <div class="text-center">
      <RouterLink
        :to="{ name: 'sort-deposit' }"
        class="text-xs text-brand-bright hover:underline"
        @click="closeModal"
      >
        Failed deposit? Resolve here
      </RouterLink>
    </div>
  </div>
</template>

<style scoped>
.deposit-btn {
  background: linear-gradient(135deg, oklch(55% 0.2 145), oklch(50% 0.18 155));
  box-shadow: 0 2px 8px oklch(55% 0.2 145 / 0.3);
}
.deposit-btn:hover:not(:disabled) {
  box-shadow: 0 4px 16px oklch(55% 0.2 145 / 0.4);
  filter: brightness(1.05);
}
.deposit-btn:active:not(:disabled) {
  transform: scale(0.98);
}
</style>
