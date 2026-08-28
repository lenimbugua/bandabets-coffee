<script setup>
import { useModalTypes } from "@/composables/useModalTypes";
import { computed, onBeforeUnmount, ref, toRefs } from "vue";
import { useBetBuilderStore } from "../stores/betbuilder";
import { useBetslipStore } from "../stores/sports-betslip.js";
import BetBuilderSelections from "./BetBuilderSelections.vue";
import TheButtonSpin from "./TheButtonSpin.vue";

import { useModalStore } from "@/stores/modal";

const { setCustomIdToRemove, addBetbuilderToBetslip, siblingExists } =
  useBetslipStore();
const props = defineProps({
  parentMatchId: {
    type: String,
    required: true,
  },
});

const selections = computed(() =>
  useBetBuilderStore().getSelectionByParentMatchId(props.parentMatchId)
);

const showSelections = ref(false);
const canAddToSlip = computed(() => selections.value?.selections?.length >= 2);

const { decimalPrice, pending } = toRefs(useBetBuilderStore());

function addToSlip(item) {
  item.isBetBuilder = true;

  const sibling = siblingExists(item);
  if (sibling) {
    setCustomIdToRemove(sibling.customId);
    const { confirmRemoveSlipModal } = useModalTypes();
    const { openModal } = useModalStore();
    openModal(confirmRemoveSlipModal);
    return;
  }

  addBetbuilderToBetslip(item, decimalPrice.value);
}

onBeforeUnmount(() => {
  setCustomIdToRemove(null);
});
</script>
<template>
  <div v-if="selections?.selections?.length > 0" class="sticky top-32">
    <div class="bb-slip">
      <!-- Top row: count + info | odds + add button + toggle -->
      <div class="bb-slip-header">
        <div class="bb-slip-left">
          <div class="bb-count-badge">
            <TheButtonSpin v-if="pending" />
            <span v-else>{{ selections.selections.length }}</span>
          </div>
          <div class="bb-slip-info">
            <span class="bb-slip-title">Bet Builder</span>
            <span v-if="!canAddToSlip" class="bb-slip-hint">Add another selection</span>
            <span v-else class="bb-slip-hint">{{ selections.selections.length }} selections</span>
          </div>
        </div>

        <div class="bb-slip-right">
          <div v-if="canAddToSlip" class="bb-odds-block">
            <span class="bb-odds-label">Odds</span>
            <span class="bb-odds-value">{{ decimalPrice }}</span>
          </div>

          <button
            :disabled="!canAddToSlip"
            :class="!canAddToSlip && 'bb-add-btn-disabled'"
            class="bb-add-btn"
            @click="addToSlip(selections)"
          >
            <TheButtonSpin v-if="pending" />
            <template v-else>
              <Icon name="tabler:plus" class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Add to Betslip</span>
            </template>
          </button>

          <button
            class="bb-toggle-btn"
            @click="showSelections = !showSelections"
          >
            <Icon
              name="tabler:chevron-down"
              :class="showSelections && 'rotate-180'"
              class="w-4 h-4"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>

      <!-- Expandable selections list -->
      <BetBuilderSelections
        v-if="showSelections"
        :selections="selections.selections"
      />
    </div>
    <ConfirmModalRemoveSlip :selections />
  </div>
</template>

<style scoped>
.bb-slip {
  border-radius: 0.625rem;
  border: 1px solid oklch(0% 0 0 / 0.08);
  background: oklch(100% 0 0);
  overflow: hidden;
}
[data-theme="dark"] .bb-slip {
  border-color: oklch(100% 0 0 / 0.06);
  background: oklch(100% 0 0 / 0.02);
}

.bb-slip-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.625rem;
  gap: 0.5rem;
}

.bb-slip-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
}

.bb-count-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.5rem;
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
}
[data-theme="dark"] .bb-count-badge {
  background: color-mix(in oklch, var(--primary) 12%, transparent);
  color: var(--primary);
}

.bb-slip-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.bb-slip-title {
  font-size: 0.7rem;
  font-weight: 700;
  color: oklch(20% 0 0);
  letter-spacing: -0.01em;
}
[data-theme="dark"] .bb-slip-title {
  color: oklch(100% 0 0 / 0.85);
}

.bb-slip-hint {
  font-size: 0.55rem;
  font-weight: 500;
  color: oklch(55% 0 0);
}
[data-theme="dark"] .bb-slip-hint {
  color: oklch(100% 0 0 / 0.35);
}

.bb-slip-right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  flex-shrink: 0;
}

.bb-odds-block {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}

.bb-odds-label {
  font-size: 0.5rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: oklch(55% 0 0);
}
[data-theme="dark"] .bb-odds-label {
  color: oklch(100% 0 0 / 0.3);
}

.bb-odds-value {
  font-size: 0.85rem;
  font-weight: 800;
  color: oklch(20% 0 0);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
[data-theme="dark"] .bb-odds-value {
  color: oklch(100% 0 0 / 0.9);
}

/* ── Add button ── */
.bb-add-btn {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.375rem 0.625rem;
  border-radius: 0.5rem;
  font-size: 0.65rem;
  font-weight: 700;
  background: var(--primary);
  color: var(--primary-foreground);
  cursor: pointer;
  transition: background 0.15s, opacity 0.15s;
}
.bb-add-btn:hover {
  background: var(--brand-teal);
}
[data-theme="dark"] .bb-add-btn {
  background: var(--primary);
}
[data-theme="dark"] .bb-add-btn:hover {
  background: var(--brand-teal);
}

.bb-add-btn-disabled {
  opacity: 0.35;
  cursor: not-allowed;
}
.bb-add-btn-disabled:hover {
  background: var(--primary);
}
[data-theme="dark"] .bb-add-btn-disabled:hover {
  background: var(--primary);
}

/* ── Toggle chevron ── */
.bb-toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 0.375rem;
  color: oklch(45% 0 0);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.bb-toggle-btn:hover {
  background: oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .bb-toggle-btn {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .bb-toggle-btn:hover {
  background: oklch(100% 0 0 / 0.05);
}

.bb-toggle-btn svg {
  transition: transform 0.2s ease;
}

.rotate-180 {
  transform: rotate(180deg);
}
</style>
