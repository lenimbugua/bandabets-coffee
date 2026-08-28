<script setup>
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useBetsStatus } from "../composables/useBetsStatus";
import { useBetsStore } from "../stores/bets";
import { useShareBetStore } from "../stores/sharebet.js";
import CashoutStrip from "./CashoutStrip.vue";

const {
  getStatusText,
  pending: betIsOpen,
  cashedOut,
//   voided,
  won,
//   pendingPayout,
} = useBetsStatus();
const { pending: sharePending } = storeToRefs(useShareBetStore());

const { setSelectedBet } = useBetsStore();
const { selectedId } = storeToRefs(useBetsStore());

defineProps({
  bet: {
    type: Object,
    required: true,
  },
});

function showRebet(status) {
  return parseInt(status) === betIsOpen;
}
</script>
<template>
  <div class="bet-card">
    <!-- ── Header: status + meta ── -->
    <div class="bet-card-header">
      <div class="flex items-center gap-2 min-w-0" :class="'status-' + bet.status">
        <BetIcon :status="bet.status" />
        <span class="bet-status-text">
          {{ getStatusText(bet.status) }}
        </span>
      </div>
      <div class="flex items-center gap-2">
        <span class="bet-meta">{{ bet.totalGames }} {{ bet.totalGames === 1 ? 'game' : 'games' }}</span>
        <span class="bet-meta">{{ bet.date }}</span>
      </div>
    </div>

    <!-- ── Body: tappable area → bet details ── -->
    <RouterLink
      :to="{ name: 'bet-details' }"
      class="bet-card-body"
      @click="setSelectedBet(bet.betId, bet)"
    >
      <!-- Financial row -->
      <div class="bet-financials">
        <div class="bet-financial-item">
          <span class="bet-label">Stake</span>
          <span class="bet-value">KES {{ bet.betAmount.toFixed("2") }}</span>
        </div>
        <div class="bet-financial-item text-center">
          <span class="bet-label">Odds</span>
          <span class="bet-value">{{ bet.totalOdd.toFixed("2") }}</span>
        </div>
        <div class="bet-financial-item text-right">
          <span class="bet-label">{{ bet.status === won ? 'Won' : bet.status === cashedOut ? 'Cashed Out' : 'To Win' }}</span>
          <span class="bet-value-highlight" :class="'win-' + bet.status">
            KES {{ bet.status === cashedOut ? bet?.cashedOutAmount?.toFixed("2") : bet.possibleWin.toFixed("2") }}
          </span>
        </div>
      </div>

      <!-- View details hint -->
      <div class="bet-details-hint">
        <span>View details</span>
        <Icon name="tabler:chevron-right" class="w-3 h-3" aria-hidden="true" />
      </div>
    </RouterLink>

    <!-- ── Footer: cashout + actions ── -->
    <div v-if="(bet.status === 1 && !bet.isBetBuilder) || showRebet(bet.status) || bet.status === betIsOpen" class="bet-card-footer">
      <!-- Cashout strip for open bets -->
      <div v-if="bet.status === 1 && !bet.isBetBuilder" class="pb-2 mb-2 border-b border-gray-100 dark:border-white/5">
        <CashoutStrip :bet="bet" :bet-id="bet.betId" />
      </div>

      <!-- Action buttons -->
      <div v-if="showRebet(bet.status) || bet.status === betIsOpen" class="flex items-center gap-2">
        <TheRebet
          v-if="showRebet(bet.status)"
          class="bet-action-btn"
          :bet-id="bet.betId"
        />
        <ShareBet v-if="bet.status === betIsOpen" :bet-id="bet.betId">
          <button class="bet-action-btn">
            <TheButtonSpin v-if="sharePending && selectedId === bet.betId" />
            <template v-else>
              <Icon name="tabler:send" class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Share</span>
            </template>
          </button>
        </ShareBet>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Card shell ── */
.bet-card {
  overflow: hidden;
}

/* ── Header ── */
.bet-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--surface-elevated);
  border-bottom: 1px solid oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .bet-card-header {
  background: oklch(100% 0 0 / 0.025);
  border-bottom-color: oklch(100% 0 0 / 0.04);
}

