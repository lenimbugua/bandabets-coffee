<script setup>
import { ref, toRefs, computed } from "vue";
import { useBetslipStore } from "../stores/sports-betslip";

const { afterBetDetails } = toRefs(useBetslipStore());

const codeCopied = ref(false);

const selections = computed(() => afterBetDetails.value?.selections || []);
const isSingle = computed(() => selections.value.length === 1);
const firstSel = computed(() => selections.value[0]);

function copyBookingCode() {
  const code = afterBetDetails.value?.bookingCode;
  if (!code) return;
  navigator.clipboard.writeText(code);
  codeCopied.value = true;
  setTimeout(() => { codeCopied.value = false; }, 2000);
}
</script>

<template>
  <div>
    <!-- Bet details card -->
    <div class="rounded-xl border border-gray-200 dark:border-white/8 bg-gray-50/50 dark:bg-white/[0.02] overflow-hidden">

      <!-- Single bet: match + market + odds -->
      <template v-if="isSingle && firstSel">
        <div class="px-4 py-3 border-b border-gray-200 dark:border-white/8">
          <p class="text-sm font-medium text-gray-900 dark:text-white">
            {{ firstSel.homeTeam }} <span class="text-gray-400 dark:text-gray-500 text-xs mx-1">vs</span> {{ firstSel.awayTeam }}
          </p>
          <div class="mt-1.5 flex items-baseline justify-between">
            <div>
              <span class="text-lg font-bold text-gray-900 dark:text-white">{{ firstSel.oddType }}</span>
              <br />
              <span class="text-sm text-gray-600 dark:text-gray-300">{{ firstSel.outcomeName }}</span>
            </div>
            <span class="text-lg font-bold text-gray-900 dark:text-white">
              @ {{ firstSel.oddValue }}
            </span>
          </div>
        </div>
      </template>

      <!-- Multi bet: list selections -->
      <template v-else-if="selections.length > 1">
        <div
          v-for="(sel, i) in selections"
          :key="i"
          class="px-4 py-2.5 border-b border-gray-200 dark:border-white/8"
        >
          <div class="flex items-baseline justify-between">
            <p class="text-xs font-medium text-gray-900 dark:text-white truncate mr-2">
              {{ sel.homeTeam }} vs {{ sel.awayTeam }}
            </p>
            <span class="text-xs font-bold text-gray-900 dark:text-white shrink-0">@ {{ sel.oddValue }}</span>
          </div>
          <p class="text-[0.65rem] text-gray-500 dark:text-gray-400 mt-0.5">
            {{ sel.oddType }} &middot; {{ sel.outcomeName }}
          </p>
        </div>
      </template>

      <!-- Stake, Win, Booking Code rows -->
      <div class="divide-y divide-gray-200 dark:divide-white/8">
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-gray-500 dark:text-gray-400">Total Stake</span>
          <span class="text-base font-bold text-gray-900 dark:text-white tabular-nums">
            KES{{ afterBetDetails?.stake }}
          </span>
        </div>
        <div class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-gray-500 dark:text-gray-400">Potential Win</span>
          <span class="text-base font-bold text-primary tabular-nums">
            KES{{ afterBetDetails?.possibleWin }}
          </span>
        </div>
        <div v-if="afterBetDetails?.bookingCode" class="flex items-center justify-between px-4 py-3">
          <span class="text-sm text-gray-500 dark:text-gray-400">Booking Code</span>
          <button
            class="flex items-center gap-2 font-bold text-gray-900 dark:text-white tabular-nums hover:text-primary transition-colors"
            @click="copyBookingCode"
          >
            <Icon name="tabler:files" class="w-4 h-4 text-primary" />
            <span class="text-base">{{ codeCopied ? 'Copied!' : afterBetDetails.bookingCode }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Action buttons -->
    <div class="flex gap-3 mt-4">
      <ShareBet
        class="flex-1"
        :bet-id="parseInt(afterBetDetails?.betId)"
      >
        <button class="w-full flex items-center justify-center gap-2 h-10 rounded-xl border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/10 transition-colors">
          <Icon name="tabler:send" class="w-4 h-4" aria-hidden="true" />
          Share
        </button>
      </ShareBet>
      <div class="flex-1">
        <button class="w-full flex items-center justify-center gap-2 h-10 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
          <TheRebet :bet-id="parseInt(afterBetDetails?.betId)" />
        </button>
      </div>
    </div>
  </div>
</template>
