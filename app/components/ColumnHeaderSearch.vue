<script setup>
import { computed, ref, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useMatchDetails } from "@/composables/useMatchDetails";

const props = defineProps({
  matches: { type: Array, default: () => [] },
  outcomeLabels: { type: Array, default: () => ["1", "X", "2"] },
  isLive: { type: Boolean, default: false },
  variant: { type: String, default: "prematch" },
  // "dark" (default) sinks the bar below the panel surface; "default" lifts it.
  tone: { type: String, default: "dark" },
});

const router = useRouter();
const { goToMatchDetails } = useMatchDetails();

const searchOpen = ref(false);
const searchQuery = ref("");
const searchInputRef = ref(null);

function openSearch() {
  searchOpen.value = true;
  searchQuery.value = "";
  nextTick(() => searchInputRef.value?.focus());
}

function closeSearch() {
  searchOpen.value = false;
  searchQuery.value = "";
}

function selectMatch(match) {
  closeSearch();
  goToMatchDetails(match, router, props.isLive);
}

const filteredMatches = computed(() => {
  if (!searchQuery.value.trim()) return [];
  const q = searchQuery.value.toLowerCase().trim();
  return props.matches
    .filter(
      (m) =>
        m.homeTeam?.toLowerCase().includes(q) ||
        m.awayTeam?.toLowerCase().includes(q) ||
        m.competitionName?.toLowerCase().includes(q)
    )
    .slice(0, 8);
});

const isSearching = computed(() => searchQuery.value.trim().length > 0);
</script>

<template>
  <div class="col-header-search relative">
    <div
      class="col-header flex items-center px-3 py-1.5"
      :class="tone === 'dark' ? 'col-header--dark' : ''"
    >
      <!-- Search: collapsed icon / expanded input (casino-style) -->
      <div
        :class="[
          'flex items-center transition-all duration-300 ease-in-out',
          searchOpen ? 'flex-1 min-w-0' : 'shrink-0',
        ]"
      >
        <!-- Collapsed: search button with label -->
        <button
          v-if="!searchOpen"
          class="search-btn flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all"
          aria-label="Search matches"
          @click="openSearch"
        >
          <Icon name="tabler:search" class="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          <span class="text-[0.6rem] font-semibold">Search</span>
        </button>

        <!-- Expanded: full-width search input -->
        <div
          v-else
          class="flex items-center flex-1 search-input-wrapper rounded-full px-3 py-0.5"
        >
          <Icon name="tabler:search" class="w-3.5 h-3.5 text-gray-400 dark:text-white/30 shrink-0" aria-hidden="true" />
          <input
            ref="searchInputRef"
            v-model="searchQuery"
            type="text"
            placeholder="Search teams or leagues..."
            class="flex-1 bg-transparent text-[0.75rem] text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-white/30 outline-none px-2 py-1"
          />
          <button
            class="search-close-btn p-0.5 rounded-full transition-colors"
            aria-label="Close search"
            @click="closeSearch"
          >
            <Icon name="tabler:x" class="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      <!-- Spacer (only when search closed) -->
      <div v-if="!searchOpen" class="flex-1 min-w-0"></div>

      <!-- Outcome labels — prematch variant -->
      <div
        v-if="variant === 'prematch'"
        :class="[
          'flex items-center gap-1.5 shrink-0 transition-all duration-300 ease-in-out',
          searchOpen
            ? 'translate-x-full opacity-0 max-w-0 overflow-hidden'
            : 'translate-x-0 opacity-100 max-w-full',
        ]"
      >
        <span
          v-for="label in outcomeLabels"
          :key="label"
          class="flex-1 min-w-[3.2rem] text-center text-[0.8rem] font-semibold text-gray-500 dark:text-white/60 uppercase"
        >
          {{ label }}
        </span>
        <div class="w-8"></div>
      </div>

      <!-- Outcome labels — live variant -->
      <div
        v-else
        :class="[
          'shrink-0 grid grid-cols-3 text-center transition-all duration-300 ease-in-out',
          searchOpen
            ? 'opacity-0 max-w-0 overflow-hidden'
            : 'opacity-100 w-[45%]',
        ]"
      >
        <span
          v-for="label in outcomeLabels"
          :key="label"
          class="text-[0.6rem] font-semibold text-gray-400 dark:text-white/30"
        >
          {{ label }}
        </span>
      </div>
    </div>

    <!-- Search results dropdown -->
    <div
      v-if="searchOpen && isSearching"
      class="absolute inset-x-0 search-dropdown overflow-hidden z-50"
      style="top: 100%"
    >
      <div v-if="filteredMatches.length">
        <div class="px-3 py-1.5 search-dropdown-header">
          <span class="text-[0.65rem] font-medium text-gray-500 dark:text-white/30">
            {{ filteredMatches.length }} result{{ filteredMatches.length > 1 ? 's' : '' }}
          </span>
        </div>
        <div
          v-for="match in filteredMatches"
          :key="match.parentMatchId"
          class="search-result-row px-3 py-2 cursor-pointer"
          @mousedown.prevent="selectMatch(match)"
        >
          <div class="text-[0.75rem] font-medium text-gray-800 dark:text-white/85 truncate">
            {{ match.homeTeam }} vs {{ match.awayTeam }}
          </div>
          <div class="text-[0.6rem] text-gray-400 dark:text-white/35 truncate mt-0.5">
            {{ match.competitionName }}
          </div>
        </div>
      </div>
      <div v-else class="flex flex-col items-center py-6">
        <Icon name="tabler:search" class="w-6 h-6 text-gray-300 dark:text-white/15 mb-1.5" aria-hidden="true" />
        <span class="text-[0.7rem] text-gray-400 dark:text-white/30">No matches found</span>
      </div>
    </div>
  </div>

  <!-- Click-away overlay -->
  <div
    v-if="searchOpen"
    class="fixed inset-0 z-30"
    @click="closeSearch"
  />
