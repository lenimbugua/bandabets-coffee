<script setup>
// Ported from src/views/TheAviator.vue. Baseline route was top-level (not
// a child of WithSibarAndBetslip) -> layout: false. ssr:false + noindex
// come from routeRules in nuxt.config.js (plan §F.6): `referralUrl` below
// reads `window.location.origin` unguarded inside a computed, which would
// throw during SSR — safe only because ssr:false means this <script
// setup> never runs on the server (Nuxt's pageToClientOnly /
// ServerPlaceholder — see global constraint 6).
import ShareToSocials from "@/components/community-bets/ShareToSocials.vue";
import { useAviatorReferralStore } from "@/stores/aviator-referral";
// import { useLoginStore } from "@/stores/login"; // invite friend feature disabled
import { useClipboard } from "@/composables/useClipboard";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
// import { useRoute } from "vue-router"; // invite friend feature disabled

definePageMeta({
  name: "aviator",
  layout: false,
});

useSeoHead({
  title: "Play Aviator – Crash Game with Real Winnings | Bandabets",
  description:
    "Soar high with the Aviator crash game! Cash out before the plane flies away and win real money instantly.",
  robots: "noindex,nofollow",
});

// const route = useRoute(); // invite friend feature disabled
const showInvitePopover = ref(false);
const loading = ref(false);

// invite friend feature disabled
// const { isAuthenticated } = storeToRefs(useLoginStore());
// const { openLoginModal } = useLoginStore();

const affiliateStore = useAviatorReferralStore();
const { referralCode: promoCode, referralDetails } = storeToRefs(affiliateStore);
const { redeemBonus } = affiliateStore;
const { redeemPending } = storeToRefs(affiliateStore);

const affiliateText = "Your friend invited you to play Aviator on Bandabets!\nSign up, deposit, and get 5 Free Bets instantly.\nPlay Now";

const referralUrl = computed(() =>
  promoCode.value
    ? `${window.location.origin}/freebet?referralCode=${promoCode.value}`
    : ""
);

const { copy: copyLink, copied: linkCopied } = useClipboard({
  source: referralUrl,
});

// invite friend feature disabled
// const handleToggle = async () => {
//   if (!isAuthenticated.value) {
//     openLoginModal();
//     return;
//   }
//   showInvitePopover.value = !showInvitePopover.value;
//   if (!showInvitePopover.value) return;
//
//   loading.value = true;
//   try {
//     await fetchReferralCode();
//     await fetchReferralDetails();
//   } catch (e) {
//     // errors handled by store
//   } finally {
//     loading.value = false;
//   }
// };

const handleBackdropClick = () => {
  showInvitePopover.value = false;
};

onMounted(() => {
  // Invite friend feature disabled
  // if (route.query.invite === "1") {
  //   handleToggle();
  // }
});

const steps = [
  {
    icon: "tabler:user-plus",
    text: "Share your unique referral link with friends.",
  },
  {
    icon: "tabler:cash-banknote",
    text: "Your friend signs up and deposits KSH 49 or more.",
  },
  {
    icon: "tabler:device-mobile",
    text: "They play at least 3 Aviator rounds with a 1.5x multiplier and a total stake of KSH 49 or more.",
  },
  {
    icon: "tabler:gift",
    text: "Boom! You get a KSH 100 Aviator Free Bet instantly.",
  },
  {
    icon: "tabler:circle-check",
    text: "Click the Claim button that will popup inside aviator to redeem your free bet.",
  },
];
</script>

