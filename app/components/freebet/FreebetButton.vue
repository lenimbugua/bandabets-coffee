<script setup>
import { useFreebetStore } from "@/stores/freebet";
import ThePadlock from "@/components/ThePadlock.vue";
import OddChangeArrow from "@/components/OddChangeArrow.vue";
import { storeToRefs } from "pinia";
import { computed } from "vue";

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
});

const { betslip } = storeToRefs(useFreebetStore());
const { addAnItemToBetslip } = useFreebetStore();

const outcomeIsSelected = computed(() => {
  return betslip?.value?.customId === props.customId;
});

function handleSelect() {
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
  addAnItemToBetslip(payload);
}

function outcomeIsLocked() {
  return props.outcome.status === -1;
}
</script>
<template>
  <button
    :disabled="outcomeIsLocked()"
    :class="[
      outcomeIsLocked() ? 'cursor-not-allowed' : 'cursor-pointer',
      outcomeIsSelected ? 'bg-brand-teal' : 'bg-gray-300/80 dark:bg-surface-interactive',
    ]"
    class="p-1 w-full rounded-md"
    @click="handleSelect"
  >
    <div v-if="outcomeIsLocked()" class="flex justify-center items-center">
      <ThePadlock />
    </div>

    <div v-else class="flex flex-col justify-center items-center">
      <div
        :class="[
          outcomeIsSelected
            ? 'text-red-100'
            : 'dark:text-slate-400 text-gray-700',
        ]"
        class="text-[0.6rem] leading-tight"
      >
        {{ outcome.outcomeName
        }}<OddChangeArrow
          :pre-odd-value="outcome.preOddValue"
          :odd-value="outcome.oddValue"
          :selected="outcomeIsSelected"
        />
      </div>
      <div
        :class="[
          outcomeIsSelected ? 'text-white' : 'dark:text-white text-gray-950',
        ]"
        class="text-[0.7rem] font-bold"
      >
        {{ outcome.oddValue }}
      </div>
    </div>
  </button>
</template>