</template>

<style scoped>
.col-header {
  background: var(--surface-sunken);
  border-bottom: 1px solid oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .col-header {
  background: oklch(100% 0 0 / 0.02);
  border-bottom-color: oklch(100% 0 0 / 0.04);
}

/* Sunken tone — darker than the panel it sits in */
.col-header--dark {
  background: oklch(0% 0 0 / 0.07);
}
[data-theme="dark"] .col-header--dark {
  background: oklch(0% 0 0 / 0.3);
  border-bottom-color: oklch(100% 0 0 / 0.03);
}

/* Search button */
.search-btn {
  color: var(--muted-foreground);
  background: oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .search-btn {
  color: oklch(100% 0 0 / 0.5);
  background: oklch(100% 0 0 / 0.06);
}
.search-btn:hover {
  color: var(--foreground);
  background: oklch(0% 0 0 / 0.08);
}
[data-theme="dark"] .search-btn:hover {
  color: oklch(100% 0 0 / 0.7);
  background: oklch(100% 0 0 / 0.1);
}

/* Search input */
.search-input-wrapper {
  background: oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .search-input-wrapper {
  background: oklch(100% 0 0 / 0.06);
}

/* Search close button */
.search-close-btn {
  color: var(--muted-foreground);
}
[data-theme="dark"] .search-close-btn {
  color: oklch(100% 0 0 / 0.4);
}
.search-close-btn:hover {
  background: oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .search-close-btn:hover {
  background: oklch(100% 0 0 / 0.08);
}

/* Search dropdown */
.search-dropdown {
  background: white;
  border: 1px solid oklch(0% 0 0 / 0.08);
  border-top: none;
  box-shadow:
    0 4px 12px oklch(0% 0 0 / 0.08),
    0 8px 24px oklch(0% 0 0 / 0.06);
  border-bottom-left-radius: 0.75rem;
  border-bottom-right-radius: 0.75rem;
}
[data-theme="dark"] .search-dropdown {
  background: var(--surface-elevated);
  border-color: oklch(100% 0 0 / 0.06);
  border-top: none;
  box-shadow:
    0 4px 12px oklch(0% 0 0 / 0.3),
    0 8px 24px oklch(0% 0 0 / 0.25);
}
.search-dropdown-header {
  border-bottom: 1px solid oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .search-dropdown-header {
  border-bottom: 1px solid oklch(100% 0 0 / 0.04);
}
.search-result-row:hover {
  background: oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .search-result-row:hover {
  background: oklch(100% 0 0 / 0.05);
}
</style>
