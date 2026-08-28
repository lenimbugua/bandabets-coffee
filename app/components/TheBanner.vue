<script setup>
import { useBannerImage } from "@/composables/useBannerImage";
import { useDefaultSport } from "@/composables/useDefaultSport";
import { useRouter } from "vue-router";

// Round 3 (Lighthouse): the banner used Swiper, which put a 26 KB gzip chunk
// and ~1 s of main-thread work (init + forced reflow) on the home page's
// critical path. The carousel is now native CSS scroll-snap: the browser
// does the swiping, and the only JS is an 8 s autoplay tick and the
// desktop prev/next buttons. Differences from the Swiper version: no
// infinite loop (autoplay wraps to the first slide), and on mobile the
// peeking next slide stops at the container edge rather than the screen edge.
const { initDefaultSport } = useDefaultSport();
const router = useRouter();
const { bannerSources } = useBannerImage();

const AUTOPLAY_DELAY_MS = 8000;

// Same 1x1 transparent GIF used by NearViewportImage.vue — slides 2-8 render
// this instead of their real image until the IntersectionObserver below
// marks them loaded, so all 8 banners (≈235 KB) don't compete with the LCP
// image at page load.
const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const props = defineProps({
  sizes: {
    type: String,
    default: "(min-width: 1024px) min(1000px, calc(100vw - 664px)), 100vw",
  },
});

const items = [
  { name: "Starter Free Bet", image: "/banners/banda/starter-free-bet.jpg" },
  { name: "Kick Off Bonus", image: "/banners/banda/kick-off-bonus.jpg" },
  { name: "Kick Off Bonus terms", image: "/banners/banda/kick-off-bonus-terms.jpg" },
  { name: "We serve you more action", image: "/banners/banda/we-serve-you-more-action.jpg" },
  { name: "Promo menu", image: "/banners/banda/promo-menu.jpg" },
  { name: "Real-time scores", image: "/banners/banda/real-time-scores.jpg" },
  { name: "News that rides with you", image: "/banners/banda/news-that-rides-with-you.jpg" },
  { name: "Wherever you are", image: "/banners/banda/wherever-you-are.jpg" },
];

const first = bannerSources(items[0].image);
useHead({
  link: [
    {
      rel: "preload",
      as: "image",
      href: items[0].image,
      fetchpriority: "high",
      ...(first.srcset
        ? { imagesrcset: first.srcset, imagesizes: props.sizes, type: "image/webp" }
        : {}),
    },
  ],
});

const ROUTE_ALL_BANNERS_HOME = true;
function openBanner(item) {
  if (ROUTE_ALL_BANNERS_HOME) {
    router.push({ name: "home" });
    return;
  }
  if (item.to.name === "sports") {
    initDefaultSport(true);
  }
  router.push(item.to);
}

const track = ref(null);
let autoplayTimer = null;

// Index of the slide currently snapped at the start edge.
function currentIndex() {
  const el = track.value;
  if (!el || !el.firstElementChild) return 0;
  const stride = el.firstElementChild.offsetWidth + gapPx(el);
  return stride > 0 ? Math.round(el.scrollLeft / stride) : 0;
}
function gapPx(el) {
  return parseFloat(getComputedStyle(el).columnGap) || 0;
}
function goTo(index, behavior = "smooth") {
  const el = track.value;
  if (!el || !el.firstElementChild) return;
  const count = items.length;
  const target = ((index % count) + count) % count;
  const stride = el.firstElementChild.offsetWidth + gapPx(el);
  el.scrollTo({ left: target * stride, behavior });
}
function slidePrev() {
  goTo(currentIndex() - 1);
}
function slideNext() {
  goTo(currentIndex() + 1);
}

function startAutoplay() {
  stopAutoplay();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  autoplayTimer = setInterval(slideNext, AUTOPLAY_DELAY_MS);
}
function stopAutoplay() {
  if (autoplayTimer) clearInterval(autoplayTimer);
  autoplayTimer = null;
}
function onVisibility() {
  document.hidden ? stopAutoplay() : startAutoplay();
}

// Slide 0 is always eager (SSR + preload). Slides 1-7 only get their real
// srcset/src once they enter the track's 200px margin — autoplay's
// slideNext() scrolls the track, so the observer fires on the *next* slide
// about one slide ahead of when it's shown, which is the intended prefetch.
const loaded = reactive(new Set([0]));
let slideObserver = null;

function observeSlides() {
  const el = track.value;
  if (!el) return;
  if (!("IntersectionObserver" in window)) {
    items.forEach((_, index) => loaded.add(index));
    return;
  }
  slideObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        loaded.add(Number(entry.target.dataset.index));
        slideObserver.unobserve(entry.target);
      }
    },
    { root: el, rootMargin: "0px 200px" }
  );
  el.querySelectorAll(".banner-slide").forEach((slide) => slideObserver.observe(slide));
}

onMounted(() => {
  startAutoplay();
  observeSlides();
  document.addEventListener("visibilitychange", onVisibility);
});
onBeforeUnmount(() => {
  stopAutoplay();
  slideObserver?.disconnect();
  slideObserver = null;
  document.removeEventListener("visibilitychange", onVisibility);
});
</script>

<template>
  <div class="w-full">
    <div class="relative w-full">
      <div
        ref="track"
        class="banner-track flex w-full gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide"
        role="region"
        aria-roledescription="carousel"
        aria-label="Promotions"
      >
        <div
          v-for="(item, index) in items"
          :key="item.image"
          class="banner-slide shrink-0 snap-start"
          role="group"
          :data-index="index"
          :aria-roledescription="'slide'"
          :aria-label="`${index + 1} of ${items.length}`"
        >
          <button
            type="button"
            class="relative block w-full aspect-[3/1] rounded-xl overflow-hidden group cursor-pointer ring-1 ring-gray-200/80 dark:ring-white/10"
            :aria-label="`${item.name} — open`"
            @click="openBanner(item)"
          >
            <picture>
              <source
                v-if="loaded.has(index) && bannerSources(item.image).srcset"
                type="image/webp"
                :srcset="bannerSources(item.image).srcset"
                :sizes="props.sizes"
              />
              <img
                :src="loaded.has(index) ? item.image : PLACEHOLDER"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                :alt="`${item.name} banner`"
                :loading="index === 0 ? 'eager' : 'lazy'"
                :fetchpriority="index === 0 ? 'high' : undefined"
                decoding="async"
              />
            </picture>
            <div
              class="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            ></div>
          </button>
        </div>
      </div>
      <button
        type="button"
        aria-label="Previous banner"
        class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full hidden lg:flex items-center justify-center bg-card/60 text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground hover:bg-card transition-all duration-200 backdrop-blur-sm"
        @click="slidePrev"
      >
        <Icon name="tabler:chevron-left" class="w-4 h-4" aria-hidden="true" />
      </button>
      <button
        type="button"
        aria-label="Next banner"
        class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full hidden lg:flex items-center justify-center bg-card/60 text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground hover:bg-card transition-all duration-200 backdrop-blur-sm"
        @click="slideNext"
      >
        <Icon name="tabler:chevron-right" class="w-4 h-4" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
/* One slide plus a 10 % peek of the next on small screens (Swiper's old
   slidesPerView: 1.1); exactly one slide from lg up. The gap-3 (12 px) on the
   track is the old spaceBetween: 12. */
.banner-slide {
  width: calc((100% - 0.75rem) / 1.1);
}
@media (min-width: 1024px) {
  .banner-slide {
    width: 100%;
  }
}
.banner-track {
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
}
</style>
