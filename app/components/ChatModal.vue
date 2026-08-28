<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";

import { storeToRefs } from "pinia";
import { useModalStore } from "@/stores/modal";
import { useModalTypes } from "@/composables/useModalTypes";
import { computed, ref } from "vue";

const { chat } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const closeButtonRef = ref(null); // Element to initially focus

const showBetslip = computed(() => {
  return modalType.value === chat && showModal.value;
});
</script>
<template>
  <AppDialog
    :open="showBetslip"
    :initial-focus="closeButtonRef"
    z-class="z-200"
    overlay-class="bg-black/50"
    container-class="flex min-h-full items-end justify-center text-center"
    panel-class="w-full max-w-4xl bg-white dark:bg-background transform overflow-hidden text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <template #default="{ titleId }">
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5"
      >
        <h2 :id="titleId" class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
          <slot name="title" />
        </h2>
        <button ref="closeButtonRef" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer outline-hidden" aria-label="Close chat" @click="closeModal">
          <Icon name="tabler:x" class="w-5 h-5" />
        </button>
      </div>
      <!-- TAWK DISABLED — restore later
      <div class="bg-white dark:bg-background h-160">
        <iframe
          frameborder="0"
          allowfullscreen=""
          webkitallowfullscreen=""
          mozallowfullscreen=""
          class="w-full h-full z-999"
          src="https://tawk.to/chat/67386bf82480f5b4f59eef63/1icq6bhh5"
        ></iframe>
      </div>
      -->
    </template>
  </AppDialog>
</template>
