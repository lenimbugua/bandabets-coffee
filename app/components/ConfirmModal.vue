<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed } from "vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

const { confirm } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === confirm && showModal.value;
});
const { closeModal } = useModalStore();
</script>
<template>
  <AppDialog
    :open="showDialog"
    aria-label="Confirm"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform rounded-2xl bg-white dark:bg-card p-6 text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <slot />
  </AppDialog>
</template>
