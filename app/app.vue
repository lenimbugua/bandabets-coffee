<script setup>
import CasinoSidebar from "@/components/CasinoSidebar.vue";
import CollectAllModals from "@/components/CollectAllModals.vue";
import OddsBar from "@/components/mobile/OddsBar.vue";
import BrandSplash from "@/components/BrandSplash.vue";
import { useAppMode } from "@/composables/useAppMode";
import { useModalTypes } from "@/composables/useModalTypes";
import { useThemeSwitch } from "@/composables/useThemeSwitch";
import { useModalStore } from "@/stores/modal";
import { useRoadblockStore } from "@/stores/roadblock";
import { useAppVersionStore } from "@/stores/app-version";

const appVersionStore = useAppVersionStore();
const { openModal } = useModalStore();
const { stopRoadblockRotationTimer } = useRoadblockStore();
const { notification } = useModalTypes();
const { switchToDark } = useThemeSwitch();
const { currentMode } = useAppMode();

// Task 5 (Lighthouse perf): preconnect to the matches API origin at runtime,
// since the host is env-driven (NUXT_PUBLIC_MATCHES_URL) and not known at
// build time. Guarded so an unset or malformed URL never throws during SSR.
// This only reaches routes that actually render on the server — casino-home.vue
// sets `ssr: false`, so this useHead call is inert there.
const { public: config } = useRuntimeConfig();
const apiOrigin = (() => {
  try {
    return new URL(config.matchesUrl).origin;
  } catch {
    return null;
  }
})();
useHead({
  link: apiOrigin
    ? [{ rel: "preconnect", href: apiOrigin, crossorigin: "" }]
    : [],
});

onBeforeMount(() => switchToDark());

onMounted(() => {
  appVersionStore.checkVersion();

  const nav = performance.getEntriesByType("navigation")[0];
  if (nav?.type !== "reload") {
    openModal(notification);
  }
});

onBeforeUnmount(() => {
  stopRoadblockRotationTimer();
});
</script>

<template>
  <div class="bg-white dark:bg-background">
    <BrandSplash />
    <div :class="currentMode === 'casino' ? 'lg:flex' : ''">
      <CasinoSidebar v-if="currentMode === 'casino'" />
      <div class="flex-1 min-w-0">
        <NuxtLayout>
          <NuxtPage />
        </NuxtLayout>
      </div>
    </div>
    <OddsBar class="xl:hidden" />
    <CollectAllModals />
  </div>
</template>
