<script setup>
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import InviteFriends from "./InviteFriends.vue";

const { festiveModal } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const closeButtonRef = ref(null); // Element to initially focus

const showShareBetModal = computed(() => {
  return modalType.value === festiveModal && showModal.value;
});
</script>

<template>
  <AppDialog
    :open="showShareBetModal"
    :initial-focus="closeButtonRef"
    z-class="z-50"
    overlay-class="bg-black/50"
    container-class="z-50 flex min-h-full items-end justify-center text-center"
    panel-class="w-full max-w-md transform overflow-hidden rounded-t-lg text-left align-middle shadow-xl transition-all"
    @close="closeModal"
  >
    <template #default="{ titleId }">
      <div
        class="flex w-full justify-between bg-white dark:bg-card border-b dark:border-gray-900"
      >
        <button class="p-2 py-1 outline-hidden" aria-label="Close" @click="closeModal">
          <Icon
            name="tabler:x"
            class="w-5 h-5 dark:text-slate-300 cursor-pointer"
          />
        </button>
        <h2
          :id="titleId"
          class="flex text-gray-600 dark:text-slate-300 grow items-center justify-center py-3 px-1 text-left uppercase text-sm font-bold border-x dark:border-gray-900"
        >
          Invite Friends
        </h2>
        <button ref="closeButtonRef" class="p-2 py-1 outline-hidden" aria-label="Close" @click="closeModal">
          <Icon
            name="tabler:x"
            class="w-5 h-5 dark:text-slate-300 cursor-pointer"
          />
        </button>
      </div>
      <div class="bg-white dark:bg-background">
        <InviteFriends />
      </div>
    </template>
  </AppDialog>
</template>
