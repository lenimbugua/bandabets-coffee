<script setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useBetslipStore } from "../stores/sports-betslip.js";
import OddChangeArrow from "./OddChangeArrow.vue";
import ThePadlock from "./ThePadlock.vue";

import { useFlyToBetslip } from "@/composables/useFlyToBetslip";
import { useToast } from "@/composables/useToast";

import { MAX_GAMES } from "../composables/useDefinedConstants";

const props = defineProps({
  outcome: {
    type: Object,
    required: true,
  },
  seasonId: {
    type: String,
    required: true,
  },
  homeTeam: {
    type: String,
    required: true,
  },
  customId: {
    type: String,
    required: true,
  },
  awayTeam: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true,
  },
  competitionId: {
    type: Number,
    required: true,
  },
  subTypeId: {
    type: Number,
    required: true,
  },
  parentMatchId: {
    type: String,
    required: true,
  },
  isMatchDetail: {
    type: Boolean,
    required: false,
    default: false,
  },
  sportId: {
    type: String,
    required: true,
  },
  competitionName: {
    type: String,
    required: true,
  },
  countryName: {
    type: String,
    required: true,
  },
  sportName: {
    type: String,
    required: true,
  },
  twoGoalUpActive: {
    type: Boolean,
    required: true,
  },
  live: {
    type: Number,
    required: false,
    default: 0,
  },
  showLabel: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const { betslip } = storeToRefs(useBetslipStore());
const { addAnItemToBetslip } = useBetslipStore();

const { fireErrorToast } = useToast();
const { triggerFlyAnimation } = useFlyToBetslip();

const outcomeIsSelected = computed(() => {
  return betslip.value.some((item) => item.customId === props.customId);
});

function handleSelect(event) {
  const clickIsToSelectOutcome = !outcomeIsSelected.value;
  if (clickIsToSelectOutcome) triggerFlyAnimation(event);
  const outcome = props.outcome;
  const payload = {
    live: props.live,
    customId: props.customId,
    seasonId: props.seasonId,
    homeTeam: props.homeTeam,
    awayTeam: props.awayTeam,
    oddType: outcome.oddType,
    startTime: props.startTime,
    twoGoalUpActive: props.twoGoalUpActive,
    oddValue: outcome.oddValue,
    outcomeId: outcome.outcomeId,
    subTypeId: props.subTypeId,
    specifiers: outcome.specifiers,
    status: outcome.status,
    sportId: props.sportId,
    prevOddValue: outcome.preOddValue,
    outcomeName: outcome.outcomeName,
    competitionId: props.competitionId,
    parentMatchId: props.parentMatchId,
    competitionName: props.competitionName,
    countryName: props.countryName,
    sportName: props.sportName,
    timestamp: Date.now().toString(),
    clickIsToSelectOutcome,
  };

  if (betslip.value.length >= MAX_GAMES && clickIsToSelectOutcome) {
    fireErrorToast("Betslip limit reached");
    return;
  }

  addAnItemToBetslip(payload);
}

function outcomeIsLocked() {
  return props.outcome.status === -1;
}
</script>
<template>
  <!-- Standard variant (non-match-detail) -->
  <button
    v-if="!isMatchDetail"
    :disabled="outcomeIsLocked()"
    :class="[
      outcomeIsLocked() ? 'cursor-not-allowed opacity-50' : 'cursor-pointer active:scale-[0.97]',
      outcomeIsSelected
        ? 'bg-odds-selected ring-1 ring-bet-deep/30'
        : 'odd-btn-default',
    ]"
    class="flex-1 flex flex-col justify-center items-center py-2.5 px-2 rounded-lg transition-all duration-150 min-w-[3.2rem]"
    @click="handleSelect($event)"
  >
    <ThePadlock v-if="outcomeIsLocked()" />
    <template v-else>
      <span
        :class="outcomeIsSelected ? 'text-odds-selected-fg/80' : 'text-gray-500 dark:text-white/65'"
        class="text-[0.6rem] leading-none mb-0.5"
      >
        {{ outcome.outcomeName }}
        <OddChangeArrow
          :pre-odd-value="outcome.preOddValue"
          :odd-value="outcome.oddValue"
          :selected="outcomeIsSelected"
        />
      </span>
      <span
        :class="outcomeIsSelected ? 'text-odds-selected-fg' : 'text-gray-900 dark:text-white'"
        class="text-[0.8rem] font-bold leading-tight tabular-nums font-odds"
      >
        {{ outcome.oddValue }}
      </span>
    </template>
  </button>

  <!-- Match-detail variant -->
  <button
    v-else
    :disabled="outcomeIsLocked()"
    :class="[
      outcomeIsLocked()
        ? 'cursor-not-allowed opacity-25'
        : 'cursor-pointer active:scale-[0.97]',
      outcomeIsSelected
        ? 'odds-btn-selected'
        : 'odds-btn',
      showLabel ? 'justify-between px-3' : 'justify-center px-2',
    ]"
    class="flex items-center py-2.5 w-full rounded-lg transition-all duration-150 ease-out"
    @click="handleSelect($event)"
  >
    <ThePadlock v-if="outcomeIsLocked()" />
    <template v-else>
      <!-- With label: name left, odds right -->
      <template v-if="showLabel">
        <span
          :class="outcomeIsSelected ? 'text-odds-selected-fg/80' : 'text-gray-600 dark:text-white/70'"
          class="text-[0.6rem] font-normal leading-tight"
        >
          {{ outcome.outcomeNameAlias }}
          <OddChangeArrow
            :pre-odd-value="outcome.preOddValue"
            :odd-value="outcome.oddValue"
          />
        </span>
        <span
          :class="outcomeIsSelected ? 'text-odds-selected-fg' : 'text-primary'"
          class="text-[0.8rem] font-bold tabular-nums font-odds"
        >
          {{ outcome.oddValue }}
        </span>
      </template>
      <!-- Without label: centered odds only -->
      <template v-else>
        <span
          :class="outcomeIsSelected ? 'text-odds-selected-fg' : 'text-primary'"
          class="text-[0.8rem] font-bold tabular-nums font-odds"
        >
          {{ outcome.oddValue }}
        </span>
        <OddChangeArrow
          :pre-odd-value="outcome.preOddValue"
          :odd-value="outcome.oddValue"
          :selected="outcomeIsSelected"
        />
      </template>
    </template>
  </button>
