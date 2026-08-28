<script setup>
import { storeToRefs } from "pinia";
import { computed, onBeforeUnmount, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useCasinoStore } from "../stores/casino";
import { useModalStore } from "@/stores/modal";
import { useLaunchCasinoGame } from "../composables/useLaunchCasinoGame";
import ErrorLaunchingGame from "./ErrorLaunchingGame.vue";

const route = useRoute();
const { initGame } = useLaunchCasinoGame();
const { closeModal } = useModalStore();
const { launchData, responseOK, pending, gameNameToLaunch, gameProviderToLaunch } = storeToRefs(useCasinoStore());

const displayGameName = computed(() => {
  if (gameNameToLaunch.value) return gameNameToLaunch.value;
  const slug = route.params?.name;
  if (!slug) return "Your Game";
  return String(slug)
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
});

onMounted(() => {
  initGame();
});

onBeforeUnmount(() => {
  closeModal();
});

// Soft-gaming launch returns an HTML body to inject (not a URL). Append a
// reset style so the embedded game fills the viewport cleanly.
function addStyleToLaunchData(data) {
  return (
    data.launchBody +
    "<style>body{margin:0;background:#0d0d1a;}#egamings_container{height:100dvh;width:100vw;overflow:scroll;}</style>"
  );
}
</script>

<template>
  <!-- Loading state -->
  <div v-if="pending" class="game-loading">
    <div class="game-loading-stage">
      <div class="game-loading-frame">
        <div class="game-loading-shimmer" aria-hidden="true"></div>

        <div class="game-loading-overlay">
          <div class="game-loading-emblem" aria-hidden="true">
            <div class="emblem-glow"></div>
            <div class="emblem-ring"></div>
            <Icon name="tabler:player-play-filled" class="emblem-icon" aria-hidden="true" />
          </div>

          <div class="game-loading-meta">
            <p class="game-loading-eyebrow">Preparing your game</p>
            <h2 class="game-loading-title">{{ displayGameName }}</h2>
            <p v-if="gameProviderToLaunch" class="game-loading-provider">
              {{ gameProviderToLaunch }}
            </p>
          </div>

          <div class="game-loading-progress" aria-hidden="true">
            <div class="game-loading-progress-bar"></div>
          </div>

          <p class="game-loading-hint">Buffering the experience…</p>
        </div>
      </div>
    </div>
  </div>

  <!-- Error state -->
  <div v-else-if="!responseOK" class="w-full h-full">
    <ErrorLaunchingGame />
  </div>

  <!-- Game iframe -->
  <div v-else class="game-viewport">
    <iframe
      v-if="launchData"
      class="game-iframe"
      :srcdoc="addStyleToLaunchData(launchData)"
      allow="fullscreen; autoplay; encrypted-media; accelerometer; gyroscope"
      allowfullscreen
    />
  </div>
</template>

<style scoped>
.game-loading {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 16px;
  background:
    radial-gradient(
      circle at 20% 0%,
      color-mix(in oklch, var(--primary) 14%, transparent),
      transparent 55%
    ),
    radial-gradient(
      circle at 80% 100%,
      color-mix(in oklch, var(--gold) 16%, transparent),
      transparent 55%
    ),
    var(--background);
  overflow: hidden;
}

.game-loading-stage {
  width: 100%;
  max-width: 720px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.game-loading-frame {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: min(480px, 70vh);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    135deg,
    var(--surface-elevated),
    var(--surface-interactive) 50%,
    var(--surface-sunken)
  );
  border: 1px solid var(--border);
  box-shadow:
    0 30px 60px -20px color-mix(in oklch, var(--background) 80%, transparent),
    0 0 0 1px color-mix(in oklch, var(--primary) 12%, transparent) inset;
}

.game-loading-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    115deg,
    transparent 0%,
    transparent 40%,
    color-mix(in oklch, var(--foreground) 8%, transparent) 50%,
    transparent 60%,
    transparent 100%
  );
  background-size: 220% 100%;
  animation: shimmer-sweep 2.6s ease-in-out infinite;
}

.game-loading-overlay {
  position: relative;
  z-index: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 18px;
  padding: 24px;
}

.game-loading-emblem {
  position: relative;
  width: 76px;
  height: 76px;
  flex: 0 0 76px;
  aspect-ratio: 1 / 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.emblem-glow,
.emblem-ring {
  box-sizing: border-box;
}

.emblem-glow {
  position: absolute;
  inset: -22px;
  border-radius: 9999px;
  background: radial-gradient(
    circle,
    color-mix(in oklch, var(--gold) 55%, transparent),
    transparent 70%
  );
  filter: blur(8px);
  animation: emblem-pulse 2.4s ease-in-out infinite;
}

.emblem-ring {
  position: absolute;
  inset: 0;
  border-radius: 9999px;
  border: 2px solid color-mix(in oklch, var(--foreground) 14%, transparent);
  border-top-color: var(--gold);
  border-right-color: color-mix(in oklch, var(--primary) 70%, transparent);
  animation: emblem-spin 1.6s linear infinite;
}

.emblem-icon {
  position: relative;
  width: 30px;
  height: 30px;
  color: var(--gold);
  filter: drop-shadow(0 0 8px color-mix(in oklch, var(--gold) 65%, transparent));
  animation: emblem-pulse 2.4s ease-in-out infinite;
}

.game-loading-meta {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  text-align: center;
  max-width: 90%;
}

.game-loading-eyebrow {
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--gold);
}

.game-loading-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--foreground);
  letter-spacing: -0.01em;
  line-height: 1.2;
}

.game-loading-provider {
  margin: 0;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--muted-foreground);
}

.game-loading-progress {
  position: relative;
  width: min(280px, 80%);
  height: 3px;
  border-radius: 9999px;
  background: color-mix(in oklch, var(--foreground) 10%, transparent);
  overflow: hidden;
}

.game-loading-progress-bar {
  position: absolute;
  inset: 0;
  width: 40%;
  border-radius: inherit;
  background: linear-gradient(
    90deg,
    color-mix(in oklch, var(--primary) 80%, transparent),
    var(--gold),
    color-mix(in oklch, var(--primary) 80%, transparent)
  );
  animation: progress-sweep 1.8s ease-in-out infinite;
}

.game-loading-hint {
  margin: 0;
  font-size: 0.7rem;
  font-weight: 600;
  color: var(--muted-foreground);
  letter-spacing: 0.04em;
}

.game-viewport {
  width: 100%;
  height: 100%;
  max-width: 1680px;
  margin: 0 auto;
}

.game-iframe {
  width: 100%;
  height: 100%;
  border: 0;
}

@keyframes shimmer-sweep {
  0% { background-position: 220% 0; }
  100% { background-position: -120% 0; }
}

@keyframes emblem-spin {
  to { transform: rotate(360deg); }
}

@keyframes emblem-pulse {
  0%, 100% { opacity: 0.85; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.05); }
}

@keyframes progress-sweep {
  0% { transform: translateX(-110%); }
  50% { transform: translateX(60%); }
  100% { transform: translateX(260%); }
}

@media (prefers-reduced-motion: reduce) {
  .game-loading-shimmer,
  .emblem-glow,
  .emblem-ring,
  .emblem-icon,
  .game-loading-progress-bar {
    animation: none;
  }
}
</style>
