<script setup>
/**
 * AppMenu — native replacement for Headless UI's Menu/MenuButton/MenuItems/MenuItem.
 *
 *   <AppMenu class="relative inline-block" button-class="…" items-class="absolute …">
 *     <template #button="{ open }">HRS <Icon … /></template>
 *     <template #default="{ close }">
 *       <button role="menuitem" class="… hover:bg-x focus:bg-x" @click="pick(3)">3 HRS</button>
 *     </template>
 *   </AppMenu>
 *
 * Root is a `<div>` (attrs fall through). The trigger is a `<button>` with
 * `aria-haspopup="menu"` / `aria-expanded`; the popup is `<div role="menu">`.
 * Items are whatever the consumer renders with `role="menuitem"` (they are
 * given `tabindex="-1"` automatically). Headless UI's `{ active }` slot prop
 * maps to `:focus` / `:hover` classes on the item.
 *
 * Behaviour: click/Enter/Space/ArrowDown on the button opens; ArrowDown/ArrowUp/
 * Home/End move focus among items (wrapping); Enter/Space activate the
 * focused item (its click handler runs); clicking an item closes the menu
 * (unless `closeOnSelect` is false); Escape, Tab and outside pointerdown
 * close, Escape returning focus to the button.
 */
import { nextTick, onBeforeUnmount, ref, useId, watch } from "vue";

const props = defineProps({
  buttonClass: { type: [String, Array, Object], default: "" },
  itemsClass: { type: [String, Array, Object], default: "" },
  closeOnSelect: { type: Boolean, default: true },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["open", "close"]);

const root = ref(null);
const button = ref(null);
const items = ref(null);
const open = ref(false);
const menuId = useId();

function itemEls() {
  const list = Array.from(items.value?.querySelectorAll('[role="menuitem"]') ?? []);
  for (const el of list) {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  }
  return list.filter((el) => !el.disabled && el.getAttribute("aria-disabled") !== "true");
}

function focusItem(index) {
  const list = itemEls();
  if (!list.length) return;
  const i = ((index % list.length) + list.length) % list.length;
  list[i].focus();
}

function openMenu({ focus = "menu" } = {}) {
  if (props.disabled || open.value) return;
  open.value = true;
  emit("open");
  nextTick(() => {
    if (focus === "first") focusItem(0);
    else if (focus === "last") focusItem(-1);
    else items.value?.focus({ preventScroll: true });
  });
}

function close({ restoreFocus = false } = {}) {
  if (!open.value) return;
  open.value = false;
  emit("close");
  if (restoreFocus) button.value?.focus({ preventScroll: true });
}

function toggle() {
  open.value ? close() : openMenu();
}

function onButtonKeydown(event) {
  if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openMenu({ focus: "first" });
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    openMenu({ focus: "last" });
  }
}

function onMenuKeydown(event) {
  const list = itemEls();
  const current = list.indexOf(document.activeElement);
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusItem(current + 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      focusItem(current < 0 ? -1 : current - 1);
      break;
    case "Home":
      event.preventDefault();
      focusItem(0);
      break;
    case "End":
      event.preventDefault();
      focusItem(-1);
      break;
    case "Enter":
    case " ":
      if (current >= 0) {
        event.preventDefault();
        list[current].click();
      }
      break;
    case "Escape":
      event.preventDefault();
      event.stopPropagation();
      close({ restoreFocus: true });
      break;
    case "Tab":
      close();
      break;
    default:
  }
}

function onMenuClick(event) {
  if (!props.closeOnSelect) return;
  const item = event.target.closest('[role="menuitem"]');
  if (item && items.value?.contains(item)) close({ restoreFocus: true });
}

function onDocumentPointerdown(event) {
  if (root.value && !root.value.contains(event.target)) close();
}

if (import.meta.client) {
  watch(open, (isOpen) => {
    if (isOpen) document.addEventListener("pointerdown", onDocumentPointerdown, true);
    else document.removeEventListener("pointerdown", onDocumentPointerdown, true);
  });
  onBeforeUnmount(() =>
    document.removeEventListener("pointerdown", onDocumentPointerdown, true)
  );
}

defineExpose({ open, openMenu, close, toggle });
</script>

<template>
  <div ref="root">
    <button
      ref="button"
      type="button"
      :class="buttonClass"
      aria-haspopup="menu"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? menuId : undefined"
      :disabled="disabled || undefined"
      @click="toggle"
      @keydown="onButtonKeydown"
    >
      <slot name="button" :open="open" />
    </button>
    <Transition name="app-menu">
      <div
        v-if="open"
        :id="menuId"
        ref="items"
        role="menu"
        tabindex="-1"
        :class="itemsClass"
        @keydown="onMenuKeydown"
        @click="onMenuClick"
      >
        <slot :open="open" :close="close" />
      </div>
    </Transition>
  </div>
</template>

<style scoped>
[role="menu"] {
  outline: none;
}
.app-menu-enter-active {
  transition: opacity 100ms ease-out, transform 100ms ease-out;
}
.app-menu-leave-active {
  transition: opacity 75ms ease-in, transform 75ms ease-in;
}
.app-menu-enter-from,
.app-menu-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
