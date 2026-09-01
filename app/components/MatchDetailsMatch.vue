<script setup>
import { toRefs } from "vue";
import { useFormatDates } from "../composables/useFormatDates";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useCountriesStore } from "../stores/countries";
import { useMatchesStore } from "../stores/matches";
const { matchDetailIsLive } = toRefs(useMatchesStore());

const { fetchMatchByDirection } = useMatchesStore();
const { selectCountry, setSelectedCompetition, selectSport } = useCountriesStore();
const { ChangeEventModal } = useModalTypes();
const { openModal } = useModalStore();

const props = defineProps({
  matchDetails: {
    type: Object,
    required: true,
  },
});
const { humanFriendlyDate } = useFormatDates();

function changeEvent() {
  selectCountry(props.matchDetails.countryName);
  selectSport(props.matchDetails.sportId);
  setSelectedCompetition(props.matchDetails.competitionName);
  openModal(ChangeEventModal);
}

function teamAbbr(name) {
  if (!name) return '???';
  return name.slice(0, 3).toUpperCase();
}
</script>
<template>
  <div class="match-hero-card mx-3 mt-3 rounded-2xl overflow-hidden">
    <!-- Competition badge bar -->
    <div class="flex items-center justify-between px-4 py-2.5 bg-gray-50/80 dark:bg-white/[0.03]">
      <div class="flex items-center gap-2 min-w-0">
        <span class="text-[0.6rem] font-medium tracking-widest uppercase text-gray-500 dark:text-white/60">
          {{ matchDetails.countryName }}
        </span>
        <span class="text-gray-200 dark:text-white/10">&middot;</span>
        <span class="text-[0.6rem] font-semibold tracking-wide uppercase text-gray-600 dark:text-white/90 truncate">
          {{ matchDetails.competitionName }}
        </span>
      </div>
      <button
        v-if="!matchDetailIsLive"
        class="change-event-btn flex items-center gap-1 px-3 py-1.5 rounded-lg text-[0.6rem] font-semibold text-brand-bright cursor-pointer shrink-0 transition-all duration-150 active:scale-95"
        @click="changeEvent"
      >
        <Icon name="tabler:external-link" class="h-3 w-3" aria-hidden="true" />
        <span>Change Event</span>
      </button>
    </div>

    <!-- Match hero body -->
    <div class="relative px-4 py-5">
      <!-- Subtle radial glow behind score -->
      <div class="hero-glow absolute inset-0 pointer-events-none"></div>

      <div class="relative flex items-center justify-center">
        <!-- Prev nav -->
        <button
          v-if="!matchDetailIsLive"
          class="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/45 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
          @click="fetchMatchByDirection(matchDetails.parentMatchId, 'previous')"
        >
          <Icon name="tabler:chevron-left" class="w-4 h-4" />
        </button>

        <!-- Home team -->
        <div class="flex-1 flex flex-col items-center gap-2.5 min-w-0">
          <div class="team-badge w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center">
            <span class="text-sm font-extrabold text-gray-700 dark:text-white/90 tracking-wider">
              {{ teamAbbr(matchDetails.homeTeam) }}
            </span>
          </div>
          <span class="text-[0.72rem] font-semibold text-gray-800 dark:text-white/90 text-center leading-tight max-w-[5.5rem] line-clamp-2">
            {{ matchDetails.homeTeam }}
          </span>
        </div>

        <!-- Center: Score + Status -->
        <div class="flex flex-col items-center gap-2 px-4 shrink-0">
          <!-- Score -->
          <div class="score-frame px-5 py-2 rounded-xl">
            <span v-if="matchDetails.result" class="text-[1.75rem] font-black tracking-wide text-gray-900 dark:text-white tabular-nums leading-none">
              {{ matchDetails.result }}
            </span>
            <span v-else class="text-lg font-light text-gray-300 dark:text-white/30 tracking-[0.15em] uppercase leading-none">
              vs
            </span>
          </div>

          <!-- Live indicator -->
          <div v-if="matchDetails.isLiveCoverage" class="live-badge flex items-center gap-1.5 px-3 py-1.5 rounded-full">
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-bright opacity-50"></span>
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-brand-bright"></span>
            </span>
            <span class="text-[0.6rem] font-bold uppercase tracking-[0.12em] text-brand-bright">
              {{ matchDetails.status }}
            </span>
            <span class="text-gray-200 dark:text-white/10">|</span>
            <span class="text-[0.6rem] font-semibold text-gray-500 dark:text-white/65 tabular-nums">
              {{ matchDetails.periodicTime }}'
            </span>
          </div>
          <!-- Start time -->
          <span
            v-else
            class="text-[0.65rem] font-medium text-gray-500 dark:text-white/65 tracking-wide"
          >
            {{ humanFriendlyDate(matchDetails.startTime) }}
          </span>
        </div>

        <!-- Away team -->
        <div class="flex-1 flex flex-col items-center gap-2.5 min-w-0">
          <div class="team-badge w-14 h-14 rounded-2xl bg-gray-50 dark:bg-white/[0.06] flex items-center justify-center">
            <span class="text-sm font-extrabold text-gray-700 dark:text-white/90 tracking-wider">
              {{ teamAbbr(matchDetails.awayTeam) }}
            </span>
          </div>
          <span class="text-[0.72rem] font-semibold text-gray-800 dark:text-white/90 text-center leading-tight max-w-[5.5rem] line-clamp-2">
            {{ matchDetails.awayTeam }}
          </span>
        </div>

        <!-- Next nav -->
        <button
          v-if="!matchDetailIsLive"
          class="p-1.5 rounded-lg text-gray-300 dark:text-white/20 hover:text-gray-500 dark:hover:text-white/45 hover:bg-gray-100 dark:hover:bg-white/5 transition-all duration-200 cursor-pointer active:scale-95 shrink-0"
          @click="fetchMatchByDirection(matchDetails.parentMatchId, 'next')"
        >
          <Icon name="tabler:chevron-right" class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- Field grass strip -->
    <div class="field-grass h-8 relative overflow-hidden">
      <div class="absolute inset-0 field-grass-bg"></div>
      <!-- Field line markings -->
      <div class="absolute inset-0 flex items-center justify-center">
        <div class="w-10 h-10 rounded-full border border-white/[0.07] dark:border-white/[0.06]"></div>
      </div>
      <div class="absolute top-0 left-0 right-0 h-px bg-white/[0.05]"></div>
    </div>
  </div>
