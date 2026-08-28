<script setup>
import { ref } from "vue";
const categories = ref([
  "Today",
  "Next 24 hours",
  "Tomorrow",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
  "Monday",
]);
</script>
<template>
  <div class="text-text-subtle p-3 h-full">
    <div class="font-bold">Choose a day</div>
    <div
      v-for="category in categories"
      :key="category"
      class="text-text-subtle p-3 text-sm flex flex-col justify-between"
    >
      {{ category }}
    </div>
    <div class="mt-4 flex justify-center items-center">
      <Icon name="tabler:circle-x" class="h-7 w-7" aria-hidden="true" />
      <div class="ml-1 text-sm">Cancel</div>
    </div>
  </div>
</template>
