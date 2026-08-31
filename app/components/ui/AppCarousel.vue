<script setup>
/**
 * AppCarousel — native replacement for Swiper (one slide per view, 30 px
 * gap, no infinite loop). The browser does the swiping via CSS scroll-snap
 * (see TheBanner.vue for the same technique); JS only tracks the active
 * index, drives prev/next/goTo, and runs an optional autoplay tick that
 * wraps to the first slide. Slides go in the default slot, each wrapped in
 * <AppCarouselSlide>. The `controls` slot (and inject("app-carousel"))
 * receive { index, count, isFirst, isLast, prev, next, goTo }.
 *
 * Keyboard: the track is focusable; ArrowLeft/ArrowRight move one slide.
 * Autoplay respects prefers-reduced-motion and pauses while the tab is
 * hidden. It is not paused on hover, matching Swiper's
 * `disableOnInteraction: false` behaviour the affiliate slider relied on.
 */
import { computed, onBeforeUnmount, onMounted, provide, reactive, ref, watch } from "vue";

const props = defineProps({
  count: { type: Number, required: true },
  /** Autoplay interval in ms; 0 disables autoplay. */
  autoplay: { type: Number, default: 0 },
  ariaLabel: { type: String, default: "Carousel" },
  /** Extra classes for the scrolling track (e.g. "h-full"). */
  trackClass: { type: String, default: "" },
});
const emit = defineEmits(["change"]);

const track = ref(null);
const index = ref(0);

function stride(el) {
  const first = el?.firstElementChild;
  if (!first) return 0;
  return first.offsetWidth + (parseFloat(getComputedStyle(el).columnGap) || 0);
}

function goTo(i, behavior = "smooth") {
  const el = track.value;
  if (!el || props.count < 1) return;
  const target = Math.min(Math.max(i, 0), props.count - 1);
  const s = stride(el);
  if (s > 0) el.scrollTo({ left: target * s, behavior });
}
function prev() {
  goTo(index.value - 1);
}
function next() {
  goTo(index.value + 1);
}
function autoplayNext() {
  goTo(index.value >= props.count - 1 ? 0 : index.value + 1);
}

let raf = null;
function onScroll() {
  if (raf) return;
  raf = requestAnimationFrame(() => {
    raf = null;
    const el = track.value;
    const s = stride(el);
    const i = s > 0 ? Math.round(el.scrollLeft / s) : 0;
    if (i !== index.value) {
      index.value = i;
      emit("change", i);
    }
  });
}

let timer = null;
function startAutoplay() {
  stopAutoplay();
  if (!props.autoplay || props.count < 2) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  timer = setInterval(autoplayNext, props.autoplay);
}
function stopAutoplay() {
  if (timer) clearInterval(timer);
  timer = null;
}
function onVisibility() {
  document.hidden ? stopAutoplay() : startAutoplay();
}

function onKeydown(e) {
  if (e.key === "ArrowRight") {
    e.preventDefault();
    next();
  } else if (e.key === "ArrowLeft") {
    e.preventDefault();
    prev();
  }
}

onMounted(() => {
  startAutoplay();
  document.addEventListener("visibilitychange", onVisibility);
});
onBeforeUnmount(() => {
  stopAutoplay();
  document.removeEventListener("visibilitychange", onVisibility);
  if (raf) cancelAnimationFrame(raf);
});
watch(
  () => props.count,
  (c) => {
    if (index.value > c - 1) goTo(Math.max(c - 1, 0), "auto");
    startAutoplay();
  }
);

const api = reactive({
  index,
  count: computed(() => props.count),
  isFirst: computed(() => index.value <= 0),
  isLast: computed(() => index.value >= props.count - 1),
  prev,
  next,
  goTo,
});
provide("app-carousel", api);
defineExpose(api);
</script>

<template>
  <div
    class="relative"
    role="region"
    :aria-label="ariaLabel"
    aria-roledescription="carousel"
    @keydown="onKeydown"
  >
    <div
      ref="track"
      class="app-carousel-track"
      :class="trackClass"
      tabindex="0"
      @scroll.passive="onScroll"
    >
      <slot />
    </div>
    <slot name="controls" v-bind="api" />
  </div>
</template>
