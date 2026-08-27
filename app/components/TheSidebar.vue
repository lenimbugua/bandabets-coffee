<script setup>
import { useCasinoStore } from "@/stores/casino";
import { useLoginStore } from "@/stores/login";
import { useModalStore } from "@/stores/modal";
import { useModalTypes } from "@/composables/useModalTypes";
import { useSecondaryNavGames } from "@/composables/useSecondaryNavGames";
import { storeToRefs } from "pinia";
import {  onMounted } from "vue";
// import { useCasino } from "@/composables/useCasino";
import { useThemeSwitch } from "@/composables/useThemeSwitch";
import { useRouter } from "vue-router";
import SidebarTabs from "./SidebarTabs.vue";
import SecondaryNavIcons from "./SecondaryNavIcons.vue";

const { isDark } = useThemeSwitch();

const router = useRouter();
const casinoStore = useCasinoStore();
const loginStore = useLoginStore();
const { categoriesWithGames } = storeToRefs(casinoStore);
const { token } = storeToRefs(loginStore);
// const { launchCasino } = useCasino();

const { games: secondaryGames, launchGame: launchSecondaryGame } = useSecondaryNavGames();
const { drawer } = useModalTypes();
const { openModal } = useModalStore();

const sportLinks = [
  { name: "Football", slug: "soccer", icon: "soccer" },
  { name: "Basketball", slug: "basketball", icon: "basketball" },
  { name: "Esports", slug: "esports", icon: "esports" },
  { name: "Tennis", slug: "tennis", icon: "tennis" },
  { name: "Cricket", slug: "cricket", icon: "cricket" },
  { name: "Rugby", slug: "rugby", icon: "rugby" },
];

function quickLaunch(game) {
  // Aviator (id 2184) requires login first — preserved from SecondaryNav
  if (parseInt(game.gameId) === 2184 && !token.value) {
    loginStore.setAfterLoginAction(() => launchSecondaryGame(router, game));
    loginStore.openLoginModal();
    return;
  }
  launchSecondaryGame(router, game);
}

function goToSport(slug) {
  router.push({ name: "sports", params: { sport: slug } });
}

function handleLogout() {
  loginStore.logout();
  router.push({ name: "home" });
}

onMounted(() => {
  if (!categoriesWithGames.value?.length) {
    casinoStore.fetchCategoriesWithGames();
  }
});

/* Top Games section disabled — see template comment below
function getRouteName(categoryName) {
  const lower = categoryName.toLowerCase();
  if (lower.includes("crash")) return "crash-games";
  if (lower.includes("virtual")) return "virtuals-games";
  return "casino";
}

const topGames = computed(() => {
  if (!categoriesWithGames.value?.length) return [];
  const seen = new Set();
  const allGames = [];
  for (const cat of categoriesWithGames.value) {
    const routeName = getRouteName(cat.name);
    for (const game of cat.games || []) {
      if (seen.has(game.id)) continue;
      seen.add(game.id);
      allGames.push({ ...game, routeName });
    }
  }
  return allGames
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 12);
});
*/
</script>

