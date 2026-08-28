<script setup>
import { computed } from "vue";

import { useMultibetBonus } from "@/composables/useMultibetBonus";

import { useBetslip } from "@/composables/useBetslip";

import { toRefs } from "vue";
import { useBetslipStore } from "../stores/sports-betslip";

import { useOneCut } from "../composables/useOneCut";

import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import formatStuff from "../utilities/format-stuff";
const { oneCut } = useModalTypes();

const { openModal } = useModalStore();

const { formattedNumber } = formatStuff();

const { betslip, stake, possibleWin } = toRefs(useBetslipStore());

const { calculatePossibleWin } = useBetslip();

const { qualifyingLegs, MIN_LEGS } = useOneCut();

const {
  getNextBoost,
  getCurrentText,
  getLegsToNextBonus,
} = useMultibetBonus();

const progress = computed(() =>
  Math.min((qualifyingLegs() / MIN_LEGS) * 100, 100)
);
const progressBarWidth = computed(() => `${progress.value}%`);

function oneCutReady() {
  return qualifyingLegs() >= MIN_LEGS;
}
</script>
<template>
  <div class="boost-card" @click="openModal(oneCut)">
    <!-- Header -->
    <div class="boost-header">
      <span class="boost-title">{{ getCurrentText() }}</span>
      <span class="boost-cta">Add {{ getLegsToNextBonus() }} more get {{ getNextBoost() }}% boost</span>
    </div>

    <!-- Payout row -->
    <div class="boost-payout">
      <span class="payout-label">Payout</span>
      <span class="payout-current">{{ formattedNumber(calculatePossibleWin(betslip, stake)) }}</span>
      <Icon name="tabler:arrow-right" class="payout-arrow" aria-hidden="true" />
      <span class="payout-boosted">{{ possibleWin }}</span>
      <span class="payout-currency">KES</span>
    </div>

    <!-- 1 Cut Win progress -->
    <div class="cut-section">
      <div class="cut-header">
        <div class="cut-label">
          <span class="cut-name">1 Cut Win</span>
          <OneCutIcon />
        </div>
        <span v-if="oneCutReady()" class="cut-ready">Ready</span>
        <span v-else class="cut-progress-text">{{ qualifyingLegs() }}/{{ MIN_LEGS }} legs</span>
      </div>
      <div class="cut-track">
        <div class="cut-fill" :style="{ width: progressBarWidth }"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.boost-card {
  padding: 0.625rem 0.75rem;
  border-radius: 0.75rem;
  border: 1px solid color-mix(in oklch, var(--primary) 20%, transparent);
  background: color-mix(in oklch, var(--primary) 5%, transparent);
  cursor: pointer;
  transition: border-color 0.15s;
}
.boost-card:hover {
  border-color: color-mix(in oklch, var(--primary) 35%, transparent);
}
[data-theme="dark"] .boost-card {
  border-color: color-mix(in oklch, var(--primary) 15%, transparent);
  background: color-mix(in oklch, var(--primary) 5%, transparent);
}
[data-theme="dark"] .boost-card:hover {
  border-color: color-mix(in oklch, var(--primary) 30%, transparent);
}

.boost-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.375rem;
}

.boost-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--primary);
}

.boost-cta {
  font-size: 0.55rem;
  font-weight: 500;
  color: oklch(45% 0 0);
}
[data-theme="dark"] .boost-cta {
  color: oklch(100% 0 0 / 0.4);
}

.boost-payout {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 0.5rem;
}

.payout-label {
  font-size: 0.6rem;
  font-weight: 500;
  color: oklch(50% 0 0);
}
[data-theme="dark"] .payout-label {
  color: oklch(100% 0 0 / 0.35);
}

.payout-current {
  font-size: 0.7rem;
  font-weight: 600;
  color: oklch(35% 0 0);
}
[data-theme="dark"] .payout-current {
  color: oklch(100% 0 0 / 0.6);
}

.payout-arrow {
  width: 0.75rem;
  height: 0.75rem;
  color: var(--primary);
}

.payout-boosted {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--primary);
}

.payout-currency {
  font-size: 0.55rem;
  color: oklch(55% 0 0);
}
[data-theme="dark"] .payout-currency {
  color: oklch(100% 0 0 / 0.3);
}

.cut-section {
  padding-top: 0.375rem;
  border-top: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .cut-section {
  border-top-color: oklch(100% 0 0 / 0.06);
}

.cut-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.25rem;
}

.cut-label {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.cut-name {
  font-size: 0.6rem;
  font-weight: 700;
  color: var(--gold);
}
[data-theme="dark"] .cut-name {
  color: var(--gold);
}

.cut-ready {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--primary);
}

.cut-progress-text {
  font-size: 0.55rem;
  font-weight: 500;
  color: oklch(50% 0 0);
}
[data-theme="dark"] .cut-progress-text {
  color: oklch(100% 0 0 / 0.35);
}

.cut-track {
  height: 0.2rem;
  border-radius: 1rem;
  background: color-mix(in oklch, var(--gold) 15%, transparent);
  overflow: hidden;
}
[data-theme="dark"] .cut-track {
  background: color-mix(in oklch, var(--gold) 10%, transparent);
}

.cut-fill {
  height: 100%;
  border-radius: 1rem;
  background: var(--gold);
  transition: width 0.4s ease;
}
</style>
