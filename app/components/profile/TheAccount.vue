<script setup>
import { useProfileStore } from "@/stores/profile";
import { ref } from "vue";
import { storeToRefs } from "pinia";

const { balance, bonus, pending } = storeToRefs(useProfileStore());
const { getProfileInfo } = useProfileStore();

getProfileInfo();

const showBalance = ref(true);
</script>

<template>
  <div v-if="balance" class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <!-- Header -->
    <div class="px-5 pt-4 pb-3">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-[0.65rem] font-bold text-gray-400 dark:text-white/30 uppercase tracking-widest">Total Balance</span>
          <button
            type="button"
            class="p-0.5 rounded-md text-gray-400 dark:text-white/30 hover:text-gray-600 dark:hover:text-white/50 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
            :aria-label="showBalance ? 'Hide balance' : 'Show balance'"
            @click="showBalance = !showBalance"
          >
            <!-- Eye open -->
            <Icon v-if="showBalance" name="tabler:eye" class="w-3.5 h-3.5" aria-hidden="true" />
            <!-- Eye closed -->
            <Icon v-else name="tabler:eye-off" class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
        <button
          type="button"
          class="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.65rem] font-semibold text-gray-500 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/60 hover:bg-gray-100 dark:hover:bg-white/5 transition-all cursor-pointer"
          aria-label="Refresh balance"
          @click="getProfileInfo()"
        >
          <Icon name="tabler:refresh" class="w-3 h-3" :class="{ 'animate-spin': pending }" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <!-- Big balance -->
      <div class="mt-2">
        <span v-if="showBalance" class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          KES <span class="tabular-nums">{{ balance }}</span>
        </span>
        <span v-else class="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          KES ******
        </span>
      </div>
    </div>

    <!-- Main + Bonus split -->
    <div class="mx-5 mb-4 rounded-xl bg-gray-50 dark:bg-white/3 border border-gray-100 dark:border-white/4 grid grid-cols-2">
      <div class="px-4 py-3 text-center border-r border-gray-100 dark:border-white/4">
        <div class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Main</div>
        <div class="mt-1 text-lg font-bold text-gray-900 dark:text-white tabular-nums">
          <span v-if="showBalance">{{ balance }}</span>
          <span v-else>****</span>
        </div>
      </div>
      <div class="px-4 py-3 text-center">
        <div class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Bonus</div>
        <div class="mt-1 text-lg font-bold text-brand-bright tabular-nums">
          <span v-if="showBalance">{{ bonus }}</span>
          <span v-else>****</span>
        </div>
      </div>
    </div>
  </div>
</template>
