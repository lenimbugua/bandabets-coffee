<script setup>
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useLoginStore } from "../stores/login";
import { useModalStore } from "@/stores/modal";
import { useModalTypes } from "@/composables/useModalTypes";
import { useCasinoStore } from "../stores/casino";

const { launchGame, setIsDemo } = useCasinoStore();
const { isDemo } = storeToRefs(useCasinoStore());

const { openModal, setAfterCloseFunction } = useModalStore();
const { login } = useModalTypes();

const { setAfterLoginAction } = useLoginStore();
const { isAuthenticated } = storeToRefs(useLoginStore());

const isRealPlay = computed(() => isDemo.value !== 1);

function afterLoginAction() {
  setIsDemo(0);
  launchGame();
}

function afterLoginModalClose() {
  if (isAuthenticated.value) return;
  setIsDemo(1);
}

const toggle = async () => {
  if (isAuthenticated.value) {
    setIsDemo(isRealPlay.value ? 1 : 0);
    await launchGame();
    return;
  }
  setAfterCloseFunction(afterLoginModalClose);
  setAfterLoginAction(afterLoginAction);
  openModal(login);
};
</script>

<template>
  <div class="toggle-container">
    <!-- Free Play label -->
    <button
      class="toggle-label"
      :class="!isRealPlay && 'toggle-label--active'"
      @click="isRealPlay && toggle()"
    >
      <Icon name="tabler:player-play-filled" class="toggle-icon" aria-hidden="true" />
      Free
    </button>

    <!-- Toggle track -->
    <button
      class="toggle-track"
      :class="isRealPlay ? 'is-real' : 'is-demo'"
      aria-label="Toggle between free play and real play"
      @click="toggle"
    >
      <span class="toggle-thumb" :class="isRealPlay ? 'translate-x-5' : 'translate-x-0.5'" />
    </button>

    <!-- Real Play label -->
    <button
      class="toggle-label"
      :class="isRealPlay && 'toggle-label--active toggle-label--real'"
      @click="!isRealPlay && toggle()"
    >
      <Icon name="tabler:credit-card" class="toggle-icon" aria-hidden="true" />
      Real
    </button>
  </div>
</template>

<style scoped>
/* ── Light mode (default) ── */
.toggle-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.toggle-label {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.6875rem;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: oklch(0% 0 0 / 0.3);
  background: none;
  border: none;
  cursor: pointer;
  transition: color 0.2s;
  padding: 4px 0;
}

.toggle-label--active {
  color: oklch(0% 0 0 / 0.85);
}

.toggle-label--real {
  color: var(--primary);
}

.toggle-icon {
  width: 12px;
  height: 12px;
}

.toggle-track {
  position: relative;
  width: 2.75rem;
  height: 1.5rem;
  border-radius: 9999px;
  cursor: pointer;
  transition: background 0.25s, box-shadow 0.25s;
  border: none;
  outline: none;
}

.toggle-track.is-demo {
  background: var(--surface-interactive);
  box-shadow: inset 0 1px 3px oklch(0% 0 0 / 0.1);
}

.toggle-track.is-real {
  background: var(--primary);
  box-shadow:
    0 0 8px color-mix(in oklch, var(--primary) 20%, transparent),
    inset 0 1px 1px oklch(100% 0 0 / 0.1);
}

.toggle-thumb {
  display: block;
  width: 1.125rem;
  height: 1.125rem;
  border-radius: 9999px;
  background: white;
  box-shadow: 0 1px 4px oklch(0% 0 0 / 0.15);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  position: absolute;
  top: 50%;
  left: 0;
  transform-origin: center;
  margin-top: -0.5625rem;
}

/* ── Dark mode ── */
[data-theme="dark"] .toggle-label {
  color: var(--muted-foreground);
}
[data-theme="dark"] .toggle-label--active {
  color: var(--foreground);
}
[data-theme="dark"] .toggle-label--real {
  color: var(--brand-bright);
}
[data-theme="dark"] .toggle-track.is-demo {
  background: var(--surface-elevated);
  box-shadow: inset 0 1px 3px oklch(0% 0 0 / 0.3);
}
[data-theme="dark"] .toggle-track.is-real {
  box-shadow:
    0 0 12px color-mix(in oklch, var(--primary) 35%, transparent),
    inset 0 1px 1px oklch(100% 0 0 / 0.1);
}
[data-theme="dark"] .toggle-thumb {
  box-shadow: 0 1px 4px oklch(0% 0 0 / 0.25);
}
</style>
