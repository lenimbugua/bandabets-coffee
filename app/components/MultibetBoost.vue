<script setup>
import { useMultibetBonus } from "@/composables/useMultibetBonus";
import { useBetslip } from "@/composables/useBetslip";
import { toRefs } from "vue";
import { useBetslipStore } from "../stores/sports-betslip";

const { calculatePossibleWin } = useBetslip();
const { betslip, stake } = toRefs(useBetslipStore());

const {
  getCurrentBoost,
  getNextBoost,
  getLegsToNextBonus,
  calculateBoostBonus,
} = useMultibetBonus();
</script>

<template>
  <div class="pb-1.5 -mx-1.5 px-1.5 border-b border-border/50">
    <div class="px-2.5 py-2 rounded-lg border border-gold-bright/20 bg-gold-bright/5">
      <!-- Boost info -->
      <div class="flex items-center gap-1.5">
        <Icon name="tabler:trending-up" class="w-3.5 h-3.5 text-gold-bright shrink-0" aria-hidden="true" />
        <span
          v-if="getCurrentBoost() > 0"
          class="text-xs font-bold text-gold-bright tabular-nums"
        >
          {{ getCurrentBoost() }}% Boost KSH {{ calculateBoostBonus(calculatePossibleWin(betslip, stake)).toFixed("2") }}
        </span>
      </div>

      <!-- Progress track -->
      <div class="mt-1.5 h-1 rounded-full bg-gold-bright/15 overflow-hidden">
        <div
          class="h-full rounded-full bg-gold-bright transition-all duration-300"
          :style="{ width: Math.min(getCurrentBoost() * 2, 100) + '%' }"
        ></div>
      </div>

      <!-- Sub text -->
      <div class="flex items-center gap-1 mt-1">
        <span class="text-[10px] text-muted-foreground">
          Add {{ getLegsToNextBonus() }} more to unlock <strong class="font-bold text-gold-bright">{{ getNextBoost() }}%</strong> boost
        </span>
        <span class="text-[10px] text-muted-foreground/40">&middot;</span>
        <span class="text-[10px] text-muted-foreground">Min 1.30 odds</span>
      </div>
    </div>
  </div>
</template>
