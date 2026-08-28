<script setup>
/**
 * AppListbox — native replacement for Headless UI's Listbox/ListboxButton/
 * ListboxOptions/ListboxOption.
 *
 *   <AppListbox v-model="market" :by="'subTypeId'" button-class="…" options-class="absolute …">
 *     <template #button="{ open, selected }">{{ selected?.oddType }}</template>
 *     <template #default="{ select, isSelected }">
 *       <li v-for="m in markets" :key="m.subTypeId" role="option"
 *           :aria-selected="isSelected(m)" class="… focus:bg-x hover:bg-x"
 *           @click="select(m)">{{ m.oddType }}</li>
 *     </template>
 *   </AppListbox>
 *
 * Root is a `<div>` (attrs fall through). Trigger `<button aria-haspopup="listbox"
 * aria-expanded>`; popup `<ul role="listbox">` (use `<li role="option">` items —
 * they are given `tabindex="-1"` automatically). `by` compares values by key
 * (string) or `(a, b) => boolean`; default is `===`. Headless UI's `{ active }`
 * maps to `:focus` / `:hover` classes; `{ selected }` → `isSelected(value)`.
 *
 * Behaviour: click/Enter/Space/ArrowDown on the button opens and focuses the
 * selected (else first) option; ArrowDown/ArrowUp/Home/End move focus;
 * Enter/Space pick the focused option (runs its click handler → `select`);
 * `select(value)` emits `update:modelValue` + `change` and closes; Escape, Tab
 * and outside pointerdown close, Escape returning focus to the button.
 */
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from "vue";

const props = defineProps({
  modelValue: { default: null },
  by: { type: [String, Function], default: null },
  buttonClass: { type: [String, Array, Object], default: "" },
  optionsClass: { type: [String, Array, Object], default: "" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change", "open", "close"]);

const root = ref(null);
const button = ref(null);
const list = ref(null);
const open = ref(false);
const listId = useId();

const selected = computed(() => props.modelValue);

function isSelected(value) {
  const current = props.modelValue;
  if (typeof props.by === "function") return props.by(current, value);
  if (typeof props.by === "string") {
    return current != null && value != null && current[props.by] === value[props.by];
  }
  return current === value;
}

function optionEls() {
  const els = Array.from(list.value?.querySelectorAll('[role="option"]') ?? []);
  for (const el of els) {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
  }
  return els.filter((el) => el.getAttribute("aria-disabled") !== "true");
}

function focusOption(index) {
  const els = optionEls();
  if (!els.length) return;
  const i = ((index % els.length) + els.length) % els.length;
  els[i].focus();
}

function openList() {
  if (props.disabled || open.value) return;
  open.value = true;
  emit("open");
  nextTick(() => {
    const els = optionEls();
    const sel = els.findIndex((el) => el.getAttribute("aria-selected") === "true");
    if (els.length) focusOption(sel >= 0 ? sel : 0);
    else list.value?.focus({ preventScroll: true });
  });
}

function close({ restoreFocus = false } = {}) {
  if (!open.value) return;
  open.value = false;
  emit("close");
  if (restoreFocus) button.value?.focus({ preventScroll: true });
}

function toggle() {
  open.value ? close() : openList();
}

function select(value) {
  if (!isSelected(value)) {
    emit("update:modelValue", value);
    emit("change", value);
  }
  close({ restoreFocus: true });
}

function onButtonKeydown(event) {
  if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
    event.preventDefault();
    openList();
  }
}

function onListKeydown(event) {
  const els = optionEls();
  const current = els.indexOf(document.activeElement);
  switch (event.key) {
    case "ArrowDown":
      event.preventDefault();
      focusOption(current + 1);
      break;
    case "ArrowUp":
      event.preventDefault();
      focusOption(current < 0 ? -1 : current - 1);
      break;
    case "Home":
      event.preventDefault();
      focusOption(0);
      break;
    case "End":
      event.preventDefault();
      focusOption(-1);
      break;
    case "Enter":
    case " ":
      if (current >= 0) {
        event.preventDefault();
        els[current].click();
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

defineExpose({ open, openList, close, select });
</script>

<template>
  <div ref="root">
    <button
      ref="button"
      type="button"
      :class="buttonClass"
      aria-haspopup="listbox"
      :aria-expanded="open ? 'true' : 'false'"
      :aria-controls="open ? listId : undefined"
      :disabled="disabled || undefined"
      @click="toggle"
      @keydown="onButtonKeydown"
    >
      <slot name="button" :open="open" :selected="selected" />
    </button>
    <Transition name="app-listbox">
      <ul
        v-if="open"
        :id="listId"
        ref="list"
        role="listbox"
        tabindex="-1"
        :class="optionsClass"
        @keydown="onListKeydown"
      >
        <slot
          :open="open"
          :close="close"
          :select="select"
          :is-selected="isSelected"
          :selected="selected"
        />
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
[role="listbox"] {
  outline: none;
}
.app-listbox-leave-active {
  transition: opacity 100ms ease-in;
}
.app-listbox-leave-to {
  opacity: 0;
}
</style>
