<script setup>
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
const { setMatchId } = useSportsQueryParamsStore();
const { openModal } = useModalStore();
const { geniusGameTracker } = useModalTypes();

const props = defineProps({
  parentMatchId: {
    type: String,
    required: true,
  },
});

function openGeniusGameTracker() {
  setMatchId(props.parentMatchId);
  openModal(geniusGameTracker);
}
</script>
<template>
  <button class="stat-btn" aria-label="Open match statistics" @click="openGeniusGameTracker()">
    <Icon name="tabler:chart-bar" class="stat-icon" aria-hidden="true" />
  </button>
</template>

<style scoped>
.stat-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.15s;
}
.stat-btn:hover {
  background: oklch(55% 0.19 142 / 0.08);
}
[data-theme="dark"] .stat-btn:hover {
  background: oklch(65% 0.17 142 / 0.1);
}

.stat-icon {
  width: 0.8rem;
  height: 0.8rem;
  color: var(--primary);
}
[data-theme="dark"] .stat-icon {
  color: var(--primary);
}
</style>
