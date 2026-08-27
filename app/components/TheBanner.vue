<script setup>
import { useBannerImage } from "@/composables/useBannerImage";
import { useDefaultSport } from "@/composables/useDefaultSport";
import "swiper/css";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { ref } from "vue";
import { useRouter } from "vue-router";

// formCloudflareImage is no longer needed — the BANDA banners are local files.
// Restore `import formatStuff from "@/utilities/format-stuff"` with it if the
// Cloudflare-hosted slide set comes back.
const { initDefaultSport } = useDefaultSport();
const router = useRouter();
const { bannerSources } = useBannerImage();

const modules = [Autoplay];
const autoplayDelay = 8000;

// Default sizes assume DesktopSportsLayout.vue's flex row: the column
// itself caps at 2xl:max-w-[1000px], and below that it's whatever's left of
// the viewport after the fixed w-[16rem] sidebar (256px), the w-84 betslip
// panel (336px), two gap-5 (20px) gaps and px-4 (32px) padding — 256 + 336 +
// 40 + 32 = 664px. Pages that mount TheBanner in a different-width column
// (e.g. casino-home.vue, which has no sidebar/betslip) should pass their own
// `sizes` prop rather than relying on this default. Below lg
// (MobileSportsLayout.vue), the banner's wrapper is only offset by mx-3
// (24px) so it renders close to full viewport width — 100vw is used as a
// safe fallback there.
const props = defineProps({
  sizes: {
    type: String,
    default: "(min-width: 1024px) min(1000px, calc(100vw - 664px)), 100vw",
  },
});

// BANDA campaign artwork, served from /public. 3:1, so the frame below uses
// the same ratio and nothing gets cropped.
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

// TheBanner is the only carousel — DesktopSportsLayout.vue and
// MobileSportsLayout.vue both mount it, but the layouts that mount those are
// gated with v-if/v-else-if on useScreenSizes()'s breakpoints (see
// TheSports.vue, TheLanding.vue, app/layouts/default.vue), so only ONE
// TheBanner instance is ever mounted at a time. That makes this the single
// place to preload the first slide for whichever viewport actually renders.
const first = bannerSources(items[0].image);
useHead({
  link: [
    {
      rel: "preload",
      as: "image",
      href: items[0].image,
      fetchpriority: "high",
      // Only advertise a srcset/sizes/type when a webp variant actually
      // exists (see useBannerImage.js's .jpg guard) — otherwise the browser
      // would preload a webp URL that 404s instead of falling back to the
      // <img>'s plain jpg src.
      ...(first.srcset ? { imagesrcset: first.srcset, imagesizes: props.sizes, type: "image/webp" } : {}),
    },
  ],
});

// The BANDA banners are brand artwork with no live offers behind them yet, so
// every slide goes home. Flip this to false to restore per-banner routing —
// the old slide set and its targets are kept below for that.
const ROUTE_ALL_BANNERS_HOME = true;

// Previous Cloudflare-hosted slides. Disabled, not deleted: these are the
// image IDs and route targets to restore when the offers come back.
// const sportsbook = { name: "sports", params: { sport: "soccer" } };
// const legacyItems = [
//   { name: "One Cut", image: "ba71caf8-45e3-4dba-8563-2fd769e98800", to: sportsbook },
//   { name: "Welcome Bonus", image: "cdfc009d-fa81-4134-d165-3a1a0a463e00", to: sportsbook },
//   { name: "Daily Deposit Bonus", image: "47fad6b1-0048-4f18-90cd-100c01eba300", to: { name: "deposit" } },
//   { name: "Wagerless Rains", image: "c752f35f-37c3-42e8-03e1-11425ff4af00", to: { name: "playon" } },
//   { name: "Cashout", image: "1949af94-a569-4c2a-032f-005a5c0e9900", to: sportsbook },
//   { name: "Aviator Cashback", image: "3c60068d-b2cf-4ce2-0cab-4a65d691b700", to: { name: "aviator" } },
// ];

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

const swiperInstance = ref(null);

const onSwiperInit = (swiper) => {
  swiperInstance.value = swiper;
};

function slidePrev() {
  swiperInstance.value?.slidePrev();
}

function slideNext() {
  swiperInstance.value?.slideNext();
}
</script>

<template>
  <div class="w-full">
    <div class="relative w-full">
      <swiper
        :slides-per-group="1"
        :space-between="12"
        :breakpoints="{
          0: { slidesPerView: 1.1 },
          1024: { slidesPerView: 1 },
        }"
        :loop="true"
        :autoplay="{ delay: autoplayDelay, disableOnInteraction: false }"
        :navigation="false"
        :modules="modules"
        class="max-lg:overflow-visible!"
        @swiper="onSwiperInit"
      >
        <swiper-slide v-for="(item, index) in items" :key="item.image">
          <button
            type="button"
            class="relative block w-full aspect-[3/1] rounded-xl overflow-hidden group cursor-pointer ring-1 ring-gray-200/80 dark:ring-white/10"
            :aria-label="`${item.name} — open`"
            @click="openBanner(item)"
          >
            <picture>
              <source
                v-if="bannerSources(item.image).srcset"
                type="image/webp"
                :srcset="bannerSources(item.image).srcset"
                :sizes="props.sizes"
              />
              <img
                :src="item.image"
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
        </swiper-slide>
      </swiper>

      <!-- Subtle scroll-suggesting arrows -->
      <button
        type="button"
        aria-label="Previous banner"
        class="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full hidden lg:flex items-center justify-center bg-card/60 text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground hover:bg-card transition-all duration-200 backdrop-blur-sm"
        @click="slidePrev"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
          <path fill-rule="evenodd" d="M14.78 5.22a.75.75 0 0 1 0 1.06L9.06 12l5.72 5.72a.75.75 0 1 1-1.06 1.06l-6.25-6.25a.75.75 0 0 1 0-1.06l6.25-6.25a.75.75 0 0 1 1.06 0Z" clip-rule="evenodd" />
        </svg>
      </button>
      <button
        type="button"
        aria-label="Next banner"
        class="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full hidden lg:flex items-center justify-center bg-card/60 text-muted-foreground opacity-40 hover:opacity-100 hover:text-foreground hover:bg-card transition-all duration-200 backdrop-blur-sm"
        @click="slideNext"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-4 h-4" aria-hidden="true">
          <path fill-rule="evenodd" d="M9.22 5.22a.75.75 0 0 1 1.06 0l6.25 6.25a.75.75 0 0 1 0 1.06l-6.25 6.25a.75.75 0 1 1-1.06-1.06L14.94 12 9.22 6.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
        </svg>
      </button>
    </div>
  </div>
</template>