<template>
  <div class="aviator-shell">
    <h1 class="sr-only">Play Aviator – Crash Game | Bandabets</h1>

    <!-- Top nav bar -->
    <div class="sticky top-0 z-20">
      <CasinoHeader />
    </div>

    <!-- Aviator free bets promo bar (invite friend) — disabled -->
    <!--
    <div class="aviator-promo-wrap">
      <div class="aviator-promo-bar" @click="handleToggle">
        <div class="promo-inner">
          <Icon name="tabler:gift" class="promo-icon" />
          <span class="promo-text">Earn Ksh 100 Aviator Free Bets Instantly</span>
          <button class="promo-cta">INVITE NOW →</button>
        </div>
      </div>
    </div>
    -->

    <!-- Invite popover overlay -->
    <Transition name="popover">
      <div
        v-if="showInvitePopover"
        class="popover-overlay"
        @mousedown.self="handleBackdropClick"
      >
        <div class="popover-panel">
          <!-- Header -->
          <div class="popover-header">
            <div>
              <h3 class="popover-title">Invite Friends & Earn</h3>
              <p class="popover-subtitle">
                Get KSH 100 Free Bet for each friend
              </p>
            </div>
            <button class="popover-close" @click="showInvitePopover = false">
              <Icon name="tabler:x" class="w-5 h-5" />
            </button>
          </div>

          <div class="popover-body">
            <!-- ── Share via socials ── -->
            <div class="share-section">
              <label class="section-label">Share With Friends</label>
              <div class="share-socials-wrap">
                <ShareToSocials
                  :share-url="referralUrl"
                  :share-text="affiliateText"
                />
              </div>
            </div>

            <!-- ── Copy link ── -->
            <div class="copy-section">
              <label class="section-label">Your Referral Link</label>
              <div class="copy-input-wrap">
                <input
                  type="text"
                  readonly
                  :value="referralUrl"
                  class="copy-input"
                />
                <button class="copy-btn" @click="copyLink(referralUrl)">
                  <Icon
                    name="tabler:circle-check"
                    v-if="linkCopied"
                    class="w-4 h-4 text-success"
                  />
                  <span>{{ linkCopied ? "Copied!" : "Copy" }}</span>
                </button>
              </div>
            </div>

            <!-- ── How it works ── -->
            <div class="steps-section">
              <h4 class="steps-title">How It Works</h4>
              <ol class="steps-list">
                <li v-for="(step, i) in steps" :key="i" class="step-item">
                  <span class="step-number">{{ i + 1 }}</span>
                  <Icon :name="step.icon" class="step-icon" />
                  <span class="step-text">{{ step.text }}</span>
                </li>
              </ol>
            </div>

            <!-- ── Dashboard ── -->
            <div class="dashboard-section">
              <h4 class="section-label">Your Dashboard</h4>

              <div v-if="loading" class="dashboard-loading">
                <Icon name="tabler:refresh" class="w-5 h-5 animate-spin text-gold-bright" />
              </div>

              <div v-else-if="!referralDetails?.length" class="dashboard-empty">
                <Icon name="tabler:user-plus" class="w-8 h-8 text-white/15" />
                <p>Invite friends to see your stats here</p>
              </div>

              <template v-else>
                <!-- Referral table -->
                <div class="referral-table-wrap">
                  <div class="referral-table-header">
                    <span class="referral-table-title">Friends</span>
                    <span class="referral-table-live">● Live</span>
                  </div>
                  <table class="referral-table">
                    <thead>
                      <tr>
                        <th>Friend</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th class="text-right">Reward</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr
                        v-for="detail in referralDetails"
                        :key="detail.friend_profile_sid"
                      >
                        <td>
                          <div class="friend-name">{{ detail.first_name }}</div>
                          <div class="friend-msisdn">{{ detail.msisdn }}</div>
                        </td>
                        <td>
                          <span
                            :class="[
                              'status-badge',
                              detail.status === 'COMPLETED' &&
                                'status-badge--active',
                              detail.status === 'REGISTERED' &&
                                'status-badge--signed',
                            ]"
                          >
                            {{ detail.status === "COMPLETED" ? "Completed" : "Registered" }}
                          </span>
                        </td>
                        <td>
                          <div class="progress-bar-wrap">
                            <div class="progress-bar" :style="{ width: `${detail.percentage}%` }"></div>
                          </div>
                          <span class="progress-text">{{ Math.round(detail.percentage) }}%</span>
                        </td>
                        <td class="text-right">
                          <span
                            v-if="detail.bonus_claimed"
                            class="claim-btn claim-btn--claimed"
                          >
                            Claimed
                          </span>
                          <button
                            v-else-if="detail.status?.toUpperCase() === 'CLAIM'"
                            class="claim-btn"
                            :disabled="redeemPending"
                            @click="redeemBonus"
                          >
                            <Icon
                              name="tabler:refresh"
                              v-if="redeemPending"
                              class="w-3 h-3 animate-spin"
                            />
                            <span v-else>Claim</span>
                          </button>
                          <button
                            v-else
                            class="claim-btn claim-btn--disabled"
                            disabled
                            :title="`Friend must complete all steps before you can claim (${Math.round(detail.percentage)}% done)`"
                          >
                            Claim
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </template>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Game iframe area -->
    <div class="aviator-viewport">
      <AviatorIframe />
    </div>

    <!-- Bottom bar: toggle -->
    <div class="sticky bottom-0 z-20 aviator-footer">
      <div class="flex items-center justify-center h-12 max-w-[1680px] mx-auto">
        <CasinoToggle />
      </div>
    </div>

    <!-- SEO content -->
    <AviatorContent1 />
  </div>
