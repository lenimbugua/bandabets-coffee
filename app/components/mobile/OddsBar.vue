<script setup>
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useBetslipStore } from "@/stores/sports-betslip";
import { useBetslipDataLayer } from "@/composables/useBetslipDataLayer";
import { storeToRefs } from "pinia";
import { computed, ref, watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
const allowedRoutes = ["home", "live", "sports", "match-details", "country"];

const betslipStore = useBetslipStore();
const { betslipLength, totalOdds, possibleWin } = storeToRefs(betslipStore);
const { verifyBetslip } = betslipStore;

const { showModal } = storeToRefs(useModalStore());
const { openModal } = useModalStore();
const { betslip } = useModalTypes();
const { addViewBetslipDataLayer } = useBetslipDataLayer();

const show = computed(() =>
  betslipLength.value > 0 && !showModal.value && allowedRoutes.includes(route.name)
);

const bouncing = ref(false);

watch(betslipLength, (newVal, oldVal) => {
  if (newVal > oldVal) {
    bouncing.value = true;
    setTimeout(() => { bouncing.value = false; }, 500);
  }
});

function openBetslip() {
  verifyBetslip();
  openModal(betslip);
  addViewBetslipDataLayer();
}
</script>

<template>
  <Transition name="oddsbar">
    <div v-if="show" class="oddsbar" data-fly-target="betslip" @click="openBetslip">
      <div class="oddsbar-inner" :class="{ 'oddsbar-bounce': bouncing }">
        <!-- Left: count + odds -->
        <div class="oddsbar-left">
          <span class="oddsbar-count">{{ betslipLength }}</span>
          <div class="oddsbar-meta">
            <span class="oddsbar-label">Betslip</span>
            <span class="oddsbar-odds">{{ totalOdds }} odds</span>
          </div>
        </div>

        <!-- Right: possible win + arrow -->
        <div class="oddsbar-right">
          <div class="oddsbar-win">
            <span class="oddsbar-win-label">Win</span>
            <span class="oddsbar-win-amount">KES {{ possibleWin }}</span>
          </div>
          <Icon name="tabler:chevron-up" class="oddsbar-arrow" aria-hidden="true" />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.oddsbar {
  position: fixed;
  bottom: calc(56px + env(safe-area-inset-bottom, 0));
  left: 0;
  right: 0;
  z-index: 49;
}

.oddsbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 14px 14px 0 0;
  background: var(--accent);
  border: 1px solid color-mix(in oklch, var(--accent) 70%, black);
  box-shadow:
    0 -2px 16px color-mix(in oklch, var(--accent) 25%, transparent),
    0 4px 24px rgb(0 0 0 / 0.2),
    inset 0 1px 0 rgb(255 255 255 / 0.1),
    inset 0 -1px 0 rgb(0 0 0 / 0.1);
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.15s;
}
.oddsbar-inner:active {
  transform: scale(0.98);
}

/* Left */
.oddsbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.oddsbar-count {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 8px;
  /* Lighter shade than the bar it sits on. The old --background fill was
     near-black on a dark bar, with --accent text on top of it — the
     count was barely legible in either theme. */
  background: var(--brand-bright);
  color: var(--primary-foreground);
  font-size: 0.8rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  box-shadow: 0 2px 6px rgb(0 0 0 / 0.25);
}

.oddsbar-meta {
  display: flex;
  flex-direction: column;
}

.oddsbar-label {
  font-size: 0.65rem;
  font-weight: 600;
  color: var(--accent-foreground);
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.oddsbar-odds {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--accent-foreground);
  font-variant-numeric: tabular-nums;
}

/* Right */
.oddsbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.oddsbar-win {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.oddsbar-win-label {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--accent-foreground);
  opacity: 0.75;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.oddsbar-win-amount {
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--accent-foreground);
  font-variant-numeric: tabular-nums;
}

.oddsbar-arrow {
  width: 18px;
  height: 18px;
  color: var(--accent-foreground);
}

/* Bounce when item lands */
.oddsbar-bounce {
  animation: oddsbar-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

@keyframes oddsbar-pop {
  0% { transform: scale(1); }
  20% { transform: scale(1.06); box-shadow: 0 0 20px color-mix(in oklch, var(--accent) 40%, transparent), 0 4px 20px oklch(0% 0 0 / 0.25), inset 0 1px 0 oklch(100% 0 0 / 0.06); }
  50% { transform: scale(0.97); }
  75% { transform: scale(1.02); }
  100% { transform: scale(1); }
}

/* Transition */
.oddsbar-enter-active {
  transition: all 0.25s ease-out;
}
.oddsbar-leave-active {
  transition: all 0.15s ease-in;
}
.oddsbar-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.oddsbar-leave-to {
  opacity: 0;
  transform: translateY(16px);
}
</style>
