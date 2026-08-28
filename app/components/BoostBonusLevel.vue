<script setup>
import { useMultibetBonus } from "@/composables/useMultibetBonus";
import MultibetBoost from "./MultibetBoost.vue";

import { ref } from "vue";

const {
  getNextBoost,
  getCurrentBoost,
  getLegsToNextBonus,
} = useMultibetBonus();

const showMultibetBoost = ref(false);
</script>
<template>
  <div class="level-strip">
    <div class="level-row">
      <div class="level-info">
        <svg class="level-icon" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.25-10.307a.75.75 0 0 0-1.064-1.058l-.161.162a14.5 14.5 0 0 0-2.168 2.928l-.06.119a.75.75 0 0 1-1.07.283l-.157-.098a3.75 3.75 0 0 0-3.98-.026.75.75 0 1 0 .79 1.275 2.25 2.25 0 0 1 2.389.015l.156.099a2.25 2.25 0 0 0 3.211-.85l.06-.118a13 13 0 0 1 1.943-2.62l.111-.111Z" clip-rule="evenodd" />
        </svg>
        <span class="level-text">Add {{ getLegsToNextBonus() }} more (odds 1.2+) for {{ getNextBoost() }}% boost</span>
      </div>
      <button
        type="button"
        class="level-toggle"
        :aria-label="showMultibetBoost ? 'Hide details' : 'Show details'"
        @click="showMultibetBoost = !showMultibetBoost"
      >
        <Icon name="tabler:chevron-down" class="toggle-icon" :class="{ 'toggle-open': showMultibetBoost }" aria-hidden="true" />
      </button>
    </div>
    <div class="level-track">
      <div class="level-fill" :style="{ width: getCurrentBoost() + '%' }"></div>
    </div>
  </div>
  <MultibetBoost v-if="!showMultibetBoost" />
</template>

<style scoped>
.level-strip {
  padding: 0.375rem 0;
}

.level-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  margin-bottom: 0.25rem;
}

.level-info {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.level-icon {
  width: 0.85rem;
  height: 0.85rem;
  flex-shrink: 0;
  color: var(--primary);
}

.level-text {
  font-size: 0.6rem;
  font-weight: 500;
  color: oklch(40% 0 0);
}
[data-theme="dark"] .level-text {
  color: oklch(100% 0 0 / 0.5);
}

.level-toggle {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background 0.15s;
}
.level-toggle:hover {
  background: oklch(0% 0 0 / 0.05);
}
[data-theme="dark"] .level-toggle:hover {
  background: oklch(100% 0 0 / 0.06);
}

.toggle-icon {
  width: 0.85rem;
  height: 0.85rem;
  color: oklch(50% 0 0);
  transition: transform 0.2s;
}
[data-theme="dark"] .toggle-icon {
  color: oklch(100% 0 0 / 0.4);
}
.toggle-open {
  transform: rotate(180deg);
}

.level-track {
  height: 0.2rem;
  border-radius: 1rem;
  background: color-mix(in oklch, var(--primary) 12%, transparent);
  overflow: hidden;
}
[data-theme="dark"] .level-track {
  background: color-mix(in oklch, var(--primary) 8%, transparent);
}

.level-fill {
  height: 100%;
  border-radius: 1rem;
  background: var(--primary);
  transition: width 0.4s ease;
}
</style>
