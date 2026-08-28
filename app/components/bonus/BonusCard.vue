<script setup>
import { computed } from "vue";

const props = defineProps({
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: "KES" },
  expiryDate: { type: String, required: true },
  status: { type: String, required: true },
  icon: { type: String, required: true },
  iconAlt: { type: String, required: true },
  wagerMultiplier: { type: String, default: "" },
  wagerProgress: { type: Number, default: 0 },
  wagerTotal: { type: Number, default: 100 },
  redemptionSteps: { type: Array, required: true },
  eligibleGames: { type: Array, default: () => [] },
});

const progressPercent = computed(() =>
  Math.min((props.wagerProgress / props.wagerTotal) * 100, 100)
);

const statusColors = {
  active: "bg-primary/20 text-primary border-primary/30",
  expired: "bg-destructive/20 text-destructive border-destructive/30",
  claimed: "bg-success/20 text-success border-success/30",
};

const gameIconComponents = {
  "Premier League": "tabler:trophy",
  "La Liga": "tabler:trophy",
  "Champions League": "tabler:trophy",
  NBA: "tabler:trophy",
  NFL: "tabler:trophy",
  Aviator: "tabler:plane",
  JetX: "tabler:rocket",
  "Crash Games": "tabler:rocket",
  CS2: "tabler:swords",
  "Dota 2": "tabler:device-gamepad-2",
  "League of Legends": "tabler:device-gamepad-2",
  Valorant: "tabler:swords",
};
</script>

<template>
  <div
    class="bg-card rounded-xl border border-gray-200 dark:border-border overflow-hidden hover:border-primary/30 card-hover-lift shadow-md dark:shadow-none"
  >
    <div class="p-2.5">
      <!-- Header Row -->
      <div class="flex items-center gap-2.5 mb-2">
        <!-- Game Icon -->
        <div
          class="w-11 h-11 rounded-xl bg-secondary/10 dark:bg-secondary/50 border border-primary/20 flex items-center justify-center p-1 overflow-hidden shrink-0 ring-1 ring-primary/10"
        >
          <img
            :src="icon"
            :alt="iconAlt"
            class="w-full h-full object-cover rounded-lg"
          />
        </div>

        <!-- Title & Status -->
        <div class="flex-1 min-w-0">
          <div class="flex items-center justify-between gap-2">
            <h3 class="text-xs font-bold text-foreground truncate">
              {{ title }}
            </h3>
            <span
              :class="
                [
                  'text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0',
                  statusColors[status]
                ]
              "
            >
              {{ status.toUpperCase() }}
            </span>
          </div>
          <div class="flex items-center justify-between mt-0.5">
            <div class="flex items-baseline gap-0.5">
              <span class="text-lg font-bold text-foreground">{{
                amount.toFixed(0)
              }}</span>
              <span class="text-[11px] text-foreground/60 font-medium">{{
                currency
              }}</span>
            </div>
            <p class="text-[10px] text-foreground/70 font-medium flex items-center gap-0.5">
              <Icon name="tabler:clock" class="w-3 h-3" /> {{ expiryDate }}
            </p>
          </div>
        </div>
      </div>

      <!-- How to Redeem - Vertical Timeline -->
      <div class="bg-gray-50 dark:bg-secondary/30 rounded-lg p-3 mb-2 border border-gray-200/80 dark:border-border/50">
        <div class="flex items-center gap-1.5 mb-3">
          <Icon name="tabler:gift" class="w-3.5 h-3.5 text-primary" />
          <span class="text-[10px] font-bold text-foreground"
            >How to Redeem</span
          >
          <span class="text-[9px] text-muted-foreground ml-auto"
            >{{ redemptionSteps.length }} steps</span
          >
        </div>

        <!-- Vertical Timeline -->
        <div class="relative pl-4">
          <!-- Vertical Line -->
          <div
            class="absolute left-[7px] top-1 bottom-1 w-0.5 bg-linear-to-b from-primary via-primary/50 to-primary rounded-full"
          />

          <div class="space-y-2">
            <div
              v-for="(step, index) in redemptionSteps"
              :key="step.step"
              class="relative flex items-start gap-2"
            >
              <!-- Step Dot -->
              <div
                :class="
                  [
                    'absolute -left-4 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 z-10',
                    index === redemptionSteps.length - 1
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'bg-primary border-primary/50 text-primary-foreground'
                  ]
                "
              >
                {{ step.step }}
              </div>

              <!-- Step Text -->
              <p
                :class="
                  [
                    'text-[11px] leading-snug pt-0.5',
                    index === redemptionSteps.length - 1
                      ? 'text-primary font-semibold'
                      : 'text-foreground/70'
                  ]
                "
              >
                {{ step.description }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Row: Games + Progress + CTA -->
      <div class="flex items-center justify-between gap-2">
        <!-- Eligible Games -->
        <div class="flex items-center gap-1 flex-1 min-w-0 overflow-hidden">
          <span
            v-for="game in eligibleGames.slice(0, 3)"
            :key="game"
            class="text-[9px] text-foreground/80 bg-gray-100 dark:bg-secondary/80 border border-gray-200 dark:border-border rounded-full px-1.5 py-0.5 flex items-center gap-0.5 shrink-0"
          >
            <Icon
              :name="gameIconComponents[game] || 'tabler:device-gamepad-2'"
              class="w-2.5 h-2.5"
            />
            <span class="truncate max-w-[40px]">{{ game.split(" ")[0] }}</span>
          </span>
          <span
            v-if="eligibleGames.length > 3"
            class="text-[8px] text-muted-foreground"
          >
            +{{ eligibleGames.length - 3 }}
          </span>
        </div>

        <!-- Wagering Progress -->
        <div v-if="wagerMultiplier" class="flex items-center gap-1">
          <div class="w-14 h-1.5 bg-gray-200 dark:bg-secondary rounded-full overflow-hidden">
            <div
              class="h-full bg-success rounded-full animate-progress"
              :style="{ width: progressPercent + '%' }"
            />
          </div>
          <span class="text-[8px] text-primary font-semibold">{{ Math.round(progressPercent) }}%</span>
          <span class="text-[7px] text-muted-foreground">({{ wagerMultiplier }})</span>
        </div>

        <!-- CTA -->
        <button
          type="button"
          class="bg-bet text-bet-foreground text-xs font-bold px-3.5 py-1.5 rounded-full flex items-center gap-0.5 shadow-glow-gold shrink-0 cta-premium"
        >
          Claim Now <Icon name="tabler:chevron-right" class="w-3 h-3" />
        </button>
      </div>
    </div>
  </div>
</template>
