<script setup>
import { useRoute } from "vue-router";
import { useBetBuilderStore } from "../stores/betbuilder";

const route = useRoute();

function routeIsMatchDetails() {
  return route.name === "match-details";
}

defineProps({
  selections: {
    type: Array,
    required: true,
  },
});

const { deleteAnItemFromSelections } = useBetBuilderStore();
</script>
<template>
  <div class="sel-list">
    <div
      v-for="(selection, idx) in selections"
      :key="selection.customId"
      class="sel-row"
      :class="{ 'sel-row-last': idx === selections.length - 1 }"
    >
      <div class="sel-dot"></div>
      <div class="sel-content">
        <span class="sel-market">{{ selection.oddType }}</span>
        <div class="sel-pick-row">
          <span class="sel-pick">{{ selection.outcomeName }}</span>
          <span v-if="selection.specifiers" class="sel-spec">{{ selection.specifiers }}</span>
        </div>
      </div>
      <button
        v-if="routeIsMatchDetails()"
        class="sel-remove-btn"
        @click="deleteAnItemFromSelections(selection.parentMatchId, selection.customId)"
      >
        <Icon name="tabler:x" class="w-3 h-3" aria-hidden="true" />
      </button>
    </div>
  </div>
</template>

<style scoped>
.sel-list {
  max-height: 7.5rem;
  overflow-y: auto;
  scrollbar-width: none;
  border-top: 1px solid oklch(0% 0 0 / 0.06);
  padding: 0.25rem 0.5rem;
}
.sel-list::-webkit-scrollbar {
  display: none;
}
[data-theme="dark"] .sel-list {
  border-top-color: oklch(100% 0 0 / 0.04);
}

.sel-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem 0.25rem;
  border-bottom: 1px solid oklch(0% 0 0 / 0.04);
}
.sel-row-last {
  border-bottom: none;
}
[data-theme="dark"] .sel-row {
  border-bottom-color: oklch(100% 0 0 / 0.03);
}
[data-theme="dark"] .sel-row-last {
  border-bottom: none;
}

.sel-dot {
  width: 0.375rem;
  height: 0.375rem;
  border-radius: 50%;
  background: var(--primary);
  flex-shrink: 0;
}
[data-theme="dark"] .sel-dot {
  background: var(--primary);
}

.sel-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.sel-market {
  font-size: 0.55rem;
  font-weight: 600;
  color: oklch(50% 0 0);
}
[data-theme="dark"] .sel-market {
  color: oklch(100% 0 0 / 0.4);
}

.sel-pick-row {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sel-pick {
  font-size: 0.6rem;
  font-weight: 700;
  color: oklch(25% 0 0);
}
[data-theme="dark"] .sel-pick {
  color: oklch(100% 0 0 / 0.75);
}

.sel-spec {
  font-size: 0.55rem;
  font-weight: 600;
  color: var(--muted-foreground);
  font-variant-numeric: tabular-nums;
}
[data-theme="dark"] .sel-spec {
  color: var(--muted-foreground);
}

.sel-remove-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 0.25rem;
  color: oklch(55% 0 0);
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s, color 0.15s;
}
.sel-remove-btn:hover {
  background: oklch(55% 0.22 25 / 0.1);
  color: oklch(50% 0.22 25);
}
[data-theme="dark"] .sel-remove-btn {
  color: oklch(100% 0 0 / 0.35);
}
[data-theme="dark"] .sel-remove-btn:hover {
  background: oklch(65% 0.2 25 / 0.12);
  color: oklch(70% 0.18 25);
}
</style>
