<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { useSportsStore } from "@/stores/sports";
import CalendarPopover from "./CalendarPopover.vue";
import { useMatchesStore } from "../stores/matches";
import { useFormatDates } from "../composables/useFormatDates";
import HoursTab from "./HoursTab.vue";
import { storeToRefs } from "pinia";

const { selectedSport } = storeToRefs(useSportsStore());

const { generateNextFourDays } = useFormatDates();

const nextFourDays = generateNextFourDays();

const { fetchDayMatches } = useMatchesStore();

function fetchMatchesByDate(date) {
  fetchDayMatches(date);
}
</script>
<template>
  <div
    :class="[
      'bg-gray-100 text-foreground border-b border-gray-200',
      'dark:bg-card dark:text-foreground dark:border-white/[0.06]',
    ]"
    class="px-1.5 sm:px-3 flex text-lg font-bold w-full items-center justify-between pl-2 rounded-t-md"
  >
    <div class="capitalize">{{ selectedSport }}</div>
    <AppTabs
      role="tablist"
      aria-label="Match day filters"
      class="flex items-center space-x-3 sm:space-x-4 justify-between text-xs"
    >
      <AppTab v-slot="{ selected, attrs }" as="template">
        <div
          :class="[
            'w-full cursor-pointer text-[0.9rem] text-center py-2 sm:py-4 font-bold',
            ' focus:outline-hidden',
            selected ? ' ' : '',
          ]"
          :style="[selected ? 'border-bottom: 2px solid var(--brand-bright);' : '']"
          v-bind="attrs"
        >
          <HoursTab />
        </div>
      </AppTab>
      <AppTab
        v-for="day in nextFourDays"
        :key="day.date"
        v-slot="{ selected, attrs }"
        as="template"
        @click="fetchMatchesByDate(day.date)"
      >
        <div
          :class="[
            'w-full cursor-pointer text-[0.9rem] text-center py-2 sm:py-4 font-bold uppercase',
            ' focus:outline-hidden',
            selected ? '' : '',
          ]"
          :style="[selected ? 'border-bottom: 2px solid var(--brand-bright);' : '']"
          v-bind="attrs"
        >
          {{ day.day }}
        </div>
      </AppTab>

      <AppTab v-slot="{ selected, attrs }" as="template">
        <div
          :class="[
            'w-full flex  text-[0.9rem] justify-center items-center py-2 sm:py-4 font-bold',
            ' focus:outline-hidden',
            selected ? '' : '',
          ]"
          :style="[selected ? 'border-bottom: 2px solid var(--brand-bright);' : '']"
          v-bind="attrs"
        >
          <CalendarPopover />
        </div>
      </AppTab>
    </AppTabs>
  </div>
</template>
