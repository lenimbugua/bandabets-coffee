<template>
  <!--
    Loading placeholder shaped like the match-details page itself (hero card,
    tab pills, market filter bar, market cards) so the layout that appears is
    the layout that loads — AnimatePulse mirrors the match LIST rows and made
    the page morph on arrival.
  -->
  <div aria-hidden="true">
    <!-- Hero card (mirrors MatchDetailsMatch) -->
    <div class="skeleton-card mx-3 mt-3 rounded-2xl overflow-hidden">
      <!-- Competition badge bar -->
      <div class="flex items-center gap-2 px-4 py-3 bg-gray-50/80 dark:bg-white/[0.03]">
        <div class="skeleton-tone h-2 w-16 rounded-md shimmer"></div>
        <div class="skeleton-tone h-2 w-28 rounded-md shimmer" style="animation-delay: 0.1s"></div>
      </div>

      <!-- Teams + score -->
      <div class="flex items-center justify-center px-4 py-5">
        <div class="flex-1 flex flex-col items-center gap-2.5">
          <div class="skeleton-tone w-14 h-14 rounded-2xl shimmer"></div>
          <div class="skeleton-tone h-2.5 w-20 rounded-md shimmer" style="animation-delay: 0.05s"></div>
        </div>
        <div class="flex flex-col items-center gap-2 px-4 shrink-0">
          <div class="skeleton-tone h-12 w-24 rounded-xl shimmer" style="animation-delay: 0.1s"></div>
          <div class="skeleton-tone h-4 w-16 rounded-full shimmer" style="animation-delay: 0.2s"></div>
        </div>
        <div class="flex-1 flex flex-col items-center gap-2.5">
          <div class="skeleton-tone w-14 h-14 rounded-2xl shimmer" style="animation-delay: 0.15s"></div>
          <div class="skeleton-tone h-2.5 w-20 rounded-md shimmer" style="animation-delay: 0.2s"></div>
        </div>
      </div>

      <!-- Grass strip -->
      <div class="h-8 bg-gray-100/60 dark:bg-white/[0.02]"></div>
    </div>

    <!-- Tab pills -->
    <div class="flex gap-2 mx-3 mt-4 mb-3">
      <div
        v-for="n in 2"
        :key="'tab-' + n"
        class="skeleton-tone h-8 w-24 rounded-xl shimmer"
        :style="{ animationDelay: `${n * 0.08}s` }"
      ></div>
    </div>

    <!-- Market filter pills -->
    <div class="mx-3 mb-3 rounded-xl skeleton-card">
      <div class="flex gap-1.5 px-3 py-2.5 overflow-hidden">
        <div
          v-for="n in 5"
          :key="'pill-' + n"
          class="skeleton-tone h-7 rounded-lg shrink-0 shimmer"
          :class="n === 1 ? 'w-12' : 'w-20'"
          :style="{ animationDelay: `${n * 0.06}s` }"
        ></div>
      </div>
    </div>

    <!-- Market cards -->
    <div class="space-y-2 px-3 pb-4">
      <div
        v-for="n in 5"
        :key="'market-' + n"
        class="skeleton-card rounded-xl overflow-hidden"
      >
        <div class="flex items-center justify-between px-3 py-2.5">
          <div
            class="skeleton-tone h-2 rounded-md shimmer"
            :class="n % 2 === 0 ? 'w-32' : 'w-24'"
            :style="{ animationDelay: `${n * 0.07}s` }"
          ></div>
          <div class="skeleton-tone h-2 w-3 rounded-md shimmer"></div>
        </div>
        <div class="grid grid-cols-3 gap-1.5 px-3 pb-3 pt-1">
          <div
            v-for="c in 3"
            :key="'cell-' + c"
            class="flex flex-col items-center gap-1 py-2.5 rounded-lg bg-gray-50 dark:bg-white/6"
          >
            <div class="skeleton-tone h-2 w-8 rounded-md shimmer" :style="{ animationDelay: `${(n + c) * 0.05}s` }"></div>
            <div class="skeleton-tone h-3.5 w-10 rounded-md shimmer" :style="{ animationDelay: `${(n + c) * 0.07}s` }"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-card {
  background: white;
  box-shadow: 0 1px 2px oklch(0% 0 0 / 0.03);
}
[data-theme="dark"] .skeleton-card {
  background: var(--card);
  box-shadow: none;
}

.skeleton-tone {
  background: linear-gradient(
    to right,
    var(--color-gray-200),
    var(--color-gray-100),
    var(--color-gray-200)
  );
}
[data-theme="dark"] .skeleton-tone {
  background: linear-gradient(
    to right,
    oklch(100% 0 0 / 0.08),
    oklch(100% 0 0 / 0.05),
    oklch(100% 0 0 / 0.08)
  );
}

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
