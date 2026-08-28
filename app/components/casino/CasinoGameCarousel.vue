<script setup>
import { ref } from "vue";
import CasinoGameCard from "./CasinoGameCard.vue";

defineProps({
  title: { type: String, required: true },
  games: { type: Array, required: true },
  icon: { type: String, default: "" },
});

defineEmits(["play", "see-all"]);

const scrollContainer = ref(null);

function scrollLeft() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: -600, behavior: "smooth" });
  }
}

function scrollRight() {
  if (scrollContainer.value) {
    scrollContainer.value.scrollBy({ left: 600, behavior: "smooth" });
  }
}
</script>

<template>
  <section v-if="games.length > 0" class="mb-3 sm:mb-6">
    <!-- Section header -->
    <div class="flex items-center justify-between mb-2 sm:mb-3 px-1">
      <h2 class="text-foreground text-sm sm:text-base font-bold">{{ title }}</h2>
      <div class="flex items-center gap-2">
        <!-- Scroll arrows (desktop) -->
        <button
          aria-label="Scroll left"
          class="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
          @click="scrollLeft"
        >
          <Icon name="tabler:chevron-left" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <button
          aria-label="Scroll right"
          class="hidden md:flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors"
          @click="scrollRight"
        >
          <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
        </button>
        <!-- More > link -->
        <button
          class="text-gray-400 dark:text-gray-500 hover:text-primary text-xs font-medium transition-colors whitespace-nowrap cursor-pointer"
          @click="$emit('see-all')"
        >
          More &gt;
        </button>
      </div>
    </div>

    <!-- Horizontal scroll row -->
    <div
      ref="scrollContainer"
      class="flex space-x-2 sm:space-x-3 overflow-x-auto scrollbar-hide pb-1 sm:pb-2 scroll-smooth"
    >
      <CasinoGameCard
        v-for="game in games"
        :key="game.id"
        :game="game"
        @play="$emit('play', $event)"
      />
    </div>
  </section>
</template>
