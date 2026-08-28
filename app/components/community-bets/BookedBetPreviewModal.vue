<script setup>
import BookedBetDetails from "@/components/community-bets/BookedBetDetails.vue";
import ExampleBet from "@/components/community-bets/ExampleBet.vue";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useShareBetStore } from "@/stores/sharebet";
import AppDialog from "@/components/ui/AppDialog.vue";
import { useClipboard } from "@/composables/useClipboard";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const { bookingCode, betslipLength, pending } = storeToRefs(useShareBetStore());
const { loadBetslip } = useShareBetStore();
const { copy, copied } = useClipboard({ source: bookingCode.value });

const { bookedBetPreview, shareBet, betslip } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal, openModal } = useModalStore();
const closeButtonRef = ref(null); // Element to initially focus

const showBookedBetsPreview = computed(() => {
  return modalType.value === bookedBetPreview && showModal.value;
});

async function shareYourBet() {
  openModal(shareBet);
}
function loadSlip() {
  loadBetslip();
  closeModal(shareBet);
  openModal(betslip);
}
</script>

<template>
  <AppDialog
    :open="showBookedBetsPreview"
    :initial-focus="closeButtonRef"
    z-class="z-70"
    overlay-class="bg-black/70"
    container-class="z-99 flex min-h-full items-end justify-center text-center"
    panel-class="w-full max-w-lg bg-white dark:bg-background transform overflow-hidden text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <template #default="{ titleId }">
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5"
      >
        <h2
          :id="titleId"
          class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide"
        >
          Shared Betslip
        </h2>
        <button ref="closeButtonRef" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer outline-hidden" aria-label="Close" @click="closeModal">
          <Icon name="tabler:x" class="w-5 h-5" />
        </button>
      </div>
      <div
        class="h-[calc(100vh-200px)] flex flex-col bg-gray-50 dark:bg-background overflow-y-scroll scrollbar-hide"
      >
        <div
          class="bg-white dark:bg-white/3 border-b border-gray-100 dark:border-white/5 w-full flex justify-between items-center py-2 px-3 sticky top-0 z-10"
        >
          <div class="flex items-center gap-2">
            <div
              class="bg-brand-bright text-primary-foreground text-xs rounded-full h-6 w-6 font-bold flex justify-center items-center"
            >
              {{ betslipLength }}
            </div>
            <span class="text-xs font-semibold text-gray-600 dark:text-gray-400"
              >Selections</span
            >
          </div>
          <div
            class="cursor-pointer flex items-center gap-2"
            role="button"
            tabindex="0"
            aria-label="Copy booking code"
            @click="copy(bookingCode)"
          >
            <span
              v-if="!copied"
              class="text-xs font-semibold text-gray-600 dark:text-gray-400"
              >Copy code</span
            >

            <div
              class="cursor-pointer flex items-center text-xs font-black text-brand-bright p-1 bg-gray-100 dark:bg-white/10 rounded-md"
            >
              <div v-if="!copied" class="space-x-1 flex items-center">
                <span>{{ bookingCode }}</span>
                <Icon
                  name="tabler:copy"
                  class="w-4 h-4 mr-0.5"
                />
              </div>
              <div v-else>Copied !</div>
            </div>
          </div>
        </div>
        <div
          class="bg-white max-h-90 overflow-y-scroll grow dark:bg-white/2 rounded-lg py-2 space-y-2"
        >
          <TheButtonSpin v-if="pending" />
          <BookedBetDetails v-else />
        </div>
        <ExampleBet />
      </div>
      <div
        class="p-2 px-6 flex bg-white dark:bg-white/3 space-x-2 sticky bottom-0 border-t border-gray-100 dark:border-white/5 w-full"
      >
        <button
          class="flex rounded-lg shrink bg-brand-bright hover:bg-brand-bright/90 text-primary-foreground uppercase tracking-wide font-bold text-sm justify-center items-center shadow-sm p-2"
          aria-label="Share bet"
          @click="shareYourBet"
        >
          <Icon name="tabler:share" class="h-7 w-8" />
        </button>
        <button
          class="flex rounded-lg grow bg-brand-bright hover:bg-brand-bright/90 text-primary-foreground uppercase tracking-wide font-bold text-sm justify-center items-center shadow-sm px-2"
          @click="loadSlip"
        >
          Load
        </button>
      </div>
    </template>
  </AppDialog>
</template>
