<script setup>
import { useCashoutStore } from "@/stores/cashout.js";
import { computed, ref, toRefs } from "vue";

const autoCashoutAmount = ref(0);
const { betId, pending } = toRefs(useCashoutStore());

const cashoutData = computed(() => useCashoutStore().cashoutData(betId.value));
const { setAutoCashout, cancelAutoCashout } = useCashoutStore();

const min = (cashoutData.value.cashOutValue + 0.1).toFixed(2);

const isValid = ref(true);

function isValidCashoutAmount() {
  isValid.value =
    autoCashoutAmount.value >= min &&
    autoCashoutAmount.value <= cashoutData.value.possibleWin;
}

const handleCashout = (betId) => {
  isValidCashoutAmount();
  if (!isValid.value) return;
  setAutoCashout(autoCashoutAmount.value, betId);
};
</script>
<template>
  <div class="auto-cashout">
    <!-- Auto cashout already enabled -->
    <div v-if="cashoutData?.autoCashOutEnabled" class="cashout-section">
      <div class="cashout-notice">
        <Icon name="tabler:clock" class="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        <p>Auto cashout is active. Cancel it before setting a new amount.</p>
      </div>
      <button
        class="cashout-action-btn cashout-btn-cancel"
        :disabled="pending"
        @click="cancelAutoCashout(cashoutData.betId)"
      >
        <TheButtonSpin v-if="pending" />
        <template v-else>
          <span>Cancel Auto Cashout</span>
          <span class="cashout-btn-tag">{{ cashoutData.autoCashOutAmount }} KES</span>
        </template>
      </button>
    </div>

    <!-- Set new auto cashout -->
    <form v-else class="cashout-section" @submit.prevent="handleCashout(cashoutData?.betId)">
      <p class="cashout-disclaimer">
        When the cashout value reaches your set amount, the bet will automatically settle
        and winnings credited to your account. You can cancel anytime before it triggers.
      </p>

      <!-- Amount input card -->
      <div class="cashout-input-card">
        <label for="autoCashoutAmount" class="cashout-input-label">Amount (KES)</label>
        <div class="cashout-input-wrap" :class="{ 'cashout-input-wrap-error': !isValid }">
          <span class="cashout-input-prefix">KES</span>
          <input
            id="autoCashoutAmount"
            v-model="autoCashoutAmount"
            required
            type="number"
            step="0.01"
            class="cashout-input"
            placeholder="0.00"
          />
        </div>
        <div v-if="!isValid" class="cashout-error-text">
          Amount must be between {{ min }} and {{ cashoutData?.possibleWin }} KES
        </div>
        <div class="cashout-range">
          <div class="cashout-range-item">
            <span class="cashout-range-label">Min</span>
            <span class="cashout-range-value">{{ min }} KES</span>
          </div>
          <div class="cashout-range-item">
            <span class="cashout-range-label">Max</span>
            <span class="cashout-range-value">{{ cashoutData?.possibleWin }} KES</span>
          </div>
        </div>
      </div>

      <button class="cashout-action-btn cashout-btn-primary" :disabled="pending">
        <TheButtonSpin v-if="pending" />
        <template v-else>
          <Icon name="tabler:clock" class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Set Auto Cashout</span>
        </template>
      </button>
    </form>
  </div>
</template>

<style scoped>
.cashout-section {
  display: flex;
  flex-direction: column;
  gap: 0.625rem;
}

.cashout-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.4;
  color: var(--warning);
  background: color-mix(in oklch, var(--warning) 12%, transparent);
  border: 1px solid color-mix(in oklch, var(--warning) 20%, transparent);
}
[data-theme="dark"] .cashout-notice {
  color: var(--warning);
  background: color-mix(in oklch, var(--warning) 8%, transparent);
  border-color: color-mix(in oklch, var(--warning) 12%, transparent);
}

.cashout-disclaimer {
  font-size: 0.7rem;
  font-weight: 500;
  line-height: 1.5;
  color: oklch(50% 0 0);
}
[data-theme="dark"] .cashout-disclaimer {
  color: oklch(100% 0 0 / 0.4);
}