</template>

<style scoped>
/* ── Shell layout ── */
.aviator-shell {
  height: var(--viewport-height, 100dvh);
  display: flex;
  flex-direction: column;
  background: var(--background);
  overflow: hidden;
}
.aviator-viewport {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.aviator-footer {
  background: var(--card);
  border-top: 1px solid var(--border);
}

/* ── Promo bar wrapper ── */
.aviator-promo-wrap {
  flex-shrink: 0;
  display: flex;
  justify-content: center;
  padding: 0;
}

.aviator-promo-bar {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 0;
  cursor: pointer;
  overflow: hidden;
  background: linear-gradient(90deg, color-mix(in oklch, var(--brand-forest) 60%, transparent), var(--card), color-mix(in oklch, var(--brand-forest) 60%, transparent));
  border-bottom: 1px solid var(--border);
  width: 100%;
  max-width: 1680px;
}

.promo-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  cursor: pointer;
  padding: 5px 12px;
}

.promo-icon {
  width: 14px;
  height: 14px;
  color: var(--primary);
  flex-shrink: 0;
  animation: promo-icon-bounce 1.5s ease-in-out infinite;
}

@keyframes promo-icon-bounce {
  0%, 100% { transform: translateY(0) rotate(0deg); }
  25% { transform: translateY(-2px) rotate(-6deg); }
  75% { transform: translateY(-1px) rotate(3deg); }
}

.promo-text {
  flex: 1;
  font-size: 0.65rem;
  font-weight: 600;
  color: oklch(100% 0 0 / 0.7);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.promo-cta {
  padding: 3px 8px;
  border-radius: 5px;
  background: oklch(100% 0 0 / 0.08);
  border: 1px solid oklch(100% 0 0 / 0.08);
  color: var(--primary);
  font-size: 0.55rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  cursor: pointer;
  white-space: nowrap;
  transition: all 0.15s;
}

.promo-cta:hover {
  background: oklch(100% 0 0 / 0.12);
  color: var(--brand-bright);
}


/* ── Popover overlay ── */
.popover-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 48px;
  background: oklch(0% 0 0 / 0.35);
  backdrop-filter: blur(4px);
}

/* ── Popover panel (mobile: centered card) ── */
.popover-panel {
  width: 100%;
  max-width: 380px;
  max-height: calc(100% - 64px);
  overflow-y: auto;
  border-radius: 16px;
  background: white;
  border: 1px solid oklch(0% 0 0 / 0.08);
  box-shadow: 0 24px 48px oklch(0% 0 0 / 0.15);
  margin: 0 12px;
}

/* ── Desktop: right-side drawer (full height, limited width) ── */
@media (min-width: 1024px) {
  .popover-overlay {
    align-items: stretch;
    justify-content: flex-end;
    padding: 0;
  }
  .popover-panel {
    max-width: 400px;
    width: 400px;
    height: 100%;
    max-height: none;
    border-radius: 0;
    margin: 0;
    border-left: 1px solid oklch(0% 0 0 / 0.08);
    box-shadow: -8px 0 32px oklch(0% 0 0 / 0.12);
  }
}

