<script setup>
import { ref, watchEffect } from "vue";
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { useModalStore } from "@/stores/modal";
import { useModalTypes } from "@/composables/useModalTypes";
import { computed } from "vue";
import { useSearchStore } from "../stores/search";
import MatchesForSearch from "./MatchesForSearch.vue";

const { performSearch } = useSearchStore();
performSearch();

const { search } = useModalTypes();
const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();

const searchTerm = ref("");
const searchInputRef = ref(null);

const showSearch = computed(() => {
  return modalType.value === search && showModal.value;
});

const debounceTimeout = ref(null);
const debounceSearch = () => {
  clearTimeout(debounceTimeout.value);
  debounceTimeout.value = setTimeout(() => {
    if (searchTerm.value) {
      performSearch(searchTerm.value);
    }
  }, 500);
};

watchEffect(() => {
  if (!searchTerm.value) {
    clearTimeout(debounceTimeout.value);
  }
});

function clearSearch() {
  searchTerm.value = "";
  searchInputRef.value?.focus();
}
</script>

<template>
  <!-- Headless UI's `static` was a render-strategy flag (outside click still
       closed the dialog); AppDialog's `static` would suppress that close, so
       it is deliberately not passed here to keep backdrop-click-to-close. -->
  <AppDialog
    :open="showSearch"
    :initial-focus="searchInputRef"
    aria-label="Search"
    z-class="z-60"
    overlay-class="bg-black/40 dark:bg-black/60"
    container-class="flex min-h-0 justify-center p-3 sm:p-6 sm:pt-[10vh]"
    panel-class="w-full max-w-2xl bg-card rounded-xl overflow-hidden shadow-xl flex flex-col max-h-[85vh]"
    @close="closeModal"
  >
    <!-- Search header -->
    <div class="shrink-0 p-3 sm:p-4 border-b border-border/50">
      <div class="flex items-center gap-2">
        <div class="flex-1 relative">
          <Icon name="tabler:search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
          <input
            ref="searchInputRef"
            v-model="searchTerm"
            type="search"
            placeholder="Search matches, teams, leagues..."
            aria-label="Search for matches, competitions, teams"
            class="w-full bg-background border-2 border-border rounded-lg pl-9 pr-8 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-colors"
            @input="debounceSearch(searchTerm)"
          />
          <button
            v-if="searchTerm"
            aria-label="Clear search"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded text-muted-foreground/40 hover:text-foreground transition-colors"
            @click="clearSearch"
          >
            <Icon name="tabler:x" class="w-4 h-4" />
          </button>
        </div>
        <button
          class="shrink-0 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-2 py-2"
          @click="closeModal"
        >
          Cancel
        </button>
      </div>
    </div>

    <!-- Results -->
    <div class="flex-1 min-h-0 overflow-y-auto">
      <div v-if="searchTerm" class="p-2">
        <MatchesForSearch />
      </div>
      <div v-else class="flex flex-col items-center justify-center py-12 px-4">
        <div class="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
          <Icon name="tabler:search" class="w-5 h-5 text-muted-foreground/30" />
        </div>
        <p class="text-sm text-muted-foreground text-center">
          Search for matches, teams, or leagues
        </p>
      </div>
    </div>
  </AppDialog>
</template>