/* ── Status text ── */
.bet-status-text {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-1  { color: oklch(58% 0.18 70); }              /* open — amber/orange: active, in-play */
.status-5  { color: oklch(50% 0.22 155); }              /* won — emerald green: success */
.status-3  { color: oklch(52% 0.24 25); }               /* lost — vivid red: failure */
.status-15 { color: oklch(50% 0.14 195); }              /* cashed out — teal: money received */
.status-10 { color: var(--muted-foreground); }            /* pending payout — processing */
.status-2  { color: oklch(58% 0.03 55); }               /* voided — warm gray: nullified */
.status-4  { color: oklch(55% 0 0); }                   /* cancelled — neutral gray */
[data-theme="dark"] .status-1  { color: oklch(78% 0.16 70); }
[data-theme="dark"] .status-5  { color: oklch(78% 0.18 155); }
[data-theme="dark"] .status-3  { color: oklch(72% 0.2 25); }
[data-theme="dark"] .status-15 { color: oklch(75% 0.12 195); }
[data-theme="dark"] .status-10 { color: var(--muted-foreground); }
[data-theme="dark"] .status-2  { color: oklch(65% 0.03 55); }
[data-theme="dark"] .status-4  { color: oklch(60% 0 0); }

/* ── Meta text ── */
.bet-meta {
  font-size: 0.6rem;
  font-weight: 500;
  color: oklch(60% 0 0);
}
[data-theme="dark"] .bet-meta {
  color: oklch(100% 0 0 / 0.3);
}

/* ── Body ── */
.bet-card-body {
  display: block;
  padding: 0.75rem;
}
.bet-card-body:hover {
  background: oklch(0% 0 0 / 0.01);
}
[data-theme="dark"] .bet-card-body:hover {
  background: oklch(100% 0 0 / 0.02);
}

/* ── Financials grid ── */
.bet-financials {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: start;
}
.bet-financial-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.bet-label {
  font-size: 0.65rem;
  font-weight: 500;
  color: oklch(55% 0 0);
}
[data-theme="dark"] .bet-label {
  color: oklch(100% 0 0 / 0.35);
}
.bet-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: oklch(25% 0 0);
  font-variant-numeric: tabular-nums;
}
[data-theme="dark"] .bet-value {
  color: oklch(100% 0 0 / 0.85);
}

/* ── Win amount — colored by status ── */
.bet-value-highlight {
  font-size: 0.85rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.win-1  { color: oklch(25% 0 0); }                                      /* open — neutral strong */
.win-5  { color: oklch(50% 0.22 155); }                                  /* won — emerald green */
.win-3  { color: oklch(55% 0.2 25); text-decoration: line-through; }     /* lost — red, struck */
.win-15 { color: oklch(50% 0.14 195); }                                  /* cashed out — teal */
.win-10 { color: var(--muted-foreground); }                               /* pending payout — processing */
.win-2  { color: oklch(58% 0.03 55); text-decoration: line-through; }    /* voided — warm gray */
.win-4  { color: oklch(55% 0 0); text-decoration: line-through; }        /* cancelled — gray */
[data-theme="dark"] .win-1  { color: oklch(100% 0 0 / 0.9); }
[data-theme="dark"] .win-5  { color: oklch(78% 0.18 155); }
[data-theme="dark"] .win-3  { color: oklch(68% 0.18 25); }
[data-theme="dark"] .win-15 { color: oklch(75% 0.12 195); }
[data-theme="dark"] .win-10 { color: var(--muted-foreground); }
[data-theme="dark"] .win-2  { color: oklch(60% 0.03 55); }
[data-theme="dark"] .win-4  { color: oklch(55% 0 0); }

/* ── View details hint ── */
.bet-details-hint {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 0.5rem;
  font-size: 0.6rem;
  font-weight: 500;
  color: oklch(55% 0 0);
}
[data-theme="dark"] .bet-details-hint {
  color: oklch(100% 0 0 / 0.25);
}

/* ── Footer ── */
.bet-card-footer {
  padding: 0.5rem 0.75rem 0.625rem;
  border-top: 1px solid oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .bet-card-footer {
  border-top-color: oklch(100% 0 0 / 0.04);
}

/* ── Action buttons ── */
.bet-action-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: oklch(50% 0 0);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.bet-action-btn:hover {
  color: oklch(40% 0 0);
  background: oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .bet-action-btn {
  color: oklch(100% 0 0 / 0.35);
}
[data-theme="dark"] .bet-action-btn:hover {
  color: oklch(100% 0 0 / 0.6);
  background: oklch(100% 0 0 / 0.04);
}
</style>