/* ── Popover header ── */
.popover-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 20px 20px 16px;
  background: linear-gradient(135deg, color-mix(in oklch, var(--gold) 10%, var(--card)), var(--muted));
  border-bottom: 1px solid var(--border);
  border-radius: 16px 16px 0 0;
}
.popover-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: var(--foreground);
}
.popover-subtitle {
  font-size: 0.75rem;
  color: var(--gold-deep);
  margin-top: 2px;
  font-weight: 500;
}
.popover-close {
  color: oklch(0% 0 0 / 0.4);
  cursor: pointer;
  padding: 4px;
  border-radius: 8px;
  background: none;
  border: none;
  transition: all 0.15s;
}
.popover-close:hover {
  color: oklch(0% 0 0 / 0.7);
  background: oklch(0% 0 0 / 0.05);
}

/* ── Body ── */
.popover-body {
  padding: 16px 20px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* ── Section label ── */
.section-label {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: oklch(0% 0 0 / 0.4);
}

/* ── Invite section ── */
.invite-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.invite-form {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.invite-input-wrap {
  display: flex;
  align-items: center;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
  transition: border-color 0.15s;
}
.invite-input-wrap:focus-within {
  border-color: var(--gold);
}
.invite-prefix {
  padding: 0 10px 0 12px;
  font-size: 0.8125rem;
  font-weight: 600;
  color: oklch(0% 0 0 / 0.45);
  white-space: nowrap;
}
.invite-input {
  flex: 1;
  min-width: 0;
  padding: 10px 0;
  font-size: 0.875rem;
  font-family: ui-monospace, monospace;
  background: transparent;
  border: none;
  outline: none;
  color: var(--foreground);
}
.invite-input::placeholder {
  color: oklch(0% 0 0 / 0.25);
}
.invite-send-btn {
  margin: 4px;
  padding: 6px 16px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 8px;
  background: linear-gradient(135deg, var(--gold-bright), var(--gold));
  color: var(--gold-foreground);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.invite-send-btn:hover {
  transform: scale(1.03);
}
.invite-send-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.invite-error {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.75rem;
  color: oklch(55% 0.2 25);
}

/* ── Share section ── */
.share-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.share-socials-wrap {
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 10px;
}

/* ── Copy link ── */
.copy-section {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.copy-input-wrap {
  display: flex;
  align-items: center;
  background: var(--muted);
  border: 1px solid var(--border);
  border-radius: 10px;
  overflow: hidden;
}
.copy-input {
  flex: 1;
  min-width: 0;
  padding: 9px 12px;
  font-size: 0.75rem;
  background: transparent;
  border: none;
  outline: none;
  color: oklch(0% 0 0 / 0.5);
  text-overflow: ellipsis;
}
.copy-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 4px;
  padding: 6px 12px;
  font-size: 0.75rem;
  font-weight: 700;
  border-radius: 8px;
  background: color-mix(in oklch, var(--foreground) 6%, transparent);
  color: var(--foreground);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.copy-btn:hover {
  background: oklch(0% 0 0 / 0.1);
}

/* ── How it works ── */
.steps-section {
  padding-top: 12px;
  border-top: 1px solid oklch(0% 0 0 / 0.06);
}
.steps-title {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--gold-deep);
  margin-bottom: 10px;
}
.steps-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
}
.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 0.8125rem;
  color: oklch(0% 0 0 / 0.65);
}
.step-number {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: color-mix(in oklch, var(--gold) 15%, transparent);
  color: var(--gold-deep);
  font-size: 0.6875rem;
  font-weight: 700;
  flex-shrink: 0;
}
.step-icon {
  width: 16px;
  height: 16px;
  color: oklch(0% 0 0 / 0.25);
  flex-shrink: 0;
}
.step-text {
  line-height: 1.3;
}

/* ── Dashboard section ── */
.dashboard-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid oklch(0% 0 0 / 0.06);
}
.dashboard-loading {
  display: flex;
  justify-content: center;
  padding: 20px 0;
}
.dashboard-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 20px 0;
  color: oklch(0% 0 0 / 0.25);
  font-size: 0.75rem;
}

