<script setup>
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, ref } from "vue";
import { useCashoutStore } from "../stores/cashout.js";
import TheButtonSpin from "./TheButtonSpin.vue";

const props = defineProps({
  betId: {
    type: Number,
    required: true,
  },

  bet: {
    type: Object,
    required: true,
  },
});

const cashoutData = computed(() =>
  useCashoutStore().cashoutData(props.bet.betId)
);

const { setSelectedCashout } = useCashoutStore();

const { openModal } = useModalStore();

const { cashout } = useModalTypes();

const { getCashoutValue, setBetId } = useCashoutStore();
const { pending, responseOK } = storeToRefs(useCashoutStore());

const autoCashoutPending = ref(false);
const instantCashoutPending = ref(false);

async function handleCashout(cashoutType) {
  setSelectedCashout(cashoutType);
  if (cashoutType === "auto") {
    autoCashoutPending.value = true;
  } else if (cashoutType === "instant") {
    instantCashoutPending.value = true;
  }
  await getCashoutValue(props.bet.betId);
  autoCashoutPending.value = false;
  instantCashoutPending.value = false;
  if (responseOK.value) {
    setBetId(props.bet.betId);
    openModal(cashout);
    return;
  }
}

let countdownInterval = null;

function startCountdown() {
  countdownInterval = setInterval(() => {
    getCashoutValue(props.bet.betId, false);
  }, 30000);
}
startCountdown();

onBeforeUnmount(() => {
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
});

getCashoutValue(props.bet.betId, false);
</script>
<template>
  <!-- Loading skeleton -->
  <div v-if="pending" class="flex items-center gap-2">
    <div class="h-8 flex-1 bg-gray-100 dark:bg-white/4 rounded-lg animate-pulse"></div>
    <div class="h-8 w-20 bg-gray-100 dark:bg-white/4 rounded-lg animate-pulse"></div>
    <div class="h-8 w-16 bg-gray-100 dark:bg-white/4 rounded-lg animate-pulse"></div>
  </div>

  <!-- Cashout controls -->
  <div v-else class="cashout-strip">
    <!-- Value display -->
    <button
      class="cashout-value-box cursor-pointer"
      :class="{ 'cashout-unavailable': !cashoutData?.cashOutAllowed, 'opacity-40 pointer-events-none': !cashoutData?.cashOutAllowed }"
      @click="handleCashout('instant')"
    >
      <span class="cashout-label">CASHOUT</span>
      <template v-if="cashoutData?.cashOutAllowed">
        <span class="cashout-amount">KES {{ cashoutData?.cashOutValue }}</span>
      </template>
      <span v-else class="cashout-label">UNAVAILABLE</span>
    </button>

    <!-- Action buttons -->
    <div class="flex items-center gap-1.5">
      <button
        class="cashout-btn cashout-btn-primary"
        :class="{ 'opacity-40 pointer-events-none': !cashoutData?.cashOutAllowed }"
        @click="handleCashout('instant')"
      >
        <TheButtonSpin v-if="instantCashoutPending" />
        <template v-else>
          <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>Instant</span>
        </template>
      </button>
      <button
        class="cashout-btn"
        :class="[
          cashoutData?.autoCashOutEnabled ? 'cashout-btn-auto-active' : 'cashout-btn-auto',
          { 'opacity-40 pointer-events-none': !cashoutData?.cashOutAllowed }
        ]"
        @click="handleCashout('auto')"
      >
        <TheButtonSpin v-if="autoCashoutPending" />
        <template v-else>
          <Icon name="tabler:clock" class="w-3 h-3" aria-hidden="true" />
          <span>Auto</span>
          <span v-if="cashoutData?.autoCashOutEnabled" class="auto-amount">{{ cashoutData?.autoCashOutAmount }}</span>
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.cashout-strip {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

/* ── Value box ── */
.cashout-value-box {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--primary);
  background: color-mix(in oklch, var(--primary) 10%, transparent);
}
[data-theme="dark"] .cashout-value-box {
  color: var(--primary);
  background: color-mix(in oklch, var(--primary) 8%, transparent);
}
.cashout-unavailable {
  color: oklch(55% 0 0);
  background: oklch(95% 0 0);
}
[data-theme="dark"] .cashout-unavailable {
  color: oklch(60% 0 0);
  background: oklch(100% 0 0 / 0.04);
}

.cashout-label {
  font-size: 0.75rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  font-variant-caps: all-small-caps;
}

.cashout-amount {
  font-size: 0.75rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

/* ── Buttons shared ── */
.cashout-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: opacity 0.15s, background 0.15s;
}

/* Instant cashout — primary action */
.cashout-btn-primary {
  color: var(--primary-foreground);
  background: var(--primary);
}
.cashout-btn-primary:hover {
  background: color-mix(in oklch, var(--primary) 85%, black);
}
[data-theme="dark"] .cashout-btn-primary {
  background: var(--primary);
}
[data-theme="dark"] .cashout-btn-primary:hover {
  background: color-mix(in oklch, var(--primary) 85%, black);
}

/* Auto cashout — secondary */
.cashout-btn-auto {
  color: oklch(45% 0 0);
  background: oklch(94% 0 0);
  border: 1px solid oklch(88% 0 0);
}
.cashout-btn-auto:hover {
  background: oklch(90% 0 0);
}
[data-theme="dark"] .cashout-btn-auto {
  color: oklch(75% 0 0);
  background: oklch(100% 0 0 / 0.04);
  border-color: oklch(100% 0 0 / 0.08);
}
[data-theme="dark"] .cashout-btn-auto:hover {
  background: oklch(100% 0 0 / 0.07);
}

/* Auto cashout — active/enabled state */
.cashout-btn-auto-active {
  color: white;
  background: oklch(65% 0.16 75);
  border: 1px solid transparent;
}
.cashout-btn-auto-active:hover {
  background: oklch(60% 0.16 75);
}
[data-theme="dark"] .cashout-btn-auto-active {
  background: oklch(60% 0.14 75);
}

.auto-amount {
  padding-left: 0.25rem;
  border-left: 1px solid oklch(100% 0 0 / 0.25);
  margin-left: 0.125rem;
  font-variant-numeric: tabular-nums;
}
</style>
