<script setup>
import { usePoll } from "@/composables/usePoll";
import { useLoginStore } from "@/stores/login";
import { onUnmounted, ref, toRefs, computed } from "vue";
import {
  MAX_WITHDRAWAL,
  MIN_WITHDRAWAL,
} from "../composables/useDefinedConstants";
import { useProfileStore } from "../stores/profile.js";
import { useWithdrawStore } from "../stores/withdraw";
import formatStuff from "../utilities/format-stuff";

const { balance, pending: profilePending } = toRefs(useProfileStore());
const { getProfileInfo } = useProfileStore();

getProfileInfo();

const showBalance = ref(true);
// const withdrawTax = useRuntimeConfig().public.withdrawTax;

const { formattedNumber } = formatStuff();

const { startPolling, pollingInterval } = usePoll();
const { isAuthenticated } = toRefs(useLoginStore());

const { setAmount, withdraw } = useWithdrawStore();
const { pending, amount, responseOK } = toRefs(useWithdrawStore());
const withdrawAmount = ref(amount.value);

const quickAmounts = [200, 500, 1000, 2000, 5000];

const balanceBelowMin = computed(() => balance.value < MIN_WITHDRAWAL);

function getMaxWithdrawal() {
  let userBal = Math.floor(parseInt(balance.value));
  let maxBal = parseInt(MAX_WITHDRAWAL);
  let minBal = parseInt(MIN_WITHDRAWAL);
  if (userBal < minBal) return minBal;
  if (userBal < maxBal) return userBal;
  return MAX_WITHDRAWAL;
}

async function makeWithdrawal() {
  setAmount(withdrawAmount.value);
  await withdraw();
  if (responseOK.value) {
    startPolling(getProfileInfo);
  }
}

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>
<template>
  <NotAuthenicated v-if="!isAuthenticated" />

  <template v-if="isAuthenticated && balance">
    <!-- Balance card -->
    <div class="withdraw-card">
      <div class="balance-header">
        <div class="balance-icon-wrap">
          <Icon name="tabler:credit-card" class="w-4 h-4" aria-hidden="true" />
        </div>
        <div class="flex-1">
          <p class="balance-label">Available Balance</p>
          <div class="flex items-center gap-2">
            <p class="balance-amount">
              <span class="balance-currency">KES</span>
              <span v-if="showBalance">{{ formattedNumber(balance) }}</span>
              <span v-else class="tracking-widest">****</span>
            </p>
            <button
              type="button"
              class="balance-toggle"
              :aria-label="showBalance ? 'Hide balance' : 'Show balance'"
              @click="showBalance = !showBalance"
            >
              <Icon v-if="showBalance" name="tabler:eye" class="h-4 w-4" />
              <Icon v-else name="tabler:eye-off" class="h-4 w-4" />
            </button>
          </div>
        </div>
        <button
          type="button"
          class="refresh-btn"
          aria-label="Refresh balance"
          @click="getProfileInfo()"
        >
          <Icon name="tabler:refresh" class="w-4 h-4" :class="{ 'animate-spin': profilePending }" />
        </button>
      </div>
    </div>

    <!-- Withdraw form card -->
    <div class="withdraw-card">
      <!-- Card header -->
      <div class="form-header">
        <div class="flex items-center gap-2">
          <div class="form-icon-wrap">
            <Icon name="tabler:circle-arrow-right-filled" class="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <h3 class="form-title">Withdraw to M-Pesa</h3>
        </div>
      </div>

      <form class="form-body" @submit.prevent="makeWithdrawal">
        <!-- Low balance warning -->
        <div v-if="balanceBelowMin" class="low-balance-alert">
          <Icon name="tabler:alert-triangle" class="w-4 h-4 shrink-0" aria-hidden="true" />
          <p>Your balance (KES {{ formattedNumber(balance) }}) is below the minimum withdrawal of KES {{ formattedNumber(MIN_WITHDRAWAL) }}.</p>
        </div>

        <!-- Amount input -->
        <div class="space-y-2">
          <label for="withdraw-amount" class="input-label">Amount</label>
          <div class="input-wrap" :class="{ 'input-wrap-error': balanceBelowMin }">
            <span class="input-prefix">KES</span>
            <input
              id="withdraw-amount"
              v-model="withdrawAmount"
              type="number"
              :min="MIN_WITHDRAWAL"
              :max="getMaxWithdrawal()"
              aria-label="Withdrawal amount in KES"
              class="amount-input"
              placeholder="100"
              name="withdraw"
              required
            />
          </div>
        </div>

        <!-- Quick amount pills -->
        <div class="flex flex-wrap gap-2">
          <button
            v-for="amt in quickAmounts"
            :key="amt"
            type="button"
            class="quick-pill"
            :class="{ 'quick-pill-active': withdrawAmount == amt }"
            @click="withdrawAmount = amt"
          >
            {{ formattedNumber(amt) }}
          </button>
        </div>

        <!-- Submit -->
        <button
          class="submit-btn"
          type="submit"
          :disabled="pending || balanceBelowMin"
        >
          <TheButtonSpin v-if="pending" />
          <span v-else>Withdraw</span>
        </button>

        <!-- Info footer -->
        <div class="info-strip">
          <div class="info-row">
            <span class="info-label">Min withdrawal</span>
            <span class="info-value">KES {{ formattedNumber(MIN_WITHDRAWAL) }}</span>
          </div>
          <div class="info-divider" />
          <div class="info-row">
            <span class="info-label">Max withdrawal</span>
            <span class="info-value">KES {{ formattedNumber(getMaxWithdrawal()) }}</span>
          </div>
          <div class="info-divider" />
          <!-- <div class="info-row">
            <span class="info-label">Withdrawal tax</span>
            <span class="info-value">{{ withdrawTax }}%</span>
          </div> -->
        </div>
      </form>
    </div>
  </template>
