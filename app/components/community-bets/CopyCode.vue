<script setup>
import { useShareBetStore } from "@/stores/sharebet.js";
import { useClipboard } from "@/composables/useClipboard";
import { storeToRefs } from "pinia";

const { bookingCode } = storeToRefs(useShareBetStore());

const { copy, copied } = useClipboard({ source: bookingCode.value });

async function copyCode() {
  await copy(bookingCode.value);
}
</script>
<template>
  <div
    class="cursor-pointer rounded-md shadow-sm flex justify-between p-4 bg-gray-50 border border-gray-200 dark:border-transparent dark:bg-white/10"
    @click="copyCode"
  >
    <span class="text-gray-600 dark:text-slate-400 font-medium">Copy Booking Code</span>
    <div v-if="!copied" class="flex items-center space-x-2">
      <span class="text-gray-900 dark:text-slate-200 font-bold">{{ bookingCode }}</span>
      <Icon name="tabler:copy" class="w-5 h-5 text-red-500" />
    </div>

    <span v-if="copied" class="text-brand-bright font-bold">Copied!</span>
  </div>
</template>
