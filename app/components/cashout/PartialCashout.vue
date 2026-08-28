<script setup>
import { ref } from "vue";
const partialCashoutValue = ref(0);
</script>
<template>
  <div class="px-6 py-2 text-gray-600 dark:text-slate-400">
    <div
      class="flex gap-2 items-center w-full justify-center text-gray-700 dark:text-slate-200 text-xl"
    >
      <Icon name="tabler:info-circle" class="h-6 w-6 text-red-600" />
      <Span class="">Partial Cashout</Span>
      <span>
        <Icon name="tabler:caret-down-filled" class="h-7 w-7 text-red-500" aria-hidden="true" />
      </span>
      <span class="font-bold text-xl text-gray-700 dark:text-slate-300"
        >427 Ksh</span
      >
    </div>
    <p class="py-2 text-sm">
      Enter below the amount of the stake of your bet you want to cash out, or
      scroll the bar, minimum amount 1.00 Ksh.
    </p>
    <div class="flex items-center gap-2 py-2">
      <label
        for="partialCashoutValue"
        class="block text-md font-semibold leading-6 text-gray-600 dark:text-gray-400"
        >Enter Amount to cahout</label
      >
      <input
        id="partialCashoutValue"
        v-model="partialCashoutValue"
        required
        type="number"
        class="mt-1 appearance-none text-slate-900 dark:text-gray-400 bg-white dark:bg-surface-deepest/50 rounded-md block p-2 sm:text-sm focus:outline-hidden placeholder:text-slate-400 focus:ring-2 shadow-sm focus:ring-ring ring-2 ring-black/20 dark:ring-white/25"
      />
    </div>
    <button class="w-full bg-red-600 p-2 rounded-md text-red-50">
      Partial Cashout
    </button>
  </div>
</template>
