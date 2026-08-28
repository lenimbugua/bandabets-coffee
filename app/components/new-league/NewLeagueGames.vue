<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import { ref } from "vue";

const tabs = ref([
  {
    name: "Scheduled Virtuals",
    icon: "🕒",
  },
  //   {
  //     name: "Turbo",
  //     icon: "⚡",
  //   },
]);
</script>
<template>
  <AppTabs role="tablist" aria-label="League game markets" class="flex justify-between">
    <AppTab
      v-for="tab in tabs"
      :key="tab.name"
      v-slot="{ selected, attrs }"
      as="template"
    >
      <div
        :class="[
          'cursor-pointer rounded-md  flex flex-col items-center px-2 text-sm whitespace-nowrap capitalize text-center font-medium',
          ' focus:outline-hidden',
          selected
            ? 'text-red-600 font-semibold'
            : 'dark:text-gray-100/90 text-gray-800',
        ]"
        v-bind="attrs"
      >
        {{ tab.name }}
      </div>
    </AppTab>
  </AppTabs>
</template>
