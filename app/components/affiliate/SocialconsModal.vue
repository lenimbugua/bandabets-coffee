<script setup>
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  TransitionChild,
  TransitionRoot,
} from "@headlessui/vue";
import ShareToSocials from "@/components/community-bets/ShareToSocials.vue";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { useShareToSocials } from "@/composables/useShareToSocials";
import { useClipboard } from "@/composables/useClipboard";
import { useAffiliateStore } from "@/stores/affiliate";

const { affiliateText } = useShareToSocials();

const { affiliateUrl } = storeToRefs(useAffiliateStore());
const { copy, copied } = useClipboard({ affiliateUrl });

const { socialIconsModal } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const closeButtonRef = ref(null); // Element to initially focus

const showShareBetModal = computed(() => {
  return modalType.value === socialIconsModal && showModal.value;
});
</script>

<template>
  <TransitionRoot appear :show="showShareBetModal" as="template">
    <Dialog
      as="div"
      class="relative z-50"
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
        <div class="fixed inset-0 bg-black/50" />
      </TransitionChild>
      <div class="fixed z-50 bottom-0 right-0 left-0 overflow-y-auto">
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
              class="w-full max-w-4xl transform overflow-hidden rounded-t-lg text-left align-middle shadow-xl transition-all"
            >
              <div
                class="flex w-full justify-between bg-white dark:bg-card border-b border-gray-200 dark:border-gray-900"
              >
                <button class="p-2 py-1 outline-hidden" aria-label="Close" @click="closeModal">
                  <Icon
                    name="tabler:x"
                    class="w-5 h-5 text-gray-600 dark:text-slate-300 cursor-pointer"
                  />
                </button>
                <DialogTitle
                  class="flex text-gray-900 dark:text-slate-300 grow items-center justify-center py-3 px-1 text-left uppercase text-sm font-bold border-x border-gray-200 dark:border-gray-900"
                >
                  Invite Friends
                </DialogTitle>
                <button ref="closeButtonRef" class="p-2 py-1 outline-hidden" aria-label="Close" @click="closeModal">
                  <Icon
                    name="tabler:x"
                    class="w-5 h-5 text-gray-600 dark:text-slate-300 cursor-pointer"
                  />
                </button>
              </div>
              <div class="bg-white dark:bg-background p-4 pb-20">
                <ShareToSocials
                  :share-url="affiliateUrl"
                  :share-text="affiliateText"
                />
                <button
                  class="w-full border border-gray-200 dark:border-card rounded-md bg-gray-50 dark:bg-surface-active dark:text-gray-50 text-gray-900 shadow-sm hover:bg-gray-100 transition-colors"
                  @click="copy(affiliateUrl)"
                >
                  <div
                    class="flex text-xs divide-x divide-gray-200 dark:divide-card items-center justify-between"
                  >
                    <div
                      class="whitespace-nowrap overflow-x-scroll scrollbar-hide px-2"
                    >
                      {{ affiliateUrl }}
                    </div>
                    <div class="py-3 px-2 flex items-center space-x-2">
                      <Icon name="tabler:copy" class="w-5 h-5 text-red-500" />
                      <span v-if="copied" class="text-red-500">Copied!</span>
                      <span v-else>copy</span>
                    </div>
                  </div>
                </button>
              </div>
            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
