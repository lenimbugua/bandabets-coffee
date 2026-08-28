
<script setup>
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/vue";
import { storeToRefs } from "pinia";
import { ref } from "vue";
import { useBetsStore } from "../stores/bets";

import { useBetsStatus } from "../composables/useBetsStatus";

const { all, pending, won, cashedOut, lost, voided, cancelled, pendingPayout } =
  useBetsStatus();

const categories = ref([
  { name: "All Bets", status: all },
  { name: "Open", status: pending },
  { name: "Settled", status: won },
]);

const settledCategories = ref([
  { name: "Won", status: won },
  { name: "Lost", status: lost },
  { name: "Cashed Out", status: cashedOut },
  { name: "Pending Payouts", status: pendingPayout },
  { name: "Voided", status: voided },
  { name: "Cancelled", status: cancelled },
]);

const { fetchBets, setAllIsPending, setPending } = useBetsStore();
const { allIsPending } = storeToRefs(useBetsStore());

async function getBets() {
  setAllIsPending(true);
  await fetchBets(1);
  setAllIsPending(false);
}

getBets();

async function filterBetsByStatus(status) {
  setPending(true);
  await fetchBets(status);
  setPending(false);
  //   return bets.value.filter((bet) => bet.status === status);
}
</script>
<template>
  <BetsLoader v-if="allIsPending" />

  <div
    v-else
    class="px-2 py-4 border border-gray-200 dark:border-card rounded-md shadow-sm"
  >
    <div class="page-header">
      <button aria-label="Go back" class="back-btn" @click="$router.go(-1)">
        <Icon name="tabler:chevron-left" class="w-4 h-4" aria-hidden="true" />
      </button>
      <h1 class="page-title">My Bets</h1>
    </div>
    <TabGroup>
      <TabList aria-label="Bet status filters" class="pill-bar">
        <Tab
          v-for="category in categories"
          :key="category.name"
          v-slot="{ selected }"
          as="template"
          @click="filterBetsByStatus(category.status)"
        >
          <button :class="['pill focus:outline-none', selected && 'pill-active']">
            {{ category.name }}
          </button>
        </Tab>
      </TabList>
      <TabPanels>
        <!-- All Bets -->
        <TabPanel>
          <TheBets />
        </TabPanel>

        <!-- Open -->
        <TabPanel>
          <TheBets />
        </TabPanel>

        <!-- Settled -->
        <TabPanel>
          <TabGroup>
            <TabList aria-label="Settled bet categories" class="sub-pill-bar mt-2">
              <Tab
                v-for="category in settledCategories"
                :key="category.name"
                v-slot="{ selected }"
                as="template"
                @click="filterBetsByStatus(category.status)"
              >
                <button :class="['sub-pill outline-none', selected && 'sub-pill-active']">
                  {{ category.name }}
                </button>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel><TheBets /></TabPanel>
              <TabPanel><TheBets /></TabPanel>
              <TabPanel><TheBets /></TabPanel>
              <TabPanel><TheBets /></TabPanel>
              <TabPanel><TheBets /></TabPanel>
              <TabPanel><TheBets /></TabPanel>
            </TabPanels>
          </TabGroup>
        </TabPanel>
      </TabPanels>
    </TabGroup>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding-bottom: 0.75rem;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid oklch(0% 0 0 / 0.06);
}
[data-theme="dark"] .page-header {
  border-bottom-color: oklch(100% 0 0 / 0.06);
}

.back-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  color: oklch(40% 0 0);
  cursor: pointer;
  transition: background 0.15s, color 0.15s;
}
.back-btn:hover {
  background: oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .back-btn {
  color: oklch(100% 0 0 / 0.6);
}
[data-theme="dark"] .back-btn:hover {
  background: oklch(100% 0 0 / 0.06);
}

.page-title {
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  color: oklch(15% 0 0);
}
[data-theme="dark"] .page-title {
  color: oklch(100% 0 0 / 0.9);
}

/* ── Primary pill bar ── */
.pill-bar {
  display: flex;
  gap: 0.3rem;
  padding: 0.25rem;
  border-radius: 0.625rem;
  background: var(--surface-elevated);
  border: 1px solid oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .pill-bar {
  background: oklch(100% 0 0 / 0.03);
  border-color: oklch(100% 0 0 / 0.06);
}

.pill {
  flex: 1;
  padding: 0.5rem 0.75rem;
  border-radius: 0.5rem;
  font-size: 0.75rem;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;
  cursor: pointer;
  color: oklch(45% 0 0);
  transition: all 0.15s;
}
.pill:hover {
  background: oklch(0% 0 0 / 0.04);
}
[data-theme="dark"] .pill {
  color: oklch(100% 0 0 / 0.5);
}
[data-theme="dark"] .pill:hover {
  background: oklch(100% 0 0 / 0.04);
}

.pill-active {
  background: oklch(100% 0 0);
  color: oklch(20% 0 0);
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.08);
}
.pill-active:hover {
  background: oklch(100% 0 0);
}
[data-theme="dark"] .pill-active {
  background: oklch(100% 0 0 / 0.1);
  color: oklch(100% 0 0 / 0.9);
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.2);
}
[data-theme="dark"] .pill-active:hover {
  background: oklch(100% 0 0 / 0.1);
}

/* ── Sub-category pills (settled) ── */
.sub-pill-bar {
  display: flex;
  gap: 0.25rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.sub-pill-bar::-webkit-scrollbar {
  display: none;
}

.sub-pill {
  padding: 0.325rem 0.625rem;
  border-radius: 1rem;
  font-size: 0.65rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  color: oklch(45% 0 0);
  border: 1px solid oklch(0% 0 0 / 0.08);
  background: transparent;
  transition: all 0.15s;
}
.sub-pill:hover {
  border-color: oklch(0% 0 0 / 0.15);
}
[data-theme="dark"] .sub-pill {
  color: oklch(100% 0 0 / 0.45);
  border-color: oklch(100% 0 0 / 0.08);
}
[data-theme="dark"] .sub-pill:hover {
  border-color: oklch(100% 0 0 / 0.15);
}

.sub-pill-active {
  background: oklch(25% 0 0);
  color: oklch(100% 0 0);
  border-color: transparent;
}
.sub-pill-active:hover {
  border-color: transparent;
}
[data-theme="dark"] .sub-pill-active {
  background: oklch(100% 0 0 / 0.12);
  color: oklch(100% 0 0 / 0.9);
  border-color: transparent;
}
[data-theme="dark"] .sub-pill-active:hover {
  border-color: transparent;
}
</style>
