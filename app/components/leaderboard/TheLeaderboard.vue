<script setup>
import { useLeaderboardStore } from "@/stores/leaderboard";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import AppTabPanel from "@/components/ui/AppTabPanel.vue";
import { ref, toRefs } from "vue";
import EligibleCasinoGame from "./EligibleCasinoGame.vue";

const { isSelected, categories } = toRefs(useLeaderboardStore());

const casinoTabs = ref([
  { name: "Leaderboard", icon: "tabler:trophy" },
  { name: "Eligible Games", icon: "tabler:puzzle" },
]);

const selectedCasinoTab = ref(casinoTabs.value[0].name);
const isSelectedCasinoTab = (tab) => selectedCasinoTab.value === tab;
const setSelectedCasinoTab = (tab) => (selectedCasinoTab.value = tab);
</script>

<template>
  <div class="bg-card rounded-xl overflow-hidden border border-border/50">
    <!-- Sport header -->
    <div
      v-if="isSelected(categories[0])"
      class="flex items-center justify-between px-4 py-3 border-b border-border/50"
    >
      <h2 class="text-base md:text-lg font-bold text-foreground">
        Current Standings
      </h2>
      <span class="text-xs text-muted-foreground font-medium">Sport</span>
    </div>

    <!-- Casino tabs -->
    <AppTabs v-if="isSelected(categories[1])">
      <div class="flex items-center justify-between border-b border-border/50 px-4 py-2">
        <div role="tablist" class="flex gap-1">
          <AppTab
            v-for="tab in casinoTabs"
            :key="tab.name"
            v-slot="{ attrs }"
            as="template"
          >
            <button
              :class="[
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors',
                isSelectedCasinoTab(tab.name)
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              ]"
              v-bind="attrs"
              @click="setSelectedCasinoTab(tab.name)"
            >
              <Icon :name="tab.icon" class="w-3.5 h-3.5" />
              {{ tab.name }}
            </button>
          </AppTab>
        </div>
        <span class="text-xs text-muted-foreground font-medium">Casino</span>
      </div>

      <div>
        <AppTabPanel>
          <LeaderboardTable />
        </AppTabPanel>
        <AppTabPanel class="p-3">
          <EligibleCasinoGame />
        </AppTabPanel>
      </div>
    </AppTabs>

    <!-- Sport table -->
    <div v-if="isSelected(categories[0])">
      <LeaderboardTable />
    </div>
  </div>
</template>
