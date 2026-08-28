<script setup>
/**
 * AppDialog — native replacement for Headless UI's
 * TransitionRoot + Dialog + TransitionChild×2 + DialogPanel + DialogTitle.
 *
 * Usage:
 *   <AppDialog :open="show" :initial-focus="closeBtn" panel-class="w-full max-w-md …" @close="close">
 *     <template #default="{ titleId }">
 *       <h3 :id="titleId">Title</h3>
 *       …
 *     </template>
 *   </AppDialog>
 *
 * - `open` drives a `<Transition>` (overlay fade 300/200 ms, panel fade+scale
 *   300/200 ms — the dominant TransitionChild set in the codebase).
 * - Escape and outside click (unless `static`) emit `close`; the component
 *   never closes itself — the parent owns `open`.
 * - Focus: on open remembers `document.activeElement`, moves focus to
 *   `initialFocus` → first focusable in the panel → the panel; Tab/Shift+Tab
 *   cycle inside the panel; on close focus returns to the remembered element.
 * - Body scroll is locked while any AppDialog is open (module-level counter).
 */
import { nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";

const props = defineProps({
  open: { type: Boolean, default: false },
  /** Element (or component with $el) to focus on open. */
  initialFocus: { type: [Object, null], default: null },
  /** When true, clicking the overlay does not emit `close`. */
  static: { type: Boolean, default: false },
  /** Classes for the panel element (Headless UI's DialogPanel classes). */
  panelClass: { type: [String, Array, Object], default: "" },
  /** Classes for the full-screen backdrop. */
  overlayClass: { type: [String, Array, Object], default: "bg-black/75" },
  /** Classes for the scroll container that positions the panel. */
  containerClass: {
    type: [String, Array, Object],
    default: "flex min-h-full items-center justify-center p-4",
  },
  /** z-index utility applied to the dialog root. */
  zClass: { type: String, default: "z-50" },
  /** Accessible name when there is no visible title; suppresses aria-labelledby. */
  ariaLabel: { type: String, default: null },
});

const emit = defineEmits(["close"]);

const titleId = useId();
const panel = ref(null);
const root = ref(null);

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

let previouslyFocused = null;
let active = false;

function focusables() {
  if (!panel.value) return [];
  return Array.from(panel.value.querySelectorAll(FOCUSABLE)).filter(
    (el) =>
      (el.checkVisibility ? el.checkVisibility() : el.getClientRects().length > 0) &&
      !el.closest("[inert]")
  );
}

function resolveEl(target) {
  if (!target) return null;
  if (target instanceof HTMLElement) return target;
  if (target.$el instanceof HTMLElement) return target.$el;
  return null;
}

// Called after the panel exists. On the mount-already-open path (lazy modals)
// the teleported panel can lag one frame behind nextTick, so retry on rAF.
function focusInitial(attempt = 0) {
  if (!active) return;
  if (!panel.value) {
    if (attempt < 10) requestAnimationFrame(() => focusInitial(attempt + 1));
    return;
  }
  const initial = resolveEl(props.initialFocus);
  if (initial && panel.value && panel.value.contains(initial)) {
    initial.focus({ preventScroll: true });
    return;
  }
  const [first] = focusables();
  (first || panel.value)?.focus({ preventScroll: true });
}

const instance = { onKeydown, onFocusin, panel };

function activate() {
  if (active) return;
  active = true;
  previouslyFocused = document.activeElement;
  lockScroll();
  pushDialog(instance);
  nextTick(() => focusInitial());
}

function deactivate() {
  if (!active) return;
  active = false;
  popDialog(instance);
  unlockScroll();
  const el = previouslyFocused;
  previouslyFocused = null;
  if (el && typeof el.focus === "function" && document.contains(el)) {
    el.focus({ preventScroll: true });
  }
}

// Both handlers are invoked from document-level listeners (see the module
// script) and only for the topmost open dialog.
function onFocusin(event) {
  if (!panel.value || panel.value.contains(event.target)) return;
  if (root.value?.contains(event.target)) return; // gutter/overlay, handled by click
  const [first] = focusables();
  (first || panel.value).focus({ preventScroll: true });
}

function onKeydown(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    event.stopPropagation();
    emit("close");
    return;
  }
  if (event.key !== "Tab") return;
  const list = focusables();
  if (!list.length) {
    event.preventDefault();
    panel.value?.focus();
    return;
  }
  const first = list[0];
  const last = list[list.length - 1];
  const current = document.activeElement;
  const inside = panel.value?.contains(current);
  if (event.shiftKey) {
    if (!inside || current === first || current === panel.value) {
      event.preventDefault();
      last.focus();
    }
  } else if (!inside || current === last) {
    event.preventDefault();
    first.focus();
  }
}