</template>

<style scoped>
.match-hero-card {
  background: white;
  box-shadow:
    0 1px 3px oklch(0% 0 0 / 0.04),
    0 4px 16px oklch(0% 0 0 / 0.03);
}
[data-theme="dark"] .match-hero-card {
  background: var(--card);
  box-shadow: none;
}

.hero-glow {
  background: radial-gradient(ellipse 50% 45% at 50% 35%, oklch(50% 0.17 142 / 0.03), transparent);
}
[data-theme="dark"] .hero-glow {
  background: radial-gradient(ellipse 50% 45% at 50% 35%, oklch(70% 0.19 142 / 0.05), transparent);
}

.score-frame {
  background: color-mix(in oklch, var(--surface-sunken) 60%, transparent);
}
[data-theme="dark"] .score-frame {
  background: color-mix(in oklch, var(--surface-sunken) 50%, transparent);
}

.team-badge {
  box-shadow:
    0 1px 2px oklch(0% 0 0 / 0.04),
    0 2px 8px oklch(0% 0 0 / 0.02);
}
[data-theme="dark"] .team-badge {
  box-shadow:
    0 1px 4px oklch(0% 0 0 / 0.15),
    0 0 12px oklch(70% 0.19 142 / 0.04);
}

.change-event-btn {
  background: oklch(70% 0.19 142 / 0.08);
}
[data-theme="dark"] .change-event-btn {
  background: oklch(70% 0.19 142 / 0.1);
}
.change-event-btn:hover {
  background: oklch(70% 0.19 142 / 0.14);
}
[data-theme="dark"] .change-event-btn:hover {
  background: oklch(70% 0.19 142 / 0.18);
}

.field-grass-bg {
  background: linear-gradient(
    180deg,
    oklch(85% 0.12 142 / 0.06) 0%,
    oklch(75% 0.15 142 / 0.1) 40%,
    oklch(65% 0.16 142 / 0.08) 100%
  );
}
[data-theme="dark"] .field-grass-bg {
  background: linear-gradient(
    180deg,
    oklch(35% 0.1 142 / 0.1) 0%,
    oklch(30% 0.12 142 / 0.15) 40%,
    oklch(25% 0.1 142 / 0.12) 100%
  );
}

.live-badge {
  background: oklch(70% 0.19 142 / 0.08);
}
[data-theme="dark"] .live-badge {
  background: oklch(70% 0.19 142 / 0.1);
}
</style>
