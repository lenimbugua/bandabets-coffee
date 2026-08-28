<script setup>
/**
 * Date-picker popover. The old Headless `Menu` was only a popover container
 * here (no `MenuItem`s — it wrapped a calendar grid), so this is a minimal
 * local disclosure instead of `AppMenu`: a trigger with `aria-expanded`, a
 * `v-if` panel, Escape and outside-pointerdown close. No menu roles, so the
 * calendar's own buttons keep their native semantics.
 */
import TheCalendar from "./TheCalendar.vue";
import { onBeforeUnmount, ref, useId, watch } from "vue";

const root = ref(null);
const open = ref(false);
const panelId = useId();

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function onKeydown(event) {
  if (event.key === "Escape" && open.value) {
    event.preventDefault();
    event.stopPropagation();
    close();
    root.value?.querySelector("button")?.focus({ preventScroll: true });
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
</script>

<template>
  <div ref="root" class="relative inline-block text-left z-50" @keydown="onKeydown">
    <div>
      <button
        type="button"
        aria-label="Pick a date"
        :aria-expanded="open ? 'true' : 'false'"
        :aria-controls="open ? panelId : undefined"
        class="inline-flex w-full justify-center outline-hidden"
        @click="toggle"
      >
        <Icon name="tabler:calendar" class="h-[18px] w-[18px]" aria-hidden="true" />
        <Icon name="tabler:chevron-down" class="-mr-1 h-5 w-5" aria-hidden="true" />
      </button>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <div
        v-if="open"
        :id="panelId"
        class="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
      >
        <TheCalendar />
      </div>
    </transition>
  </div>
</template>
