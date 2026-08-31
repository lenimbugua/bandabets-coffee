<script setup>
import { onMounted, ref } from "vue";
import AppCarousel from "../ui/AppCarousel.vue";
import AppCarouselSlide from "../ui/AppCarouselSlide.vue";
import TopEarners from "./TopEarners.vue";

const autoplayDelay = 10000;

const loaderStyle = ref({
  width: "0%",
  transition: "none",
});

const startLoader = () => {
  loaderStyle.value = { width: "0%", transition: "none" };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      loaderStyle.value = {
        width: "100%",
        transition: `width ${autoplayDelay}ms linear`,
      };
    });
  });
};

onMounted(() => {
  startLoader();
});
</script>

<template>
  <div class="w-full overflow-hidden mb-4">
    <div class="relative w-full h-32 md:h-48 rounded-xl overflow-hidden bg-card">
      <AppCarousel
        :count="2"
        :autoplay="autoplayDelay"
        aria-label="Affiliate highlights"
        class="h-full"
        track-class="h-full"
        @change="startLoader"
      >
        <AppCarouselSlide class="h-full">
          <AffiliateCall />
        </AppCarouselSlide>
        <AppCarouselSlide class="h-full">
          <TopEarners />
        </AppCarouselSlide>
      </AppCarousel>

      <!-- Progress bar -->
      <div class="absolute z-10 bottom-0 w-full">
        <div class="h-0.5 bg-border/30">
          <div
            class="h-full bg-brand-bright"
            :style="loaderStyle"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>
