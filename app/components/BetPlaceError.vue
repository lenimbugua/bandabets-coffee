<script setup>
import { storeToRefs } from "pinia";
import { useBetslipStore } from "../stores/sports-betslip.js";
import { useModalStore } from "@/stores/modal";
import { inject } from "vue";
const { closeModal } = useModalStore();
const { betPlaceError } = storeToRefs(useBetslipStore());
const dialogTitleId = inject("dialogTitleId", null);
</script>
<template>
  <div>
    <div class="w-full p-2 flex justify-center">
      <div
        style="z-index: 999999"
        class="p-1 absolute -top-10 bg-brand-bright/20 rounded-full"
      >
        <Icon
          name="tabler:alert-circle"
          style="z-index: 100"
          class="w-16 h-16 mx-auto text-red-500"
        />
      </div>
    </div>
    <div
      class="absolute top-4 right-4 p-0.5 rounded-full border border-gray-950 dark:border-slate-300"
      @click="closeModal"
    >
      <Icon name="tabler:x" class="text-gray-900 dark:text-white w-5 h-5" />
    </div>
    <h3 :id="dialogTitleId" class="w-full flex justify-center text-lg font-medium leading-6 text-red-500">
      Error !
    </h3>
    <div
      class="mt-2 px-2 rounded-md text-gray-600 dark:text-slate-300 text-center"
    >
      <div>Your bet could not be placed</div>
      {{ betPlaceError }}.
    </div>
    <div class="flex justify-center py-3">
      <button
        class="bg-white shadow-sm p-2 text-red-500 rounded-md uppercase tracking-wider border border-red-600 dark:border-red-300"
        @click="closeModal()"
      >
        ok
      </button>
    </div>
  </div>
</template>