/* ── Input card ── */
.cashout-input-card {
  padding: 0.75rem;
  border-radius: 0.625rem;
  background: oklch(97% 0 0);
  border: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .cashout-input-card {
  background: oklch(100% 0 0 / 0.02);
  border-color: oklch(100% 0 0 / 0.06);
}

.cashout-input-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 600;
  color: oklch(50% 0 0);
  margin-bottom: 0.375rem;
}
[data-theme="dark"] .cashout-input-label {
  color: oklch(100% 0 0 / 0.4);
}

.cashout-input-wrap {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  border-radius: 0.5rem;
  background: oklch(100% 0 0);
  border: 1px solid oklch(0% 0 0 / 0.12);
  padding: 0 0.625rem;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.cashout-input-wrap:focus-within {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring) 12%, transparent);
}
[data-theme="dark"] .cashout-input-wrap {
  background: oklch(100% 0 0 / 0.04);
  border-color: oklch(100% 0 0 / 0.1);
}
[data-theme="dark"] .cashout-input-wrap:focus-within {
  border-color: var(--ring);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring) 15%, transparent);
}

.cashout-input-wrap-error {
  border-color: var(--destructive);
  box-shadow: 0 0 0 2px color-mix(in oklch, var(--destructive) 10%, transparent);
}

.cashout-input-prefix {
  font-size: 0.75rem;
  font-weight: 700;
  color: oklch(45% 0 0);
}
[data-theme="dark"] .cashout-input-prefix {
  color: oklch(100% 0 0 / 0.45);
}

.cashout-input {
  flex: 1;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: oklch(15% 0 0);
  background: transparent;
  border: none;
  outline: none;
}
.cashout-input::placeholder {
  color: oklch(70% 0 0);
}
[data-theme="dark"] .cashout-input {
  color: oklch(100% 0 0 / 0.9);
}
[data-theme="dark"] .cashout-input::placeholder {
  color: oklch(100% 0 0 / 0.2);
}

.cashout-error-text {
  font-size: 0.65rem;
  font-weight: 500;
  color: var(--destructive);
  margin-top: 0.25rem;
}

.cashout-range {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px solid oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .cashout-range {
  border-top-color: oklch(100% 0 0 / 0.04);
}

.cashout-range-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.cashout-range-label {
  font-size: 0.6rem;
  font-weight: 500;
  color: oklch(55% 0 0);
}
[data-theme="dark"] .cashout-range-label {
  color: oklch(100% 0 0 / 0.35);
}

.cashout-range-value {
  font-size: 0.65rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--primary);
}
[data-theme="dark"] .cashout-range-value {
  color: var(--primary);
}

/* ── Action buttons ── */
.cashout-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  width: 100%;
  padding: 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.cashout-action-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cashout-btn-primary {
  color: var(--primary-foreground);
  background: var(--primary);
}
.cashout-btn-primary:hover:not(:disabled) {
  background: color-mix(in oklch, var(--primary) 85%, black);
}
[data-theme="dark"] .cashout-btn-primary {
  background: var(--primary);
}
[data-theme="dark"] .cashout-btn-primary:hover:not(:disabled) {
  background: color-mix(in oklch, var(--primary) 85%, black);
}

.cashout-btn-cancel {
  color: var(--warning-foreground, white);
  background: var(--warning);
}
.cashout-btn-cancel:hover:not(:disabled) {
  background: color-mix(in oklch, var(--warning) 85%, black);
}
[data-theme="dark"] .cashout-btn-cancel {
  background: var(--warning);
}
[data-theme="dark"] .cashout-btn-cancel:hover:not(:disabled) {
  background: color-mix(in oklch, var(--warning) 85%, black);
}

.cashout-btn-tag {
  padding-left: 0.5rem;
  margin-left: 0.25rem;
  border-left: 1px solid oklch(100% 0 0 / 0.25);
  font-size: 0.7rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
</style>
