<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";

import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

const { loader } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === loader && showModal.value;
});
const { closeModal } = useModalStore();
</script>
<template>
  <AppDialog
    :open="showDialog"
    aria-label="Loading"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform rounded-2xl bg-transparent p-6 text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <div class="grow">
      <div
        class="flex justify-center items-center bg-white/90 h-32 w-32 p-8 mx-auto"
      >
        <div
          class="animate-spin rounded-full h-full w-full border-t-3 border-b-2 border-gray-900"
        ></div>
      </div>
    </div>
  </AppDialog>
</template>
