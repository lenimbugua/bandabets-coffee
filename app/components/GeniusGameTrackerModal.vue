<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";

import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

const { geniusGameTracker } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === geniusGameTracker && showModal.value;
});
const { closeModal } = useModalStore();
</script>
<template>
  <AppDialog
    :open="showDialog"
    aria-label="Game tracker"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="bg-white relative w-full max-w-md transform rounded-2xl bg-transparent p-6 text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <button
      class="absolute -top-5 -right-3 bg-gray-50 rounded-full shadow-zxl"
      aria-label="Close game tracker"
      @click="closeModal"
    >
      <Icon name="tabler:x" class="h-5 w-5 text-gray-600" />
    </button>
    <div
      class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
    >
      Loading...
    </div>
    <div class="absolute h-full w-full inset-0">
      <GeniusGameTracker />
    </div>
  </AppDialog>
</template>
