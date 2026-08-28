<script setup>
import formatStuff from "@/utilities/format-stuff";
import { storeToRefs } from "pinia";
import { useAffiliateStore } from "../../stores/affiliate";

const { formattedNumber } = formatStuff();
const { earnings } = storeToRefs(useAffiliateStore());

const getRankStyle = (rank) => {
  switch (rank) {
    case 1:
      return "text-gold-bright";
    case 2:
      return "text-slate-400 dark:text-slate-300";
    case 3:
      return "text-amber-700 dark:text-amber-600";
    default:
      return "text-muted-foreground";
  }
};

const getPodiumHeight = (rank) => {
  switch (rank) {
    case 1:
      return "h-16 md:h-24";
    case 2:
      return "h-12 md:h-18";
    case 3:
      return "h-10 md:h-14";
    default:
      return "h-8 md:h-12";
  }
};
</script>

<template>
  <div
    class="relative h-32 md:h-48 rounded-md overflow-hidden bg-linear-to-br from-gold-bright/5 via-transparent to-brand-bright/5 dark:from-gold-bright/10 dark:via-background dark:to-brand-bright/10"
  >
    <!-- Subtle decorative accents -->
    <div
      class="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-24 rounded-full bg-gold-bright/8 blur-3xl"
    ></div>

    <div class="relative z-10 flex flex-col h-full px-4 pt-2 md:pt-3">
      <h3 class="text-center text-sm md:text-lg font-bold text-gold-bright mb-2 md:mb-3">
        Top Earners
      </h3>

      <div class="flex justify-center items-end gap-3 md:gap-4 flex-1 pb-2">
        <div
          v-for="topEarner in earnings?.topEarners"
          :key="topEarner?.position"
          class="flex flex-col items-center"
        >
          <!-- Trophy icon -->
          <Icon
            name="tabler:trophy"
            :class="getRankStyle(topEarner.position)"
            class="w-8 h-8 md:w-12 md:h-12 mb-1"
            aria-hidden="true"
          />

          <!-- Podium bar -->
          <div
            :class="getPodiumHeight(topEarner.position)"
            class="w-14 md:w-20 rounded-t-lg bg-linear-to-t from-brand-bright/80 to-brand-bright/30 dark:from-brand-bright/60 dark:to-brand-bright/20 flex items-end justify-center pb-1"
          >
            <span class="text-[10px] md:text-xs font-bold text-foreground tabular-nums">
              {{ formattedNumber(topEarner?.amount) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
