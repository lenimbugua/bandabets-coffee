<script setup>
import BandaLogo from "./logos/BandaLogo.vue";

// The splash is SSR-rendered and dismissed by CSS animation alone (see the
// style block): it fades out ~1 s after first paint whether or not the
// JavaScript bundle has arrived. onMounted merely removes the node once the
// animation is guaranteed to have finished, so it stops costing layout.
const SPLASH_TOTAL_MS = 1100;
const isVisible = ref(true);
onMounted(() => {
  setTimeout(() => {
    isVisible.value = false;
  }, SPLASH_TOTAL_MS);
});
</script>

<template>
  <div
    v-if="isVisible"
    class="splash fixed inset-0 z-9999 flex flex-col items-center justify-center bg-background pointer-events-none"
    role="status"
    aria-label="Bandabets is loading"
  >
    <BandaLogo class="splash-mark h-9 w-auto md:h-11" />
    <!-- A hairline that draws to full width, then holds. -->
    <span
      class="splash-rule mt-6 block h-px w-32 origin-left bg-primary md:w-40"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
/* Timeline (ms after first paint):
     0–450   mark settles in (ease-out-expo, no overshoot)
   120–570   rule draws left → right
   700–1100  whole overlay lifts and fades; visibility flips to hidden at the end
   The overlay never intercepts pointer events, so a fast tap on SSR content
   still works during the hold. */
.splash {
  animation: splash-out 400ms cubic-bezier(0.16, 1, 0.3, 1) 700ms forwards;
}
.splash-mark {
  opacity: 0;
  transform: translateY(6px) scale(0.985);
  animation: splash-mark-in 450ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
.splash-rule {
  transform: scaleX(0);
  opacity: 0.9;
  animation: splash-rule-in 450ms cubic-bezier(0.16, 1, 0.3, 1) 120ms forwards;
}
@keyframes splash-mark-in {
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
@keyframes splash-rule-in {
  to {
    transform: scaleX(1);
  }
}
@keyframes splash-out {
  to {
    opacity: 0;
    transform: scale(1.012);
    visibility: hidden;
  }
}

/* Reduced motion: keep the brand, drop the movement — mark and rule are
   present immediately and only a short fade-out remains. */
@media (prefers-reduced-motion: reduce) {
  .splash-mark,
  .splash-rule {
    opacity: 1;
    transform: none;
    animation: none;
  }
  .splash {
    animation: splash-out 200ms linear 500ms forwards;
  }
}
</style>
