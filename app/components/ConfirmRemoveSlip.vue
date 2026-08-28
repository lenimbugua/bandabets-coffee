<script setup>
import { useModalStore } from "@/stores/modal";
import { inject, toRefs } from "vue";
import { useBetBuilderStore } from "../stores/betbuilder";
import { useBetslipStore } from "../stores/sports-betslip.js";

const props = defineProps({
  selections: {
    type: Object,
    required: true,
  },
});

const { closeModal } = useModalStore();

const { customIdToRemove } = toRefs(useBetslipStore());

const { deleteAnItemFromBetslip, addBetbuilderToBetslip } = useBetslipStore();
const { decimalPrice } = toRefs(useBetBuilderStore());

function removeTheBet() {
  deleteAnItemFromBetslip(customIdToRemove.value);
  addBetbuilderToBetslip(props.selections, decimalPrice.value);
  closeModal();
}
const dialogTitleId = inject("dialogTitleId", null);
</script>
<template>
  <div>
    <div class="w-full p-2 flex justify-center">
      <div class="p-1 absolute -top-10 bg-brand-bright/20 rounded-full">
        <Icon
          name="tabler:alert-circle"
          style="z-index: 100"
          class="w-16 h-16 mx-auto text-amber-500"
        />
      </div>
    </div>
    <button
      class="absolute top-4 right-4 p-0.5 rounded-full border border-gray-950 dark:border-slate-300"
      aria-label="Close"
      @click="closeModal"
    >
      <Icon name="tabler:x" class="text-gray-900 dark:text-white w-5 h-5" />
    </button>
    <h3 :id="dialogTitleId" class="w-full flex justify-center text-lg font-medium leading-6 text-red-500">
      Conflicting Bets
    </h3>
    <div
      class="mt-2 px-2 rounded-md text-gray-600 dark:text-slate-300 text-center"
    >
      Conflicting bets will be removed from the betslip
    </div>
    <div class="flex justify-center space-x-3 py-3">
      <button
        class="bg-brand-bright shadow-sm p-2 text-gold-foreground rounded-md"
        @click="closeModal()"
      >
        Cancel
      </button>
      <button
        class="bg-red-500 shadow-sm p-2 text-red-100 rounded-md min-w-20"
        @click="removeTheBet"
      >
        <span>Yes, Proceed</span>
      </button>
    </div>
  </div>
</template>