/* ── Stats grid ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}
.stat-card {
  padding: 10px 12px;
  border-radius: 10px;
  background: var(--muted);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-card--highlight {
  background: color-mix(in oklch, var(--gold) 8%, transparent);
  border-color: color-mix(in oklch, var(--gold) 15%, transparent);
}
.stat-card--rank {
  background: linear-gradient(135deg, color-mix(in oklch, var(--primary) 15%, var(--card)), color-mix(in oklch, var(--brand-teal) 10%, var(--card)));
  border-color: color-mix(in oklch, var(--primary) 20%, transparent);
}
.stat-label {
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: oklch(0% 0 0 / 0.4);
}
.stat-value {
  font-size: 1.125rem;
  font-weight: 800;
  color: var(--foreground);
}
.stat-value--green {
  color: var(--success);
}
.stat-value--gold {
  color: var(--gold-deep);
}

/* ── Referral table ── */
.referral-table-wrap {
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--border);
}
.referral-table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}
.referral-table-title {
  font-size: 0.6875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: oklch(0% 0 0 / 0.45);
}
.referral-table-live {
  font-size: 0.625rem;
  font-weight: 600;
  color: var(--success);
  animation: pulse-live 2s ease-in-out infinite;
}
@keyframes pulse-live {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
}
.referral-table {
  width: 100%;
  font-size: 0.75rem;
  border-collapse: collapse;
}
.referral-table th {
  padding: 8px 12px;
  text-align: left;
  font-size: 0.625rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--muted-foreground);
  background: var(--muted);
  border-bottom: 1px solid var(--border);
}
.referral-table td {
  padding: 8px 8px;
  color: oklch(0% 0 0 / 0.65);
  border-bottom: 1px solid oklch(0% 0 0 / 0.04);
  word-wrap: break-word;
  overflow-wrap: break-word;
}
.referral-table th:nth-child(1) { width: 30%; }
.referral-table th:nth-child(2) { width: 22%; }
.referral-table th:nth-child(3) { width: 25%; }
.referral-table th:nth-child(4) { width: 23%; }
.referral-table tr:last-child td {
  border-bottom: none;
}

/* ── Friend cell ── */
.friend-name {
  font-weight: 600;
  font-size: 0.75rem;
  color: var(--foreground);
}
.friend-msisdn {
  font-size: 0.625rem;
  font-family: ui-monospace, monospace;
  color: oklch(0% 0 0 / 0.35);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* ── Progress bar ── */
.progress-bar-wrap {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: oklch(0% 0 0 / 0.06);
  overflow: hidden;
}
.progress-bar {
  height: 100%;
  border-radius: 3px;
  background: var(--primary);
  transition: width 0.3s ease;
}
.progress-text {
  font-size: 0.625rem;
  font-weight: 600;
  color: oklch(0% 0 0 / 0.45);
  margin-top: 2px;
  display: block;
}

/* ── Claim button ── */
.claim-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 4px 14px;
  font-size: 0.6875rem;
  font-weight: 700;
  border-radius: 6px;
  background: linear-gradient(135deg, var(--primary), var(--brand-teal));
  color: var(--primary-foreground);
  border: none;
  cursor: pointer;
  transition: all 0.15s;
  white-space: nowrap;
}
.claim-btn:hover {
  transform: scale(1.05);
}
.claim-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}
.claim-btn--claimed {
  background: color-mix(in oklch, var(--success) 15%, transparent);
  color: var(--success);
  cursor: default;
}
.claim-btn--disabled {
  position: relative;
  background: oklch(0% 0 0 / 0.08);
  color: oklch(0% 0 0 / 0.3);
  opacity: 1;
}
.claim-btn--disabled:hover::after {
  content: attr(title);
  position: fixed;
  width: max-content;
  max-width: 220px;
  padding: 8px 12px;
  border-radius: 8px;
  background: var(--card);
  color: var(--foreground);
  font-size: 0.6875rem;
  font-weight: 500;
  line-height: 1.4;
  box-shadow: 0 4px 12px oklch(0% 0 0 / 0.25);
  z-index: 100;
  pointer-events: none;
  transform: translate(-75%, -110%);
}

