<script setup>
import FreebetButton from "@/components/freebet/FreebetButton.vue";
import { useCasino } from "@/composables/useCasino";
import { casinoCategoryIconPath } from "@/composables/useCasinoCategoryIcons";
import { useLoadCode } from "@/composables/useLoadCode";
import { useMatchDetails } from "@/composables/useMatchDetails";
import { useModalTypes } from "@/composables/useModalTypes";
import { useToast } from "@/composables/useToast";
import { useTopLeagues } from "@/composables/useTopLeagues";
import { useBetBuilderStore } from "@/stores/betbuilder";
import { useBookedBetsStore } from "@/stores/booked-bets";
import { useCasinoStore } from "@/stores/casino";
import { useFreebetStore } from "@/stores/freebet";
import { useLiveMatchesStore } from "@/stores/live-matches";
import { useLoginStore } from "@/stores/login";
import { useModalStore } from "@/stores/modal";
import { useShareBetStore } from "@/stores/sharebet";
import { useBetslipStore } from "@/stores/sports-betslip";
import { storeToRefs } from "pinia";
import { computed, onMounted, ref } from "vue";
import { RouterLink, useRouter } from "vue-router";

const router = useRouter();

// --- Welcome gift ---
const { token, isAuthenticated } = storeToRefs(useLoginStore());
const freebetStore = useFreebetStore();
const { redeemedFreebets, redeemedPending } = storeToRefs(freebetStore);

const showWelcomeGift = computed(() => {
  if (!token.value) return true;
  if (redeemedPending.value) return false;
  if (redeemedFreebets.value === null) return false;
  return true;
});

// FREEBET DISABLED — temporarily off, to be restored later.
// Forcing this false keeps the "Welcome Gift" tab on the Karibu Bonus promo
// branch and never renders the freebet UI below it. Restore the real line to
// bring the feature back.
// const freebetUnclaimed = computed(() => redeemedFreebets.value === false);
const freebetUnclaimed = computed(() => false);

// --- Welcome gift: freebet & aviator ---
const {
  freebet,
  pending: freebetPending,
  betslip: freebetSlip,
  totalOdds: freebetOdds,
  createPending,
  createError,
  createSuccess,
} = storeToRefs(freebetStore);
const { fetchFreebet, createSportsbookFreebet } = freebetStore;

const freebetPossibleWin = computed(() => {
  if (!freebetOdds.value) return 0;
  const win = freebetStore.stake * freebetOdds.value - freebetStore.stake;
  return Math.round((Math.max(0, win) + Number.EPSILON) * 100) / 100;
});

const { fireSuccessToast, positionTopRight } = useToast();

async function placeSoccerFreebet() {
  if (!freebetSlip.value) return;
  await createSportsbookFreebet();
  if (createSuccess.value) {
    fireSuccessToast("Free bet placed successfully!", positionTopRight);
  }
}

const formFreebetCustomId = (
  parentMatchId,
  subTypeId,
  outcomeName,
  outcomeId
) => {
  return `${parentMatchId}${subTypeId}${outcomeName}${outcomeId}`;
};

const baseTabs = ["Games"];
const tabs = computed(() => baseTabs);

const activeTab = ref("Games");

// --- Matches tab ---
const liveMatchesStore = useLiveMatchesStore();
const { highlightMatches: hotCompetitions, pending: matchesPending } =
  storeToRefs(liveMatchesStore);
const { goToMatchDetails } = useMatchDetails();
const { isTopLeague, getTopLeagueImage } = useTopLeagues();
const selectedCompetition = ref("");

onMounted(async () => {
  liveMatchesStore.getHighlightMatches();
  if (token.value) {
    await freebetStore.fetchRedeemedFreebets();
    if (showWelcomeGift.value) {
      activeTab.value = "Welcome Gift";
      if (freebetUnclaimed.value) fetchFreebet();
    }
  }
});

const competitions = computed(() => {
  return hotCompetitions.value.map((c) => ({
    competitionId: c.competitionId,
    competitionName: c.competitionName,
    countryName: c.countryName,
  }));
});

const highlightMatches = computed(() => {
  const result = [];
  const source = selectedCompetition.value
    ? hotCompetitions.value.filter(
        (c) => c.competitionId === selectedCompetition.value
      )
    : hotCompetitions.value;
  for (const competition of source) {
    if (!competition.matches) continue;
    for (const match of competition.matches) {
      result.push({
        ...match,
        competitionName: competition.competitionName,
        countryName: competition.countryName,
        sportName: competition.sportName,
        sportId: competition.sportId,
      });
      if (result.length >= 6) return result;
    }
  }
  return result;
});

function selectCompetition(id) {
  selectedCompetition.value = selectedCompetition.value === id ? "" : id;
}

const formCustomId = (parentMatchId, subTypeId, outcomeName, index) => {
  return `${parentMatchId}${subTypeId}${outcomeName}${index}`;
};

function formatMatchTime(startTime) {
  if (!startTime) return "";
  const timePart = startTime.split(" ")[1]?.slice(0, 5) || "";
  const datePart = startTime.split(" ")[0] || "";
  const today = new Date().toISOString().split("T")[0];
  const label = datePart === today ? "Today" : datePart.slice(5);
  return `${timePart} | ${label}`;
}

// --- Codes tab (BetHub) ---
const bookedBetsStore = useBookedBetsStore();
const { bethub, pending: bethubPending } = storeToRefs(bookedBetsStore);
const selectedCodeCategory = ref("");

onMounted(() => {
  bookedBetsStore.fetchBethub();
});

const codeCategoryPills = computed(() => {
  if (!bethub.value || !Array.isArray(bethub.value)) return [];
  return bethub.value.map((c) => ({
    code: c.categoryCode,
    name: c.categoryName,
    icon: c.icon,
  }));
});

const activeCodeCategory = computed(() => {
  if (selectedCodeCategory.value) return selectedCodeCategory.value;
  return codeCategoryPills.value[0]?.code || "";
});

