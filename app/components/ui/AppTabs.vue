<script setup>
/**
 * AppTabs — native replacement for Headless UI's TabGroup.
 *
 *   <AppTabs v-model="index" @change="onChange">        (controlled)
 *   <AppTabs :default-index="1">                          (uncontrolled)
 *     <div role="tablist" aria-label="…" class="…">
 *       <AppTab v-for="…">Label</AppTab>
 *     </div>
 *     <AppTabPanel>…</AppTabPanel>
 *   </AppTabs>
 *
 * Renders a plain `<div>` root (attrs/classes fall through). Tab and panel
 * indices follow DOM order, like Headless UI. `selectedIndex` is the
 * `modelValue` when it is a number, else internal state seeded by
 * `defaultIndex`. Keyboard handling lives here; AppTab wires it up.
 */
import { computed, nextTick, onMounted, provide, reactive, ref, watch } from "vue";

const props = defineProps({
  modelValue: { type: Number, default: null },
  defaultIndex: { type: Number, default: 0 },
  vertical: { type: Boolean, default: false },
});

const emit = defineEmits(["update:modelValue", "change"]);

const root = ref(null);
const tabs = reactive([]);
const panels = reactive([]);
const internal = ref(props.defaultIndex);

const selectedIndex = computed(() =>
  typeof props.modelValue === "number" ? props.modelValue : internal.value
);

function select(index) {
  if (index < 0 || (tabs.length && index >= tabs.length)) return;
  const changed = index !== selectedIndex.value;
  internal.value = index;
  if (changed) {
    emit("update:modelValue", index);
    emit("change", index);
  }
}

// Keep registration order in sync with DOM order (v-for insertions, SSR
// hydration, etc.) so index === position in the tablist.
function sortByDom(list) {
  if (!import.meta.client || !root.value) return;
  const nodes = Array.from(root.value.querySelectorAll("[id]"));
  const pos = new Map(nodes.map((n, i) => [n.id, i]));
  list.sort((a, b) => (pos.get(a.id) ?? Infinity) - (pos.get(b.id) ?? Infinity));
}

function registerTab(entry) {
  tabs.push(entry);
  nextTick(() => sortByDom(tabs));
  return () => {
    const i = tabs.indexOf(entry);
    if (i !== -1) tabs.splice(i, 1);
  };
}

function registerPanel(entry) {
  panels.push(entry);
  nextTick(() => sortByDom(panels));
  return () => {
    const i = panels.indexOf(entry);
    if (i !== -1) panels.splice(i, 1);
  };
}

function indexOfTab(id) {
  return tabs.findIndex((t) => t.id === id);
}

function tabElements() {
  return Array.from(root.value?.querySelectorAll('[role="tab"]') ?? []).filter(
    (el) => !el.disabled && el.getAttribute("aria-disabled") !== "true"
  );
}

function onTabKeydown(event) {
  const prevKey = props.vertical ? "ArrowUp" : "ArrowLeft";
  const nextKey = props.vertical ? "ArrowDown" : "ArrowRight";
  const els = tabElements();
  if (!els.length) return;
  const current = els.indexOf(event.currentTarget);
  let target = null;
  switch (event.key) {
    case prevKey:
      target = (current - 1 + els.length) % els.length;
      break;
    case nextKey:
      target = (current + 1) % els.length;
      break;
    case "Home":
      target = 0;
      break;
    case "End":
      target = els.length - 1;
      break;
    default:
      return;
  }
  event.preventDefault();
  const el = els[target];
  el.focus();
  el.click();
}

onMounted(() => {
  sortByDom(tabs);
  sortByDom(panels);
});

watch(
  () => props.modelValue,
  (v) => {
    if (typeof v === "number") internal.value = v;
  }
);

provide("app-tabs", {
  selectedIndex,
  vertical: computed(() => props.vertical),
  select,
  registerTab,
  registerPanel,
  indexOfTab,
  tabs,
  panels,
  onTabKeydown,
});

defineExpose({ selectedIndex, select });
</script>

<template>
  <div ref="root">
    <slot :selected-index="selectedIndex" :select="select" />
  </div>
</template>
