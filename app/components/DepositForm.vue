<script setup>
import { usePoll } from "@/composables/usePoll";
import { useLoginStore } from "@/stores/login";
import { storeToRefs } from "pinia";
import { onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { useDepositStore } from "../stores/deposit.js";
import DepositInput from "./DepositInput.vue";

const router = useRouter();

const { isAuthenticated } = storeToRefs(useLoginStore());

const { performDeposit } = useDepositStore();

const { pollingInterval } = usePoll();

function makeDeposit() {
  performDeposit(router);
}

// Ensure the interval is cleared when the component is unmounted
onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval);
  }
});
</script>

<template>
  <NotAuthenicated v-if="!isAuthenticated" />

  <div v-else class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <!-- Card header -->
    <div class="px-5 pt-4 pb-2">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg bg-brand-bright/10 flex items-center justify-center">
          <Icon name="tabler:credit-card" class="w-3.5 h-3.5 text-brand-bright" aria-hidden="true" />
        </div>
        <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">M-Pesa Deposit</h3>
      </div>
    </div>

    <!-- Form body -->
    <form class="px-5 pb-5 space-y-3" @submit.prevent="makeDeposit">
      <DepositAmounts />
      <DepositInput />
      <MakeDepositButton />
    </form>
  </div>
</template>
