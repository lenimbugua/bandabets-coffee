<script setup>
// Ported from src/views/BetDetails.vue. Baseline route was a child of
// WithSibarAndBetslip (now app/layouts/default.vue) — layout left at its
// default here.
//
// fetchBetslip() below is called synchronously in setup, same as
// baseline. app/stores/bets.js reads token/profileSid from the persisted
// login store and can call openLoginModal on 401, mutating global modal
// state — unsafe under SSR. This page stays client-only (routeRules in
// nuxt.config.js), which keeps it inert. See plan §9 SSR hazards.
//
// The local `BetDetails` component import below shadows the
// auto-registered global of the same name — intentional, keep it explicit
// (do not delete expecting auto-import to resolve the same file).
import { storeToRefs } from "pinia";
import BetDetails from "@/components/BetDetails.vue";
import { useBetsStore } from "@/stores/bets";

definePageMeta({
  name: "bet-details",
  requiresAuth: true,
});

useSeoHead({
  title: "Bet Details | Bandabets Slip Info",
  description:
    "View full bet slip details, odds, and results instantly from your Bandabets account.",
  robots: "noindex,nofollow",
});

const { pending } = storeToRefs(useBetsStore());
const { fetchBetslip } = useBetsStore();
fetchBetslip();
</script>
<template>
  <div class="bet-details-page">
    <div class="bet-details-wrapper">
      <div class="page-header">
        <button aria-label="Go back" class="back-btn" @click="$router.go(-1)">
          <Icon name="tabler:chevron-left" class="w-4 h-4" aria-hidden="true" />
        </button>
        <h1 class="page-title">Bet Details</h1>
      </div>
      <BetsLoader v-if="pending" />
      <BetDetails v-else />
    </div>
  </div>
</template>

<style scoped>
.bet-details-page {
  background: oklch(100% 0 0);
}
[data-theme="dark"] .bet-details-page {
  background: transparent;
}

.bet-details-wrapper {
  border-radius: 0.75rem;
  border: 1px solid oklch(0% 0 0 / 0.1);
  background: oklch(100% 0 0);
  overflow: hidden;
}
[data-theme="dark"] .bet-details-wrapper {
  border-color: oklch(100% 0 0 / 0.06);
  background: oklch(100% 0 0 / 0.02);
}

.page-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 0.75rem;
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .page-header {
  border-bottom-color: oklch(100% 0 0 / 0.06);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: oklch(40% 0 0);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.back-btn:hover {
  background: oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .back-btn {
  color: oklch(100% 0 0 / 0.6);
}
[data-theme="dark"] .back-btn:hover {
  background: oklch(100% 0 0 / 0.06);
}

.page-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: oklch(15% 0 0);
}
[data-theme="dark"] .page-title {
  color: oklch(100% 0 0 / 0.9);
}
</style>
