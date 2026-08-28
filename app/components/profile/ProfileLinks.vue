<script setup>
import { useSupport } from "@/composables/useSupport";
import { useLoginStore } from "@/stores/login";
import { useRouter } from "vue-router";

const router = useRouter();
const { logout } = useLoginStore();

const { openSupportModal } = useSupport();

const signOut = () => {
  router.push({ name: "home" });
  logout();
};
</script>

<template>
  <!-- Account & Activity -->
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <div class="px-4 pt-3.5 pb-2">
      <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Account & Activity</h3>
    </div>
    <div class="divide-y divide-gray-100 dark:divide-white/5">
      <RouterLink
        :to="{ name: 'my-bets' }"
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center">
            <Icon name="tabler:copy" class="w-4 h-4 text-blue-500" aria-hidden="true" />
          </div>
          <span class="text-[0.8rem] font-medium text-gray-800 dark:text-gray-200">My Bets</span>
        </div>
        <Icon name="tabler:chevron-right" class="w-3.5 h-3.5 text-gray-300 dark:text-white/15" aria-hidden="true" />
      </RouterLink>
      <RouterLink
        :to="{ name: 'sort-deposit' }"
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-primary/8 dark:bg-primary/10 flex items-center justify-center">
            <Icon name="tabler:circle-check" class="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <span class="text-[0.8rem] font-medium text-gray-800 dark:text-gray-200">Sort Deposit (Jisort)</span>
        </div>
        <Icon name="tabler:chevron-right" class="w-3.5 h-3.5 text-gray-300 dark:text-white/15" aria-hidden="true" />
      </RouterLink>
    </div>
  </div>

  <!-- Promotions & Rewards -->
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <div class="px-4 pt-3.5 pb-2">
      <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Promotions & Rewards</h3>
    </div>
    <div class="divide-y divide-gray-100 dark:divide-white/5">
      <RouterLink
        :to="{ name: 'promotions' }"
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-gold-650/10 flex items-center justify-center">
            <Icon name="tabler:gift" class="w-4 h-4 text-gold-650" aria-hidden="true" />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-[0.8rem] font-medium text-gray-800 dark:text-gray-200">Promotions</span>
            <span class="px-1.5 py-0.5 rounded-md bg-brand-bright/10 text-[0.55rem] font-bold text-brand-bright uppercase">New</span>
          </div>
        </div>
        <Icon name="tabler:chevron-right" class="w-3.5 h-3.5 text-gray-300 dark:text-white/15" aria-hidden="true" />
      </RouterLink>
    </div>
  </div>

  <!-- Help & Support -->
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <div class="px-4 pt-3.5 pb-2">
      <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">Help & Support</h3>
    </div>
    <div class="divide-y divide-gray-100 dark:divide-white/5">
      <RouterLink
        :to="{ name: 'share-feedback' }"
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
            <Icon name="tabler:sun" class="w-4 h-4 text-amber-500" aria-hidden="true" />
          </div>
          <span class="text-[0.8rem] font-medium text-gray-800 dark:text-gray-200">Share Feedback</span>
        </div>
        <Icon name="tabler:chevron-right" class="w-3.5 h-3.5 text-gray-300 dark:text-white/15" aria-hidden="true" />
      </RouterLink>
      <div
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors cursor-pointer"
        @click="openSupportModal"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-500/10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-sky-500">
              <path fill-rule="evenodd" d="M3.43 2.524A41.29 41.29 0 0 1 10 2c2.236 0 4.43.18 6.57.524 1.437.231 2.43 1.49 2.43 2.902v5.148c0 1.413-.993 2.67-2.43 2.902a41.202 41.202 0 0 1-5.183.501.78.78 0 0 0-.528.224l-3.579 3.58A.75.75 0 0 1 6 17.25v-3.443a41.033 41.033 0 0 1-2.57-.33C1.993 13.244 1 11.986 1 10.573V5.426c0-1.413.993-2.67 2.43-2.902Z" clip-rule="evenodd" />
            </svg>
          </div>
          <span class="text-[0.8rem] font-medium text-gray-800 dark:text-gray-200">Chat with Support</span>
        </div>
        <Icon name="tabler:chevron-right" class="w-3.5 h-3.5 text-gray-300 dark:text-white/15" aria-hidden="true" />
      </div>
    </div>
  </div>

  <!-- More -->
  <div class="rounded-2xl bg-white dark:bg-white/3 border border-gray-200/80 dark:border-white/6 shadow-sm dark:shadow-none overflow-hidden">
    <div class="px-4 pt-3.5 pb-2">
      <h3 class="text-[0.6rem] font-bold text-gray-400 dark:text-white/25 uppercase tracking-widest">More</h3>
    </div>
    <div class="divide-y divide-gray-100 dark:divide-white/5">
      <RouterLink
        :to="{ name: 'self-exclusion' }"
        class="flex items-center justify-between px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/3 transition-colors"
      >
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <Icon name="tabler:circle-x" class="w-4 h-4 text-gray-400 dark:text-white/40" aria-hidden="true" />
          </div>
          <span class="text-[0.8rem] font-medium text-gray-800 dark:text-gray-200">Self Exclusion</span>
        </div>
        <Icon name="tabler:chevron-right" class="w-3.5 h-3.5 text-gray-300 dark:text-white/15" aria-hidden="true" />
      </RouterLink>
    </div>
  </div>

  <!-- Logout -->
  <button
    type="button"
    class="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200/60 dark:border-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/10 text-[0.8rem] font-semibold text-red-500 dark:text-red-400 transition-all cursor-pointer"
    @click="signOut"
  >
    <Icon name="tabler:logout" class="w-4 h-4" aria-hidden="true" />
    Sign Out
  </button>
</template>
