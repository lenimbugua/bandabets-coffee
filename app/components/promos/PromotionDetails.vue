<script setup>
import MobileFooterV2 from "../components/mobile/MobileFooterV2.vue";
import { usePromoStore } from "@/stores/promos";
import { computed, onBeforeUnmount, toRefs } from "vue";
import { sanitizeHtml } from "@/utils/sanitizeHtml";

import { useCasino } from "@/composables/useCasino";
import { useDefaultSport } from "@/composables/useDefaultSport";
import { useRouter } from "vue-router";
const { selectedPromo } = toRefs(usePromoStore());

const sanitizedDescription = computed(() =>
  sanitizeHtml(selectedPromo.value?.description)
);

const { launchCasino } = useCasino();

// import { usePromos } from "../composables/usePromos";
// import { useCasinoStore } from "../stores/casino";

const { initDefaultSport } = useDefaultSport();

// const { setLaunchGameId } = useCasinoStore();

const router = useRouter();

// const {
//   hakiLeaguePromo,
//   cashbackPromo,
//   bethubPromo,
//   multibetBoostPromo,
//   twoUpPromo,
//   oneCutPromo,
//   aviatorWelcomeBonus,
//   dailyAviatorCashback,
// } = usePromos();

const goToSports = () => {
  initDefaultSport(true);
  router.push({ name: "sports", params: { sport: "soccer" } });
};

function goToRoute() {
  if (selectedPromo.value.app_route_name === "sports") {
    goToSports();
    return;
  }

  if (!selectedPromo.value.game_id.Valid) {
    router.push({ name: selectedPromo.value.app_route_name });
    return;
  }
  launchCasino(
    selectedPromo.value.game_id.String,
    selectedPromo.value.game_name.String
  );
}

// function launchCasino(gameId, gameName) {
//   if (gameName == hakiLeaguePromo) {
//     router.push({ name: "pari-league" });
//     return;
//   }
//   if (gameName == cashbackPromo) {
//     router.push({ name: "deposit" });
//     return;
//   }
//   if (gameName == bethubPromo) {
//     router.push({ name: "share-bets" });
//     return;
//   }

//   if (gameName == multibetBoostPromo) {
//     goToSports();
//     return;
//   }
//   if (gameName == twoUpPromo) {
//     goToSports();
//     return;
//   }
//   if (gameName == oneCutPromo) {
//     goToSports();
//     return;
//   }

//   if (gameName == dailyAviatorCashback) {
//     router.push({ name: "games", params: { name: "aviator" } });
//     return;
//   }
//   if (gameName == aviatorWelcomeBonus) {
//     router.push({ name: "games", params: { name: "aviator" } });
//     return;
//   }
//   setLaunchGameId(gameId);
//   router.push({ name: "games", params: { name: gameName } });
// }

onBeforeUnmount(() => {
  usePromoStore().selectPromo(null);
});
</script>
<template>
  <HeaderLinks />

  <div class="relative">
    <div class="max-w-6xl mx-auto sm:px-12 px-3">
      <div class="mb-4">
        <div class="flex items-center mt-4 space-x-2">
          <button aria-label="Go back" class="flex items-center cursor-pointer" @click="$router.go(-1)">
            <Icon name="tabler:chevron-left" class="h-7 w-7 cursor-pointer text-gray-900 dark:text-white" />
          </button>
          <h3 class="text-lg font-bold text-gray-900 dark:text-gray-100">Back</h3>
        </div>
        <div class="relative aspect-video h-42 sm:h-104 w-full my-4 rounded-xl overflow-hidden border border-gray-200 dark:border-border shadow-sm dark:shadow-none">
          <!-- TEMPORARY: placeholder in place of the CMS image_url.
               Restore :src="selectedPromo?.image_url" to undo. -->
          <img
            class="absolute top-0 w-full h-full right-0 left-0 bottom-0 object-cover"
            :src="PROMO_PLACEHOLDER"
            :alt="selectedPromo?.title || 'Promotion details'"
            loading="lazy"
          />
        </div>
        <!-- sanitized via sanitizeHtml (ultrahtml allow-list, runs on server and client) -->
        <div
          class="prose dark:prose-invert max-w-none text-gray-700 dark:text-slate-400"
          v-html="sanitizedDescription"
        ></div>
      </div>
    </div>
    <!-- Sticky CTA -->
    <div class="fixed bottom-32 left-1/2 -translate-x-1/2 z-50">
      <button
        class="px-6 py-3 rounded-full font-bold text-primary-foreground bg-brand-bright hover:bg-brand-bright active:scale-95 shadow-xl hover:shadow-2xl transition-all"
        @click="goToRoute(selectedPromo)"
      >
        <span v-if="selectedPromo?.call_to_action_name">{{
          selectedPromo?.call_to_action_name
        }}</span>
        <span v-else>Play Now</span>
      </button>
    </div>
  </div>

  <!-- <ThePromos /> -->
  <Footer />
  <MobileFooterV2 />
</template>
