<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

const { notification } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === notification && showModal.value;
});
const { closeModal } = useModalStore();
</script>
<template>
  <AppDialog
    :open="showDialog"
    aria-label="Notification"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform bg-transparent p-6 text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <button
      class="absolute top-2 right-2 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
      aria-label="Close"
      @click="closeModal"
    >
      <Icon name="tabler:x" class="w-5 h-5" />
    </button>
    <slot />
  </AppDialog>
</template>
