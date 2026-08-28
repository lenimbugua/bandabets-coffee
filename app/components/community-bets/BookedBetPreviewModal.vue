<script setup>
import BookedBetDetails from "@/components/community-bets/BookedBetDetails.vue";
import ExampleBet from "@/components/community-bets/ExampleBet.vue";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useShareBetStore } from "@/stores/sharebet";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
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
  <TransitionRoot appear :show="showBookedBetsPreview" as="template">
    <Dialog
      as="div"
      class="relative z-70"
      :initial-focus="closeButtonRef"
      @close="closeModal"
    >
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/70" />
      </TransitionChild>
      <div class="fixed z-99 bottom-0 right-0 left-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel
              class="w-full max-w-lg bg-white dark:bg-background transform overflow-hidden text-left align-middle shadow-xl transition-all"
            >
              <div
                class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5"
              >
                <DialogTitle
                  class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide"
                >
                  Shared Betslip
                </DialogTitle>
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
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
