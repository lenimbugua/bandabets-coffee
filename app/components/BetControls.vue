<script setup>
import { useBetslipLogin } from "@/composables/useBetslipLogin.js";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { storeToRefs } from "pinia";
import { computed } from "vue";
import { useLoginStore } from "../stores/login.js";
import { useBetslipStore } from "../stores/sports-betslip.js";
import OneCutWin from "./OneCutWin.vue";

const { placeBet, removeDeactivatedMatches, showNoBetError, setStake } =
  useBetslipStore();

const { isAuthenticated } = storeToRefs(useLoginStore());
const { betslip, stake, pending, possibleWin, totalOdds } = storeToRefs(
  useBetslipStore()
);

const { openLogin } = useBetslipLogin();
const betslipHasDeactivatedItems = computed(() =>
  betslip.value.some((item) => item.status !== 1)
);

function afterPlaceBetAction() {
  const { closeModal, openModal } = useModalStore();
  const { betPlaceStatus } = useModalTypes();

  closeModal();
  openModal(betPlaceStatus);
}

async function bet() {
  if (stake.value <= 0) return;
  if (!betslip.value.length) {
    showNoBetError();
    return;
  }
  placeBet(afterPlaceBetAction);
}
</script>

<template>
  <form
    class="w-full bg-accent/30 border-t border-border/50 px-2 py-2 space-y-1.5"
    @submit.prevent="bet"
  >
    <!-- Stake + Returns card -->
    <div class="rounded-lg bg-card border border-border/50">
      <div class="p-2.5">
        <TheStake :set-stake :stake :total-odds />
      </div>
      <div class="border-t border-border/30 p-2.5 space-y-2">
        <PossibleWin :possible-win :stake :total-odds />
        <div class="border-t border-border/30 pt-2 space-y-1.5">
          <BetslipBonus />
          <OneCutWin />
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-2">
      <div class="shrink-0">
        <ShareBetslipButton />
      </div>
      <div class="flex-1">
        <button
          v-if="betslipHasDeactivatedItems"
          class="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold transition-all duration-150 hover:bg-red-500/15 active:scale-[0.98] cursor-pointer"
          @click="removeDeactivatedMatches"
        >
          <TheButtonSpin v-if="pending" />
          <span v-else>Remove Deactivated</span>
        </button>
        <button
          v-else-if="!isAuthenticated"
          type="button"
          class="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-bet text-bet-foreground text-xs font-bold transition-all duration-150 hover:bg-bet-hover active:scale-[0.98] cursor-pointer"
          @click="openLogin"
        >
          <Icon name="tabler:user" class="w-3.5 h-3.5" aria-hidden="true" />
          Login to Place Bet
        </button>
        <button
          v-else
          type="submit"
          class="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-lg bg-bet text-bet-foreground text-xs font-bold transition-all duration-150 hover:bg-bet-hover active:scale-[0.98] cursor-pointer"
        >
          <TheButtonSpin v-if="pending" />
          <template v-else>
            <Icon name="tabler:circle-check" class="w-3.5 h-3.5" aria-hidden="true" />
            Place Bet
          </template>
        </button>
      </div>
    </div>
  </form>
</template>
