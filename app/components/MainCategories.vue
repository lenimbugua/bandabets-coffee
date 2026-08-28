<script setup>
import { useDefaultSport } from "@/composables/useDefaultSport";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useMainCategories } from "../composables/useMainCategories";
import { useLiveMatchesStore } from "../stores/live-matches";
import MainCategoryIcons from "./MainCategoryIcons.vue";

const scrollContainer = ref(null);

const smooth = ref(true);
const behavior = computed(() => (smooth.value ? "smooth" : "auto"));

const router = useRouter();

const { initDefaultSport } = useDefaultSport();
const { setResource, resetToDefaults } = useSportsQueryParamsStore();
const { getLiveMatches, emptyLiveMatches } = useLiveMatchesStore();

const scrollAmount = 300;
const canScrollLeft = ref(false);
const canScrollRight = ref(true);

// Native replacement for the two bits used from VueUse's useScroll(): `x`
// (drives the scroll position) and `arrivedState.right` (gates further
// scrolling once the rightmost edge is reached) — computed from the DOM
// directly at click time instead of a reactively-tracked pair of refs.
function scroll() {
  const el = scrollContainer.value;
  if (!el) return;
  const atRight = el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
  if (atRight) return;
  el.scrollTo({ left: el.scrollLeft + scrollAmount, behavior: behavior.value });
}

// const scrollRight = () => {
//   if (!scrollContainer.value) return;
//   if (!canScrollRight.value) return;
//   scrollContainer.value.scrollBy({
//     left: scrollAmount,
//     behavior: "smooth",
//   });
//   setTimeout(checkScrollPosition, 300);
// };

// console.log(scrollRight);

// const scrollLeft = () => {
//   scrollContainer.value.scrollBy({
//     left: -scrollAmount,
//     behavior: "smooth",
//   });
//   setTimeout(checkScrollPosition, 300);
// };

const checkScrollPosition = () => {
  if (!scrollContainer.value) return;

  canScrollLeft.value = scrollContainer.value.scrollLeft > 0;
  canScrollRight.value =
    scrollContainer.value.scrollLeft <
    scrollContainer.value.scrollWidth - scrollContainer.value.clientWidth;
};

onMounted(() => {
  checkScrollPosition();

  // Optional: Re-check on window resize
  window.addEventListener("resize", checkScrollPosition);
});

const casinoCategoryMap = {
  crash: "all",
  virtuals: "virtuals",
  "popular-games": "top",
};

async function goToLink(params) {
  if (params == "live") {
    emptyLiveMatches();
    resetToDefaults();
    setResource("live");
    getLiveMatches();
    router.push({ name: "live", params: { sport: "soccer" } });
    return;
  }

  if (params == "sport") {
    initDefaultSport(true);
    router.push({ name: "sports", params: { sport: "soccer" } });
    return;
  }
  if (casinoCategoryMap[params]) {
    router.push({ name: "casino-home", query: { category: casinoCategoryMap[params] } });
    return;
  }
  router.push({ name: params });
}

const { categories } = useMainCategories();
</script>
<template>
  <div
    class="flex relative items-center w-full justify-between max-w-screen py"
  >
    <!-- <div
      class="p-0.5 bg-gray-300 dark:bg-surface-active h-10 z-50 flex items-center left-0 md:hidden text-end shadow-l rounded-l-md border border-r-0 dark:border-border-darkest"
      @click="scrollLeft"
    >
      <button>
        <Icon
          name="tabler:chevron-left"
          :class="{ 'opacity-80': !canScrollLeft }"
          class="h-5 w-5 text-gray-950 dark:text-white"
        />
      </button>
    </div> -->
    <div
      ref="scrollContainer"
      class="scroll-container flex space-x-2 items-center w-full justify-between overflow-x-scroll scrollbar-hide"
    >
      <div
        v-for="category in categories"
        :key="category.name"
        role="button"
        :aria-label="'Navigate to ' + category.name"
        tabindex="0"
        :class="[category.bg]"
        class="cursor-pointer rounded-md shadow-sm px-1"
        @click="goToLink(category.path)"
      >
        <MainCategoryIcons :icon="category.name" />
      </div>
    </div>
    <button
      aria-label="Scroll categories right"
      class="p-0.5 h-10 flex items-center right-0 md:hidden text-end shadow-sm rounded-r-md border border-l-0 dark:border-border-darkest"
      @click="scroll"
    >
      <Icon
        name="tabler:chevron-right"
        :class="{ 'opacity-80': !canScrollRight }"
        class="h-5 w-5 text-gray-950 dark:text-white"
      />
    </button>
  </div>
</template>