const bethubBets = computed(() => {
  if (!bethub.value || !Array.isArray(bethub.value)) return [];
  const catCode = activeCodeCategory.value;
  const source = catCode
    ? bethub.value.filter((c) => c.categoryCode === catCode)
    : bethub.value;
  const result = [];
  for (const category of source) {
    if (!category.bets) continue;
    for (const bet of category.bets) {
      result.push({
        ...bet,
        categoryName: category.categoryName,
        categoryIcon: category.icon,
      });
      if (result.length >= 6) return result;
    }
  }
  return result;
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

// --- Builder tab (BetBuilder Hub) ---
const betBuilderStore = useBetBuilderStore();
const { hub: betBuilderHub } = storeToRefs(betBuilderStore);
const { shareBet: shareBetModal, confirmRemoveSlipModal } = useModalTypes();
const { openModal } = useModalStore();
const { setBookingCode: setShareCode } = useShareBetStore();
const { addBetbuilderToBetslip, setCustomIdToRemove, siblingExists } =
  useBetslipStore();

onMounted(() => {
  betBuilderStore.fetchJengaHub();
});

const betBuilderBets = computed(() => {
  if (!betBuilderHub.value || !Array.isArray(betBuilderHub.value)) return [];
  return betBuilderHub.value.slice(0, 6);
});

function renameSlipToSelections(obj) {
  const newObj = { ...obj };
  if ("slip" in newObj) {
    newObj.selections = newObj.slip;
    delete newObj.slip;
  }
  return newObj;
}

function addBuilderToSlip(item) {
  const prepared = renameSlipToSelections(item);
  prepared.isBetBuilder = true;
  const sibling = siblingExists(prepared);
  if (sibling) {
    setCustomIdToRemove(sibling.customId);
    openModal(confirmRemoveSlipModal);
    return;
  }
  addBetbuilderToBetslip(prepared, item.oddValue);
}

function shareBuilder(hub) {
  setShareCode(hub.shareBet);
  openModal(shareBetModal);
}

// --- Games tab ---
const { launchCasino } = useCasino();
const casinoStore = useCasinoStore();
const { categoriesWithGames, categoriesLoading } = storeToRefs(casinoStore);
const selectedGameCategory = ref("");

onMounted(() => {
  if (!categoriesWithGames.value?.length) {
    casinoStore.fetchCategoriesWithGames();
  }
});

function getRouteName(categoryName) {
  const lower = categoryName.toLowerCase();
  if (lower.includes("crash")) return "crash-games";
  if (lower.includes("virtual")) return "virtuals-games";
  return "casino";
}

const gameCategoryPills = computed(() => {
  const pills = [];
  for (const cat of categoriesWithGames.value) {
    pills.push({
      id: cat.id,
      name: cat.name,
      iconPath: casinoCategoryIconPath(cat.name),
    });
  }
  return pills;
});

const activeGameCategory = computed(() => {
  if (selectedGameCategory.value) return selectedGameCategory.value;
  return gameCategoryPills.value[0]?.id || "";
});

const filteredGames = computed(() => {
  if (!categoriesWithGames.value?.length) return [];
  const catId = activeGameCategory.value;
  if (!catId) return [];
  const cat = categoriesWithGames.value.find((c) => c.id === catId);
  if (!cat) return [];
  const routeName = getRouteName(cat.name);
  return cat.games
    .map((g) => ({ ...g, routeName }))
    .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0))
    .slice(0, 12);
});

function playGame(game) {
  launchCasino(game.id, game.gameName, game.routeName, game.providerName);
}

const viewAllLink = computed(() => {
  const map = {
    "Welcome Gift": { to: { name: "deposit" }, label: "deposit" },
    Highlights: {
      to: { name: "sports", params: { sport: "soccer" } },
      label: "View All",
    },
    Builder: {
      to: { name: "sports", params: { sport: "soccer" } },
      label: "View All",
    },
    Codes: { to: { name: "share-bets" }, label: "View All" },
    Games: { to: { name: "casino-home" }, label: "View All" },
  };
  return map[activeTab.value] || map.Highlights;
});

const isLoading = computed(() => {
  if (activeTab.value === "Highlights")
    return matchesPending.value && !highlightMatches.value.length;
  if (activeTab.value === "Codes")
    return bethubPending.value && !bethubBets.value.length;
  if (activeTab.value === "Games") return categoriesLoading.value;
  return false;
});
</script>

