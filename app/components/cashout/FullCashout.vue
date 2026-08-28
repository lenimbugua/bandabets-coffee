<script setup>
import { useCashoutStore } from "@/stores/cashout.js";
import { computed, toRefs } from "vue";

const { cashoutNow, cancelAutoCashout } = useCashoutStore();
const { pending, betId } = toRefs(useCashoutStore());
const cashoutData = computed(() => useCashoutStore().cashoutData(betId.value));
</script>
<template>
  <div class="full-cashout">
    <!-- Auto cashout active warning -->
    <div v-if="cashoutData?.autoCashOutEnabled" class="cashout-section">
      <div class="cashout-notice">
        <Icon name="tabler:alert-circle" class="w-3.5 h-3.5 shrink-0 mt-0.5" aria-hidden="true" />
        <p>Auto cashout is active. Cancel it first to use instant cashout.</p>
      </div>
      <button class="cashout-action-btn cashout-btn-cancel" :disabled="pending" @click="cancelAutoCashout(cashoutData.betId)">
        <TheButtonSpin v-if="pending" />
        <template v-else>
          <span>Cancel Auto Cashout</span>
          <span class="cashout-btn-tag">{{ cashoutData.autoCashOutAmount }} KES</span>
        </template>
      </button>
    </div>

    <!-- Normal full cashout -->
    <div v-else class="cashout-section">
      <p class="cashout-disclaimer">
        By clicking below you confirm your cashout. This action cannot be reversed.
      </p>
      <button class="cashout-action-btn cashout-btn-primary" :disabled="pending" @click="cashoutNow(betId)">
        <TheButtonSpin v-if="pending" />
        <template v-else>
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
          </svg>
          <span>Cashout Now</span>
        </template>
      </button>
    </div>
  </div>
</template>

<style scoped>
.full-cashout {
  /* container */
}

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
