<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed, onMounted, provide, ref } from "vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

defineProps({
  selections: {
    type: Object,
    required: true,
  },
});

const { confirmRemoveSlipModal } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === confirmRemoveSlipModal && showModal.value;
});
const { closeModal } = useModalStore();

// The visible title lives in the slotted child; hand it the dialog's title id
// so aria-labelledby resolves to the real heading.
const dialogRef = ref(null);
const dialogTitleId = ref(null);
provide("dialogTitleId", dialogTitleId);
onMounted(() => {
  dialogTitleId.value = dialogRef.value?.titleId ?? null;
});
</script>
<template>
  <AppDialog
    ref="dialogRef"
    :open="showDialog"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform rounded-2xl bg-white dark:bg-card p-6 text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <ConfirmRemoveSlip :selections />
  </AppDialog>
</template>
