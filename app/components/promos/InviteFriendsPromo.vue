<script setup>
import { RouterLink } from "vue-router";

const steps = [
  {
    num: 1,
    title: "Share Your Link",
    desc: "Share your unique referral link with friends via WhatsApp, Telegram, Facebook, X, or copy link.",
  },
  {
    num: 2,
    title: "Friend Signs Up",
    desc: "Your friend registers on Bandabets and deposits KSH 49 or more.",
  },
  {
    num: 3,
    title: "They Play Aviator",
    desc: "They play at least 3 Aviator rounds with a 1.5x multiplier and a total stake of KSH 49 or more.",
  },
  {
    num: 4,
    title: "You Get Rewarded!",
    desc: "Boom! You receive a KSH 100 Aviator Free Bet instantly.",
  },
];

const shareChannels = [
  { name: "WhatsApp", icon: "💬", color: "bg-primary/10 text-primary" },
  { name: "Telegram", icon: "✈️", color: "bg-blue-500/10 text-blue-600 dark:text-blue-400" },
  { name: "Facebook", icon: "📘", color: "bg-blue-600/10 text-blue-700 dark:text-blue-400" },
  { name: "X / Twitter", icon: "🐦", color: "bg-gray-500/10 text-foreground" },
  { name: "Copy Link", icon: "🔗", color: "bg-brand-bright/10 text-brand-bright" },
];
</script>

<template>
  <div class="max-w-6xl mx-auto py-6 space-y-6">
    <!-- Hero section -->
    <div class="relative bg-card rounded-xl overflow-hidden border border-border/30">
      <div class="relative px-5 pt-6 pb-5 bg-gradient-to-br from-gold-bright/10 via-gold-bright/5 to-transparent dark:from-gold-bright/15 dark:via-gold-bright/5 dark:to-transparent">
        <div class="absolute top-0 right-0 w-40 h-40 bg-gold-bright/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        <div class="relative">
          <div class="inline-flex items-center gap-1.5 rounded-full bg-gold-bright/10 dark:bg-gold-bright/15 px-3 py-1 mb-3">
            <span class="text-sm">🎁</span>
            <span class="text-[11px] font-bold text-gold-bright uppercase tracking-wider">Refer & Earn</span>
          </div>
          <h1 class="text-2xl font-bold text-foreground leading-tight">
            Invite Friends & Earn KSH 100 Free Bet
          </h1>
          <p class="text-sm text-muted-foreground mt-2 leading-relaxed max-w-md">
            Get a <span class="font-bold text-gold-bright">KSH 100 Aviator Free Bet</span> for every friend you invite. No limits — the more friends, the more free bets!
          </p>
        </div>
      </div>

      <!-- Reward highlight strip -->
      <div class="flex items-center justify-center gap-3 px-5 py-3.5 bg-brand-bright/5 dark:bg-brand-bright/8 border-t border-border/20">
        <div class="text-center">
          <p class="text-2xl font-bold text-brand-bright tabular-nums">KSH 100</p>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Free Bet Per Referral</p>
        </div>
        <div class="w-px h-8 bg-border/30"></div>
        <div class="text-center">
          <p class="text-2xl font-bold text-foreground">♾️</p>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">No Limit</p>
        </div>
        <div class="w-px h-8 bg-border/30"></div>
        <div class="text-center">
          <p class="text-2xl font-bold text-foreground">⚡</p>
          <p class="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Instant Reward</p>
        </div>
      </div>
    </div>

    <!-- How it works -->
    <div class="bg-card rounded-xl border border-border/30 overflow-hidden">
      <div class="px-5 py-3.5 border-b border-border/30">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <span class="text-base">🎯</span>
          How It Works
        </h2>
      </div>
      <div class="p-5">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div
            v-for="step in steps"
            :key="step.num"
            class="flex gap-3.5 p-3.5 rounded-xl bg-background border border-border/20"
          >
            <div class="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-bright/10 dark:bg-brand-bright/15 text-brand-bright font-bold text-base shrink-0">
              {{ step.num }}
            </div>
            <div>
              <p class="text-sm font-semibold text-foreground">{{ step.title }}</p>
              <p class="text-xs text-muted-foreground mt-0.5 leading-relaxed">{{ step.desc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Share channels -->
    <div class="bg-card rounded-xl border border-border/30 overflow-hidden">
      <div class="px-5 py-3.5 border-b border-border/30">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <span class="text-base">📤</span>
          Share With Friends
        </h2>
        <p class="text-xs text-muted-foreground mt-0.5">Spread the word and start earning</p>
      </div>
      <div class="p-5">
        <div class="flex flex-wrap gap-2">
          <div
            v-for="channel in shareChannels"
            :key="channel.name"
            :class="[
              'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border/20 text-sm font-medium',
              channel.color,
            ]"
          >
            <span>{{ channel.icon }}</span>
            {{ channel.name }}
          </div>
        </div>
        <p class="text-xs text-muted-foreground mt-3">
          All sharing options are available on the <span class="font-medium text-foreground">Invite Friends</span> page after you log in.
        </p>
      </div>
    </div>

    <!-- Dashboard preview -->
    <div class="bg-card rounded-xl border border-border/30 overflow-hidden">
      <div class="px-5 py-3.5 border-b border-border/30">
        <h2 class="text-sm font-bold text-foreground flex items-center gap-2">
          <span class="text-base">📊</span>
          Your Dashboard
        </h2>
      </div>
      <div class="p-5">
        <div class="flex flex-col items-center justify-center py-6 text-center bg-background rounded-xl border border-border/20">
          <div class="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <Icon name="tabler:users" class="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          </div>
          <p class="text-sm font-semibold text-foreground mb-1">Track Your Referrals</p>
          <p class="text-xs text-muted-foreground max-w-xs">
            See pending invites, successful referrals, and earned free bets — all from your Invite Friends dashboard.
          </p>
        </div>
      </div>
    </div>

    <!-- CTA -->
    <div class="text-center py-2">
      <RouterLink
        :to="{ name: 'aviator', query: { invite: '1' } }"
        class="inline-flex items-center gap-2 bg-brand-bright text-primary-foreground font-bold text-sm px-8 py-3 rounded-xl hover:bg-brand-bright/90 active:scale-[0.98] transition-all shadow-sm"
      >
        🎁 Start Inviting Friends
      </RouterLink>
    </div>
  </div>
</template>
