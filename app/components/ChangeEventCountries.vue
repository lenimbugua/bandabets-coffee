<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";

import { toRefs } from "vue";

import { useCountriesStore } from "@/stores/countries";

const {
  fetchChangeEventCountries,
  getCompetitionsByCountry,
} = useCountriesStore();
const { countries, selectedCountry } = toRefs(useCountriesStore());

fetchChangeEventCountries();

const countryIsSelected = (country) =>
  country.countryName === selectedCountry.value;
</script>
<template>
  <AppTabs
    role="tablist"
    aria-label="Country filters"
    class="country-bar"
  >
    <AppTab
      v-for="country in countries"
      :key="country.countryName"
      v-slot="{ attrs }"
      as="template"
      @click="getCompetitionsByCountry(country.countryName, true)"
    >
      <button
        :class="['country-tab', countryIsSelected(country) && 'country-tab--active']"
        v-bind="attrs"
      >
        <img class="country-flag" :src="country.flagUrl" :alt="country.countryName + ' flag'" loading="lazy" />
        <span>{{ country.countryName }}</span>
      </button>
    </AppTab>
  </AppTabs>
</template>

<style scoped>
.country-bar {
  display: flex;
  gap: 0;
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
  background: oklch(100% 0 0);
}
.country-bar::-webkit-scrollbar {
  display: none;
}
[data-theme="dark"] .country-bar {
  border-bottom-color: oklch(100% 0 0 / 0.05);
  background: var(--card);
}

.country-tab {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.625rem 0.75rem;
  font-size: 0.65rem;
  font-weight: 500;
  white-space: nowrap;
  color: oklch(45% 0 0);
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
  outline: none;
}
.country-tab:hover {
  color: oklch(25% 0 0);
  background: oklch(0% 0 0 / 0.02);
}
[data-theme="dark"] .country-tab {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .country-tab:hover {
  color: oklch(100% 0 0 / 0.7);
  background: oklch(100% 0 0 / 0.03);
}

.country-tab--active {
  color: var(--primary);
  border-bottom-color: var(--primary);
  font-weight: 600;
}
[data-theme="dark"] .country-tab--active {
  color: var(--primary);
  border-bottom-color: var(--primary);
}
.country-tab--active:hover {
  color: var(--primary);
}
[data-theme="dark"] .country-tab--active:hover {
  color: var(--primary);
}

.country-flag {
  height: 0.875rem;
  width: 0.875rem;
  border-radius: 0.125rem;
  object-fit: cover;
}
</style>
