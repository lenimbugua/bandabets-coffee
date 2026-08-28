<script setup>
import { useLoadCode } from "../composables/useLoadCode";
import TheButtonSpin from "./TheButtonSpin.vue";

const {
  loadCode,
  setIntention,
  loadSlipIsPending,
  isToLoadCode,
  bookingCode,
} = useLoadCode();

function isValidBookingCode(code) {
  return code.length === 8;
}
</script>

<template>
  <form class="px-4 pt-4 pb-3" @submit.prevent="loadCode">
    <label
      for="bookingCode"
      class="block text-xs font-semibold text-muted-foreground mb-2"
    >
      Have a booking code?
    </label>
    <div class="flex gap-2">
      <input
        id="bookingCode"
        v-model="bookingCode"
        required
        type="text"
        placeholder="Enter 8-digit code"
        class="flex-1 min-w-0 text-sm text-foreground bg-input rounded-lg px-3 py-2 border border-border placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors"
      />
      <button
        type="submit"
        :class="[
          isValidBookingCode(bookingCode)
            ? 'bg-foreground/90 text-background hover:bg-foreground/80 cursor-pointer'
            : 'bg-muted text-muted-foreground/30 cursor-not-allowed',
        ]"
        class="shrink-0 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold transition-colors duration-150"
        @click="setIntention(isToLoadCode)"
      >
        <TheButtonSpin v-if="loadSlipIsPending" />
        <template v-else>
          <Icon name="tabler:download" class="w-3.5 h-3.5" aria-hidden="true" />
          Load
        </template>
      </button>
    </div>
  </form>
</template>
