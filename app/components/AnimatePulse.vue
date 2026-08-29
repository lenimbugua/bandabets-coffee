<script setup>
defineProps({
  rows: {
    type: Number,
    required: true,
  },
});
</script>
<template>
  <!--
    Loading placeholder for the match list. Its box model mirrors MatchTwo.vue
    exactly (1px border-b + px-2 py-2 wrapper + 24px competition row + 49.6px
    odds row) so a row measures the same ~90.6px as the card that replaces it;
    otherwise the list shrinks on load and Lighthouse scores it as CLS.
  -->
  <div class="w-full bg-white dark:bg-background">
    <div
      v-for="i in rows"
      :key="i"
      class="leading-none w-full border-b border-border"
    >
      <div class="w-full mx-auto px-2 py-2">
        <!-- Competition + time row: 16px tall content (h-4 sport icon in the card) + pb-2 -->
        <div class="flex items-center justify-between pb-2 h-6">
          <div class="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 rounded-md w-32 shimmer"></div>
          <div class="h-2 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 rounded-md w-20 shimmer" style="animation-delay: 0.1s;"></div>
        </div>

        <!-- Teams column + three odds buttons, like MatchTwo's second row -->
        <div class="flex justify-between items-center space-x-2 w-full">
          <div class="flex-col min-w-0 flex-1 space-y-1">
            <div class="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 rounded-md w-3/4 shimmer" style="animation-delay: 0.05s;"></div>
            <div class="h-3 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 rounded-md w-2/3 shimmer" style="animation-delay: 0.15s;"></div>
          </div>
          <div class="shrink-0 flex space-x-1 items-center">
            <!-- Each odds placeholder is TheButton's py-2.5 box with a label line + odds line inside (29.6px), i.e. 49.6px tall -->
            <div
              v-for="n in 3"
              :key="n"
              class="flex flex-col items-center py-2.5 px-2 min-w-[3.2rem] rounded-lg bg-gray-50 dark:bg-white/6"
            >
              <div class="h-2.5 w-4 mb-0.5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 rounded-md shimmer" :style="{ animationDelay: `${0.1 + n * 0.05}s` }"></div>
              <div class="h-[1.1rem] w-7 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 rounded-md shimmer" :style="{ animationDelay: `${0.15 + n * 0.05}s` }"></div>
            </div>
            <div class="px-1 flex">
              <div class="h-3 w-5 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 dark:from-white/8 dark:via-white/5 dark:to-white/8 rounded-md shimmer" style="animation-delay: 0.3s;"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes shimmer {
  0% {
    background-position: -1000px 0;
  }
  100% {
    background-position: 1000px 0;
  }
}

.shimmer {
  background-size: 1000px 100%;
  animation: shimmer 2s infinite;
}
</style>
