<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";

// const { competitionIsLoading, status, liveTimerElapsedSeconds } = storeToRefs(
//   useLeagueStore()
// );

const tabs = ["results", "standings", "My Bets"];
</script>

<template>
  <ThePanel class="w-84 max-h-[calc(100vh-90px)]">
    <!-- <LiveAnimatePulse v-if="competitionIsLoading" /> -->

      <AppTabs role="tablist" aria-label="League side panel navigation" class="flex rounded-t-md overflow-clip">
        <AppTab
          v-for="tab in tabs"
          :key="tab"
          v-slot="{ selected, attrs }"
          as="template"
        >
          <button
            class="bg-secondary font-extrabold px-2 w-full whitespace-nowrap hover:bg-opacity-50 capitalize py-2.5 text-sm border-x border-black/20 dark:border-black/40 first:border-l-0 last:border-r-0 focus:outline-hidden"
            :class="[selected ? 'text-accent-500' : 'text-white/80']"
            v-bind="attrs"
          >
            {{ tab }}
          </button>
        </AppTab>
        <!-- <div
          class="max-h-[calc(100vh-170px)] overflow-y-scroll scrollbar-hide"
        >
          <AppTabPanel class="focus:outline-hidden">
            <TheLive v-if="status == 'LIVE' || status == 'ENDED'" />
            <div v-else class="bg-pattern">
              <TheCountDown />
            </div>
          </AppTabPanel>
          <AppTabPanel class="focus:outline-hidden">
            <TheResults />
          </AppTabPanel>
          <AppTabPanel class="bg-pattern bg-pattern focus:outline-hidden">
            <TheStandings />
          </AppTabPanel>
        </div> -->
      </AppTabs>
  </ThePanel>
</template>
