<script setup>
import BookedBetsCategory from "@/components/community-bets/BookedBetsCategory.vue";
import BookedBetsFAQs from "@/components/community-bets/BookedBetsFAQs.vue";
import LoadCode from "@/components/community-bets/LoadCode.vue";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import AppTabPanel from "@/components/ui/AppTabPanel.vue";
import { ref } from "vue";

const categories = ref(["Bets Hub", "Load Code", "FAQ"]);
</script>

<template>
  <AppTabs>
    <div
      role="tablist"
      aria-label="Booked bets navigation"
      class="flex gap-2"
    >
      <AppTab
        v-for="category in categories"
        :key="category"
        v-slot="{ selected, attrs }"
        as="template"
      >
        <button
          :class="[
            'cursor-pointer rounded-full py-1.5 px-4 text-xs font-semibold text-center transition-colors duration-150 border',
            selected
              ? 'bg-pill-selected text-pill-selected-foreground border-pill-selected'
              : 'bg-card text-muted-foreground border-border/50 hover:text-foreground hover:border-border',
          ]"
          v-bind="attrs"
        >
          {{ category }}
        </button>
      </AppTab>
    </div>
    <div class="mt-4">
      <AppTabPanel>
        <BookedBetsCategory />
      </AppTabPanel>
      <AppTabPanel class="mb-16 md:mb-20">
        <LoadCode />
      </AppTabPanel>
      <AppTabPanel>
        <BookedBetsFAQs />
      </AppTabPanel>
    </div>
  </AppTabs>
</template>