/* ── Status badges ── */
.status-badge {
  font-size: 0.625rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.status-badge--active {
  background: color-mix(in oklch, var(--success) 12%, transparent);
  color: var(--success);
}
.status-badge--signed {
  background: color-mix(in oklch, var(--muted-foreground) 12%, transparent);
  color: var(--muted-foreground);
}
.status-badge--pending {
  background: color-mix(in oklch, var(--gold) 10%, transparent);
  color: var(--gold-deep);
}

/* ══════════════════════════════════
   Dark mode overrides
   ══════════════════════════════════ */

/* Dark mode — already dark by default, minimal overrides */

/* Popover */
[data-theme="dark"] .popover-overlay {
  background: oklch(0% 0 0 / 0.6);
}
[data-theme="dark"] .popover-panel {
  background: var(--card);
  border-color: var(--border);
  box-shadow: 0 24px 48px oklch(0% 0 0 / 0.5), 0 0 0 1px oklch(100% 0 0 / 0.04);
}
@media (min-width: 1024px) {
  [data-theme="dark"] .popover-panel {
    box-shadow: -8px 0 32px oklch(0% 0 0 / 0.4);
  }
}
[data-theme="dark"] .popover-header {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--gold-deep) 25%, var(--card)),
    var(--surface-elevated)
  );
  border-bottom-color: var(--border);
}
[data-theme="dark"] .popover-title {
  color: var(--foreground);
}
[data-theme="dark"] .popover-subtitle {
  color: var(--gold-bright);
}
[data-theme="dark"] .popover-close {
  color: oklch(100% 0 0 / 0.5);
}
[data-theme="dark"] .popover-close:hover {
  color: white;
  background: oklch(100% 0 0 / 0.1);
}

/* Section label */
[data-theme="dark"] .section-label {
  color: oklch(100% 0 0 / 0.4);
}

/* Invite */
[data-theme="dark"] .invite-input-wrap {
  background: var(--surface-deepest);
  border-color: var(--border);
}
[data-theme="dark"] .invite-input-wrap:focus-within {
  border-color: var(--gold);
}
[data-theme="dark"] .invite-prefix {
  color: var(--muted-foreground);
}
[data-theme="dark"] .invite-input {
  color: var(--foreground);
}
[data-theme="dark"] .invite-input::placeholder {
  color: oklch(100% 0 0 / 0.25);
}
[data-theme="dark"] .invite-error {
  color: oklch(65% 0.2 25);
}

/* Share */
[data-theme="dark"] .share-socials-wrap {
  background: var(--surface-deepest);
  border-color: var(--border);
}

