<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";
import OneCutIcon from "./OneCutIcon.vue";
import OneCutPromo from "./OneCutPromo.vue";

const { oneCutModal } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === oneCutModal && showModal.value;
});
const { closeModal } = useModalStore();
</script>
<template>
  <AppDialog
    :open="showDialog"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform bg-white dark:bg-background text-left align-middle shadow-xl transition-all overflow-hidden"
    @close="closeModal"
  >
    <template #default="{ titleId }">
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5"
      >
        <h2 :id="titleId" class="flex items-center gap-1 text-sm font-bold text-amber-400">
          <span>1 Cut Win</span>
          <OneCutIcon />
        </h2>
        <button class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer outline-hidden" aria-label="Close" @click="closeModal">
          <Icon name="tabler:x" class="w-5 h-5" />
        </button>
      </div>
      <div class="max-h-[85vh] overflow-y-scroll scrollbar-hide">
        <OneCutPromo />
      </div>
    </template>
  </AppDialog>
</template>
