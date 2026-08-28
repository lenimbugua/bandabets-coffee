<script setup>
</script>

<template>
  <div class="grid grid-cols-2 gap-3">
    <RouterLink
      :to="{ name: 'deposit' }"
      class="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-primary-foreground bg-brand-bright hover:bg-brand-bright/90 shadow-sm shadow-brand-bright/20 transition-all"
    >
      <Icon name="tabler:circle-plus" class="w-4 h-4" aria-hidden="true" />
      Deposit
    </RouterLink>
    <RouterLink
      :to="{ name: 'withdraw' }"
      class="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold text-gray-700 dark:text-white bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/6 hover:bg-gray-50 dark:hover:bg-white/8 shadow-sm dark:shadow-none transition-all"
    >
      <Icon name="tabler:circle-minus" class="w-4 h-4" aria-hidden="true" />
      Withdraw
    </RouterLink>
  </div>
</template>
