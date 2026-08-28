<script setup>
import { storeToRefs } from "pinia";
const props = defineProps({
  index: {
    type: Number,
    required: true,
  },
  competitionId: {
    type: Number,
    required: true,
  },
  countryName: {
    type: String,
    required: true,
  },

  competitionName: {
    type: String,
    required: true,
  },
  matchCount: {
    type: Number,
    required: true,
  },
  store: {
    type: Function,
    required: true,
  },
});
const { fetchCompetitionMatches } = props.store();
const { competitions } = storeToRefs(props.store());

function fetchMatches() {
  fetchCompetitionMatches(props.competitionId, props.index);
}

function isOpened() {
  const competition = competitions.value[props.index];
  if (!competition) {
    return false;
  }

  if (competition["isOpened"]) {
    return competition.isOpened;
  }

  const matches = competition?.matches;

  if (!matches) {
    return false;
  }

  return matches.length > 0;
}
</script>

<template>
  <button
    class="group w-full flex items-center justify-between px-3 py-2.5 bg-gray-50 dark:bg-white/3 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer"
    @click="fetchMatches()"
  >
    <div class="flex items-center gap-2 min-w-0">
      <span class="text-[0.8rem] font-bold text-gray-800 dark:text-white/70 truncate">
        {{ competitionName }}
      </span>
      <span
        v-if="matchCount"
        class="shrink-0 px-1.5 py-0.5 rounded-full bg-gray-200 dark:bg-white/8 text-[0.6rem] font-bold text-gray-500 dark:text-white/35"
      >
        {{ matchCount }}
      </span>
    </div>
    <Icon
      name="tabler:chevron-down"
      class="w-3.5 h-3.5 shrink-0 ml-2 text-gray-300 dark:text-white/20 group-hover:text-brand-bright transition-all duration-200"
      :class="isOpened() ? 'rotate-180' : ''"
      aria-hidden="true"
    />
  </button>
</template>
