<script setup>
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { computed } from "vue";
import { useLoadCode } from "@/composables/useLoadCode";
import { useBetslip } from "@/composables/useBetslip";
import { useShareBetStore } from "@/stores/sharebet.js";
import BookedSelection from "./BookedSelection.vue";
import AppCarousel from "../ui/AppCarousel.vue";
import AppCarouselSlide from "../ui/AppCarouselSlide.vue";

const { setBookingCode } = useShareBetStore();

const props = defineProps({
  selections: { type: Array, required: true },
  bookingCode: { type: String, required: true },
});

const { shareBet } = useModalTypes();
const { openModal } = useModalStore();

function chunkArray(arr, size) {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
}

const { calculateTotalOdds } = useBetslip();
const totalOdds = calculateTotalOdds(props.selections);
const chunkSize = 2;
const chunkedItems = computed(() => chunkArray(props.selections, chunkSize));

const {
  loadCode,
  setIntention,
  loadSlipIsPending,
  isToLoadCode,
  setBookingCode: setBookingCodeComposable,
} = useLoadCode();

function addToBetslip() {
  setIntention(isToLoadCode);
  setBookingCodeComposable(props.bookingCode);
  setBookingCode(props.bookingCode);
  loadCode();
}

function openShare() {
  setBookingCode(props.bookingCode);
  openModal(shareBet);
}
</script>

<template>
  <div class="space-y-3">
    <div class="bg-accent/30 border border-border/50 rounded-lg px-3">
      <!-- Header: selections count + odds -->
      <div class="flex items-center justify-between py-2.5">
        <div class="flex items-center gap-1.5">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-brand-bright text-[10px] font-bold text-primary-foreground tabular-nums">
            {{ selections.length }}
          </span>
          <span class="text-xs text-muted-foreground">Selections</span>
        </div>
        <div class="flex items-center gap-1.5">
          <span class="text-xs text-muted-foreground">Odds</span>
          <span class="text-sm font-bold text-brand-bright tabular-nums">
            {{ totalOdds }}
          </span>
        </div>
      </div>

      <!-- Selections carousel -->
      <AppCarousel :count="chunkedItems.length" aria-label="Selections">
        <AppCarouselSlide v-for="(pair, index) in chunkedItems" :key="index">
          <div
            class="bg-card cursor-pointer rounded-lg p-2.5 pb-4 space-y-2 border border-border/30"
            @click="addToBetslip"
          >
            <BookedSelection
              v-for="(item, index2) in pair"
              :key="index2"
              :selection="item"
              :index="index * chunkSize + index2"
            />
          </div>
        </AppCarouselSlide>
        <template #controls="{ index: active, count, isFirst, isLast, prev, next, goTo }">
          <template v-if="count > 1">
            <button
              type="button"
              class="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 rounded-full bg-card/90 border border-border p-1 text-foreground hover:text-brand-bright disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="isFirst"
              aria-label="Previous selections"
              @click="prev()"
            >
              <Icon name="tabler:chevron-left" class="w-4 h-4" />
            </button>
            <button
              type="button"
              class="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 rounded-full bg-card/90 border border-border p-1 text-foreground hover:text-brand-bright disabled:opacity-30 disabled:cursor-not-allowed"
              :disabled="isLast"
              aria-label="Next selections"
              @click="next()"
            >
              <Icon name="tabler:chevron-right" class="w-4 h-4" />
            </button>
            <div class="flex justify-center gap-1.5 pt-2">
              <button
                v-for="i in count"
                :key="i"
                type="button"
                class="h-1.5 rounded-full transition-all"
                :class="i - 1 === active ? 'w-4 bg-brand-bright' : 'w-1.5 bg-muted-foreground/40 hover:bg-muted-foreground'"
                :aria-label="`Go to selections ${i} of ${count}`"
                :aria-current="i - 1 === active ? 'true' : undefined"
                @click="goTo(i - 1)"
              ></button>
            </div>
          </template>
        </template>
      </AppCarousel>

      <!-- Actions: Share + Add -->
      <div class="flex items-center justify-between py-2.5">
        <button
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-brand-bright/30 text-brand-bright text-xs font-semibold hover:bg-brand-bright/10 transition-colors"
          @click="openShare"
        >
          <Icon name="tabler:share" class="w-3.5 h-3.5" />
          Share
        </button>
        <button
          class="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-brand-bright text-primary-foreground text-xs font-bold hover:bg-brand-bright/90 transition-colors"
          @click="addToBetslip"
        >
          <TheButtonSpin v-if="loadSlipIsPending" />
          <template v-else>
            <Icon name="tabler:plus" class="w-3.5 h-3.5" />
            Add
          </template>
        </button>
      </div>
    </div>
  </div>
</template>
