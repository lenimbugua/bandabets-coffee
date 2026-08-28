<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useBetsStore } from "../stores/bets";
import { useBetsStatus } from "../composables/useBetsStatus";
import { useFormatScores } from "../composables/useFormatScores";
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useRouter } from "vue-router";
import { useShareBetStore } from "../stores/sharebet.js";
import CashoutStrip from "./CashoutStrip.vue";
import DateBox from "./DateBox.vue";
import LiveBox from "./LiveBox.vue";

const { goToMatchDetails } = useMatchDetails();
const router = useRouter();

const { pending: sharePending } = storeToRefs(useShareBetStore());
const { homeScore, awayScore } = useFormatScores();
const {
  getStatusText,
  cashedOut,
  won,
  pending: betIsOpen,
} = useBetsStatus();

const { betDetails, selectedBet } = storeToRefs(useBetsStore());

const isBetBuilder = computed(() => selectedBet.value?.isBetBuilder === true);

const betBuilderMatch = computed(() => {
  if (!isBetBuilder.value || !betDetails.value?.length) return null;
  const first = betDetails.value[0];
  return {
    parentMatchId: first.parentMatchId,
    homeTeam: first.homeTeam,
    awayTeam: first.awayTeam,
    date: first.date,
    isLive: first.isLive,
    status: first.status,
    periodicTime: first.periodicTime,
    matchState: first.matchState,
    result: first.result,
  };
});

function parseSpecifier(specifiers) {
  if (!specifiers) return '';
  if (specifiers.includes('=')) {
    const parts = specifiers.split(',');
    const values = parts.map(p => p.split('=')[1]).filter(Boolean);
    return values.join(', ');
  }
  return specifiers;
}

function showScores(isLive, status) {
  status = parseInt(status);
  if (isLive) return true;
  if (status == 1 || status == 4) return false;
  return true;
}
</script>

