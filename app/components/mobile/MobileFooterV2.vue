<script setup>
import { useBetslipDataLayer } from "@/composables/useBetslipDataLayer";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";
import { RouterLink, useRoute } from "vue-router";
import { useBetslipStore } from "@/stores/sports-betslip.js";

const route = useRoute();

const { betslipLength, totalOdds } = storeToRefs(useBetslipStore());
const { verifyBetslip } = useBetslipStore();
const { betslip } = useModalTypes();
const { openModal } = useModalStore();
const { addViewBetslipDataLayer } = useBetslipDataLayer();

function openBetslip() {
  verifyBetslip();
  openModal(betslip);
  addViewBetslipDataLayer();
}

const tabs = [
  { key: "home", label: "Home", to: { name: "home" }, activeOn: ["home"] },
  {
    key: "casino",
    label: "Casino",
    to: { name: "casino-home" },
    activeOn: ["casino-home", "casino-game"],
  },
  {
    key: "promos",
    label: "Promos",
    to: { name: "promotions" },
    activeOn: ["promotions", "promotion-details"],
  },
  { key: "bonuses", label: "My Bonuses", to: { name: "bonus" }, activeOn: ["bonus"] },
  { key: "my-bets", label: "My Bets", to: { name: "my-bets" }, activeOn: ["my-bets"] },
];

function isActive(tab) {
  return tab.activeOn.includes(route.name);
}
</script>

<template>
  <!-- BETSLIP PILL DISABLED — restore later. Note: with the pill off,
       mobile has no persistent betslip entry point (the old footer orb is
       gone too); selections can only be viewed via odds-button toggles. -->
  <button
    v-if="false && betslipLength > 0"
    type="button"
    data-fly-target="betslip"
    aria-label="Open betslip"
    class="fixed bottom-[calc(64px+env(safe-area-inset-bottom,0))] left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-full bg-bet px-4 py-2 shadow-lg xl:hidden"
    @click="openBetslip"
  >
    <span
      class="flex h-6 min-w-6 items-center justify-center rounded-md bg-betslip px-1 text-sm font-black tabular-nums text-betslip-foreground"
    >{{ betslipLength }}</span>
    <span class="text-base font-black tabular-nums text-bet-foreground">
      {{ totalOdds }}
    </span>
  </button>

  <nav
    class="fixed bottom-0 left-0 right-0 z-50 xl:hidden bg-white/80 dark:bg-card/80 backdrop-blur-xl border-t border-gray-200/80 dark:border-white/8 footer-nav h-[calc(56px+env(safe-area-inset-bottom,0))]"
  >
    <div class="grid h-14 grid-cols-5 items-center pb-[env(safe-area-inset-bottom,0)]">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.to"
        class="flex flex-col items-center gap-0.5"
        :class="isActive(tab) ? 'text-selected' : 'text-muted-foreground'"
      >
        <!-- Home -->
        <svg v-if="tab.key === 'home'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-[1.4rem] w-[1.4rem]" aria-hidden="true">
          <path d="M11.47 3.841a.75.75 0 0 1 1.06 0l8.69 8.69a.75.75 0 1 0 1.06-1.061l-8.689-8.69a2.25 2.25 0 0 0-3.182 0l-8.69 8.69a.75.75 0 1 0 1.061 1.06l8.69-8.689Z" />
          <path d="m12 5.432 8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 0 1-.75-.75v-4.5a.75.75 0 0 0-.75-.75h-3a.75.75 0 0 0-.75.75V21a.75.75 0 0 1-.75.75H5.625a1.875 1.875 0 0 1-1.875-1.875v-6.198a2.29 2.29 0 0 0 .091-.086L12 5.432Z" />
        </svg>
        <!-- Casino: spade -->
        <svg v-else-if="tab.key === 'casino'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-[1.4rem] w-[1.4rem]" aria-hidden="true">
          <path d="M12 2C9.5 5.5 4 8.5 4 12.75 4 15.1 5.9 17 8.25 17c.85 0 1.64-.25 2.3-.68-.32 1.4-1 2.72-2.05 3.93a.5.5 0 0 0 .38.83h6.24a.5.5 0 0 0 .38-.83c-1.05-1.21-1.73-2.53-2.05-3.93.66.43 1.45.68 2.3.68C18.1 17 20 15.1 20 12.75 20 8.5 14.5 5.5 12 2Z" />
        </svg>
        <!-- Promos: megaphone -->
        <svg v-else-if="tab.key === 'promos'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-[1.4rem] w-[1.4rem]" aria-hidden="true">
          <path d="M16.881 4.345A23.112 23.112 0 0 1 8.25 6H7.5a5.25 5.25 0 0 0-.88 10.427 21.593 21.593 0 0 0 1.378 3.94c.464 1.004 1.674 1.32 2.582.796l.657-.379c.88-.508 1.165-1.593.772-2.468a17.116 17.116 0 0 1-.628-1.607c1.918.258 3.76.75 5.5 1.446A21.727 21.727 0 0 0 18 11.25c0-2.414-.393-4.735-1.119-6.905ZM18.26 3.74a23.22 23.22 0 0 1 1.24 7.51 23.22 23.22 0 0 1-1.41 7.992.75.75 0 1 0 1.409.516 24.555 24.555 0 0 0 1.415-6.43 2.992 2.992 0 0 0 .836-2.078c0-.807-.319-1.54-.836-2.078a24.65 24.65 0 0 0-1.415-6.43.75.75 0 1 0-1.409.516c.059.16.116.321.17.482Z" />
        </svg>
        <!-- My Bonuses: gift -->
        <svg v-else-if="tab.key === 'bonuses'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-[1.4rem] w-[1.4rem]" aria-hidden="true">
          <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.943c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 1 0-1.875-1.875V6.75h-1.5V4.875C11.25 3.839 10.41 3 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6.75a2.25 2.25 0 0 0 2.25-2.25v-6.75h-9Z" />
        </svg>
        <!-- My Bets: clipboard -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="h-[1.4rem] w-[1.4rem]" aria-hidden="true">
          <path fill-rule="evenodd" d="M10.5 3.75a.75.75 0 0 0-.75.75v.75h4.5V4.5a.75.75 0 0 0-.75-.75h-3ZM8.25 4.5a2.25 2.25 0 0 1 2.25-2.25h3a2.25 2.25 0 0 1 2.25 2.25v.803A2.25 2.25 0 0 1 17.25 7.5v12A2.25 2.25 0 0 1 15 21.75H9A2.25 2.25 0 0 1 6.75 19.5v-12a2.25 2.25 0 0 1 1.5-2.122V4.5Zm.75 6a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h4.5a.75.75 0 0 1 0 1.5h-4.5a.75.75 0 0 1-.75-.75Zm0 3a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H9.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
        </svg>

        <span class="text-[0.6rem] font-semibold">{{ tab.label }}</span>
      </RouterLink>
    </div>
  </nav>
</template>

<style scoped>
[data-theme="light"] .footer-nav {
  box-shadow: 0 -1px 3px oklch(0% 0 0 / 0.05), 0 -4px 12px oklch(0% 0 0 / 0.03);
}
</style>
