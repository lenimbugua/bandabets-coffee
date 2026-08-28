<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { useCasinoStore } from "../stores/casino";
import { storeToRefs } from "pinia";
import { useCasinoQueryParamsStore } from "@/stores/casino-query-params";

const { setProviderId, resetToDefaults } = useCasinoQueryParamsStore();

const { selectedCategory } = storeToRefs(useCasinoStore());

const { setSelectedCategory, getAllCasinos, setCategoryIsPending } =
  useCasinoStore();

function isSelected(categoryBinomen) {
  return selectedCategory.value.p_binomen === categoryBinomen;
}

const { providers } = storeToRefs(useCasinoStore());

async function selectCategory(category) {
  resetToDefaults();
  setProviderId(category.p_binomen);
  setSelectedCategory(category);
  setCategoryIsPending(true);
  await getAllCasinos();
  setCategoryIsPending(false);
}
</script>
<template>
  <AppTabs vertical role="tablist" aria-label="Casino provider categories" class="flex flex-col">
    <AppTab
      v-for="provider in providers"
      :key="provider.provider_id"
      v-slot="{ attrs }"
      as="template"
    >
      <button
        :class="[
          'w-full flex items-center space-x-2  p-2.5 text-sm font-medium rounded-md leading-5',
          ' focus:outline-hidden',
          isSelected(provider.p_binomen)
            ? 'dark:bg-black/50 dark:text-red-500  bg-brand-mid/50 text-red-900 shadow-sm'
            : 'text-slate-500 hover:bg-white/12 hover:text-red-600/90',
        ]"
        v-bind="attrs"
        @click="selectCategory(provider)"
      >
        <CasinoIcons
          :icon-css="'text-gray-700 dark:text-brand-mid h-4 w-4 mr-2'"
          :icon="provider.p_binomen"
        />
        {{ provider.provider_name }}
      </button>
    </AppTab>
  </AppTabs>
</template>
