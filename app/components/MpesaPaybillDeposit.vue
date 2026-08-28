<script setup>
import { useModalStore } from "@/stores/modal";

const { closeModal } = useModalStore();

const { public: config } = useRuntimeConfig();
const paybillNo = config.paybillNo;

</script>

<template>
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <!-- Header -->
    <div class="px-5 pt-4 pb-3 flex items-center gap-3">
      <div class="w-7 h-7 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center">
        <Icon name="tabler:phone" class="w-3.5 h-3.5 text-primary" aria-hidden="true" />
      </div>
      <div class="flex items-baseline gap-2">
        <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Paybill</h3>
        <span class="text-sm font-bold text-brand-bright tabular-nums">{{ paybillNo }}</span>
      </div>
    </div>

    <!-- Steps -->
    <div class="px-5 pb-5">
      <div class="space-y-2.5">
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">1</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">Go to M-Pesa Menu on your phone</span>
        </div>
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">2</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">Select Lipa na M-Pesa</span>
        </div>
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">3</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">Choose Paybill</span>
        </div>
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">4</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">Enter Business Number <strong class="text-gray-900 dark:text-white font-bold">{{ paybillNo }}</strong></span>
        </div>
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">5</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">Enter Account Number <strong class="text-gray-900 dark:text-white font-bold">pari</strong></span>
        </div>
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">6</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">Enter Amount</span>
        </div>
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">7</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">Enter M-Pesa PIN and Confirm</span>
        </div>
        <div class="flex items-start gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">8</span>
          <span class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">You will receive M-Pesa Confirmation</span>
        </div>
      </div>

      <!-- Footer link -->
      <div class="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
        <RouterLink
          :to="{ name: 'sort-deposit' }"
          class="text-[0.7rem] font-medium text-brand-bright hover:underline"
          @click="closeModal"
        >
          Can't see your deposit? Resolve here
        </RouterLink>
      </div>
    </div>
  </div>
</template>
