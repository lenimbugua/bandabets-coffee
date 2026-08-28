<template>
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <!-- Header -->
    <div class="px-5 pt-4 pb-3 flex items-center gap-3">
      <div class="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
        <Icon name="tabler:file-text" class="w-3.5 h-3.5 text-sky-500" aria-hidden="true" />
      </div>
      <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Terms & Conditions</h3>
    </div>

    <!-- Terms list -->
    <div class="px-5 pb-5">
      <div class="space-y-3">
        <div class="flex gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">1</span>
          <p class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">
            Available exclusively to <strong class="text-gray-900 dark:text-white font-semibold">active, registered</strong> Bandabets users.
          </p>
        </div>
        <div class="flex gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">2</span>
          <p class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">
            Valid only for the <strong class="text-gray-900 dark:text-white font-semibold">first qualifying deposit(s)</strong> made each calendar day (00:00 to 23:59).
          </p>
        </div>
        <div class="flex gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">3</span>
          <p class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">
            Bonus amounts are credited <strong class="text-gray-900 dark:text-white font-semibold">instantly</strong> to your account wallet upon a successful deposit match.
          </p>
        </div>
        <div class="flex gap-3">
          <span class="shrink-0 w-5 h-5 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center text-[0.6rem] font-bold text-gray-400 dark:text-white/30 tabular-nums">4</span>
          <p class="text-[0.75rem] text-gray-600 dark:text-white/50 leading-relaxed">
            Bandabets reserves the right to modify or terminate this transaction-fee refund program at any time.
          </p>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="mt-4 pt-3 border-t border-gray-100 dark:border-white/5">
        <p class="text-[0.65rem] text-gray-400 dark:text-white/20 leading-relaxed">
          This product is provided "as is" without any warranties, whether express or implied. Only warranties implied by law and that cannot be excluded will apply, as stated in Bandabets's General Terms and Conditions and Privacy Policy.
        </p>
      </div>
    </div>
  </div>
</template>
