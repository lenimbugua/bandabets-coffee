<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import TheCalendar from "./TheCalendar.vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

import { storeToRefs } from "pinia";
import { computed } from "vue";

const { calendar } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const { closeModal } = useModalStore();

const showCalendar = computed(() => {
  return modalType.value === calendar && showModal.value;
});
</script>

<template>
  <AppDialog
    :open="showCalendar"
    aria-label="Select date"
    z-class="z-10"
    overlay-class="bg-black/25"
    container-class="flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform overflow-hidden rounded-2xl dark:bg-surface-interactive bg-white p-6 text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <TheCalendar />
  </AppDialog>
</template>