<template>
  <div class="card">
    <!-- ── Card header: status + meta ── -->
    <div class="card-header">
      <div class="flex items-center gap-2 min-w-0" :class="'status-' + selectedBet?.status">
        <BetIcon :status="selectedBet?.status" />
        <span class="status-text">{{ getStatusText(selectedBet?.status) }}</span>
        <span v-if="isBetBuilder" class="bb-badge">Bet Builder</span>
      </div>
      <div class="flex items-center gap-2">
        <span class="meta-badge">
          {{ selectedBet?.totalGames }} {{ selectedBet?.totalGames === 1 ? 'game' : 'games' }}
        </span>
        <span class="meta-text">{{ selectedBet?.date }}</span>
      </div>
    </div>

    <!-- ── Summary body: ID + financials ── -->
    <div class="card-body">
      <div class="id-row">
        <span class="bet-id-badge">ID: {{ selectedBet?.betRefenceId }}</span>
        <ShareBet v-if="selectedBet?.status === betIsOpen" :bet-id="selectedBet?.betId">
          <button class="share-btn">
            <TheButtonSpin v-if="sharePending" />
            <template v-else>
              <Icon name="tabler:share" class="w-3.5 h-3.5" aria-hidden="true" />
              <span>Share</span>
            </template>
          </button>
        </ShareBet>
      </div>

      <div class="financials">
        <div class="financial-item">
          <span class="fin-label">Stake</span>
          <span class="fin-value">KES {{ selectedBet?.betAmount.toFixed("2") }}</span>
        </div>
        <div class="financial-item text-center">
          <span class="fin-label">Odds</span>
          <span class="fin-value">{{ selectedBet?.totalOdd.toFixed("2") }}</span>
        </div>
        <div class="financial-item text-right">
          <span class="fin-label">
            {{ selectedBet?.status === won ? 'Won' : selectedBet?.status === cashedOut ? 'Cashed Out' : 'To Win' }}
          </span>
          <span class="fin-value-highlight" :class="'win-' + selectedBet?.status">
            KES {{ selectedBet?.status === cashedOut ? selectedBet?.cashedOutAmount?.toFixed("2") : selectedBet?.possibleWin }}
          </span>
        </div>
      </div>
    </div>

    <!-- ── Cashout strip ── -->
    <div v-if="selectedBet?.status == 1 && !selectedBet?.isBetBuilder" class="card-footer">
      <CashoutStrip
        :bet="selectedBet"
        :cashout-value="selectedBet?.casheOutValue"
        :bet-id="selectedBet.betId"
        :cashout-allowed="selectedBet.cashOutAllowed"
      />
    </div>

    <!-- ── Selections divider ── -->
    <div class="sel-divider">
      <span class="sel-header-text">Selections</span>
      <span class="selections-count">{{ betDetails?.length || 0 }}</span>
    </div>

    <!-- ══════════════════════════════════════════
         BET BUILDER layout: single match, multiple markets
         ══════════════════════════════════════════ -->
    <div v-if="isBetBuilder && betBuilderMatch" class="bb-section">
      <!-- Match header -->
      <div
        class="bb-match-header"
        @click="goToMatchDetails(betDetails[0], router, betBuilderMatch.isLive)"
      >
        <div class="selection-indicator">
          <DateBox
            v-if="betBuilderMatch.isLive == parseInt(0) && betBuilderMatch.status == parseInt(1)"
            :date="betBuilderMatch.date"
          />
          <LiveBox
            v-else
            :status-desc="betBuilderMatch.periodicTime"
            :match-state="betBuilderMatch.matchState"
            :is-live="betBuilderMatch.isLive"
            :status="betBuilderMatch.status"
          />
        </div>
        <div class="teams-block">
          <div class="team-row">
            <span v-if="showScores(betBuilderMatch.isLive, betBuilderMatch.status)" class="team-score" :class="betBuilderMatch.isLive ? 'score-live' : 'score-' + betBuilderMatch.status">
              {{ homeScore(betBuilderMatch.result) }}
            </span>
            <span class="team-name">{{ betBuilderMatch.homeTeam }}</span>
          </div>
          <div class="team-row">
            <span v-if="showScores(betBuilderMatch.isLive, betBuilderMatch.status)" class="team-score" :class="betBuilderMatch.isLive ? 'score-live' : 'score-' + betBuilderMatch.status">
              {{ awayScore(betBuilderMatch.result) }}
            </span>
            <span class="team-name">{{ betBuilderMatch.awayTeam }}</span>
          </div>
        </div>
        <div class="bb-match-status" :class="'status-' + betBuilderMatch.status">
          <BetIcon class="w-3 h-3" :status="betBuilderMatch.status" />
        </div>
      </div>

      <!-- Date + stats row for the match -->
      <div class="selection-bottom-row">
        <span class="selection-date">{{ betBuilderMatch.date }}</span>
        <OpenMatchStatButton :parent-match-id="betBuilderMatch.parentMatchId" />
      </div>

      <!-- Market list -->
      <div class="bb-markets">
        <div
          v-for="(item, idx) in betDetails"
          :key="idx"
          class="bb-market-row"
          :class="{ 'bb-market-row-last': idx === betDetails.length - 1 }"
        >
          <div class="bb-market-left">
            <div class="flex items-center gap-1" :class="'status-' + item.status">
              <BetIcon class="w-2.5 h-2.5" :status="item.status" />
            </div>
            <div class="bb-market-info">
              <span class="bb-market-name">{{ item.marketName }}</span>
              <span class="bb-pick-value">{{ item.outcomeName }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- ══════════════════════════════════════════
         REGULAR layout: each selection as a row
         ══════════════════════════════════════════ -->
    <div v-else class="selections-list">
      <div
        v-for="(item, idx) in betDetails"
        :key="JSON.stringify(item)"
        class="selection-item"
        :class="{ 'selection-item-last': idx === betDetails.length - 1 }"
      >
        <!-- Main row: indicator + teams + right column -->
        <div
          class="selection-main"
          @click="goToMatchDetails(item, router, item.isLive)"
        >
          <!-- Date/Live indicator -->
          <div class="selection-indicator">
            <DateBox
              v-if="item.isLive == parseInt(0) && item.status == parseInt(1)"
              :date="item.date"
            />
            <LiveBox
              v-else
              :status-desc="item.periodicTime"
              :match-state="item.matchState"
              :is-live="item.isLive"
              :status="item.status"
            />
          </div>

          <!-- Teams -->
          <div class="teams-block">
            <div class="team-row">
              <span v-if="showScores(item.isLive, item.status)" class="team-score" :class="item.isLive ? 'score-live' : 'score-' + item.status">
                {{ homeScore(item.result) }}
              </span>
              <span class="team-name">{{ item.homeTeam }}</span>
            </div>
            <div class="team-row">
              <span v-if="showScores(item.isLive, item.status)" class="team-score" :class="item.isLive ? 'score-live' : 'score-' + item.status">
                {{ awayScore(item.result) }}
              </span>
              <span class="team-name">{{ item.awayTeam }}</span>
            </div>
          </div>

          <!-- Right: status + odds + market/pick -->
          <div class="selection-right">
            <div class="flex items-center gap-1" :class="'status-' + item.status">
              <BetIcon class="w-3 h-3" :status="item.status" />
              <span class="selection-status-text">{{ getStatusText(item.status) }}</span>
            </div>
            <div class="odds-block">
              <span class="odds-heading">Odds</span>
              <div class="odds-picked">
                <span class="odds-label">Picked</span>
                <span class="odds-value">{{ item.oddValue }}</span>
              </div>
              <div v-if="item.currentOddValue && item.isLive" class="odds-current">
                <span class="odds-label">Live</span>
                <span class="live-odds">{{ item.currentOddValue }}</span>
              </div>
            </div>
            <div class="market-pick-right">
              <span class="market-name">{{ item.marketName }}<span v-if="parseSpecifier(item.specifiers)" class="specifier-value"> ({{ parseSpecifier(item.specifiers) }})</span></span>
              <span class="pick-label">Pick:</span>
              <span class="pick-value">{{ item.outcomeName }}</span>
              <TwoUpIcon v-if="item?.twoGoalsUp" />
            </div>
          </div>
        </div>

        <!-- Date + stats row -->
        <div class="selection-bottom-row">
          <span class="selection-date">{{ item.date }}</span>
          <OpenMatchStatButton :parent-match-id="item.parentMatchId" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ══════════════════════════════════════════
   Single unified card
   ══════════════════════════════════════════ */
.card {
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.75rem;
  background: var(--surface-elevated);
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .card-header {
  background: oklch(100% 0 0 / 0.025);
  border-bottom-color: oklch(100% 0 0 / 0.04);
}

/* ── Status ── */
.status-text {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.selection-status-text {
  font-size: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.status-1  { color: oklch(58% 0.18 70); }
.status-5  { color: oklch(50% 0.22 155); }
.status-3  { color: oklch(52% 0.24 25); }
.status-15 { color: oklch(50% 0.14 195); }
.status-10 { color: var(--muted-foreground); }
.status-2  { color: oklch(58% 0.03 55); }
.status-4  { color: oklch(55% 0 0); }
[data-theme="dark"] .status-1  { color: oklch(78% 0.16 70); }
[data-theme="dark"] .status-5  { color: oklch(78% 0.18 155); }
[data-theme="dark"] .status-3  { color: oklch(72% 0.2 25); }
[data-theme="dark"] .status-15 { color: oklch(75% 0.12 195); }
[data-theme="dark"] .status-10 { color: var(--muted-foreground); }
[data-theme="dark"] .status-2  { color: oklch(65% 0.03 55); }
[data-theme="dark"] .status-4  { color: oklch(60% 0 0); }

/* ── Bet Builder badge ── */
.bb-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.1rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.55rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  background: color-mix(in oklch, var(--muted-foreground) 10%, transparent);
  color: var(--muted-foreground);
}
[data-theme="dark"] .bb-badge {
  background: color-mix(in oklch, var(--muted-foreground) 12%, transparent);
  color: var(--muted-foreground);
}

/* ── Meta ── */
.meta-badge {
  display: inline-flex;
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.6rem;
  font-weight: 600;
  background: oklch(0% 0 0 / 0.05);
  color: oklch(40% 0 0);
}
[data-theme="dark"] .meta-badge {
  background: oklch(100% 0 0 / 0.05);
  color: oklch(100% 0 0 / 0.5);
}

.meta-text {
  font-size: 0.6rem;
  font-weight: 500;
  color: oklch(50% 0 0);
}
[data-theme="dark"] .meta-text {
  color: oklch(100% 0 0 / 0.3);
}

/* ── Card body ── */
.card-body {
  padding: 0.75rem;
}

.id-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.625rem;
  padding-bottom: 0.625rem;
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .id-row {
  border-bottom-color: oklch(100% 0 0 / 0.04);
}

.bet-id-badge {
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  background: var(--surface-interactive);
  color: oklch(30% 0 0);
  font-variant-numeric: tabular-nums;
  border: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .bet-id-badge {
  background: oklch(100% 0 0 / 0.04);
  color: oklch(100% 0 0 / 0.7);
  border-color: oklch(100% 0 0 / 0.06);
}

.share-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  font-size: 0.65rem;
  font-weight: 600;
  color: oklch(45% 0 0);
  cursor: pointer;
  transition: color 0.15s, background 0.15s;
}
.share-btn:hover {
  color: oklch(35% 0 0);
  background: oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .share-btn {
  color: oklch(100% 0 0 / 0.35);
}
[data-theme="dark"] .share-btn:hover {
  color: oklch(100% 0 0 / 0.6);
  background: oklch(100% 0 0 / 0.04);
}

/* ── Financials ── */
.financials {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 0.75rem;
  align-items: start;
}
.financial-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.fin-label {
  font-size: 0.6rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: oklch(50% 0 0);
}
[data-theme="dark"] .fin-label {
  color: oklch(100% 0 0 / 0.35);
}

.fin-value {
  font-size: 0.8rem;
  font-weight: 700;
  color: oklch(20% 0 0);
  font-variant-numeric: tabular-nums;
}
[data-theme="dark"] .fin-value {
  color: oklch(100% 0 0 / 0.85);
}

.fin-value-highlight {
  font-size: 0.85rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
}
.win-1  { color: oklch(20% 0 0); }
.win-5  { color: oklch(50% 0.22 155); }
.win-3  { color: oklch(55% 0.2 25); text-decoration: line-through; }
.win-15 { color: oklch(50% 0.14 195); }
.win-10 { color: var(--muted-foreground); }
.win-2  { color: oklch(58% 0.03 55); text-decoration: line-through; }
.win-4  { color: oklch(55% 0 0); text-decoration: line-through; }
[data-theme="dark"] .win-1  { color: oklch(100% 0 0 / 0.9); }
[data-theme="dark"] .win-5  { color: oklch(78% 0.18 155); }
[data-theme="dark"] .win-3  { color: oklch(68% 0.18 25); }
[data-theme="dark"] .win-15 { color: oklch(75% 0.12 195); }
[data-theme="dark"] .win-10 { color: var(--muted-foreground); }
[data-theme="dark"] .win-2  { color: oklch(60% 0.03 55); }
[data-theme="dark"] .win-4  { color: oklch(55% 0 0); }

/* ── Card footer ── */
.card-footer {
  padding: 0.5rem 0.75rem 0.625rem;
  border-top: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .card-footer {
  border-top-color: oklch(100% 0 0 / 0.04);
}

/* ══════════════════════════════════════════
   Selections (inside same card)
   ══════════════════════════════════════════ */
.sel-divider {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.75rem;
  background: var(--surface-elevated);
  border-top: 1px solid oklch(0% 0 0 / 0.06);
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .sel-divider {
  background: oklch(100% 0 0 / 0.025);
  border-top-color: oklch(100% 0 0 / 0.04);
  border-bottom-color: oklch(100% 0 0 / 0.04);
}

.sel-header-text {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: oklch(40% 0 0);
}
[data-theme="dark"] .sel-header-text {
  color: oklch(100% 0 0 / 0.5);
}

.selections-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 1.125rem;
  height: 1.125rem;
  padding: 0 0.3rem;
  border-radius: 1rem;
  font-size: 0.55rem;
  font-weight: 700;
  background: oklch(0% 0 0 / 0.06);
  color: oklch(40% 0 0);
}
[data-theme="dark"] .selections-count {
  background: oklch(100% 0 0 / 0.06);
  color: oklch(100% 0 0 / 0.5);
}

/* ══════════════════════════════════════════
   Bet Builder layout
   ══════════════════════════════════════════ */
.bb-section {
  padding: 0.5rem;
  border-radius: 0.625rem;
  border: 1px solid oklch(0% 0 0 / 0.08);
  background: oklch(100% 0 0);
  margin: 0.5rem;
  overflow: hidden;
}
[data-theme="dark"] .bb-section {
  border-color: oklch(100% 0 0 / 0.06);
  background: oklch(100% 0 0 / 0.02);
}

.bb-match-header {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.75rem 0.25rem;
  cursor: pointer;
  transition: background 0.1s;
}
.bb-match-header:hover {
  background: oklch(0% 0 0 / 0.015);
}
[data-theme="dark"] .bb-match-header:hover {
  background: oklch(100% 0 0 / 0.02);
}

.bb-match-status {
  display: flex;
  align-items: center;
}

/* Market list */
.bb-markets {
  padding: 0 0.75rem 0.375rem;
}

.bb-market-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.375rem 0.5rem;
  border-bottom: 1px solid oklch(0% 0 0 / 0.04);
}
.bb-market-row-last {
  border-bottom: none;
}
[data-theme="dark"] .bb-market-row {
  border-bottom-color: oklch(100% 0 0 / 0.03);
}
[data-theme="dark"] .bb-market-row-last {
  border-bottom: none;
}

.bb-market-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  min-width: 0;
}

.bb-market-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}

.bb-market-name {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--muted-foreground);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
[data-theme="dark"] .bb-market-name {
  color: var(--muted-foreground);
}

.bb-pick-value {
  font-size: 0.6rem;
  font-weight: 700;
  color: oklch(25% 0 0);
}
[data-theme="dark"] .bb-pick-value {
  color: oklch(100% 0 0 / 0.75);
}

/* ══════════════════════════════════════════
   Regular selection items
   ══════════════════════════════════════════ */
.selections-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 0.5rem 0.5rem;
}

.selection-item {
  border-radius: 0.625rem;
  border: 1px solid oklch(0% 0 0 / 0.08);
  background: oklch(100% 0 0);
  overflow: hidden;
}
[data-theme="dark"] .selection-item {
  border-color: oklch(100% 0 0 / 0.06);
  background: oklch(100% 0 0 / 0.02);
}

.selection-main {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.5rem;
  align-items: center;
  padding: 0.5rem 0.75rem 0.25rem;
  cursor: pointer;
  transition: background 0.1s;
}
.selection-main:hover {
  background: oklch(0% 0 0 / 0.015);
}
[data-theme="dark"] .selection-main:hover {
  background: oklch(100% 0 0 / 0.02);
}

.selection-indicator {
  flex-shrink: 0;
}

/* Teams */
.teams-block {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
  min-width: 0;
}

.team-row {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.team-name {
  font-size: 0.7rem;
  font-weight: 600;
  color: oklch(20% 0 0);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
[data-theme="dark"] .team-name {
  color: oklch(100% 0 0 / 0.85);
}

.team-score {
  font-size: 0.65rem;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  min-width: 0.875rem;
  text-align: center;
}

/* Live scores — red */
.score-live { color: oklch(55% 0.24 25); }
[data-theme="dark"] .score-live { color: oklch(72% 0.2 25); }

/* Settled scores — match status color */
.score-5  { color: oklch(50% 0.22 155); }
.score-3  { color: oklch(52% 0.24 25); }
.score-15 { color: oklch(50% 0.14 195); }
.score-10 { color: var(--muted-foreground); }
.score-2  { color: oklch(58% 0.03 55); }
.score-4  { color: oklch(55% 0 0); }
[data-theme="dark"] .score-5  { color: oklch(78% 0.18 155); }
[data-theme="dark"] .score-3  { color: oklch(72% 0.2 25); }
[data-theme="dark"] .score-15 { color: oklch(75% 0.12 195); }
[data-theme="dark"] .score-10 { color: var(--muted-foreground); }
[data-theme="dark"] .score-2  { color: oklch(65% 0.03 55); }
[data-theme="dark"] .score-4  { color: oklch(60% 0 0); }

/* Right column: status + odds + market/pick stacked */
.selection-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.375rem;
}

/* Odds row */
.odds-block {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.odds-heading {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: oklch(45% 0 0);
  margin-right: 0.125rem;
}
[data-theme="dark"] .odds-heading {
  color: oklch(65% 0 0);
}

.odds-picked,
.odds-current {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0.25rem 0.5rem;
  border-radius: 0.375rem;
  min-width: 2.5rem;
}

.odds-picked {
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--primary) 15%, transparent);
}
[data-theme="dark"] .odds-picked {
  background: color-mix(in oklch, var(--primary) 10%, transparent);
  border-color: color-mix(in oklch, var(--primary) 15%, transparent);
}

.odds-current {
  background: oklch(58% 0.18 70 / 0.1);
  border: 1px solid oklch(58% 0.18 70 / 0.15);
}
[data-theme="dark"] .odds-current {
  background: oklch(78% 0.16 70 / 0.1);
  border-color: oklch(78% 0.16 70 / 0.15);
}

.odds-label {
  font-size: 0.5rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: oklch(50% 0 0);
  line-height: 1;
  margin-bottom: 0.125rem;
}
[data-theme="dark"] .odds-label {
  color: oklch(100% 0 0 / 0.4);
}

.odds-value {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--primary);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
[data-theme="dark"] .odds-value {
  color: var(--primary);
}

.live-odds {
  font-size: 0.75rem;
  font-weight: 800;
  color: oklch(58% 0.18 70);
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
[data-theme="dark"] .live-odds {
  color: oklch(78% 0.16 70);
}

/* Market + pick below odds */
.market-pick-right {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.market-name {
  font-size: 0.6rem;
  font-weight: 600;
  color: var(--muted-foreground);
}
[data-theme="dark"] .market-name {
  color: var(--muted-foreground);
}

.specifier-value {
  font-weight: 700;
  color: oklch(50% 0.15 145);
}
[data-theme="dark"] .specifier-value {
  color: oklch(75% 0.15 145);
}

.pick-label {
  font-size: 0.55rem;
  font-weight: 700;
  color: var(--primary);
  letter-spacing: 0.02em;
}
[data-theme="dark"] .pick-label {
  color: var(--primary);
}

.pick-value {
  font-size: 0.6rem;
  font-weight: 800;
  color: oklch(20% 0 0);
}
[data-theme="dark"] .pick-value {
  color: oklch(100% 0 0 / 0.8);
}

/* Date + stats row */
.selection-bottom-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 0.75rem 0.375rem;
}

.selection-date {
  font-size: 0.55rem;
  font-weight: 500;
  color: oklch(55% 0 0);
  font-variant-numeric: tabular-nums;
}
[data-theme="dark"] .selection-date {
  color: oklch(100% 0 0 / 0.3);
}
</style>
