<script setup>
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import AppDialog from "@/components/ui/AppDialog.vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

const closeButtonRef = ref(null);

const { deposit } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === deposit && showModal.value;
});
const { closeModal } = useModalStore();
</script>
<template>
  <AppDialog
    :open="showDialog"
    :initial-focus="closeButtonRef"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform bg-white dark:bg-background text-left align-middle shadow-2xl transition-all overflow-hidden rounded-2xl border border-gray-200/80 dark:border-white/6"
  >
    <template #default="{ titleId }">
      <!-- Accent header bar -->
      <div class="relative overflow-hidden px-5 pt-5 pb-4">
        <div class="absolute inset-0 bg-gradient-to-r from-brand-bright/8 via-primary/5 to-transparent dark:from-brand-bright/10 dark:via-primary/5"></div>
        <div class="relative flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-brand-bright/15 dark:bg-brand-bright/20 flex items-center justify-center">
              <Icon name="tabler:credit-card" class="w-4.5 h-4.5 text-brand-bright" aria-hidden="true" />
            </div>
            <h3 :id="titleId" class="text-base font-bold text-gray-900 dark:text-white">
              Deposit Funds
            </h3>
          </div>
          <button
            ref="closeButtonRef"
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close deposit dialog"
            @click="closeModal"
          >
            <Icon name="tabler:x" class="w-5 h-5" />
          </button>
        </div>
      </div>
      <!-- Form content -->
      <div class="px-5 pb-5">
        <DepositForm />
      </div>
    </template>
  </AppDialog>
</template>