</template>

<style scoped>
/* ── Card ── */
.withdraw-card {
  border-radius: 16px;
  background: white;
  border: 1px solid oklch(0% 0 0 / 0.06);
  overflow: hidden;
}

/* ── Balance header ── */
.balance-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
}
.balance-icon-wrap {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.balance-label {
  font-size: 0.7rem;
  font-weight: 500;
  color: oklch(0% 0 0 / 0.45);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}
.balance-amount {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--foreground);
  line-height: 1.2;
  letter-spacing: -0.02em;
}
.balance-currency {
  font-size: 0.8rem;
  font-weight: 600;
  color: oklch(0% 0 0 / 0.4);
  margin-right: 4px;
  vertical-align: middle;
}
.balance-toggle {
  color: oklch(0% 0 0 / 0.3);
  cursor: pointer;
  padding: 4px;
  background: none;
  border: none;
  border-radius: 8px;
  transition: all 0.15s;
}
.balance-toggle:hover {
  color: oklch(0% 0 0 / 0.6);
  background: oklch(0% 0 0 / 0.04);
}
.refresh-btn {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: oklch(0% 0 0 / 0.03);
  border: 1px solid oklch(0% 0 0 / 0.06);
  color: oklch(0% 0 0 / 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  flex-shrink: 0;
}
.refresh-btn:hover {
  background: oklch(0% 0 0 / 0.06);
  color: oklch(0% 0 0 / 0.7);
}

/* ── Form card ── */
.form-header {
  padding: 16px 20px 0;
}
.form-icon-wrap {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
  display: flex;
  align-items: center;
  justify-content: center;
}
.form-title {
  font-size: 0.65rem;
  font-weight: 700;
  color: oklch(0% 0 0 / 0.3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.form-body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Low balance alert ── */
.low-balance-alert {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 10px;
  background: oklch(80% 0.12 50 / 0.1);
  color: oklch(45% 0.15 50);
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
}

/* ── Input ── */
.input-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: oklch(0% 0 0 / 0.5);
}
.input-wrap {
  display: flex;
  align-items: center;
  border-radius: 12px;
  border: 1.5px solid oklch(0% 0 0 / 0.1);
  background: oklch(0% 0 0 / 0.02);
  overflow: hidden;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.input-wrap:focus-within {
  border-color: color-mix(in oklch, var(--ring) 50%, transparent);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 8%, transparent);
}
.input-wrap-error {
  border-color: color-mix(in oklch, var(--destructive) 40%, transparent);
}
.input-prefix {
  padding: 0 14px;
  font-size: 0.8rem;
  font-weight: 700;
  color: oklch(0% 0 0 / 0.35);
  white-space: nowrap;
  user-select: none;
}
.amount-input {
  flex: 1;
  min-width: 0;
  padding: 12px 14px 12px 0;
  font-size: 1.1rem;
  font-weight: 700;
  background: transparent;
  color: var(--foreground);
  border: none;
  outline: none;
}
.amount-input::placeholder {
  color: oklch(0% 0 0 / 0.2);
  font-weight: 500;
}
/* Remove spinner for number input */
.amount-input::-webkit-outer-spin-button,
.amount-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.amount-input[type="number"] {
  -moz-appearance: textfield;
}

/* ── Quick pills ── */
.quick-pill {
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  background: oklch(0% 0 0 / 0.04);
  color: oklch(0% 0 0 / 0.55);
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s;
}
.quick-pill:hover {
  background: oklch(0% 0 0 / 0.07);
  color: oklch(0% 0 0 / 0.75);
}
.quick-pill-active {
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
  border-color: color-mix(in oklch, var(--primary) 25%, transparent);
}

/* ── Submit ── */
.submit-btn {
  width: 100%;
  padding: 13px;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 700;
  color: white;
  background: var(--primary);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
}
.submit-btn:hover:not(:disabled) {
  background: var(--brand-teal);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 25%, transparent);
}
.submit-btn:active:not(:disabled) {
  transform: translateY(0);
}
.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ── Info strip ── */
.info-strip {
  border-radius: 10px;
  background: oklch(0% 0 0 / 0.025);
  padding: 12px 14px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.info-label {
  font-size: 0.72rem;
  color: oklch(0% 0 0 / 0.4);
  font-weight: 500;
}
.info-value {
  font-size: 0.72rem;
  color: oklch(0% 0 0 / 0.7);
  font-weight: 700;
}
.info-divider {
  height: 1px;
  background: oklch(0% 0 0 / 0.05);
  margin: 8px 0;
}

/* ═══ Dark theme ═══ */
[data-theme="dark"] .withdraw-card {
  background: oklch(100% 0 0 / 0.03);
  border-color: oklch(100% 0 0 / 0.06);
}

[data-theme="dark"] .balance-icon-wrap {
  background: color-mix(in oklch, var(--primary) 15%, transparent);
  color: var(--brand-bright);
}
[data-theme="dark"] .balance-label {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .balance-amount {
  color: white;
}
[data-theme="dark"] .balance-currency {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .balance-toggle {
  color: oklch(100% 0 0 / 0.35);
}
[data-theme="dark"] .balance-toggle:hover {
  color: oklch(100% 0 0 / 0.7);
  background: oklch(100% 0 0 / 0.06);
}
[data-theme="dark"] .refresh-btn {
  background: oklch(100% 0 0 / 0.04);
  border-color: oklch(100% 0 0 / 0.08);
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .refresh-btn:hover {
  background: oklch(100% 0 0 / 0.08);
  color: oklch(100% 0 0 / 0.7);
}

[data-theme="dark"] .form-icon-wrap {
  background: color-mix(in oklch, var(--primary) 15%, transparent);
  color: var(--brand-bright);
}
[data-theme="dark"] .form-title {
  color: oklch(100% 0 0 / 0.25);
}

[data-theme="dark"] .low-balance-alert {
  background: oklch(70% 0.15 50 / 0.12);
  color: oklch(80% 0.12 60);
}

[data-theme="dark"] .input-label {
  color: oklch(100% 0 0 / 0.5);
}
[data-theme="dark"] .input-wrap {
  background: oklch(100% 0 0 / 0.04);
  border-color: oklch(100% 0 0 / 0.1);
}
[data-theme="dark"] .input-wrap:focus-within {
  border-color: color-mix(in oklch, var(--ring) 50%, transparent);
  box-shadow: 0 0 0 3px color-mix(in oklch, var(--ring) 10%, transparent);
}
[data-theme="dark"] .input-wrap-error {
  border-color: color-mix(in oklch, var(--destructive) 40%, transparent);
}
[data-theme="dark"] .input-prefix {
  color: oklch(100% 0 0 / 0.35);
}
[data-theme="dark"] .amount-input {
  color: white;
}
[data-theme="dark"] .amount-input::placeholder {
  color: oklch(100% 0 0 / 0.2);
}

[data-theme="dark"] .quick-pill {
  background: oklch(100% 0 0 / 0.05);
  color: oklch(100% 0 0 / 0.5);
}
[data-theme="dark"] .quick-pill:hover {
  background: oklch(100% 0 0 / 0.08);
  color: oklch(100% 0 0 / 0.7);
}
[data-theme="dark"] .quick-pill-active {
  background: color-mix(in oklch, var(--primary) 15%, transparent);
  color: var(--brand-bright);
  border-color: color-mix(in oklch, var(--primary) 30%, transparent);
}

[data-theme="dark"] .submit-btn {
  background: var(--brand-bright);
}
[data-theme="dark"] .submit-btn:hover:not(:disabled) {
  background: var(--primary);
  box-shadow: 0 4px 12px color-mix(in oklch, var(--brand-bright) 30%, transparent);
}

[data-theme="dark"] .info-strip {
  background: oklch(100% 0 0 / 0.03);
}
[data-theme="dark"] .info-label {
  color: oklch(100% 0 0 / 0.35);
}
[data-theme="dark"] .info-value {
  color: oklch(100% 0 0 / 0.7);
}
[data-theme="dark"] .info-divider {
  background: oklch(100% 0 0 / 0.06);
}
</style>
