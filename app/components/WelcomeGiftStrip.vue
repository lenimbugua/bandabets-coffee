<script setup>
import { computed, onMounted, ref } from "vue";
import { storeToRefs } from "pinia";
import { RouterLink } from "vue-router";
import { useLoginStore } from "@/stores/login";
import { useFreebetStore } from "@/stores/freebet";

const DISMISS_KEY = "wg_strip_dismissed";

const { token } = storeToRefs(useLoginStore());
const freebetStore = useFreebetStore();
const { redeemedFreebets, redeemedPending } = storeToRefs(freebetStore);

const dismissed = ref(sessionStorage.getItem(DISMISS_KEY) === "1");

// Show only to a signed-in player whose welcome gift is still unclaimed.
const show = computed(() => {
  if (dismissed.value) return false;
  if (!token.value) return false;
  if (redeemedPending.value) return false;
  return redeemedFreebets.value === false;
});

function dismiss() {
  dismissed.value = true;
  sessionStorage.setItem(DISMISS_KEY, "1");
}

onMounted(() => {
  // Resolve claimed status once for the session if we don't have it yet.
  if (token.value && redeemedFreebets.value === null && !redeemedPending.value) {
    freebetStore.fetchRedeemedFreebets();
  }
});
</script>

<template>
  <Transition name="wg-strip">
    <RouterLink
      v-if="show"
      :to="{ name: 'welcome-gift' }"
      class="wg-strip group relative flex items-center gap-3 overflow-hidden rounded-2xl px-3.5 py-3 mx-3 lg:mx-0 mt-3 mb-1 border border-brand-bright/25 bg-linear-to-r from-brand-forest/90 via-brand-forest/70 to-surface-elevated/90 shadow-[0_6px_24px_-12px_var(--brand-bright)] transition-all duration-200 hover:border-brand-bright/45 hover:-translate-y-0.5"
    >
      <!-- ambient glow -->
      <span
        aria-hidden="true"
        class="pointer-events-none absolute -top-10 -right-6 h-28 w-28 rounded-full bg-brand-bright/25 blur-3xl opacity-50 transition-opacity duration-300 group-hover:opacity-80"
      ></span>

      <!-- gift medallion -->
      <span
        class="relative z-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gold/40 bg-gold/12 text-gold-bright"
      >
        <Icon name="tabler:gift" class="h-5 w-5" />
      </span>

      <!-- copy -->
      <div class="relative z-1 min-w-0 flex-1">
        <p class="text-sm font-bold text-white leading-tight">
          Your welcome gift is waiting
        </p>
        <p class="text-[0.7rem] text-white/60 leading-tight mt-0.5 truncate">
          Claim a free bet — no deposit needed.
        </p>
      </div>

      <!-- CTA -->
      <span
        class="relative z-1 hidden sm:flex items-center gap-1 rounded-lg bg-white/12 px-3 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-white/20"
      >
        Claim
        <Icon
          name="tabler:chevron-right"
          class="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </span>

      <!-- dismiss -->
      <button
        type="button"
        aria-label="Dismiss"
        class="relative z-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-white/45 transition-colors hover:bg-white/10 hover:text-white/80"
        @click.prevent.stop="dismiss"
      >
        <Icon name="tabler:x" class="h-4 w-4" aria-hidden="true" />
      </button>
    </RouterLink>
  </Transition>
</template>

<style scoped>
.wg-strip-enter-active,
.wg-strip-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.wg-strip-enter-from,
.wg-strip-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
@media (prefers-reduced-motion: reduce) {
  .wg-strip,
  .wg-strip-enter-active,
  .wg-strip-leave-active {
    transition: none;
  }
}
</style>
