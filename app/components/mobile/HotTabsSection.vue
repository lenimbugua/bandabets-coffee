<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { useRouter } from "vue-router";
import { useLiveMatchesStore } from "@/stores/live-matches";
import { useBookedBetsStore } from "@/stores/booked-bets";
import { useCasinoStore } from "@/stores/casino";
import { useFormatScores } from "@/composables/useFormatScores";
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useLoadCode } from "@/composables/useLoadCode";
import { useCasino } from "@/composables/useCasino";
import { casinoCategoryIconPath } from "@/composables/useCasinoCategoryIcons";
import NearViewportImage from "@/components/casino/NearViewportImage.vue";

const router = useRouter();

// --- Tabs ---
const tabs = [
  { key: "top-games", label: "Top Games" },
  { key: "live", label: "Live" },
  { key: "codes", label: "Codes" },
];
const activeTab = ref("top-games");

// --- Live tab ---
const liveMatchesStore = useLiveMatchesStore();
const { previewMatches, previewPending } = storeToRefs(liveMatchesStore);
const { goToMatchDetails } = useMatchDetails();
const { homeScore, awayScore } = useFormatScores();
const selectedCompetitionId = ref("");

const liveCompetitionChips = computed(() =>
  previewMatches.value
    .filter((c) => c.matches?.length)
    .map((c) => ({
      id: c.competitionId,
      name: c.competitionName,
      count: c.matches.length,
    }))
);

const activeCompetitionId = computed(
  () => selectedCompetitionId.value || liveCompetitionChips.value[0]?.id || ""
);

const liveCards = computed(() => {
  const competition = previewMatches.value.find(
    (c) => c.competitionId === activeCompetitionId.value
  );
  if (!competition?.matches) return [];
  return competition.matches.slice(0, 8).map((match) => ({
    ...match,
    competitionName: competition.competitionName,
    countryName: competition.countryName,
    sportName: competition.sportName,
    sportId: competition.sportId,
  }));
});

function liveMarket(match) {
  return match.markets?.[0] || null;
}

function teamInitial(name) {
  return (name || "?").trim().charAt(0).toUpperCase();
}

const formCustomId = (parentMatchId, subTypeId, outcomeName, outcomeId) => {
  return `${parentMatchId}${subTypeId}${outcomeName}${outcomeId}`;
};

// --- Codes tab (BetHub) ---
const bookedBetsStore = useBookedBetsStore();
const { bethub, pending: bethubPending } = storeToRefs(bookedBetsStore);
const selectedCodeCategory = ref("");

const codeChips = computed(() => {
  if (!Array.isArray(bethub.value)) return [];
  return bethub.value.map((c) => ({
    id: c.categoryCode,
    name: c.categoryName,
    icon: c.icon,
    count: c.bets?.length || 0,
  }));
});

const activeCodeCategory = computed(
  () => selectedCodeCategory.value || codeChips.value[0]?.id || ""
);

const codeCards = computed(() => {
  if (!Array.isArray(bethub.value)) return [];
  const category = bethub.value.find(
    (c) => c.categoryCode === activeCodeCategory.value
  );
  if (!category?.bets) return [];
  return category.bets.slice(0, 6).map((bet) => ({
    ...bet,
    categoryName: category.categoryName,
    categoryIcon: category.icon,
  }));
});

function getTotalOdds(slip) {
  if (!slip?.length) return 0;
  return slip.reduce((acc, s) => acc * (s.oddValue || 1), 1).toFixed(2);
}

const {
  loadCode: executeLoadCode,
  setBookingCode,
  setIntention,
  isToLoadCode,
} = useLoadCode();

function loadCode(code) {
  setBookingCode(code);
  setIntention(isToLoadCode);
  executeLoadCode();
}

// --- Top Games tab ---
const casinoStore = useCasinoStore();
const { categoriesWithGames, categoriesLoading } = storeToRefs(casinoStore);
const { launchCasino } = useCasino();
const selectedGameCategoryId = ref(null);

const gameChips = computed(() =>
  categoriesWithGames.value.map((cat) => ({
    id: cat.id,
    name: cat.name,
    iconPath: casinoCategoryIconPath(cat.name),
    count: cat.games?.length || 0,
  }))
);

const activeGameCategory = computed(() => {
  if (selectedGameCategoryId.value) {
    const picked = categoriesWithGames.value.find(
      (c) => c.id === selectedGameCategoryId.value
    );
    if (picked) return picked;
  }
  return (
    categoriesWithGames.value.find((c) => c.slug === "hot-games-in-kenya") ||
    categoriesWithGames.value[0] ||
    null
  );
});

