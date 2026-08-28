<script setup>
import { useCompetitions } from "@/composables/haki-league/useCompetitions.js";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";

const {
  competitions,
  formFlagUrl,
  // fetchMatches
} = useCompetitions();
</script>
<template>
  <div class="pl-3">
    <div
      :class="['bg-white dark:bg-muted']"
      class="rounded-md overflow-hidden border border-gray-200 dark:border-white/10 shadow-premium dark:shadow-none"
    >
      <div
        class="flex space-x-1 rounded-t-md bg-gray-100 dark:bg-surface-sunken text-gray-700 dark:text-slate-300 px-2 border-b border-gray-200 dark:border-transparent font-semibold text-sm py-1.5"
      >
        Competitions
      </div>
      <AppTabs role="tablist" aria-label="League competitions">
        <AppTab
          v-for="competition in competitions"
          :key="competition.name"
          v-slot="{ selected, attrs }"
          as="template"
        >
          <div
            class="flex flex-col p-4"
            :class="[
              'w-full cursor-pointer  py-2 text-md text-center font-semibold',
              ' focus:outline-hidden',
              selected
                ? 'bg-brand-dark text-white shadow-sm'
                : 'dark:text-slate-400 text-gray-950/80',
            ]"
            v-bind="attrs"
          >
            <div class="relative w-20 h-12">
              <img
                :src="formFlagUrl(competition.flag)"
                :alt="competition.name"
                class="absolute inset-0 h-full w-full object-cover rounded-md"
                loading="lazy"
              />
            </div>
            <div class="text-xs py-0.5">
              {{ competition.name }}
            </div>
          </div>
        </AppTab>
      </AppTabs>
    </div>
  </div>
</template>
