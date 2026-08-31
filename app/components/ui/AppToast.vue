<script setup>
/**
 * AppToast — one toast row. Owns its own auto-dismiss timer (pauses while
 * hovered or focused, like sweetalert2's timerProgressBar did) and emits
 * `dismiss` when the timer ends or the close button is pressed.
 */
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  toast: { type: Object, required: true },
});
const emit = defineEmits(["dismiss"]);

const ICONS = {
  success: "tabler:circle-check",
  error: "tabler:alert-triangle",
  info: "tabler:info-circle",
};
const ICON_CLASS = {
  success: "text-success",
  error: "text-destructive",
  info: "text-muted-foreground",
};

let timer = null;
let startedAt = 0;
let remaining = props.toast.duration;
const running = ref(false);

function start() {
  if (timer || remaining <= 0) return;
  startedAt = performance.now();
  running.value = true;
  timer = setTimeout(() => emit("dismiss"), remaining);
}
function pause() {
  if (!timer) return;
  clearTimeout(timer);
  timer = null;
  remaining -= performance.now() - startedAt;
  running.value = false;
}

onMounted(start);
onBeforeUnmount(() => {
  if (timer) clearTimeout(timer);
});
</script>

<template>
  <div
    class="app-toast pointer-events-auto relative flex w-full items-start gap-2.5 overflow-hidden rounded-lg border border-border-strong bg-card px-3 py-2.5 text-card-foreground elevation-3"
    :class="toast.kind === 'error' ? 'text-destructive' : ''"
    @mouseenter="pause"
    @mouseleave="start"
    @focusin="pause"
    @focusout="start"
  >
    <Icon
      :name="ICONS[toast.kind] ?? ICONS.info"
      class="mt-px h-5 w-5 shrink-0"
      :class="ICON_CLASS[toast.kind] ?? ICON_CLASS.info"
      aria-hidden="true"
    />
    <p class="grow text-sm font-medium leading-snug">{{ toast.title }}</p>
    <button
      type="button"
      class="-mr-1 -mt-0.5 shrink-0 rounded-sm p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
      aria-label="Dismiss notification"
      @click="emit('dismiss')"
    >
      <Icon name="tabler:x" class="h-4 w-4" aria-hidden="true" />
    </button>
    <span
      class="app-toast-progress absolute bottom-0 left-0 h-0.5 w-full bg-current"
      :class="running ? 'app-toast-progress--running' : ''"
      :style="{ animationDuration: toast.duration + 'ms' }"
      aria-hidden="true"
    ></span>
  </div>
</template>