const gameCards = computed(
  () => activeGameCategory.value?.games?.slice(0, 12) || []
);

function gameRouteName(categoryName = "") {
  const lower = categoryName.toLowerCase();
  if (lower.includes("crash")) return "crash-games";
  if (lower.includes("virtual")) return "virtuals-games";
  return "casino";
}

function playGame(game) {
  launchCasino(
    game.id,
    game.gameName,
    gameRouteName(activeGameCategory.value?.name || ""),
    game.providerName
  );
}

onMounted(() => {
  liveMatchesStore.getPreviewLiveMatches();
  bookedBetsStore.fetchBethub();
  if (!categoriesWithGames.value?.length) {
    casinoStore.fetchCategoriesWithGames();
  }
});
</script>

<template>
  <section class="mx-3 mt-4 overflow-hidden rounded-xl bg-card py-2">
    <!-- Tab row -->
    <div class="flex items-center gap-5 px-3 overflow-x-auto scrollbar-hide">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        type="button"
        class="flex shrink-0 items-center gap-1.5 py-2 text-[0.95rem] font-extrabold whitespace-nowrap transition-colors duration-150"
        :class="activeTab === tab.key ? 'text-selected' : 'text-foreground'"
        @click="activeTab = tab.key"
      >
        <!-- Live: signal dot -->
        <svg v-if="tab.key === 'live'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
          <path d="M5.636 5.636a1 1 0 0 1 0 1.414 7 7 0 0 0 0 9.9 1 1 0 1 1-1.414 1.414 9 9 0 0 1 0-12.728 1 1 0 0 1 1.414 0Zm14.142 0a9 9 0 0 1 0 12.728 1 1 0 1 1-1.414-1.414 7 7 0 0 0 0-9.9 1 1 0 0 1 1.414-1.414ZM8.464 8.464a1 1 0 0 1 0 1.415 3 3 0 0 0 0 4.242 1 1 0 1 1-1.414 1.415 5 5 0 0 1 0-7.072 1 1 0 0 1 1.414 0Zm8.486 0a5 5 0 0 1 0 7.072 1 1 0 1 1-1.414-1.415 3 3 0 0 0 0-4.242 1 1 0 0 1 1.414-1.415ZM12 10.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
        </svg>
        <!-- Codes: ticket -->
        <svg v-else-if="tab.key === 'codes'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
          <path fill-rule="evenodd" d="M4 5a2 2 0 0 0-2 2v2.25a.75.75 0 0 0 .75.75 2 2 0 1 1 0 4 .75.75 0 0 0-.75.75V17a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2.25a.75.75 0 0 0-.75-.75 2 2 0 1 1 0-4 .75.75 0 0 0 .75-.75V7a2 2 0 0 0-2-2H4Zm10 2.5a.75.75 0 0 1 1.5 0v1a.75.75 0 0 1-1.5 0v-1Zm.75 3.25a.75.75 0 0 0-.75.75v1a.75.75 0 0 0 1.5 0v-1a.75.75 0 0 0-.75-.75Zm-.75 4.75a.75.75 0 0 1 1.5 0v1a.75.75 0 0 1-1.5 0v-1Z" clip-rule="evenodd" />
        </svg>
        <!-- Top Games: flame -->
        <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5" aria-hidden="true">
          <path fill-rule="evenodd" d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545 3.75 3.75 0 0 1 3.255 3.717Z" clip-rule="evenodd" />
        </svg>
        {{ tab.label }}
      </button>
    </div>

    <!-- ============ LIVE TAB ============ -->
    <template v-if="activeTab === 'live'">
      <!-- Competition chips -->
      <div
        v-if="liveCompetitionChips.length"
        class="flex gap-2 px-3 pt-1 pb-2.5 overflow-x-auto scrollbar-hide"
      >
        <button
          v-for="chip in liveCompetitionChips"
          :key="chip.id"
          type="button"
          class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors duration-150"
          :class="activeCompetitionId === chip.id
            ? 'bg-pill-selected text-pill-selected-foreground'
            : 'bg-surface-elevated text-muted-foreground hover:text-foreground'"
          @click="selectedCompetitionId = chip.id"
        >
          {{ chip.name }}
          <span
            class="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem] font-bold tabular-nums"
            :class="activeCompetitionId === chip.id
              ? 'bg-brand-bright text-primary-foreground'
              : 'bg-foreground/10 text-foreground/70'"
          >{{ chip.count }}</span>
        </button>
      </div>

      <!-- Loading skeleton -->
      <div v-if="previewPending && !liveCards.length" class="flex gap-2.5 px-3 pb-2 overflow-hidden">
        <div v-for="i in 2" :key="i" class="h-44 w-[82%] max-w-sm shrink-0 animate-pulse rounded-xl bg-foreground/5"></div>
      </div>

      <!-- Match cards -->
      <div
        v-else-if="liveCards.length"
        class="flex snap-x snap-mandatory gap-2.5 px-3 scroll-px-3 pb-2 overflow-x-auto scrollbar-hide"
      >
        <article
          v-for="match in liveCards"
          :key="match.parentMatchId"
          class="w-[82%] max-w-sm shrink-0 snap-start rounded-xl bg-popover p-3"
        >
          <!-- League header + teams open match details -->
          <div class="cursor-pointer" @click="goToMatchDetails(match, router, true)">
            <div class="mb-2.5 truncate text-[0.75rem] font-semibold text-foreground/80">
              {{ match.competitionName }}
            </div>

            <div class="grid grid-cols-[1fr_auto_1fr] items-start gap-2">
              <!-- Home -->
              <div class="min-w-0 text-center">
                <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-lg font-extrabold text-foreground/80">
                  {{ teamInitial(match.homeTeam) }}
                </span>
                <div class="mt-1.5 truncate text-[0.8rem] font-semibold text-foreground">
                  {{ match.homeTeam }}
                </div>
              </div>

              <!-- Score + clock -->
              <div class="pt-2 text-center">
                <div class="text-base font-extrabold tabular-nums text-foreground">
                  {{ homeScore(match.result) }} - {{ awayScore(match.result) }}
                </div>
                <div class="mt-0.5 text-[0.7rem] font-semibold text-red-500">
                  {{ match.periodicTime || "" }} {{ match.statusDesc || "" }}
                </div>
                <div class="mt-0.5 text-[0.65rem] text-muted-foreground">
                  Game ID {{ match.gameId || match.parentMatchId }}
                </div>
              </div>

              <!-- Away -->
              <div class="min-w-0 text-center">
                <span class="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-surface-elevated text-lg font-extrabold text-foreground/80">
                  {{ teamInitial(match.awayTeam) }}
                </span>
                <div class="mt-1.5 truncate text-[0.8rem] font-semibold text-foreground">
                  {{ match.awayTeam }}
                </div>
              </div>
            </div>
          </div>

          <!-- Odds row -->
          <div v-if="liveMarket(match)?.matchOutcomes?.length" class="mt-3 grid grid-cols-3 gap-2">
            <TheButton2
              v-for="outcome in liveMarket(match).matchOutcomes.slice(0, 3)"
              :key="outcome.outcomeId"
              variant="wide"
              :outcome="outcome"
              :season-id="match.homeTeam"
              :home-team="match.homeTeam"
              :away-team="match.awayTeam"
              :sport-id="match.sportId || ''"
              :two-goal-up-active="liveMarket(match)?.twoGoalUpActive || false"
              :custom-id="formCustomId(match.parentMatchId, outcome.marketId, outcome.outcomeName, outcome.outcomeId)"
              :start-time="match.startTime || ''"
              :competition-id="match.competitionId || 0"
              :sub-type-id="parseInt(outcome.marketId) || 0"
              :competition-name="match.competitionName || ''"
              :country-name="match.countryName || ''"
              :sport-name="match.sportName || ''"
              :parent-match-id="match.parentMatchId"
              :live="1"
            />
          </div>
        </article>
      </div>

      <!-- Empty -->
      <div v-else class="px-3 py-6 text-center text-xs text-muted-foreground">
        No live matches right now
      </div>
    </template>

    <!-- ============ CODES TAB ============ -->
    <template v-else-if="activeTab === 'codes'">
      <div
        v-if="codeChips.length"
        class="flex gap-2 px-3 pt-1 pb-2.5 overflow-x-auto scrollbar-hide"
      >
        <button
          v-for="chip in codeChips"
          :key="chip.id"
          type="button"
          class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors duration-150"
          :class="activeCodeCategory === chip.id
            ? 'bg-pill-selected text-pill-selected-foreground'
            : 'bg-surface-elevated text-muted-foreground hover:text-foreground'"
          @click="selectedCodeCategory = chip.id"
        >
          <img v-if="chip.icon" :src="chip.icon" :alt="chip.name" class="h-4 w-4 rounded-full object-cover" />
          {{ chip.name }}
          <span
            class="flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.65rem] font-bold tabular-nums"
            :class="activeCodeCategory === chip.id
              ? 'bg-brand-bright text-primary-foreground'
              : 'bg-foreground/10 text-foreground/70'"
          >{{ chip.count }}</span>
        </button>
      </div>

      <div v-if="bethubPending && !codeCards.length" class="flex gap-2.5 px-3 pb-2 overflow-hidden">
        <div v-for="i in 2" :key="i" class="h-40 w-64 shrink-0 animate-pulse rounded-xl bg-foreground/5"></div>
      </div>

      <div
        v-else-if="codeCards.length"
        class="flex snap-x snap-mandatory gap-2.5 px-3 scroll-px-3 pb-2 overflow-x-auto scrollbar-hide"
      >
        <article
          v-for="(bet, idx) in codeCards"
          :key="idx"
          class="w-64 shrink-0 snap-start rounded-xl bg-popover p-3"
        >
          <div class="mb-2 flex items-center gap-2">
            <img v-if="bet.categoryIcon" :src="bet.categoryIcon" :alt="bet.categoryName" class="h-4 w-4 rounded-full object-cover" />
            <span class="text-[0.7rem] font-bold text-foreground">{{ bet.categoryName }}</span>
          </div>

          <div class="space-y-1.5">
            <div v-for="(sel, sIdx) in bet.slip?.slice(0, 3)" :key="sIdx">
              <div class="truncate text-[0.65rem] font-semibold text-foreground/80">
                {{ sel.homeTeam }} vs {{ sel.awayTeam }}
              </div>
              <div class="text-[0.65rem] font-medium text-selected">
                {{ sel.outcomeName }} @{{ sel.oddValue }}
              </div>
            </div>
            <div v-if="bet.slip?.length > 3" class="text-[0.6rem] text-foreground/60">
              +{{ bet.slip.length - 3 }} more
            </div>
          </div>

          <div class="mt-2.5 flex items-center justify-between border-t border-border/60 pt-2.5">
            <div class="flex items-center gap-3">
              <span class="text-[0.65rem] text-foreground/65">
                <span class="font-bold text-foreground">{{ bet.slip?.length || 0 }}</span> picks
              </span>
              <span class="text-[0.65rem] text-foreground/65">
                @<span class="font-bold text-selected">{{ getTotalOdds(bet.slip) }}</span>
              </span>
            </div>
            <button
              type="button"
              class="rounded-lg bg-brand-bright px-3 py-1.5 text-[0.65rem] font-bold text-primary-foreground transition-colors hover:bg-brand-bright/90"
              @click="loadCode(bet.shareBet)"
            >
              + Load
            </button>
          </div>
        </article>
      </div>

      <div v-else class="px-3 py-6 text-center text-xs text-muted-foreground">
        No codes available
      </div>
    </template>

    <!-- ============ TOP GAMES TAB ============ -->
    <template v-else>
      <div
        v-if="gameChips.length"
        class="flex gap-2 px-3 pt-1 pb-2.5 overflow-x-auto scrollbar-hide"
      >
        <button
          v-for="chip in gameChips"
          :key="chip.id"
          type="button"
          class="flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold whitespace-nowrap transition-colors duration-150"
          :class="activeGameCategory?.id === chip.id
            ? 'bg-pill-selected text-pill-selected-foreground'
            : 'bg-surface-elevated text-muted-foreground hover:text-foreground'"
          @click="selectedGameCategoryId = chip.id"
        >
          <svg viewBox="0 0 24 24" class="h-3.5 w-3.5 shrink-0" fill="currentColor" aria-hidden="true">
            <path :d="chip.iconPath" />
          </svg>
          {{ chip.name }}
        </button>
      </div>

      <div v-if="categoriesLoading && !gameCards.length" class="flex gap-2 px-3 pb-2 overflow-hidden">
        <div v-for="i in 4" :key="i" class="aspect-square w-24 shrink-0 animate-pulse rounded-lg bg-foreground/5"></div>
      </div>

      <div
        v-else-if="gameCards.length"
        class="flex gap-2 px-3 pb-2 overflow-x-auto scrollbar-hide"
      >
        <button
          v-for="game in gameCards"
          :key="game.id"
          type="button"
          class="w-24 shrink-0 overflow-hidden rounded-lg bg-surface-deepest text-left transition-shadow hover:shadow-md"
          @click="playGame(game)"
        >
          <div class="relative aspect-square overflow-hidden">
            <NearViewportImage
              :src="game.imgFullUrl"
              :alt="game.gameName"
              class="h-full w-full object-cover"
            />
          </div>
        </button>
      </div>

      <div v-else class="px-3 py-6 text-center text-xs text-muted-foreground">
        No games available
      </div>
    </template>
  </section>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
</style>
