<script setup>
import { defineAsyncComponent, reactive, watch } from "vue";
import { storeToRefs } from "pinia";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useBetslipStore } from "@/stores/sports-betslip";
import BetslipModal from "./BetslipModal.vue";

// Every modal below gates itself on `modalType === <type> && showModal`, so
// none of them render anything until opened. Mounting all ~24 eagerly still
// pulls every chunk into the initial modulepreload set. Instead, a modal is
// mounted the first time its type is opened and stays mounted afterwards —
// closeModal() nulls modalType immediately, so a plain v-if on the current
// type would unmount mid leave-transition.
const lazy = (loader) => defineAsyncComponent(loader);
const TheDrawer = lazy(() => import("./TheDrawer.vue"));
const BetPlaceStatusDialogue = lazy(() => import("./BetPlaceStatusDialogue.vue"));
const SearchModal = lazy(() => import("./SearchModal.vue"));
const CalendarModal = lazy(() => import("./CalendarModal.vue"));
const LoginModal = lazy(() => import("./LoginModal.vue"));
const CasinoUnauthModal = lazy(() => import("./CasinoUnauthModal.vue"));
const DepositModal = lazy(() => import("./DepositModal.vue"));
const ChatModal = lazy(() => import("./ChatModal.vue"));
const ShareBetModal = lazy(() => import("@/components/community-bets/ShareBetModal.vue"));
const BookedBetPreviewModal = lazy(() => import("@/components/community-bets/BookedBetPreviewModal.vue"));
const ConfirmModal = lazy(() => import("./ConfirmModal.vue"));
const CancelBet = lazy(() => import("./CancelBet.vue"));
const InsufficientBalanceModal = lazy(() => import("./InsufficientBalanceModal.vue"));
const CashoutModal = lazy(() => import("./cashout/CashoutModal.vue"));
const RoadBlockModal = lazy(() => import("./RoadBlockModal.vue"));
const LoaderModal = lazy(() => import("./LoaderModal.vue"));
const SportsIconsModal = lazy(() => import("./SportsIconsModal.vue"));
const ChangeEventModal = lazy(() => import("./ChangeEventModal.vue"));
const SocialconsModal = lazy(() => import("@/components/affiliate/SocialconsModal.vue"));
const CustomerSupportModal = lazy(() => import("./CustomerSupportModal.vue"));
const GeniusGameTrackerModal = lazy(() => import("./GeniusGameTrackerModal.vue"));
const OneCutModal = lazy(() => import("./OneCutModal.vue"));
const TwoUpModal = lazy(() => import("./TwoUpModal.vue"));
const MultibetBoostModal = lazy(() => import("./MultibetBoostModal.vue"));
const InviteFriendModal = lazy(() => import("@/components/festive/InviteFriendModal.vue"));

const { modalType } = storeToRefs(useModalStore());
const { betslipLength } = storeToRefs(useBetslipStore());
const t = useModalTypes();
const { getModalTitle, betslip } = t;

const everOpened = reactive(new Set());
watch(
  modalType,
  (type) => {
    if (type) everOpened.add(type);
  },
  { immediate: true },
);
const opened = (type) => everOpened.has(type);
</script>

<template>
  <!-- sport betslip (always mounted — core UI) -->
  <BetslipModal class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute">
    <template #title>
      {{ getModalTitle(modalType) }}
      <span v-if="betslipLength > 0" class="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-[0.65rem] font-bold text-primary-foreground bg-brand-bright rounded-full">{{ betslipLength }}</span>
    </template>
    <div class="max-h-[85vh] flex flex-col">
      <SportsBetslip v-if="modalType === betslip" />
    </div>
  </BetslipModal>

  <TheDrawer v-if="opened(t.drawer)" />
  <BetPlaceStatusDialogue v-if="opened(t.betPlaceStatus)" />
  <SearchModal v-if="opened(t.search)" />
  <CalendarModal v-if="opened(t.calendar)" />
  <LoginModal v-if="opened(t.login)" />
  <CasinoUnauthModal v-if="opened(t.casinoUnauthModal)" />
  <DepositModal v-if="opened(t.deposit)" />
  <ChatModal v-if="opened(t.chat)" />
  <ShareBetModal v-if="opened(t.shareBet)" />

  <BookedBetPreviewModal
    v-if="opened(t.bookedBetPreview)"
    class="z-50 max-h-32 max-w-28 h-full bottom-32 absolute"
  />

  <ConfirmModal v-if="opened(t.confirm)">
    <CancelBet />
  </ConfirmModal>

  <InsufficientBalanceModal v-if="opened(t.insufficientBalance)" />
  <CashoutModal v-if="opened(t.cashout)" />
  <RoadBlockModal v-if="opened(t.roadblock)" />
  <LoaderModal v-if="opened(t.loader)" />
  <SportsIconsModal v-if="opened(t.sportsIconsModal)" />
  <ChangeEventModal v-if="opened(t.ChangeEventModal)" />
  <SocialconsModal v-if="opened(t.socialIconsModal)" />
  <CustomerSupportModal v-if="opened(t.customerSupportModal)" />
  <GeniusGameTrackerModal v-if="opened(t.geniusGameTracker)" />

  <OneCutModal
    v-if="opened(t.oneCutModal)"
    class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute"
  />
  <TwoUpModal
    v-if="opened(t.twoUpModal)"
    class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute"
  />
  <MultibetBoostModal
    v-if="opened(t.multibetBoostModal)"
    class="z-999 max-h-32 max-w-28 h-full bottom-32 absolute"
  />
  <InviteFriendModal v-if="opened(t.festiveModal)" />
</template>
