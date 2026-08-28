<script setup>
import coinsReward from "@/assets/bonus/coins-reward.png"
import aviatorReward from "@/assets/bonus/aviator-reward.png"
import diamondReward from "@/assets/bonus/diamond-reward.png"
import slotsReward from "@/assets/bonus/slots-reward.png"
import spinWheelReward from "@/assets/bonus/spin-wheel-reward.png"
import crownReward from "@/assets/bonus/crown-reward.png"

const weeklyRewards = [
  { day: 1, reward: "10", image: coinsReward, claimed: true, current: false, locked: false },
  { day: 2, reward: "1 Free", image: aviatorReward, claimed: true, current: false, locked: false },
  { day: 3, reward: "25", image: diamondReward, claimed: false, current: true, locked: false },
  { day: 4, reward: "2 Free", image: slotsReward, claimed: false, current: false, locked: true },
  { day: 5, reward: "50", image: coinsReward, claimed: false, current: false, locked: true },
  { day: 6, reward: "5 Spins", image: spinWheelReward, claimed: false, current: false, locked: true },
  { day: 7, reward: "100", image: crownReward, claimed: false, current: false, locked: true },
]

const currentStreak = 3
const todayReward = weeklyRewards.find((r) => r.current)
</script>

<template>
  <div class="bg-card rounded-xl border border-gray-200 dark:border-border p-2.5 shadow-md dark:shadow-none">
    <!-- Header Row -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-1.5">
        <Icon name="tabler:gift" class="w-4 h-4 text-accent" />
        <span class="text-[11px] font-bold text-foreground">Daily Rewards</span>
      </div>
      <div class="flex items-center gap-1 bg-primary/10 dark:bg-primary/20 text-primary text-[9px] font-bold px-1.5 py-0.5 rounded-full">
        <Icon name="tabler:flame" class="w-2.5 h-2.5" />
        <span>{{ currentStreak }} Day Streak</span>
      </div>
    </div>

    <!-- Days Row - Compact -->
    <div class="flex gap-1 md:gap-2 mb-2">
      <div
        v-for="day in weeklyRewards"
        :key="day.day"
        :class="[
          'flex-1 flex flex-col items-center p-1 rounded-lg border transition-all hover:scale-[1.04] cursor-pointer',
          day.claimed && 'bg-primary/5 dark:bg-primary/10 border-primary/20 dark:border-primary/30',
          day.current && 'bg-accent/10 dark:bg-accent/20 border-accent shadow-glow-gold',
          day.locked && 'bg-gray-50 dark:bg-secondary/30 border-gray-200 dark:border-border opacity-60'
        ]"
      >
        <!-- Day Label -->
        <span :class="[
          'text-[8px] font-semibold mb-0.5',
          day.current ? 'text-accent' : 'text-muted-foreground'
        ]">
          D{{ day.day }}
        </span>

        <!-- Day Image -->
        <div :class="[
          'w-7 h-7 md:w-10 md:h-10 rounded-md overflow-hidden mb-0.5',
          day.locked && 'grayscale opacity-50'
        ]">
          <div v-if="day.claimed" class="w-full h-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
            <Icon name="tabler:check" class="w-3.5 h-3.5 text-primary" />
          </div>
          <div v-else-if="day.locked" class="relative w-full h-full">
            <img :src="day.image" :alt="`Day ${day.day} reward`" class="w-full h-full object-cover blur-[1px]" />
            <Icon name="tabler:lock" class="absolute inset-0 m-auto w-3 h-3 text-muted-foreground" />
          </div>
          <img
            v-else
            :src="day.image"
            :alt="`Day ${day.day} reward`"
            :class="[
              'w-full h-full object-cover',
              day.current && 'ring-2 ring-accent/50'
            ]"
          />
        </div>

        <!-- Reward -->
        <span :class="[
          'text-[9px] font-bold leading-tight text-center',
          day.current ? 'text-accent' : 'text-foreground/80'
        ]">
          {{ day.reward }}
        </span>
      </div>
    </div>

    <!-- Claim Button - Compact -->
    <button
      v-if="todayReward && !todayReward.claimed"
      type="button"
      class="w-full bg-bet text-bet-foreground text-xs font-bold py-2 rounded-lg shadow-glow-gold flex items-center justify-center gap-1 cta-premium"
    >
      <Icon name="tabler:gift" class="w-3.5 h-3.5" />
      Claim Day {{ todayReward.day }}: {{ todayReward.reward }} KES
    </button>
  </div>
</template>
