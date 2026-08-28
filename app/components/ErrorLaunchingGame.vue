<script setup>
import { useLaunchCasinoGame } from "../composables/useLaunchCasinoGame";

const { initGame } = useLaunchCasinoGame();
</script>

<template>
  <div class="error-container">
    <div class="error-content">
      <!-- Icon -->
      <div class="error-icon-wrap">
        <div class="error-icon-bg" />
        <Icon name="tabler:alert-triangle" class="error-icon" aria-hidden="true" />
      </div>

      <!-- Text -->
      <h2 class="error-title">Failed to launch game</h2>
      <p class="error-desc">Something went wrong while loading. Please try again or go back.</p>

      <!-- Actions -->
      <div class="error-actions">
        <button class="error-btn error-btn--secondary" @click="$router.go(-1)">
          <Icon name="tabler:arrow-left" class="w-3.5 h-3.5" aria-hidden="true" />
          Go back
        </button>
        <button class="error-btn error-btn--primary" @click="initGame">
          <Icon name="tabler:refresh" class="w-3.5 h-3.5" aria-hidden="true" />
          Try again
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* ── Light mode (default) ── */
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  min-height: 60vh;
  padding: 24px;
}

.error-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 320px;
}

.error-icon-wrap {
  position: relative;
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.error-icon-bg {
  position: absolute;
  inset: 0;
  border-radius: 16px;
  background: color-mix(in oklch, var(--destructive) 10%, transparent);
  border: 1px solid color-mix(in oklch, var(--destructive) 15%, transparent);
}

.error-icon {
  position: relative;
  width: 32px;
  height: 32px;
  color: var(--destructive);
}

.error-title {
  font-size: 1.0625rem;
  font-weight: 700;
  color: var(--foreground);
  margin-bottom: 8px;
}

.error-desc {
  font-size: 0.8125rem;
  color: oklch(0% 0 0 / 0.45);
  line-height: 1.5;
  margin-bottom: 24px;
}

.error-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.error-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 18px;
  border-radius: 10px;
  font-size: 0.8125rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
  border: none;
}

.error-btn--secondary {
  background: oklch(0% 0 0 / 0.04);
  color: oklch(0% 0 0 / 0.6);
  border: 1px solid oklch(0% 0 0 / 0.1);
}

.error-btn--secondary:hover {
  background: oklch(0% 0 0 / 0.08);
  color: oklch(0% 0 0 / 0.85);
}

.error-btn--primary {
  background: var(--primary);
  color: var(--primary-foreground);
}

.error-btn--primary:hover {
  background: var(--brand-bright);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px color-mix(in oklch, var(--primary) 30%, transparent);
}

/* ── Dark mode ── */
[data-theme="dark"] .error-icon-bg {
  background: color-mix(in oklch, var(--destructive) 8%, transparent);
  border-color: color-mix(in oklch, var(--destructive) 12%, transparent);
}
[data-theme="dark"] .error-icon {
  color: var(--destructive);
}
[data-theme="dark"] .error-title {
  color: white;
}
[data-theme="dark"] .error-desc {
  color: oklch(100% 0 0 / 0.4);
}
[data-theme="dark"] .error-btn--secondary {
  background: oklch(100% 0 0 / 0.06);
  color: oklch(100% 0 0 / 0.7);
  border-color: oklch(100% 0 0 / 0.08);
}
[data-theme="dark"] .error-btn--secondary:hover {
  background: oklch(100% 0 0 / 0.1);
  color: white;
}
</style>
