<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";

import { storeToRefs } from "pinia";
import { computed, ref } from "vue";

import { useModalStore } from "@/stores/modal";
import { useModalTypes } from "@/composables/useModalTypes";
import { useDepositStore } from "@/stores/deposit";
import { useProfileStore } from "@/stores/profile";
import { useRouter } from "vue-router";

const router = useRouter();
const closeButtonRef = ref(null);

const { balance } = storeToRefs(useProfileStore());
const { deposit } = storeToRefs(useDepositStore());
const { resetDeposit, performDeposit } = useDepositStore();

const { insufficientBalance } = useModalTypes();

const { showModal, modalType } = storeToRefs(useModalStore());

const showDialog = computed(() => {
  return modalType.value === insufficientBalance && showModal.value;
});
const { closeModal } = useModalStore();

function closeThisModal() {
  resetDeposit();
  closeModal();
}
</script>

<template>
  <AppDialog
    :open="showDialog"
    :initial-focus="closeButtonRef"
    z-class="z-1000"
    container-class="z-50 flex min-h-full items-center justify-center p-4 text-center"
    panel-class="w-full max-w-md transform bg-white dark:bg-background text-left align-middle shadow-2xl transition-all overflow-hidden rounded-2xl border border-gray-200/80 dark:border-white/6"
    @close="closeThisModal"
  >
    <template #default="{ titleId }">
      <!-- Header with warning accent -->
      <div class="relative overflow-hidden px-5 pt-5 pb-4">
        <div class="absolute inset-0 bg-gradient-to-r from-amber-500/8 via-orange-500/5 to-transparent dark:from-amber-500/10 dark:via-orange-500/5"></div>
        <div class="relative flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-xl bg-amber-500/15 dark:bg-amber-500/20 flex items-center justify-center">
              <Icon name="tabler:alert-triangle" class="w-4.5 h-4.5 text-amber-500" aria-hidden="true" />
            </div>
            <h3 :id="titleId" class="text-base font-bold text-gray-900 dark:text-white">
              Insufficient Balance
            </h3>
          </div>
          <button
            ref="closeButtonRef"
            class="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close"
            @click="closeThisModal"
          >
            <Icon name="tabler:x" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Balance + Deposit form (single card) -->
      <div class="px-5 py-5">
        <form
          class="rounded-xl border border-gray-200 dark:border-white/8 overflow-hidden bg-gray-50/50 dark:bg-white/[0.015]"
          @submit.prevent="performDeposit(router)"
        >
          <!-- Balance row -->
          <div class="flex border-b border-gray-200 dark:border-white/8">
            <div class="flex-1 py-3 px-4 text-center">
              <div class="text-[0.6rem] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                Balance
              </div>
              <div class="text-lg font-bold text-gray-900 dark:text-white tabular-nums leading-tight">
                {{ balance }} <span class="text-[0.6rem] font-medium text-gray-400 dark:text-gray-500">KES</span>
              </div>
            </div>
            <div class="w-px bg-gray-200 dark:bg-white/8"></div>
            <div class="flex-1 py-3 px-4 text-center">
              <div class="text-[0.6rem] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-0.5">
                Needed
              </div>
              <div class="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums leading-tight">
                {{ deposit }} <span class="text-[0.6rem] font-medium text-gray-400 dark:text-gray-500">KES</span>
              </div>
            </div>
          </div>

          <!-- Input + submit -->
          <div class="p-4 space-y-3">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center">
              Top up your account to place this bet
            </p>
            <DepositInput />
            <MakeDepositButton />
          </div>
        </form>
      </div>
    </template>
  </AppDialog>
</template>
