<script setup>
import { ref } from "vue";

const outcomeCount = ref(3);
</script>
<template>
  <div class="flex text-center items-center gap-2 lg:gap-3 w-full grid-cols-3">
    <button
      v-for="i in outcomeCount"
      :key="i"
      class=" bg-gray-300/70 dark:bg-surface-interactive flex justify-center items-center p-2 h-10 w-16 sm:w-32  shadow-md rounded-md"
    >
      <Icon name="tabler:lock" class="text-red-500/50 h-5 w-5" aria-hidden="true" />
    </button>
  </div>
</template>
