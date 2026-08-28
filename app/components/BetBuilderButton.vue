<script setup>
import { useToast } from "@/composables/useToast";
import { computed, toRefs } from "vue";
import { useBetBuilderStore } from "../stores/betbuilder";
import OddChangeArrow from "./OddChangeArrow.vue";
import ThePadlock from "./ThePadlock.vue";

import { MAX_GAMES } from "../composables/useDefinedConstants.js";

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
  multiBetMarketName: {
    type: String,
    required: true,
  },
  twoGoalUpActive: {
    type: Boolean,
    required: true,
  },
  showLabel: {
    type: Boolean,
    required: false,
    default: true,
  },
});

const selections = computed(() =>
  useBetBuilderStore().getSelectionByParentMatchId(props.parentMatchId)
);
const {
  addAnItemToSelection,
} = useBetBuilderStore();
const { decimalPrice, pending } = toRefs(useBetBuilderStore());

const { fireErrorToast } = useToast();

const outcomeIsSelected = computed(() => {
  return selections?.value?.selections.some(
    (item) => item.customId === props.customId
  );
});

async function handleSelect() {
  const clickIsToSelectOutcome = !outcomeIsSelected.value;
  const outcome = props.outcome;
  const payload = {
    live: 0,
    customId: props.customId,
    seasonId: props.seasonId,
    homeTeam: props.homeTeam,
    awayTeam: props.awayTeam,
    oddType: outcome.oddType,
    startTime: props.startTime,
    twoGoalUpActive: props.twoGoalUpActive,
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
    multiBetOutcomeName: outcome.multiBetOutcomeName,
    multiBetMarketName: props.multiBetMarketName,
    timestamp: Date.now().toString(),
    clickIsToSelectOutcome,
  };

  if (
    selections?.value?.selections.length >= MAX_GAMES &&
    clickIsToSelectOutcome
  ) {
    fireErrorToast("Betslip limit reached");
    return;
  }

  const payloadWithParentMatchId = {
    payload,
    parentMatchId: props.parentMatchId,
    homeTeam: props.homeTeam,
    awayTeam: props.awayTeam,
    startTime: props.startTime,
  };

  addAnItemToSelection(payloadWithParentMatchId);
  payloadWithParentMatchId.payload.oddValue = decimalPrice.value;
}

function outcomeIsLocked() {
  if (pending.value) return true;
  if (outcomeIsSelected.value) return false;
  return props.outcome.status === -1 || props.outcome.disabled;
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
        ? 'bg-brand-bright/90 ring-1 ring-brand-bright/30'
        : 'bg-gray-100 dark:bg-white/6',
    ]"
    class="flex-1 flex flex-col justify-center items-center py-1.5 px-1 rounded-lg transition-all duration-150"
    @click="handleSelect"
  >
    <ThePadlock v-if="outcomeIsLocked()" />
    <template v-else>
      <span
        :class="outcomeIsSelected ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'"
        class="text-[0.55rem] leading-none"
      >
        {{ outcome.outcomeName }}
        <OddChangeArrow
          :pre-odd-value="outcome.preOddValue"
          :odd-value="outcome.oddValue"
        />
      </span>
      <span
        :class="outcomeIsSelected ? 'text-white' : 'text-gray-900 dark:text-white'"
        class="text-[0.8rem] font-bold leading-tight"
      >
        {{ outcome.oddValue }}
      </span>
    </template>
  </button>

  <!-- Premium match-detail variant -->
  <button
    v-else
    :disabled="outcomeIsLocked()"
    :class="[
      outcomeIsLocked()
        ? 'cursor-not-allowed opacity-25'
        : 'cursor-pointer active:scale-[0.97]',
      outcomeIsSelected
        ? 'odds-btn-selected bg-brand-bright/90'
        : 'odds-btn',
      showLabel ? 'justify-between px-3.5' : 'justify-center px-2',
    ]"
    class="flex items-center py-2.5 w-full rounded-xl transition-all duration-200 ease-out"
    @click="handleSelect"
  >
    <ThePadlock v-if="outcomeIsLocked()" />
    <template v-else>
      <!-- With label: horizontal name left, odds right -->
      <template v-if="showLabel">
        <span
          :class="outcomeIsSelected ? 'text-white/80' : 'text-gray-500 dark:text-white/50'"
          class="text-[0.65rem] font-medium"
        >
          {{ outcome.outcomeNameAlias }}
          <OddChangeArrow
            :pre-odd-value="outcome.preOddValue"
            :odd-value="outcome.oddValue"
            :selected="outcomeIsSelected"
          />
        </span>
        <span
          :class="outcomeIsSelected ? 'text-white' : 'text-brand-bright'"
          class="text-[0.85rem] font-bold tabular-nums"
        >
          {{ outcome.oddValue }}
        </span>
      </template>
      <!-- Without label: centered odds only (table layout) -->
      <template v-else>
        <span
          :class="outcomeIsSelected ? 'text-white' : 'text-brand-bright'"
          class="text-[0.85rem] font-bold tabular-nums"
        >
          {{ outcome.oddValue }}
        </span>
        <OddChangeArrow
          :pre-odd-value="outcome.preOddValue"
          :odd-value="outcome.oddValue"
        />
      </template>
    </template>
  </button>
</template>

<style scoped>
.odds-btn {
  background: oklch(94% 0.01 255 / 0.5);
  border: 0.5px solid oklch(50% 0.03 258 / 0.08);
}
[data-theme="dark"] .odds-btn {
  background: oklch(30% 0.045 258 / 0.6);
  border-color: oklch(45% 0.04 258 / 0.3);
}
.odds-btn:hover {
  background: oklch(92% 0.01 255 / 0.6);
  box-shadow: 0 1px 4px oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .odds-btn:hover {
  background: oklch(33% 0.045 258 / 0.7);
  box-shadow: 0 2px 8px oklch(0% 0 0 / 0.15);
}

.odds-btn-selected {
  border: 0.5px solid oklch(70% 0.19 142 / 0.3);
  box-shadow:
    0 1px 3px oklch(70% 0.19 142 / 0.15),
    0 4px 12px oklch(70% 0.19 142 / 0.08);
}
</style>
