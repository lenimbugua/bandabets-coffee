<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import CopyCode from "@/components/community-bets/CopyCode.vue";
import ShareToSocials from "@/components/community-bets/ShareToSocials.vue";
import { useModalTypes } from "@/composables/useModalTypes";
import { useShareToSocials } from "@/composables/useShareToSocials";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

const { shareBet } = useModalTypes();
const { betText, shareBetUrl } = useShareToSocials();

const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const closeButtonRef = ref(null); // Element to initially focus

const showShareBetModal = computed(() => {
  return modalType.value === shareBet && showModal.value;
});
</script>

<template>
  <AppDialog
    :open="showShareBetModal"
    :initial-focus="closeButtonRef"
    z-class="z-50"
    overlay-class="bg-black/50"
    container-class="z-50 flex min-h-full items-end justify-center text-center"
    panel-class="w-full max-w-4xl bg-white dark:bg-background transform overflow-hidden text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <template #default="{ titleId }">
      <div
        class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5"
      >
        <h2
          :id="titleId"
          class="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide"
        >
          Share With Friends
        </h2>
        <button ref="closeButtonRef" class="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors cursor-pointer outline-hidden" aria-label="Close" @click="closeModal">
          <Icon name="tabler:x" class="w-5 h-5" />
        </button>
      </div>
      <div class="bg-white dark:bg-background p-4 pb-20">
        <ShareToSocials
          :share-url="shareBetUrl"
          :share-text="betText"
        />
        <CopyCode />
      </div>
    </template>
  </AppDialog>
</template>
