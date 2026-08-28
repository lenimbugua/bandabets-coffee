<script setup>
// Ported from src/views/VirtualsIndex.vue. Baseline route was top-level ->
// layout: false. ssr:false + noindex come from routeRules in
// nuxt.config.js — this page instantiates the casino store (plan §F.7
// circular import) and links to the auth-gated Kiron routes, so it stays
// client-only like every other Batch F game page.
//
// Links to { name: 'pari-league' } and { name: 'pari-virtual-jackpot' }
// below require those two pages to exist — they're shipped in this same
// batch (app/pages/virtual-games/nai-league.vue,
// nai-virtual-jackpot.vue).
import MobileFooterV2 from "@/components/mobile/MobileFooterV2.vue";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useVirtual } from "@/composables/useVirtual";
import { useCasinoStore } from "@/stores/casino";

definePageMeta({
  name: "virtuals",
  layout: false,
});

useSeoHead({
  title: "Virtual Sports | 24/7 Matches & Results | Bandabets",
  description:
    "Bet on nonstop virtual football, racing, and more. Fast results and instant wins 24/7 on Bandabets.",
  robots: "noindex,nofollow",
});

const { categories, games } = useVirtual();
const { pending } = storeToRefs(useCasinoStore());
</script>
<template>
  <!-- DEPOSIT BAR DISABLED — restore later
  <TheDepositBar class="md:hidden" /> -->
  <HeaderLinks />
  <div class="w-full h-full max-w-[1680px] sm:px-3 mx-auto overflow-scroll bg-gray-50/50 dark:bg-transparent">
    <CasinoAnimate v-if="pending" />

    <div v-else class="flex w-full px-3 space-x-4 lg:px-0 lg:pt-3">
      <div class="w-full rounded-md">
        <div class="md:hidden w-full overflow-x-scroll">
          <MainCategories class="p-2 mb-2" />
        </div>
        <div class="md:max-w-[1000px] mx-auto rounded-lg overflow-clip"></div>

        <div class="md:max-w-[1000px] mx-auto">
          <div
            class="w-full flex items-center justify-between h-full cursor-pointer pb-5"
          >
            <button aria-label="Go back" class="cursor-pointer" @click="$router.go(-1)">
              <Icon name="tabler:arrow-left" class="size-6 stroke-2 text-gray-900 dark:text-white" aria-hidden="true" />
            </button>
            <h1 class="font-black text-3xl text-gray-900 dark:text-gray-50 leading-none">
              VIRTUAL GAMES
            </h1>
            <div></div>
          </div>
          <div class="grid grid-cols-2 gap-4 mb-6">
            <RouterLink
              :to="{ name: 'pari-league' }"
              class="group relative cursor-pointer flex flex-col items-center justify-center h-36 sm:h-72 rounded-2xl overflow-clip border border-gray-200 dark:border-white/8 shadow-sm dark:shadow-none transition-all hover:shadow-lg hover:scale-[1.02] virtual-card-league"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-brand-mid via-brand-selected to-brand-forest"></div>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_60%)]"></div>
              <div class="relative flex flex-col items-center gap-2 sm:gap-4">
                <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 sm:w-10 sm:h-10 text-white">
                    <path fill-rule="evenodd" d="M5.166 2.621v.858c-1.035.148-2.059.33-3.071.543a.75.75 0 0 0-.584.859 6.753 6.753 0 0 0 6.138 5.6 6.73 6.73 0 0 0 2.743 1.346A6.707 6.707 0 0 1 9.279 15H8.54c-1.036 0-1.875.84-1.875 1.875V19.5h-.75a.75.75 0 0 0 0 1.5h12.17a.75.75 0 0 0 0-1.5h-.75v-2.625c0-1.036-.84-1.875-1.875-1.875h-.739a6.707 6.707 0 0 1-1.112-3.173 6.73 6.73 0 0 0 2.743-1.347 6.753 6.753 0 0 0 6.139-5.6.75.75 0 0 0-.585-.858 47.077 47.077 0 0 0-3.07-.543V2.62a.75.75 0 0 0-.658-.744 49.22 49.22 0 0 0-6.093-.377c-2.063 0-4.096.128-6.093.377a.75.75 0 0 0-.657.744Z" clip-rule="evenodd" />
                  </svg>
                </div>
                <div class="text-center">
                  <span class="block text-white font-black text-base sm:text-2xl tracking-tight">LEAGUE</span>
                  <span class="block text-white/60 text-[0.6rem] sm:text-xs font-semibold uppercase tracking-widest mt-0.5">Virtual Football</span>
                </div>
              </div>
            </RouterLink>

            <RouterLink
              :to="{ name: 'pari-virtual-jackpot' }"
              class="group relative cursor-pointer flex flex-col items-center justify-center h-36 sm:h-72 rounded-2xl overflow-clip border border-gray-200 dark:border-white/8 shadow-sm dark:shadow-none transition-all hover:shadow-lg hover:scale-[1.02] virtual-card-jackpot"
            >
              <div class="absolute inset-0 bg-gradient-to-br from-gold via-gold-deep to-destructive"></div>
              <div class="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_60%)]"></div>
              <div class="relative flex flex-col items-center gap-2 sm:gap-4">
                <div class="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-7 h-7 sm:w-10 sm:h-10 text-white">
                    <path d="M9.315 7.584C12.195 3.883 16.695 1.5 21.75 1.5a.75.75 0 0 1 .75.75c0 5.056-2.383 9.555-6.084 12.436A6.75 6.75 0 0 1 9.75 22.5a.75.75 0 0 1-.75-.75v-4.131A15.838 15.838 0 0 1 6.382 15H2.25a.75.75 0 0 1-.75-.75 6.75 6.75 0 0 1 7.815-6.666ZM15 6.75a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5Z" />
                    <path d="M5.26 17.242a.75.75 0 1 0-.897-1.203 5.243 5.243 0 0 0-2.05 5.022.75.75 0 0 0 .625.627 5.243 5.243 0 0 0 5.022-2.051.75.75 0 1 0-1.202-.897 3.744 3.744 0 0 1-3.008 1.51c0-1.23.592-2.323 1.51-3.008Z" />
                  </svg>
                </div>
                <div class="text-center">
                  <span class="block text-white font-black text-base sm:text-2xl tracking-tight">JACKPOT</span>
                  <span class="block text-white/60 text-[0.6rem] sm:text-xs font-semibold uppercase tracking-widest mt-0.5">Virtual Jackpot</span>
                </div>
              </div>
            </RouterLink>
          </div>
          <TheCrash :games :categories />
        </div>
      </div>
    </div>
  </div>
  <MobileFooterV2 />
  <Footer />
</template>