<template>
  <div
    class="rounded-2xl overflow-hidden relative bg-card border border-border/50"
  >
    <!-- Subtle ambient -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        class="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-muted/50 blur-3xl"
      ></div>
      <div
        class="absolute -bottom-24 -left-16 w-64 h-64 rounded-full bg-muted/30 blur-3xl"
      ></div>
      <div
        class="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-border/20 via-border/40 to-border/20"
      ></div>
    </div>

    <!-- Tab header -->
    <div
      class="relative z-1 px-3.5 lg:px-5 pt-2.5 lg:pt-4 pb-2 lg:pb-2.5 bg-background/50 dark:bg-white/[0.02] border-b border-border/40 shadow-[0_1px_2px_oklch(0%_0_0_/_0.04)]"
    >
      <div class="flex items-center gap-3 lg:gap-5 overflow-x-auto scrollbar-hide">
        <!-- Casino label — editorial serif -->
        <span
          class="font-serif text-sm lg:text-lg italic font-bold text-red-500 dark:text-red-400 tracking-tight shrink-0"
          >Casino</span
        >
        <div class="w-px h-5 bg-gray-300 dark:bg-white/15 shrink-0"></div>

        <!-- Tabs — premium indicators -->
        <button
          v-for="tab in tabs"
          :key="tab"
          class="relative pb-1 text-xs lg:text-sm whitespace-nowrap shrink-0 transition-colors duration-150 cursor-pointer"
          :class="[
            activeTab === tab
              ? 'text-gray-900 dark:text-white font-bold'
              : 'text-gray-500 dark:text-white/50 font-medium hover:text-gray-800 dark:hover:text-white/75',
          ]"
          @click="activeTab = tab"
        >
          {{ tab }}
        </button>

        <RouterLink
          :to="viewAllLink.to"
          class="hidden lg:flex items-center gap-1 ml-auto text-sm font-medium text-gray-500 dark:text-white/50 hover:text-gray-700 dark:hover:text-white/70 transition-colors shrink-0"
        >
          {{ viewAllLink.label }}
          <Icon name="tabler:chevron-right" class="w-4 h-4" aria-hidden="true" />
        </RouterLink>

        <!-- Mobile View All Games -->
        <RouterLink
          :to="{ name: 'casino-home' }"
          class="lg:hidden flex items-center gap-1 ml-auto text-xs font-semibold text-brand-bright hover:text-brand-bright/80 transition-colors"
        >
          View All Games
          <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
        </RouterLink>
      </div>
    </div>

    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="relative z-1 flex gap-2.5 lg:gap-3 px-3.5 lg:px-5 pb-3.5 lg:pb-5 pt-2 overflow-hidden"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="shrink-0 w-64 lg:w-72 h-44 rounded-xl bg-gray-200 dark:bg-white/5 animate-pulse"
      ></div>
    </div>

    <!-- Tab content -->
    <div v-else class="relative z-1 overflow-hidden">
      <!-- ============ WELCOME GIFT TAB ============ -->
      <div v-if="activeTab === 'Welcome Gift'" class="py-3 lg:py-4">
        <!-- Redeemed or just claimed: Karibu Bonus promo -->
        <template v-if="!isAuthenticated || !freebetUnclaimed || createSuccess">
          <div class="px-3.5 lg:px-5 pb-3">
            <RouterLink
              :to="{ name: 'deposit' }"
              class="block gift-card gift-card--green overflow-hidden"
            >
              <div class="gift-card-glow gift-card-glow--green"></div>
              <div class="relative z-1">
                <!-- Header with hero number -->
                <div class="flex items-center justify-between mb-2.5">
                  <div class="flex items-baseline gap-1.5">
                    <span
                      class="text-2xl font-extrabold text-white tabular-nums leading-none"
                      >50</span
                    >
                    <span class="text-xs text-white/50 font-medium"
                      >free bets</span
                    >
                  </div>
                  <span
                    class="text-[0.65rem] font-medium text-success/70 bg-success/10 px-2 py-0.5 rounded-full"
                    >Aviator Karibu Bonus</span
                  >
                </div>

                <!-- Tier rows — compact 2-column grid -->
                <div class="grid grid-cols-2 gap-1 mb-2.5">
                  <div
                    class="flex items-center justify-between py-1 px-2 rounded-md bg-white/6"
                  >
                    <span class="text-[0.65rem] text-white/55">100 – 500</span>
                    <span
                      class="text-[0.65rem] font-bold text-white tabular-nums"
                      >5</span
                    >
                  </div>
                  <div
                    class="flex items-center justify-between py-1 px-2 rounded-md bg-white/6"
                  >
                    <span class="text-[0.65rem] text-white/55"
                      >501 – 1,000</span
                    >
                    <span
                      class="text-[0.65rem] font-bold text-white tabular-nums"
                      >10</span
                    >
                  </div>
                  <div
                    class="flex items-center justify-between py-1 px-2 rounded-md bg-white/6"
                  >
                    <span class="text-[0.65rem] text-white/55"
                      >1,001 – 5,000</span
                    >
                    <span
                      class="text-[0.65rem] font-bold text-white tabular-nums"
                      >20</span
                    >
                  </div>
                  <div
                    class="flex items-center justify-between py-1 px-2 rounded-md bg-white/8"
                  >
                    <span class="text-[0.65rem] text-white/55">5,001+</span>
                    <span
                      class="text-[0.65rem] font-bold text-success tabular-nums"
                      >50</span
                    >
                  </div>
                </div>

                <!-- CTA + feature tags inline -->
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-[0.6rem] text-white/40"
                      >Real cash wins</span
                    >
                    <span class="w-0.5 h-0.5 rounded-full bg-white/20"></span>
                    <span class="text-[0.6rem] text-white/40">No wagering</span>
                  </div>
                  <div
                    class="flex items-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/12 hover:bg-white/18 transition-colors"
                  >
                    <span class="text-xs font-bold text-white"
                      >Deposit & Claim</span
                    >
                    <Icon name="tabler:arrow-right" class="w-3.5 h-3.5 text-white/70" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </RouterLink>
          </div>
        </template>

        <!-- Unclaimed: freebet UI -->
        <template v-else>
          <div class="px-3.5 lg:px-5 pb-3">
            <div class="gift-card gift-card--green flex flex-col">
              <div class="gift-card-glow gift-card-glow--green"></div>
              <div class="relative z-1 flex flex-col">
                <!-- Header — single compact row -->
                <div class="flex items-center justify-between mb-2">
                  <div class="flex items-center gap-2">
                    <div
                      class="w-7 h-7 rounded-md bg-white/10 border border-white/10 flex items-center justify-center"
                    >
                      <SecondaryNavIcons
                        icon="soccer"
                        icon-css="w-3.5 h-3.5 text-white"
                      />
                    </div>
                    <p class="text-xs font-bold text-white">
                      Soccer Free Bet
                    </p>
                  </div>
                  <span
                    class="text-[0.65rem] font-bold text-success bg-success/10 px-2 py-0.5 rounded-full tabular-nums"
                    >KES {{ freebetStore.stake }}</span
                  >
                </div>

                <!-- Match + outcomes -->
                <AnimatePulse v-if="freebetPending" :rows="1" />
                <template v-if="freebet && !createSuccess">
                  <!-- Teams -->
                  <div
                    class="flex items-center justify-between gap-2 py-1.5 px-2.5 mb-2 rounded-md bg-white/6"
                  >
                    <span
                      class="text-[0.65rem] font-semibold text-white/80 truncate flex-1"
                      >{{ freebet.homeTeam }}</span
                    >
                    <span
                      class="text-[0.55rem] font-bold text-white/30 uppercase shrink-0"
                      >vs</span
                    >
                    <span
                      class="text-[0.65rem] font-semibold text-white/80 truncate flex-1 text-right"
                      >{{ freebet.awayTeam }}</span
                    >
                  </div>

                  <!-- Outcomes -->
                  <div class="flex gap-1.5 mb-2">
                    <FreebetButton
                      v-for="outcome in freebet.markets[0].matchOutcomes"
                      :key="outcome.id"
                      :outcome="outcome"
                      :season-id="freebet.homeTeam"
                      :home-team="freebet.homeTeam"
                      :sport-id="freebet.sportId"
                      :custom-id="
                        formFreebetCustomId(
                          freebet.parentMatchId,
                          outcome.marketId,
                          outcome.outcomeName,
                          outcome.outcomeId
                        )
                      "
                      :away-team="freebet.awayTeam"
                      :start-time="freebet.startTime"
                      :competition-id="freebet.competitionId"
                      :sub-type-id="parseInt(outcome.marketId)"
                      :competition-name="freebet.competitionName"
                      :country-name="freebet.countryName"
                      :sport-name="freebet.sportName"
                      :parent-match-id="freebet.parentMatchId"
                    />
                  </div>

                  <!-- Error -->
                  <div
                    v-if="createError"
                    class="text-[0.65rem] text-red-300 mb-1.5"
                  >
                    {{ createError }}
                  </div>

                  <!-- CTA row with potential win -->
                  <div class="flex items-center justify-between mt-auto">
                    <span
                      v-if="freebetSlip"
                      class="text-[0.65rem] text-white/50"
                    >
                      Win:
                      <span class="font-bold text-success tabular-nums"
                        >KES {{ freebetPossibleWin }}</span
                      >
                    </span>
                    <span v-else class="text-[0.65rem] text-white/30"
                      >Pick an outcome</span
                    >
                    <button
                      :disabled="!freebetSlip || createPending"
                      :class="[
                        'flex items-center justify-center gap-1.5 py-1.5 px-3.5 rounded-lg text-xs font-bold transition-all active:scale-[0.97]',
                        freebetSlip
                          ? 'bg-white/15 text-white border border-white/10 cursor-pointer hover:bg-white/20'
                          : 'bg-white/5 text-white/25 cursor-not-allowed',
                      ]"
                      @click="placeSoccerFreebet"
                    >
                      <TheButtonSpin v-if="createPending" />
                      <span v-else>Place Free Bet</span>
                    </button>
                  </div>
                </template>

                <!-- Success state -->
                <div
                  v-if="createSuccess"
                  class="flex items-center gap-1.5 justify-center py-2 rounded-lg bg-success/15"
                >
                  <Icon name="tabler:check" class="w-3.5 h-3.5 text-success" aria-hidden="true" />
                  <span class="text-xs font-bold text-white"
                    >Free bet placed!</span
                  >
                </div>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ============ MATCHES TAB ============ -->
      <div v-else-if="activeTab === 'Highlights'">
        <!-- Competition pills — metallic accent on active -->
        <div
          v-if="competitions.length > 0"
          class="flex gap-2 lg:gap-2.5 px-3.5 lg:px-5 pb-2.5 lg:pb-3 pt-1 overflow-x-auto scrollbar-hide"
        >
          <button
            v-for="comp in competitions"
            :key="comp.competitionId"
            class="shrink-0 flex items-center gap-1.5 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-[0.7rem] lg:text-xs whitespace-nowrap transition-all duration-300 cursor-pointer"
            :class="[
              selectedCompetition === comp.competitionId
                ? 'bg-pill-selected text-pill-selected-foreground font-bold'
                : 'bg-white dark:bg-white/8 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10 hover:text-gray-800 dark:hover:text-white/75 hover:border-gray-300 dark:hover:border-white/20 font-medium',
            ]"
            @click="selectCompetition(comp.competitionId)"
          >
            <img
              v-if="isTopLeague(comp.competitionName)"
              :src="getTopLeagueImage(comp.competitionName)"
              :alt="comp.competitionName"
              class="w-4 h-4 shrink-0 rounded-full object-cover"
            />
            {{ comp.competitionName }}
          </button>
        </div>

        <!-- Match cards carousel — glass cards -->
        <div
          v-if="highlightMatches.length > 0"
          class="flex gap-2.5 lg:gap-4 px-3.5 lg:px-5 pb-3.5 lg:pb-5 overflow-x-auto scrollbar-hide"
        >
          <div
            v-for="match in highlightMatches"
            :key="match.parentMatchId"
            class="shrink-0 w-64 lg:w-72.5 rounded-xl overflow-hidden cursor-pointer flex flex-col bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/8 shadow-sm dark:shadow-none hover:border-brand-bright/30 dark:hover:border-brand-bright/20 hover:-translate-y-0.5 transition-all duration-200"
            @click="goToMatchDetails(match, router, false)"
          >
            <!-- Top: match info — glass surface -->
            <div class="relative px-3.5 lg:px-4 pt-3 lg:pt-4 pb-3 lg:pb-4 flex-1">
              <!-- Competition + time -->
              <div class="flex items-center justify-between mb-3 lg:mb-4">
                <span
                  class="text-[0.6rem] lg:text-[0.65rem] text-foreground/65 font-medium tracking-wide uppercase truncate"
                >
                  {{ match.competitionName }}
                </span>
                <span
                  class="text-[0.65rem] text-brand-bright/70 font-medium shrink-0 ml-2"
                >
                  {{ formatMatchTime(match.startTime) }}
                </span>
              </div>

              <!-- Teams face-off — editorial typography -->
              <div class="flex items-center justify-between gap-2 lg:gap-3">
                <!-- Home -->
                <div class="flex flex-col items-center flex-1 min-w-0">
                  <div
                    class="w-9 lg:w-11 h-9 lg:h-11 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 text-foreground"
                  >
                    <span class="text-xs font-bold">{{
                      match.homeTeam?.slice(0, 2)?.toUpperCase()
                    }}</span>
                  </div>
                  <span
                    class="font-serif text-[0.65rem] lg:text-[0.75rem] italic font-semibold text-foreground text-center mt-1.5 lg:mt-2 leading-tight line-clamp-2"
                  >
                    {{ match.homeTeam }}
                  </span>
                </div>

                <!-- VS divider -->
                <div class="flex flex-col items-center shrink-0 gap-1">
                  <span
                    class="text-[0.5rem] lg:text-[0.55rem] font-bold tracking-widest text-brand-bright px-2 py-0.5 rounded-md border border-brand-bright/20 bg-brand-bright/10"
                    >VS</span
                  >
                </div>

                <!-- Away -->
                <div class="flex flex-col items-center flex-1 min-w-0">
                  <div
                    class="w-9 lg:w-11 h-9 lg:h-11 rounded-full flex items-center justify-center shrink-0 bg-gray-100 dark:bg-white/8 border border-gray-200 dark:border-white/10 text-foreground"
                  >
                    <span class="text-xs font-bold">{{
                      match.awayTeam?.slice(0, 2)?.toUpperCase()
                    }}</span>
                  </div>
                  <span
                    class="font-serif text-[0.65rem] lg:text-[0.75rem] italic font-semibold text-foreground text-center mt-1.5 lg:mt-2 leading-tight line-clamp-2"
                  >
                    {{ match.awayTeam }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Bottom: tactile odds buttons -->
            <div
              class="px-2.5 lg:px-3 py-2 lg:py-2.5 border-t border-gray-100 dark:border-white/6 bg-gray-50/80 dark:bg-white/3"
              @click.stop
            >
              <div
                v-if="match?.markets?.[0]?.matchOutcomes?.length"
                class="grid grid-cols-3 gap-1.5 lg:gap-2"
              >
                <TheButton2
                  v-for="outcome in match.markets[0].matchOutcomes"
                  :key="outcome.outcomeId"
                  :outcome="outcome"
                  :season-id="match.homeTeam"
                  :home-team="match.homeTeam"
                  :sport-id="match.sportId || ''"
                  :two-goal-up-active="
                    match?.markets?.[0]?.twoGoalUpActive || false
                  "
                  :custom-id="
                    formCustomId(
                      match.parentMatchId,
                      outcome.marketId,
                      outcome.outcomeName,
                      outcome.outcomeId
                    )
                  "
                  :away-team="match.awayTeam"
                  :start-time="match.startTime || ''"
                  :competition-id="match.competitionId || 0"
                  :sub-type-id="parseInt(outcome.marketId) || 0"
                  :competition-name="match.competitionName || ''"
                  :country-name="match.countryName || ''"
                  :sport-name="match.sportName || ''"
                  :parent-match-id="match.parentMatchId"
                  :live="0"
                />
              </div>
              <div v-else class="grid grid-cols-3 gap-2">
                <button
                  v-for="i in 3"
                  :key="i"
                  class="flex justify-center items-center py-2.5 rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200/60 dark:border-white/8 transition-colors"
                >
                  <Icon name="tabler:lock" class="w-3.5 h-3.5 text-foreground/15" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty state -->
        <div v-else class="px-3.5 lg:px-4 py-8 text-center">
          <span class="text-xs text-gray-400 dark:text-white/40"
            >No matches available</span
          >
        </div>

        <!-- Footer -->
        <div class="px-3.5 lg:px-5 py-3 lg:py-4 lg:hidden">
          <RouterLink
            :to="{ name: 'sports', params: { sport: 'soccer' } }"
            class="flex items-center justify-center gap-1 text-sm font-semibold text-brand-bright"
          >
            View Today's Matches
            <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
          </RouterLink>
        </div>
      </div>

      <!-- ============ EXPERT TAB (BetBuilder) ============ -->
      <div v-else-if="activeTab === 'Builder'">
        <!-- BetBuilder hub cards -->
        <div
          v-if="betBuilderBets.length > 0"
          class="flex gap-2.5 lg:gap-3 px-3.5 lg:px-4 pb-3.5 lg:pb-4 pt-2.5 lg:pt-3 overflow-x-auto scrollbar-hide"
        >
          <div
            v-for="hub in betBuilderBets"
            :key="`${hub.parentMatchId}${hub.oddValue}${hub.startTime}`"
            class="shrink-0 w-60 lg:w-72 rounded-xl overflow-hidden flex flex-col bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/8 shadow-sm dark:shadow-none hover:border-brand-bright/30 dark:hover:border-brand-bright/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <!-- Header -->
            <div class="px-3.5 pt-3 pb-2.5">
              <div class="flex items-center justify-between mb-2">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    class="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center overflow-hidden shrink-0"
                  >
                    <img
                      v-if="isTopLeague(hub.competitionName)"
                      :src="getTopLeagueImage(hub.competitionName)"
                      :alt="hub.competitionName"
                      class="w-6 h-6 object-contain"
                      loading="lazy"
                    />
                    <svg
                      v-else
                      xmlns="http://www.w3.org/2000/svg"
                      class="w-5 h-5 text-brand-dark dark:text-brand-bright"
                      viewBox="0 0 64 64"
                    >
                      <circle cx="32" cy="32" r="29.3" fill="#fff" />
                      <path
                        fill="#4a4e51"
                        d="M61.9 32c0-.7.2-10.9-5.8-17.5c-.3-.6-1.5-3-5.6-5.9C47.8 6.5 45 5 44.7 4.8S39.4 2 33.4 2c-.5 0-.9 0-1.4.1c-4.6-.1-8.8 1.1-11.9 2.5c-3.2 1.4-5.3 2.8-5.5 3c-3.4 1.9-9.9 9.5-10.4 13.6c-2.1 2.6-3.8 14.5 0 21.7c2.7 10 12.7 15 13.5 15.4c.5.3 5.9 3.7 12.6 3.7h.9c.6.1 1.1.1 1.7.1c7.2 0 18-5.1 20.2-9.1c6.2-4.6 9.4-16.2 8.8-21M17.8 47.1c-2.9-4.6-4.5-10.7-4.9-12.1c.9-1.4 5.4-8 7.9-10c1.4.3 7.5 1.4 13.2 2.4c.7 1.9 3.9 10 4.8 13.2c-1 1.2-4.9 5.7-8.7 9.2c-4.1.1-11-2.3-12.3-2.7m36-32.5c0 .4-.1 2-.9 3.9c-1.5-.8-5.3-2.4-10.6-2.7c-.8-1.2-3.8-5.3-8.5-8.1c.6-1.3 1.5-2.8 2.1-3.3c.2 0 .4-.1.8-.1c2.5 0 6.9 1.7 7.3 1.8c.4.2 8.3 4.4 9.8 8.5M11.8 34c-3.4-.6-5.5-1.6-6.1-2c-1.3-4.6-.2-9.6-.1-10.3c1.3-2.2 4.8-8 7.2-9.1c2.4-.5 5.5.1 6.7.4c-.1 1.6-.3 6.1.3 10.9c-2.6 2.2-6.9 8.5-8 10.1M31.7 3.5c.8.1 1.9.2 2.7.5c-.8 1-1.6 2.5-1.9 3.3c-1.6.3-7.5 1.4-12.2 4.4c-.9-.2-3.8-.9-6.5-.7c.7-1.3 1.7-2.2 1.8-2.3c.3-.3 7.4-5.3 16.1-5.2m19.1 38.1c-1.2 0-5.7-.3-10.6-1.5c-.9-3.3-4.1-11.4-4.8-13.3c3.1-4.4 6.1-8.5 6.9-9.7c5.7.4 9.7 2.5 10.5 2.9c3.3 5.3 4 10.7 4.1 11.6c-1.8 5.5-5.2 9.2-6.1 10M3.7 28.5c.1 1.3.3 2.6.7 3.9c-.3.9-.6 1.8-.7 2.7c-.3-2.3-.3-4.6 0-6.6M18.5 57l-.4.6zc-2.5-1.2-4.4-4-5.2-5.1c1.5-1.5 3.4-2.9 4.1-3.4c1.6.6 8.3 2.8 12.6 2.8c.7 1 3.1 4 6 6.4c-1.8 1.8-4.4 2.6-4.9 2.8c-6.8.2-12.6-3.5-12.6-3.5m16.3 3.4c.9-.5 1.9-1.2 2.7-2.1c1.3-.2 6.9-1.1 11.9-4.8c.3 0 .9.1 1.5.1c-3.1 2.9-10.5 6.2-16.1 6.8M50.2 52c1.8-4.7 1.7-8.3 1.6-9.4c1-1 4.4-4.6 6.3-10.1c1 .2 1.7.4 2 .6c.1.4.3 1.3.2 2.7c-.8 5-3.4 12.6-8.1 15.9c-.5.3-1.3.4-2 .3"
                      />
                    </svg>
                  </div>
                  <span
                    class="text-[0.65rem] font-medium text-foreground/60 truncate"
                    >{{ hub.competitionName }}</span
                  >
                </div>
                <div
                  class="shrink-0 ml-2 px-2 py-0.5 rounded-md text-right bg-brand-bright/10 border border-brand-bright/20"
                >
                  <span class="text-foreground font-bold text-sm">{{
                    hub.oddValue
                  }}</span>
                </div>
              </div>
              <div
                class="text-[0.75rem] font-semibold text-foreground truncate"
              >
                {{ hub.homeTeam }} vs {{ hub.awayTeam }}
              </div>
              <div class="text-[0.65rem] text-foreground/65 mt-0.5 font-medium">
                {{ hub.startTime }}
              </div>
            </div>

            <!-- Selections -->
            <div
              class="flex-1 px-3.5 py-2 space-y-1.5 overflow-y-auto scrollbar-hide max-h-24 border-t border-gray-100 dark:border-white/6"
            >
              <div
                v-for="(sel, sIdx) in hub.slip?.slice(0, 4)"
                :key="sIdx"
                class="flex items-center gap-2"
              >
                <div
                  class="w-1 h-1 rounded-full bg-brand-bright shrink-0"
                ></div>
                <div
                  class="min-w-0 flex-1 flex items-center justify-between gap-2"
                >
                  <span
                    class="text-[0.65rem] font-semibold text-foreground/75 truncate"
                    >{{ sel.outcomeName }}</span
                  >
                  <span class="text-[0.6rem] text-foreground/35 shrink-0">{{
                    sel.oddType
                  }}</span>
                </div>
              </div>
              <div
                v-if="hub.slip?.length > 4"
                class="text-[0.6rem] text-foreground/60 pl-3"
              >
                +{{ hub.slip.length - 4 }} more
              </div>
            </div>

            <!-- Actions -->
            <div
              class="px-3.5 py-2.5 flex items-center justify-between border-t border-gray-100 dark:border-white/6 bg-gray-50/80 dark:bg-white/3"
              @click.stop
            >
              <div class="flex items-center gap-1.5">
                <span class="text-[0.65rem] font-bold text-foreground/60"
                  >{{ hub.slip?.length || 0 }} picks</span
                >
              </div>
              <div class="flex items-center gap-2">
                <button
                  class="px-2.5 py-1 rounded-lg bg-foreground/8 hover:bg-foreground/12 text-foreground text-[0.65rem] font-semibold transition-colors cursor-pointer"
                  @click="shareBuilder(hub)"
                >
                  Share
                </button>
                <button
                  class="px-2.5 py-1 rounded-lg bg-brand-bright text-primary-foreground text-[0.65rem] font-bold hover:bg-brand-bright/90 transition-colors cursor-pointer"
                  @click="addBuilderToSlip(hub)"
                >
                  + Betslip
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="px-3.5 lg:px-4 pb-3.5 lg:pb-4 pt-2.5 lg:pt-3">
          <div
            class="rounded-xl p-4 space-y-3 text-center bg-white/50 dark:bg-white/3 border border-dashed border-gray-300 dark:border-white/10"
          >
            <div
              class="w-10 h-10 mx-auto rounded-xl bg-brand-bright/15 flex items-center justify-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                class="w-5 h-5 text-brand-bright"
              >
                <path
                  d="M11.983 1.907a.75.75 0 0 0-1.292-.657l-8.5 9.5A.75.75 0 0 0 2.75 12h6.572l-1.305 6.093a.75.75 0 0 0 1.292.657l8.5-9.5A.75.75 0 0 0 17.25 8h-6.572l1.305-6.093Z"
                />
              </svg>
            </div>
            <div>
              <span class="text-sm font-bold text-foreground block"
                >Bet Builder</span
              >
              <p class="text-[0.7rem] text-foreground/65 mt-1 leading-relaxed">
                Combine multiple outcomes from one match for boosted odds.
              </p>
            </div>
            <RouterLink
              :to="{ name: 'sports', params: { sport: 'soccer' } }"
              class="inline-block px-5 py-2 rounded-lg bg-brand-bright text-primary-foreground text-xs font-bold hover:bg-brand-bright/90 transition-colors"
            >
              Start Building
            </RouterLink>
          </div>
        </div>
      </div>

      <!-- ============ CODES TAB (BetHub) ============ -->
      <div v-else-if="activeTab === 'Codes'">
        <!-- Category pills -->
        <div
          v-if="codeCategoryPills.length > 0"
          class="flex gap-2 lg:gap-2.5 px-3.5 lg:px-5 pb-2.5 lg:pb-3 pt-1 overflow-x-auto scrollbar-hide"
        >
          <button
            v-for="pill in codeCategoryPills"
            :key="pill.code"
            class="shrink-0 flex items-center gap-1.5 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-[0.7rem] lg:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
            :class="[
              activeCodeCategory === pill.code
                ? 'bg-pill-selected text-pill-selected-foreground'
                : 'bg-white dark:bg-white/8 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10 hover:text-gray-800 dark:hover:text-white/75 hover:border-gray-300 dark:hover:border-white/20',
            ]"
            @click="selectedCodeCategory = pill.code"
          >
            <img
              v-if="pill.icon"
              :src="pill.icon"
              :alt="pill.name"
              class="w-4 h-4 rounded-full object-cover"
            />
            {{ pill.name }}
          </button>
        </div>

        <!-- Loading -->
        <div v-if="bethubPending" class="flex gap-2.5 lg:gap-3 px-3.5 lg:px-4 pb-3.5 lg:pb-4">
          <div
            v-for="i in 3"
            :key="i"
            class="shrink-0 w-56 lg:w-60 h-36 rounded-xl bg-foreground/5 animate-pulse"
          ></div>
        </div>

        <!-- Bet cards -->
        <div
          v-else-if="bethubBets.length > 0"
          class="flex gap-2.5 lg:gap-3 px-3.5 lg:px-5 pb-3.5 lg:pb-5 overflow-x-auto scrollbar-hide"
        >
          <div
            v-for="(bet, idx) in bethubBets"
            :key="idx"
            class="shrink-0 w-56 lg:w-60 rounded-xl overflow-hidden bg-white dark:bg-white/5 border border-gray-200/80 dark:border-white/8 shadow-sm dark:shadow-none hover:border-brand-bright/30 dark:hover:border-brand-bright/20 hover:-translate-y-0.5 transition-all duration-200"
          >
            <!-- Category header -->
            <div
              class="px-3.5 py-2 flex items-center gap-2 border-b border-gray-100 dark:border-white/6 bg-gray-50 dark:bg-white/3"
            >
              <img
                v-if="bet.categoryIcon"
                :src="bet.categoryIcon"
                :alt="bet.categoryName"
                class="w-4 h-4 rounded-full object-cover"
              />
              <span class="text-[0.7rem] font-bold text-foreground">{{
                bet.categoryName
              }}</span>
            </div>

            <div class="p-3.5 space-y-2">
              <!-- Selections preview -->
              <div
                v-for="(sel, sIdx) in bet.slip?.slice(0, 3)"
                :key="sIdx"
                class="space-y-0.5"
              >
                <div
                  class="text-[0.65rem] font-semibold text-foreground/80 truncate"
                >
                  {{ sel.homeTeam }} vs {{ sel.awayTeam }}
                </div>
                <div class="flex items-center gap-1.5">
                  <span class="text-[0.65rem] text-brand-bright font-medium"
                    >{{ sel.outcomeName }} @{{ sel.oddValue }}</span
                  >
                </div>
              </div>
              <div
                v-if="bet.slip?.length > 3"
                class="text-[0.6rem] text-foreground/60"
              >
                +{{ bet.slip.length - 3 }} more
              </div>

              <!-- Stats + action -->
              <div
                class="flex items-center justify-between pt-2.5 border-t border-gray-100 dark:border-white/6"
              >
                <div class="flex items-center gap-3">
                  <span class="text-[0.65rem] text-foreground/65"
                    ><span class="text-foreground font-bold">{{
                      bet.slip?.length || 0
                    }}</span>
                    picks</span
                  >
                  <span class="text-[0.65rem] text-foreground/65"
                    >@<span class="text-brand-bright font-bold">{{
                      getTotalOdds(bet.slip)
                    }}</span></span
                  >
                </div>
                <button
                  class="px-3 py-1.5 rounded-lg bg-brand-bright text-primary-foreground text-[0.65rem] font-bold hover:bg-brand-bright/90 transition-colors cursor-pointer"
                  @click="loadCode(bet.shareBet)"
                >
                  + Load
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty -->
        <div v-else class="px-3.5 lg:px-4 pb-3.5 lg:pb-4 pt-2.5 lg:pt-3">
          <div
            class="py-8 text-center text-xs text-gray-400 dark:text-white/40"
          >
            No codes available
          </div>
        </div>

        <!-- Footer -->
        <div class="px-3.5 lg:px-5 py-3 lg:py-4 lg:hidden">
          <RouterLink
            :to="{ name: 'share-bets' }"
            class="flex items-center justify-center gap-1 text-sm font-semibold text-brand-bright"
          >
            View Code Center
            <Icon name="tabler:chevron-right" class="w-3.5 h-3.5" aria-hidden="true" />
          </RouterLink>
        </div>
      </div>

      <!-- ============ GAMES TAB ============ -->
      <div v-else-if="activeTab === 'Games'">
        <!-- Category pills -->
        <div class="flex gap-2 lg:gap-2.5 px-3.5 lg:px-5 pb-2.5 lg:pb-3 pt-1 overflow-x-auto scrollbar-hide">
          <button
            v-for="pill in gameCategoryPills"
            :key="pill.id"
            class="shrink-0 inline-flex items-center gap-1.5 px-3.5 lg:px-4 py-1.5 lg:py-2 rounded-full text-[0.7rem] lg:text-xs font-semibold whitespace-nowrap transition-all cursor-pointer"
            :class="[
              activeGameCategory === pill.id
                ? 'bg-pill-selected text-pill-selected-foreground'
                : 'bg-white dark:bg-white/8 text-gray-600 dark:text-white/50 border border-gray-200 dark:border-white/10 hover:text-gray-800 dark:hover:text-white/75 hover:border-gray-300 dark:hover:border-white/20',
            ]"
            @click="selectedGameCategory = pill.id"
          >
            <svg
              viewBox="0 0 24 24"
              class="w-4 h-4 shrink-0"
              fill="currentColor"
              aria-hidden="true"
            >
              <path :d="pill.iconPath" />
            </svg>
            <span>{{ pill.name }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="categoriesLoading" class="flex gap-2.5 lg:gap-3 px-3.5 lg:px-4 pb-3.5 lg:pb-4">
          <div
            v-for="i in 6"
            :key="i"
            class="shrink-0 w-24 lg:w-28 aspect-square rounded-xl bg-foreground/5 animate-pulse"
          ></div>
        </div>

        <!-- Game cards -->
        <div
          v-else-if="filteredGames.length > 0"
          class="flex gap-2.5 lg:gap-3 px-3.5 lg:px-5 pb-3.5 lg:pb-5 overflow-x-auto scrollbar-hide"
        >
          <button
            v-for="game in filteredGames"
            :key="game.id"
            class="shrink-0 w-32 lg:w-44 cursor-pointer group"
            @click="playGame(game)"
          >
            <div
              class="relative rounded-xl overflow-hidden aspect-square border border-gray-200 dark:border-white/10 group-hover:border-red-500/30 transition-all"
            >
              <img
                :src="game.imgFullUrl"
                :alt="game.gameName"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <p
              class="text-xs lg:text-sm font-bold text-foreground text-center mt-2 truncate"
            >
              {{ game.gameName }}
            </p>
          </button>
        </div>

        <!-- Empty -->
        <div v-else class="px-3.5 lg:px-4 py-8 text-center">
          <span class="text-xs text-gray-400 dark:text-white/40"
            >No games available</span
          >
        </div>

      </div>
    </div>
  </div>
</template>

<style scoped>
.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

/* ── Premium gift cards ── */
.gift-card {
  position: relative;
  overflow: hidden;
  border-radius: 14px;
  padding: 14px 16px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  border: 1px solid transparent;
}
.gift-card:hover {
  transform: translateY(-2px);
}
.gift-card:active {
  transform: scale(0.98);
}

.gift-card--green {
  background: linear-gradient(
    145deg,
    color-mix(in oklch, var(--brand-forest) 85%, transparent),
    color-mix(in oklch, var(--brand-forest) 90%, transparent)
  );
  backdrop-filter: blur(12px);
  border-color: color-mix(in oklch, var(--primary) 20%, transparent);
  box-shadow: 0 4px 24px color-mix(in oklch, var(--primary) 12%, transparent),
    inset 0 1px 0 oklch(100% 0 0 / 0.06);
}
.gift-card--green:hover {
  box-shadow: 0 8px 32px color-mix(in oklch, var(--primary) 20%, transparent),
    inset 0 1px 0 oklch(100% 0 0 / 0.08);
}

.gift-card--red {
  background: linear-gradient(
    145deg,
    oklch(28% 0.08 25 / 0.85),
    oklch(20% 0.06 25 / 0.9)
  );
  backdrop-filter: blur(12px);
  border-color: oklch(45% 0.12 25 / 0.2);
  box-shadow: 0 4px 24px oklch(40% 0.1 25 / 0.12),
    inset 0 1px 0 oklch(100% 0 0 / 0.06);
}
.gift-card--red:hover {
  box-shadow: 0 8px 32px oklch(40% 0.12 25 / 0.2),
    inset 0 1px 0 oklch(100% 0 0 / 0.08);
}

.gift-card-glow {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.2;
  pointer-events: none;
  transition: opacity 0.3s;
}
.gift-card:hover .gift-card-glow {
  opacity: 0.35;
}
.gift-card-glow--green {
  top: -25px;
  right: -25px;
  background: var(--brand-bright);
}
.gift-card-glow--red {
  top: -25px;
  right: -25px;
  background: oklch(50% 0.14 25);
}
</style>
