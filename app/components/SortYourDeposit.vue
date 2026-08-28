<script setup>
import { storeToRefs } from "pinia";
import { ref } from "vue";

import { useLoginStore } from "@/stores/login";

import { useToast } from "@/composables/useToast";
import { useDepositStore } from "../stores/deposit.js";

const { fireSuccessToast, fireErrorToast } = useToast();

const { jisort } = useDepositStore();
const { pending, statusMessage, responseOK } = storeToRefs(useDepositStore());

const { openLoginModal } = useLoginStore();
const { isAuthenticated } = storeToRefs(useLoginStore());

const inputMessage = ref("");
const extractedCode = ref("");

const handlePaste = async () => {
  const strippedText = inputMessage.value.replace(/\s+/g, "");
  extractedCode.value = strippedText.slice(0, 10);
  inputMessage.value = extractedCode.value;
};

async function sortDeposit() {
  await jisort(extractedCode.value);

  if (responseOK.value) {
    fireSuccessToast(statusMessage.value);
  } else {
    fireErrorToast(statusMessage.value);
  }
}
</script>

<template>
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <!-- Header -->
    <div class="px-5 pt-4 pb-3 flex items-center gap-3">
      <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
        <Icon name="tabler:refresh" class="w-3.5 h-3.5 text-amber-500" aria-hidden="true" />
      </div>
      <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Sort Your Deposit</h3>
    </div>

    <!-- Form -->
    <form class="px-5 pb-5 space-y-3" @submit.prevent="sortDeposit">
      <div>
        <label for="transactionMessage" class="block text-[0.7rem] font-semibold text-gray-500 dark:text-white/40 uppercase tracking-wider mb-1.5">
          Transaction Code
        </label>
        <input
          id="transactionMessage"
          v-model="inputMessage"
          type="text"
          class="w-full h-11 px-4 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200/80 dark:border-white/8 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/20 outline-hidden focus:ring-2 focus:ring-brand-bright/30 focus:border-brand-bright transition-all"
          placeholder="e.g SL354VKM9J..."
          name="code"
          required
          @input="handlePaste"
        />
      </div>

      <p class="text-[0.7rem] text-gray-500 dark:text-white/35 leading-relaxed">
        Paste your M-Pesa transaction code to resolve a missing deposit.
      </p>

      <button
        v-if="!isAuthenticated"
        class="w-full h-11 rounded-xl bg-brand-bright text-primary-foreground text-sm font-bold hover:bg-brand-bright/90 transition-all"
        type="button"
        @click="openLoginModal"
      >
        Login to Continue
      </button>
      <button
        v-else
        class="w-full h-11 rounded-xl bg-brand-bright text-primary-foreground text-sm font-bold hover:bg-brand-bright/90 shadow-sm shadow-brand-bright/20 transition-all"
        type="submit"
      >
        <TheButtonSpin v-if="pending" />
        <span v-else>Sort Deposit</span>
      </button>
    </form>

    <!-- Info footer -->
    <div class="px-5 pb-4">
      <div class="rounded-xl bg-amber-50/50 dark:bg-amber-500/5 border border-amber-200/50 dark:border-amber-500/10 px-4 py-3">
        <div class="flex gap-2.5">
          <Icon name="tabler:info-circle" class="w-4 h-4 shrink-0 text-amber-500 mt-0.5" aria-hidden="true" />
          <p class="text-[0.7rem] text-amber-700 dark:text-amber-400/70 leading-relaxed">
            Use this to fix any deposit where money was deducted but not reflected in your account. You should have an M-Pesa confirmation SMS.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
