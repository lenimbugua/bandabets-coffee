<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, ref } from "vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";

const closeButtonRef = ref(null);

const { login } = useModalTypes();

const { showModal, modalType, afterCloseFunction } = storeToRefs(
  useModalStore()
);

const showDialog = computed(() => {
  return modalType.value === login && showModal.value;
});

const { closeModal, setAfterCloseFunction } = useModalStore();

function close() {
  if (afterCloseFunction.value) {
    afterCloseFunction.value();
  }
  closeModal();
}
onBeforeUnmount(() => {
  setAfterCloseFunction(null);
});
</script>
<template>
  <AppDialog
    :open="showDialog"
    :initial-focus="closeButtonRef"
    z-class="z-999"
    container-class="z-100 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform bg-white dark:bg-background p-6 text-left align-middle shadow-xl transition-all overflow-hidden"
    @close="close"
  >
    <template #default="{ titleId }">
      <div>
        <button
          ref="closeButtonRef"
          aria-label="Close login dialog"
          class="absolute top-4 right-4 p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer"
          @click="close"
        >
          <Icon name="tabler:x" class="w-5 h-5" />
        </button>
        <h3
          :id="titleId"
          class="w-full flex justify-center text-lg font-semibold leading-6 text-gray-900 dark:text-white"
        >
          Login To Continue
        </h3>
        <TheLogin />
      </div>
    </template>
  </AppDialog>
</template>
