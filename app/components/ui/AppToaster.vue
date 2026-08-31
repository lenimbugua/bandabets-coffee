<script setup>
/**
 * AppToaster — renders the shared toast queue from useToast.js. Mounted once
 * in app.vue. One fixed stack per position; each stack is a polite live
 * region so screen readers announce new toasts without focus moving. During
 * SSR it renders only the (empty) live regions. Stack is z-[1100] so toasts
 * stay above app modals (AppDialog/LoginModal/DepositModal/BetslipModal sit
 * at z-999/z-1000) but below BrandSplash's z-9999.
 */
import { computed } from "vue";
import { toasts, dismissToast } from "@/composables/useToast";
import AppToast from "./AppToast.vue";

const POSITIONS = ["top", "top-right", "bottom-right"];
const POSITION_CLASS = {
  top: "top-3 left-1/2 -translate-x-1/2 items-center",
  "top-right": "top-3 right-3 items-end",
  "bottom-right": "bottom-3 right-3 items-end",
};

const groups = computed(() =>
  POSITIONS.map((position) => ({
    position,
    items: toasts.filter((t) => t.position === position),
  }))
);
</script>

<template>
  <div data-app-toaster>
    <div
      v-for="group in groups"
      :key="group.position"
      class="pointer-events-none fixed z-[1100] flex w-[calc(100vw-1.5rem)] max-w-sm flex-col gap-2"
      :class="POSITION_CLASS[group.position]"
      role="status"
      aria-live="polite"
      aria-atomic="false"
    >
      <TransitionGroup name="app-toast">
        <AppToast
          v-for="t in group.items"
          :key="t.id"
          :toast="t"
          @dismiss="dismissToast(t.id)"
        />
      </TransitionGroup>
    </div>
  </div>
</template>