<template>
  <div
    class="sticky z-2 w-[16rem] top-12 lg:top-14 h-[calc(100vh-4rem)] flex flex-col gap-3"
  >
    <!-- Top Games -->
    <!-- <div
      class="shrink-0 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-none overflow-hidden"
    >
      <div class="flex items-center justify-between px-3.5 py-2.5">
        <h3
          class="text-[0.65rem] font-bold uppercase tracking-widest text-gray-400 dark:text-white/30"
        >
          Top Games
        </h3>
        <router-link
          :to="{ name: 'casino-home' }"
          class="flex items-center gap-0.5 text-[0.65rem] font-semibold text-brand-bright hover:text-brand-bright/80 transition-colors"
        >
          View All
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 16 16"
            fill="currentColor"
            class="w-3 h-3"
          >
            <path
              fill-rule="evenodd"
              d="M6.22 4.22a.75.75 0 0 1 1.06 0l3.25 3.25a.75.75 0 0 1 0 1.06l-3.25 3.25a.75.75 0 0 1-1.06-1.06L8.94 8 6.22 5.28a.75.75 0 0 1 0-1.06Z"
              clip-rule="evenodd"
            />
          </svg>
        </router-link>
      </div>

      <div v-if="topGames.length" class="px-3 pb-3">
        <div class="grid grid-cols-4 gap-2.5">
          <button
            v-for="game in topGames"
            :key="game.id"
            class="group relative aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-white/5 cursor-pointer"
            @click="launchCasino(game.id, game.gameName, game.routeName, game.providerName)"
          >
            <img
              :src="game.imgFullUrl"
              :alt="game.gameName"
              class="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
          </button>
        </div>
      </div> 
    </div> -->

    <!-- Popular (formerly the SecondaryNav row) -->
    <div class="shrink-0 rounded-xl bg-card border border-border overflow-hidden">
      <div class="px-3.5 py-2.5">
        <h3 class="text-[0.65rem] font-bold uppercase tracking-widest text-muted-foreground">
          Popular
        </h3>
      </div>
      <ul class="flex flex-col gap-0.5 pb-2 px-2">
        <!-- Featured games (Aviator) -->
        <li v-for="game in secondaryGames" :key="game.gameName">
          <button
            class="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-interactive font-medium transition-colors"
            @click="quickLaunch(game)"
          >
            <img
              :src="game.imgUrl"
              :alt="game.gameName"
              class="w-6 h-6 rounded object-cover shrink-0"
              loading="lazy"
            />
            <span class="capitalize">{{ game.gameName }}</span>
            <span
              v-if="game.new"
              class="ml-auto text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gold text-gold-foreground"
            >New</span>
          </button>
        </li>

        <!-- Sport types (use the same SecondaryNavIcons set the drawer uses) -->
        <li v-for="sport in sportLinks" :key="sport.slug">
          <button
            class="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-interactive font-medium transition-colors"
            @click="goToSport(sport.slug)"
          >
            <SecondaryNavIcons :icon="sport.icon" icon-css="w-6 h-6 shrink-0 fill-current text-primary" />
            <span>{{ sport.name }}</span>
          </button>
        </li>

        <!-- More — opens drawer modal -->
        <li>
          <button
            class="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-surface-interactive font-medium transition-colors"
            @click="openModal(drawer)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class="w-6 h-6 shrink-0 text-primary"
              aria-hidden="true"
            >
              <path d="M6 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Zm8 0a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z" />
            </svg>
            <span>More</span>
          </button>
        </li>
      </ul>
    </div>

    <!-- Top Leagues — flexible, scrolls internally -->
    <div class="flex-1 min-h-0">
      <SidebarTabs />
    </div>

    <!-- Footer: Theme + Logout -->
    <div
      class="shrink-0 rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] shadow-sm dark:shadow-none overflow-hidden"
    >
      <div class="flex items-center justify-between px-3.5 py-2.5">
        <!-- Theme toggle pill -->
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/10 text-[0.65rem] font-medium text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-white/20 transition-all"
          @click="isDark = !isDark"
        >
          <svg
            v-if="isDark"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-3 h-3 text-amber-400"
          >
            <path
              d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.06 1.06l1.06 1.06Z"
            />
          </svg>
          <svg
            v-else
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-3 h-3"
          >
            <path
              fill-rule="evenodd"
              d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z"
              clip-rule="evenodd"
            />
          </svg>
          <span>{{ isDark ? "Dark" : "Light" }}</span>
        </button>

        <!-- Logout -->
        <button
          v-if="token"
          class="flex items-center gap-1.5 text-[0.7rem] font-medium text-red-500/80 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 transition-colors cursor-pointer"
          @click="handleLogout"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="w-3.5 h-3.5"
          >
            <path
              fill-rule="evenodd"
              d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z"
              clip-rule="evenodd"
            />
            <path
              fill-rule="evenodd"
              d="M19 10a.75.75 0 0 0-.75-.75H8.704l1.048-.943a.75.75 0 1 0-1.004-1.114l-2.5 2.25a.75.75 0 0 0 0 1.114l2.5 2.25a.75.75 0 1 0 1.004-1.114l-1.048-.943h9.546A.75.75 0 0 0 19 10Z"
              clip-rule="evenodd"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  </div>
</template>
