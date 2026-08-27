<script setup>
import { useRouter } from "vue-router";
import { useCasino } from "@/composables/useCasino";
import NearViewportImage from "@/components/casino/NearViewportImage.vue";

const props = defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
  games: { type: Array, required: true },
  badge: { type: String, default: "" }, // 'new' | 'rank' | ''
  viewAllRoute: {
    type: Object,
    default: () => ({ name: "casino-home" }),
  },
});

const router = useRouter();
const { launchCasino } = useCasino();

function routeNameFor(categoryName = "") {
  const lower = categoryName.toLowerCase();
  if (lower.includes("crash")) return "crash-games";
  if (lower.includes("virtual")) return "virtuals-games";
  return "casino";
}

function play(game) {
  launchCasino(game.id, game.gameName, routeNameFor(game.categoryName), game.providerName);
}

function viewAll() {
  router.push(props.viewAllRoute);
}
</script>

<template>
  <section v-if="games.length" class="mx-3 mt-3">
    <div class="rounded-xl bg-card border border-border-subtle p-3">
      <header class="flex items-center justify-between mb-2">
        <h2 class="text-sm font-extrabold text-foreground tracking-wide uppercase">
          {{ title }}
        </h2>
        <button
          type="button"
          class="shrink-0 inline-flex items-center gap-1 text-xs font-bold text-gold-bright hover:text-gold"
          @click="viewAll"
        >
          ALL
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="w-3.5 h-3.5">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </header>

      <p v-if="subtitle" class="mb-2 text-[11px] font-bold text-gold-bright tracking-wide">
        {{ subtitle }}
      </p>

      <div class="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1">
        <button
          v-for="(game, idx) in games"
          :key="game.id"
          type="button"
          class="shrink-0 w-20 sm:w-24 md:w-28 lg:w-32 rounded-lg overflow-hidden bg-surface-deepest border border-border-subtle text-left hover:shadow-md transition-shadow"
          @click="play(game)"
        >
          <div class="relative aspect-square overflow-hidden">
            <NearViewportImage
              :src="game.imgFullUrl"
              :alt="game.gameName"
              class="w-full h-full object-cover"
            />

            <span
              v-if="badge === 'new'"
              class="absolute top-1 left-1 sm:top-1.5 sm:left-1.5 inline-flex items-center px-1 sm:px-1.5 py-0.5 rounded-md bg-primary text-primary-foreground text-[9px] sm:text-[10px] font-extrabold tracking-wide"
            >
              #NEW
            </span>

            <span
              v-else-if="badge === 'rank'"
              class="absolute top-1.5 left-1.5 inline-flex items-center justify-center w-6 h-6 rounded-full bg-background/80 border border-border text-foreground text-xs font-extrabold"
            >
              {{ idx + 1 }}
            </span>
          </div>
        </button>
      </div>
    </div>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