/* Copy */
[data-theme="dark"] .copy-input-wrap {
  background: var(--surface-deepest);
  border-color: var(--border);
}
[data-theme="dark"] .copy-input {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .copy-btn {
  background: oklch(100% 0 0 / 0.08);
  color: white;
}
[data-theme="dark"] .copy-btn:hover {
  background: oklch(100% 0 0 / 0.14);
}

/* Steps */
[data-theme="dark"] .steps-section {
  border-top-color: oklch(100% 0 0 / 0.06);
}
[data-theme="dark"] .steps-title {
  color: var(--gold-bright);
}
[data-theme="dark"] .step-item {
  color: oklch(100% 0 0 / 0.7);
}
[data-theme="dark"] .step-number {
  background: color-mix(in oklch, var(--gold) 15%, transparent);
  color: var(--gold-bright);
}
[data-theme="dark"] .step-icon {
  color: oklch(100% 0 0 / 0.3);
}

/* Dashboard */
[data-theme="dark"] .dashboard-section {
  border-top-color: oklch(100% 0 0 / 0.06);
}
[data-theme="dark"] .dashboard-empty {
  color: oklch(100% 0 0 / 0.3);
}
[data-theme="dark"] .stat-card {
  background: oklch(100% 0 0 / 0.04);
  border-color: oklch(100% 0 0 / 0.06);
}
[data-theme="dark"] .stat-card--rank {
  background: linear-gradient(
    135deg,
    color-mix(in oklch, var(--primary) 35%, var(--card)),
    color-mix(in oklch, var(--brand-teal) 30%, var(--card))
  );
  border-color: color-mix(in oklch, var(--primary) 20%, transparent);
}
[data-theme="dark"] .stat-label {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .stat-value {
  color: white;
}
[data-theme="dark"] .stat-value--green {
  color: var(--success);
}
[data-theme="dark"] .stat-value--gold {
  color: var(--gold-bright);
}

/* Table */
[data-theme="dark"] .referral-table-wrap {
  border-color: var(--border);
}
[data-theme="dark"] .referral-table-header {
  background: var(--surface-elevated);
  border-bottom-color: var(--border);
}
[data-theme="dark"] .referral-table-title {
  color: var(--muted-foreground);
}
[data-theme="dark"] .referral-table-live {
  color: var(--success);
}
[data-theme="dark"] .referral-table th {
  color: var(--muted-foreground);
  background: var(--surface-elevated);
  border-bottom-color: var(--border);
}
[data-theme="dark"] .referral-table td {
  color: oklch(100% 0 0 / 0.7);
  border-bottom-color: oklch(100% 0 0 / 0.04);
}

/* Badges */
[data-theme="dark"] .status-badge--active {
  background: color-mix(in oklch, var(--success) 15%, transparent);
  color: var(--success);
}
[data-theme="dark"] .status-badge--signed {
  background: color-mix(in oklch, var(--muted-foreground) 15%, transparent);
  color: var(--muted-foreground);
}
[data-theme="dark"] .status-badge--pending {
  background: color-mix(in oklch, var(--gold) 12%, transparent);
  color: var(--gold-bright);
}

/* Friend cell */
[data-theme="dark"] .friend-name {
  color: white;
}
[data-theme="dark"] .friend-msisdn {
  color: oklch(100% 0 0 / 0.35);
}

/* Progress bar */
[data-theme="dark"] .progress-bar-wrap {
  background: oklch(100% 0 0 / 0.08);
}
[data-theme="dark"] .progress-text {
  color: oklch(100% 0 0 / 0.45);
}

/* Claim button */
[data-theme="dark"] .claim-btn {
  background: linear-gradient(135deg, var(--primary), var(--brand-teal));
  color: var(--primary-foreground);
}
[data-theme="dark"] .claim-btn--claimed {
  background: color-mix(in oklch, var(--success) 20%, transparent);
  color: var(--success);
}
[data-theme="dark"] .claim-btn--disabled {
  background: oklch(100% 0 0 / 0.08);
  color: oklch(100% 0 0 / 0.3);
}
[data-theme="dark"] .claim-btn--disabled:hover::after {
  background: var(--surface-elevated);
}

/* ── Transitions (mobile: fade + scale) ── */
.popover-enter-active {
  transition: all 0.2s ease-out;
}
.popover-leave-active {
  transition: all 0.15s ease-in;
}
.popover-enter-from {
  opacity: 0;
}
.popover-enter-from .popover-panel {
  transform: translateY(-8px) scale(0.97);
}
.popover-leave-to {
  opacity: 0;
}
.popover-leave-to .popover-panel {
  transform: translateY(-4px) scale(0.98);
}

/* ── Transitions (desktop: slide from right) ── */
@media (min-width: 1024px) {
  .popover-enter-from .popover-panel {
    transform: translateX(100%) scale(1);
  }
  .popover-leave-to .popover-panel {
    transform: translateX(100%) scale(1);
  }
  .popover-enter-active .popover-panel {
    transition: transform 0.25s ease-out;
  }
  .popover-leave-active .popover-panel {
    transition: transform 0.2s ease-in;
  }
}
</style>
