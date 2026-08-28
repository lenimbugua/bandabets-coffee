<script setup>
import { storeToRefs } from "pinia";
import { computed, onMounted, provide, ref } from "vue";
import AppDialog from "@/components/ui/AppDialog.vue";

import { useModalStore } from "@/stores/modal";

import { useBetslipStore } from "../stores/sports-betslip.js";

import { useModalTypes } from "@/composables/useModalTypes";

const { betPlaceStatus } = useModalTypes();

const { responseOK } = storeToRefs(useBetslipStore());

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === betPlaceStatus && showModal.value;
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
    container-class="z-50 flex min-h-full items-center justify-center px-6 py-8 text-center"
    panel-class="w-full max-w-sm transform rounded-2xl bg-white dark:bg-card p-5 pt-14 text-left align-middle shadow-xl transition-all overflow-visible"
    @close="closeModal"
  >
    <BetPlaceSuccess v-if="responseOK" />
    <BetPlaceError v-else />
  </AppDialog>
</template>
