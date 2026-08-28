<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";

import { storeToRefs } from "pinia";
import { useModalStore } from "@/stores/modal";
import { useModalTypes } from "@/composables/useModalTypes";
import { useBetslipStore } from "@/stores/sports-betslip";
import { computed, ref } from "vue";

const { betslip, instantBetslip } = useModalTypes();
const { betslipLength } = storeToRefs(useBetslipStore());
const { clearBetslip } = useBetslipStore();

const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const closeButtonRef = ref(null); // Element to initially focus

const showBetslip = computed(() => {
  return (
    (modalType.value === betslip || modalType.value === instantBetslip) &&
    showModal.value
  );
});


</script>

<template>
  <AppDialog
    :open="showBetslip"
    :initial-focus="closeButtonRef"
    z-class="z-70"
    overlay-class="bg-black/50"
    container-class="flex min-h-full flex-col justify-end sm:items-center text-center max-h-dvh"
    panel-class="w-full max-w-4xl h-dvh max-h-dvh sm:h-auto sm:max-h-[80dvh] pb-[env(safe-area-inset-bottom,0px)] sm:pb-0 bg-white dark:bg-background transform overflow-hidden text-left align-middle shadow-xl dark:shadow-none border-t border-gray-200 dark:border-white/6 transition-all rounded-none sm:rounded-t-xl flex flex-col"
    @close="closeModal"
  >
    <template #default="{ titleId }">
      <!-- Drag handle (mobile) -->
      <div class="flex justify-center pt-2 pb-1 sm:hidden">
        <div class="w-10 h-1 rounded-full bg-gray-300 dark:bg-white/15"></div>
      </div>
      <div
        class="flex items-center justify-between px-4 py-2.5 sm:py-3 border-b border-gray-200 dark:border-white/5 shrink-0"
      >
        <h2 :id="titleId" class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
          <slot name="title"></slot>
        </h2>
        <div class="flex items-center gap-3">
          <button
            v-if="betslipLength > 0"
            class="text-[0.7rem] font-semibold text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer"
            @click="clearBetslip"
          >
            Clear All
          </button>
          <button ref="closeButtonRef" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer outline-hidden" aria-label="Close betslip" @click="closeModal">
            <Icon name="tabler:x" class="w-5 h-5" />
          </button>
        </div>
      </div>
      <div class="flex-1 min-h-0 overflow-y-auto">
        <slot />
      </div>
    </template>
  </AppDialog>
</template>
