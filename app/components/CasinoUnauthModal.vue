<script setup>
import { storeToRefs } from "pinia";
import { computed } from "vue";
import AppDialog from "@/components/ui/AppDialog.vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

const { showModal, modalType } = storeToRefs(useModalStore());

const { openModal, closeModal, setAfterCloseFunction } = useModalStore();

const { login, casinoUnauthModal } = useModalTypes();

const isOpen = computed(() => {
  return modalType.value === casinoUnauthModal && showModal.value;
});
function close() {
  setAfterCloseFunction(null);
  closeModal();
}
</script>
<template>
  <AppDialog
    :open="isOpen"
    aria-label="Login required"
    z-class="z-10"
    overlay-class="bg-black/50"
    container-class="flex min-h-full items-center justify-center p-4 text-center"
    panel-class="flex items-center w-full h-[75vh] max-w-2xl transform overflow-hidden bg-white/75 dark:bg-background/90 backdrop-blur-sm p-12 text-left shadow-xl transition-all"
  >
    <div class="w-full flex gap-4">
      <button
        type="button"
        class="inline-flex w-1/2 justify-center rounded-xl border border-transparent bg-brand-bright font-bold uppercase px-4 py-3 text-sm text-primary-foreground hover:bg-brand-bright/90 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-bright/40 focus-visible:ring-offset-2 transition-colors"
        @click="openModal(login)"
      >
        Login
      </button>
      <button
        type="button"
        class="inline-flex w-1/2 justify-center rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-white/10 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-brand-bright/40 focus-visible:ring-offset-2 transition-colors"
        @click="close"
      >
        Free Play
      </button>
    </div>
  </AppDialog>
</template>
