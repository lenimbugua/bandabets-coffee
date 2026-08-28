<script setup>
import BetslipLoadCode from "./BetslipLoadCode.vue";
</script>

<template>
  <div class="flex flex-col flex-1 min-h-0">
    <div class="flex-1">
      <!-- Empty state -->
      <div class="flex flex-col items-center justify-center pt-10 pb-6 px-5">
        <div class="relative w-14 h-14 mb-4">
          <div class="absolute inset-0 rounded-full border-2 border-dashed border-border/50 animate-[spin_20s_linear_infinite]"></div>
          <div class="absolute inset-2 rounded-full bg-muted/50 flex items-center justify-center">
            <Icon name="tabler:plus" class="w-5 h-5 text-muted-foreground/30" aria-hidden="true" />
          </div>
        </div>

        <h3 class="text-sm font-bold text-foreground mb-1">
          No selections yet
        </h3>
        <p class="text-xs text-muted-foreground text-center leading-relaxed max-w-44">
          Tap any odds to start building your betslip
        </p>
      </div>

      <!-- Divider -->
      <div class="mx-4 border-t border-border/50"></div>

      <!-- Load code -->
      <BetslipLoadCode />
    </div>

    <!-- BetControls — always pinned at bottom -->
    <div class="shrink-0">
      <BetControls />
    </div>
  </div>
</template>
