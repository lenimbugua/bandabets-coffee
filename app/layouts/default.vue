<script setup>
import MobileFooterV2 from "@/components/mobile/MobileFooterV2.vue";
import { useScreenSizes } from "@/composables/useScreenSizes";
const { isSmallScreen, isMediumScreen, isLargeScreen } = useScreenSizes();

import SportsBetslipPanel from "@/components/SportsBetslipPanel.vue";
import TheSidebar from "@/components/TheSidebar.vue";
</script>

<template>
  <h1 class="sr-only">Sports Betting – Matches & Betslip | Bandabets</h1>
  <div
    v-if="isLargeScreen"
    class="min-h-dvh bg-gray-50 dark:bg-background"
  >
    <HeaderLinks />
    <div class="w-full max-w-[1680px] mx-auto px-4 pt-4">
      <div class="w-full flex gap-5">
        <div class="shrink-0">
          <TheSidebar />
        </div>
        <main class="flex-1 min-w-0 max-w-200 lg:max-w-250 py-3">
          <slot />
        </main>
        <div class="shrink-0">
          <SportsBetslipPanel />
        </div>
      </div>
    </div>
    <LazyFooter hydrate-on-visible />
    <MobileFooterV2 />
  </div>
  <div v-else-if="isMediumScreen" class="min-h-dvh bg-gray-50 dark:bg-background">
    <HeaderLinks />
    <div class="w-full max-w-[1680px] mx-auto px-4 pt-4">
      <div class="w-full flex gap-4">
        <div class="shrink-0">
          <TheSidebar />
        </div>
        <main class="flex-1 min-w-0 py-3">
          <slot />
        </main>
      </div>
    </div>
    <LazyFooter hydrate-on-visible />
    <MobileFooterV2 />
  </div>
  <div
    v-else-if="isSmallScreen"
    class="h-dvh w-full overflow-scroll dark:border-border-darkest"
  >
    <div
      class="sticky z-60 top-0 bg-white dark:bg-background border-b dark:shadow-xl dark:border-border-darkest rounded-b-xl overflow-clip"
    >
      <HeaderLinks />
    </div>
    <main class="w-full grow px-2 py-3">
      <slot />
    </main>
    <LazyFooter hydrate-on-visible />
    <MobileFooterV2 />
  </div>
</template>
