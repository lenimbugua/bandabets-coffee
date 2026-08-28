<script setup>
const bonusRanges = [
  { deposit: "49 - 99", bonus: "5" },
  { deposit: "100 - 199", bonus: "10" },
  { deposit: "200 - 299", bonus: "15" },
  { deposit: "300 - 399", bonus: "20" },
  { deposit: "400 - 499", bonus: "25" },
  { deposit: "500 - 999", bonus: "30" },
  { deposit: "1000+", bonus: "50" },
];
</script>

<template>
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <!-- Header -->
    <div class="px-5 pt-4 pb-3 flex items-center gap-3">
      <div class="w-7 h-7 rounded-lg bg-amber-50 dark:bg-gold-650/10 flex items-center justify-center">
        <Icon name="tabler:currency-dollar" class="w-3.5 h-3.5 text-gold-650" aria-hidden="true" />
      </div>
      <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Deposit Bonus Tiers</h3>
    </div>

    <!-- Table -->
    <div class="px-5 pb-5">
      <div class="rounded-xl overflow-hidden border border-gray-200/80 dark:border-white/6">
        <!-- Table header -->
        <div class="grid grid-cols-2 bg-gray-50 dark:bg-white/5">
          <div class="px-4 py-2.5 text-[0.65rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Deposit (KES)</div>
          <div class="px-4 py-2.5 text-[0.65rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Bonus (KES)</div>
        </div>

        <!-- Rows -->
        <div class="divide-y divide-gray-100 dark:divide-white/5">
          <div
            v-for="(range, index) in bonusRanges"
            :key="index"
            class="grid grid-cols-2 hover:bg-gray-50/50 dark:hover:bg-white/3 transition-colors"
          >
            <div class="px-4 py-3 text-[0.8rem] text-gray-600 dark:text-white/50 tabular-nums">{{ range.deposit }}</div>
            <div class="px-4 py-3 text-[0.8rem] font-semibold text-brand-bright tabular-nums">+{{ range.bonus }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
