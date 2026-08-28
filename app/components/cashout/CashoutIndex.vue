<script setup>
import { useCashoutStore } from "@/stores/cashout";
import { useModalStore } from "@/stores/modal";
import { onBeforeUnmount, toRefs, computed } from "vue";
import AutoCashout from "./AutoCashout.vue";
import FullCashout from "./FullCashout.vue";
import { useBetsStore } from "@/stores/bets";
import { useRoute } from "vue-router";

const { fetchBets, fetchBetslip } = useBetsStore();
const route = useRoute();
const { setSelectedCashout } = useCashoutStore();
const { selectedCashout, betId } = toRefs(useCashoutStore());
const { closeModal } = useModalStore();

const cashoutData = computed(() => useCashoutStore().cashoutData(betId.value));

function fetchBet() {
  if (route.name === "my-bets") {
    fetchBets(1);
  } else if (route.name === "bet-details") {
    fetchBetslip();
  }
}

onBeforeUnmount(() => {
  fetchBet();
  closeModal();
});
</script>
<template>
  <div class="cashout-modal">
    <!-- ── Header ── -->
    <div class="cashout-header">
      <div class="flex items-center gap-2">
        <div class="cashout-icon-wrap">
          <Icon name="tabler:upload" class="w-4 h-4" aria-hidden="true" />
        </div>
        <div>
          <h2 class="cashout-title">Cashout</h2>
          <p class="cashout-bet-id">Bet #{{ betId }}</p>
        </div>
      </div>
      <button class="cashout-close-btn" @click="closeModal">
        <Icon name="tabler:x" class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>

    <!-- ── Tab switcher ── -->
    <div class="cashout-tabs">
      <button
        :class="['cashout-tab', selectedCashout === 'instant' && 'cashout-tab-active']"
        @click="setSelectedCashout('instant')"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
        <span>Instant</span>
      </button>
      <button
        :class="['cashout-tab', selectedCashout === 'auto' && 'cashout-tab-active']"
        @click="setSelectedCashout('auto')"
      >
        <Icon name="tabler:clock" class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Auto</span>
      </button>
    </div>

    <!-- ── Body ── -->
    <div class="cashout-body">
      <!-- Cashout value display -->
      <div v-if="cashoutData" class="cashout-value-card">
        <span class="cashout-value-label">Current Cashout Value</span>
        <span class="cashout-value-amount">KES {{ cashoutData.cashOutValue }}</span>
      </div>

      <div v-if="selectedCashout === 'instant'">
        <FullCashout />
      </div>
      <AutoCashout v-else />
    </div>
  </div>
</template>

<style scoped>
/* ── Modal shell ── */
.cashout-modal {
  overflow: hidden;
}

/* ── Header ── */
.cashout-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.875rem 1rem;
  background: var(--surface-elevated);
  border-bottom: 1px solid oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .cashout-header {
  background: oklch(100% 0 0 / 0.025);
  border-bottom-color: oklch(100% 0 0 / 0.04);
}

.cashout-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
}
[data-theme="dark"] .cashout-icon-wrap {
  background: color-mix(in oklch, var(--primary) 12%, transparent);
  color: var(--primary);
}

.cashout-title {
  font-size: 0.9rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: oklch(15% 0 0);
}
[data-theme="dark"] .cashout-title {
  color: oklch(100% 0 0 / 0.9);
}

.cashout-bet-id {
  font-size: 0.65rem;
  font-weight: 500;
  color: oklch(55% 0 0);
  margin-top: 1px;
}
[data-theme="dark"] .cashout-bet-id {
  color: oklch(100% 0 0 / 0.35);
}

.cashout-close-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: oklch(45% 0 0);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.cashout-close-btn:hover {
  background: oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .cashout-close-btn {
  color: oklch(100% 0 0 / 0.5);
}
[data-theme="dark"] .cashout-close-btn:hover {
  background: oklch(100% 0 0 / 0.06);
}

/* ── Tabs ── */
.cashout-tabs {
  display: flex;
  gap: 0.3rem;
  padding: 0.375rem;
  margin: 0.75rem 1rem 0;
  border-radius: 0.625rem;
  background: var(--surface-elevated);
  border: 1px solid oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .cashout-tabs {
  background: oklch(100% 0 0 / 0.03);
  border-color: oklch(100% 0 0 / 0.06);
}

.cashout-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  color: oklch(45% 0 0);
  transition: all 0.15s;
}
.cashout-tab:hover {
  background: oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .cashout-tab {
  color: oklch(100% 0 0 / 0.5);
}
[data-theme="dark"] .cashout-tab:hover {
  background: oklch(100% 0 0 / 0.04);
}

.cashout-tab-active {
  background: oklch(100% 0 0);
  color: oklch(20% 0 0);
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.08);
}
.cashout-tab-active:hover {
  background: oklch(100% 0 0);
}
[data-theme="dark"] .cashout-tab-active {
  background: oklch(100% 0 0 / 0.1);
  color: oklch(100% 0 0 / 0.9);
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
}
[data-theme="dark"] .cashout-tab-active:hover {
  background: oklch(100% 0 0 / 0.1);
}

/* ── Body ── */
.cashout-body {
  padding: 0.75rem 1rem 1rem;
}

/* ── Cashout value card ── */
.cashout-value-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  border-radius: 0.625rem;
  background: color-mix(in oklch, var(--success) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--success) 20%, transparent);
}
[data-theme="dark"] .cashout-value-card {
  background: color-mix(in oklch, var(--primary) 6%, transparent);
  border-color: color-mix(in oklch, var(--primary) 10%, transparent);
}

.cashout-value-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary);
}
[data-theme="dark"] .cashout-value-label {
  color: var(--primary);
}

.cashout-value-amount {
  font-size: 1rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  color: var(--success);
}
[data-theme="dark"] .cashout-value-amount {
  color: var(--success);
}
</style>
