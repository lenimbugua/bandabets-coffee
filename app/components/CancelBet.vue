<script setup>
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";
import { useBetsStore } from "../stores/bets";
import TheButtonSpin from "./TheButtonSpin.vue";

const { closeModal } = useModalStore();

const { selectedId, pending } = storeToRefs(useBetsStore());

const { cancelBet } = useBetsStore();

async function cancelTheBet() {
  await cancelBet(selectedId.value);
  closeModal();
}
</script>
<template>
  <div>
    <div class="w-full p-2 flex justify-center">
      <div class="p-1 absolute -top-10 bg-brand-bright/20 rounded-full">
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
    <h3 class="w-full flex justify-center text-lg font-medium leading-6 text-red-500">
      Are you sure?
    </h3>
    <div
      class="mt-2 px-2 rounded-md text-gray-600 dark:text-slate-300 text-center"
    >
      This action is irreversible
    </div>
    <div class="flex justify-center space-x-3 py-3">
      <button
        class="bg-brand-bright shadow-sm p-2 text-gold-foreground rounded-md"
        @click="closeModal()"
      >
        No Thanks
      </button>
      <button
        class="bg-red-500 shadow-sm p-2 text-red-100 rounded-md min-w-20"
        @click="cancelTheBet"
      >
        <TheButtonSpin v-if="pending" />
        <span v-else>Yes, Proceed</span>
      </button>
    </div>
  </div>
</template>
