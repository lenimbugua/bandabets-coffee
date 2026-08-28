<script setup>
import SportsBetslip from "./SportsBetslip.vue";
import { RouterLink } from "vue-router";
import { storeToRefs } from "pinia";
import { useBetslipStore } from "../stores/sports-betslip.js";

const { betslipLength } = storeToRefs(useBetslipStore());
const { clearBetslip } = useBetslipStore();
</script>

<template>
  <div class="relative w-84 h-full">
    <div class="w-full sticky top-14 h-[calc(100vh-4rem)] flex flex-col rounded-xl bg-card border border-border/50 overflow-hidden" data-fly-target="betslip">
      <!-- Header -->
      <div class="flex items-center justify-between px-3 py-2.5 border-b border-border/50">
        <span class="flex items-center gap-1.5 text-sm font-bold text-foreground">
          Betslip
          <span
            v-if="betslipLength > 0"
            class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[10px] font-bold text-primary-foreground bg-brand-bright rounded-full tabular-nums"
          >
            {{ betslipLength }}
          </span>
        </span>
        <div class="flex items-center gap-3">
          <button
            v-if="betslipLength > 0"
            class="text-xs font-semibold text-muted-foreground/50 hover:text-red-500 transition-colors cursor-pointer"
            @click="clearBetslip"
          >
            Clear All
          </button>
          <RouterLink
            :to="{ name: 'my-bets' }"
            class="flex items-center gap-0.5 text-xs font-semibold text-brand-bright hover:text-brand-bright/80 transition-colors"
          >
            My Bets
            <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
          </RouterLink>
        </div>
      </div>

      <!-- Content -->
      <div class="flex-1 flex flex-col min-h-0">
        <SportsBetslip />
      </div>
    </div>
  </div>
</template>
