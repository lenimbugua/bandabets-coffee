<script setup>
// Prev / counter / Next for an AppCarousel; must be rendered inside the
// carousel's `controls` slot so inject() finds it.
import { inject } from "vue";

const carousel = inject("app-carousel", null);
if (!carousel) {
  throw new Error("CategoryPagination must be used inside <AppCarousel>");
}
</script>

<template>
  <div class="flex items-center justify-between pt-3">
    <button
      type="button"
      :disabled="carousel.isFirst"
      :class="carousel.isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:text-brand-bright/80'"
      class="flex items-center gap-0.5 text-xs font-medium text-brand-bright transition-colors"
      aria-label="Previous bet"
      @click="carousel.prev()"
    >
      <Icon name="tabler:chevron-left" class="w-4 h-4" />
      Prev
    </button>

    <span class="text-xs text-muted-foreground tabular-nums">
      {{ carousel.index + 1 }} / {{ carousel.count }}
    </span>

    <button
      type="button"
      :disabled="carousel.isLast"
      :class="carousel.isLast ? 'opacity-30 cursor-not-allowed' : 'hover:text-brand-bright/80'"
      class="flex items-center gap-0.5 text-xs font-medium text-brand-bright transition-colors"
      aria-label="Next bet"
      @click="carousel.next()"
    >
      Next
      <Icon name="tabler:chevron-right" class="w-4 h-4" />
    </button>
  </div>
</template>