</template>

<style scoped>
/* Standard variant (non-match-detail) unselected */
.odd-btn-default {
  background: var(--surface-elevated);
  border: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .odd-btn-default {
  background: oklch(100% 0 0 / 0.06);
  border-color: transparent;
}
.odd-btn-default:hover {
  background: var(--surface-interactive);
  border-color: oklch(0% 0 0 / 0.1);
}
[data-theme="dark"] .odd-btn-default:hover {
  background: oklch(100% 0 0 / 0.1);
  border-color: transparent;
}

/* Match-detail variant unselected */
.odds-btn {
  background: color-mix(in oklch, var(--surface-elevated) 70%, transparent);
  border: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .odds-btn {
  background: oklch(100% 0 0 / 0.08);
  border-color: oklch(100% 0 0 / 0.06);
}
.odds-btn:hover {
  background: color-mix(in oklch, var(--surface-interactive) 80%, transparent);
  border-color: oklch(0% 0 0 / 0.1);
}
[data-theme="dark"] .odds-btn:hover {
  background: oklch(100% 0 0 / 0.14);
  border-color: oklch(100% 0 0 / 0.08);
}

/* Match-detail variant selected */
.odds-btn-selected {
  background: var(--odds-selected-bg);
  box-shadow: 0 1px 4px color-mix(in oklch, var(--odds-selected-bg) 15%, transparent);
  border: 1px solid transparent;
}
</style>