function onOutsideClick() {
  if (!props.static) emit("close");
}

if (import.meta.client) {
  // Same path whether `open` is already true at mount or flips later;
  // `activate()`/`deactivate()` are idempotent via the `active` flag.
  onMounted(() => {
    if (props.open) activate();
  });
  watch(
    () => props.open,
    (isOpen) => (isOpen ? activate() : deactivate())
  );
  onBeforeUnmount(deactivate);
}

defineExpose({ titleId, panel, getOpenCount });
</script>

<script>
// Module-level state shared by every mounted AppDialog: scroll lock counter
// and a stack of open dialogs (topmost handles Escape/Tab/focus containment).
let openCount = 0;
let previousOverflow = "";
const stack = [];

function topmost() {
  return stack[stack.length - 1];
}
function documentKeydown(event) {
  const top = topmost();
  if (!top) return;
  // Nested AppMenu/AppListbox handle their own Escape/Tab in the bubble
  // phase and stopPropagation there — but this listener runs in the
  // capture phase, so it would otherwise close the dialog first. Let the
  // event continue through to the menu/listbox when the target is inside
  // one that lives within the topmost dialog's panel.
  const panelEl = top.panel?.value;
  if (panelEl) {
    const ownerWidget = event.target.closest?.('[role="menu"],[role="listbox"]');
    if (ownerWidget && panelEl.contains(ownerWidget)) return;
  }
  top.onKeydown(event);
}
function documentFocusin(event) {
  topmost()?.onFocusin(event);
}
function pushDialog(inst) {
  if (stack.length === 0) {
    document.addEventListener("keydown", documentKeydown, true);
    document.addEventListener("focusin", documentFocusin, true);
  }
  stack.push(inst);
}
function popDialog(inst) {
  const i = stack.indexOf(inst);
  if (i !== -1) stack.splice(i, 1);
  if (stack.length === 0) {
    document.removeEventListener("keydown", documentKeydown, true);
    document.removeEventListener("focusin", documentFocusin, true);
  }
}

function getOpenCount() {
  return openCount;
}

function lockScroll() {
  if (openCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  openCount += 1;
}

function unlockScroll() {
  openCount = Math.max(0, openCount - 1);
  if (openCount === 0) {
    document.body.style.overflow = previousOverflow;
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="app-dialog" :duration="{ enter: 300, leave: 200 }" appear>
      <div
        v-if="open"
        ref="root"
        class="app-dialog fixed inset-0"
        :class="zClass"
        role="dialog"
        aria-modal="true"
        :aria-label="ariaLabel || undefined"
        :aria-labelledby="ariaLabel ? undefined : titleId"
      >
        <div
          class="app-dialog__overlay fixed inset-0"
          :class="overlayClass"
          aria-hidden="true"
        />
        <div
          class="app-dialog__container fixed inset-0 overflow-y-auto"
          @click.self="onOutsideClick"
        >
          <div :class="containerClass" @click.self="onOutsideClick">
            <div
              ref="panel"
              class="app-dialog__panel"
              tabindex="-1"
              :class="panelClass"
            >
              <slot :title-id="titleId" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.app-dialog__panel {
  outline: none;
}

/* overlay: opacity 300ms ease-out in / 200ms ease-in out */
.app-dialog-enter-active .app-dialog__overlay {
  transition: opacity 300ms ease-out;
}
.app-dialog-leave-active .app-dialog__overlay {
  transition: opacity 200ms ease-in;
}
.app-dialog-enter-from .app-dialog__overlay,
.app-dialog-leave-to .app-dialog__overlay {
  opacity: 0;
}

/* panel: opacity + scale-95→100, same timings */
.app-dialog-enter-active .app-dialog__panel {
  transition: opacity 300ms ease-out, transform 300ms ease-out;
}
.app-dialog-leave-active .app-dialog__panel {
  transition: opacity 200ms ease-in, transform 200ms ease-in;
}
.app-dialog-enter-from .app-dialog__panel,
.app-dialog-leave-to .app-dialog__panel {
  opacity: 0;
  transform: scale(0.95);
}

@media (prefers-reduced-motion: reduce) {
  .app-dialog-enter-active .app-dialog__overlay,
  .app-dialog-leave-active .app-dialog__overlay,
  .app-dialog-enter-active .app-dialog__panel,
  .app-dialog-leave-active .app-dialog__panel {
    transition-duration: 1ms;
  }
}
</style>
