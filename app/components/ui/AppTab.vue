<script setup>
/**
 * AppTab — native replacement for Headless UI's Tab. Must be a descendant of
 * AppTabs (any depth; wrap tabs in a `<div role="tablist">`).
 *
 * Default form — renders a `<button role="tab">`, slot gets `{ selected }`:
 *   <AppTab v-slot="{ selected }" :class="…">Label</AppTab>
 *
 * Custom-root form (Headless UI `as="template"`) — set `as="template"` and
 * spread `attrs` onto your own element; `selected` and `select` are provided:
 *   <AppTab as="template" v-slot="{ selected, attrs }">
 *     <div v-bind="attrs" :class="selected ? '…' : '…'">Label</div>
 *   </AppTab>
 * `attrs` = { role, id, 'aria-selected', 'aria-controls', tabindex, onClick,
 * onKeydown }. A consumer `id` attribute on <AppTab> is used as the tab id. Any `@click` on `<AppTab>` itself fires after selection in both
 * forms (passed through in the default form, merged into `attrs.onClick` in
 * the template form).
 *
 * Keyboard (roving tabindex): ArrowLeft/ArrowRight (ArrowUp/ArrowDown when
 * the AppTabs is `vertical`), Home, End move focus and select.
 */
import { computed, inject, onBeforeUnmount, reactive, useAttrs, useId } from "vue";

defineOptions({ inheritAttrs: false });

const props = defineProps({
  /** "button" (default) or "template" for the custom-root slot form. */
  as: { type: String, default: "button" },
  disabled: { type: Boolean, default: false },
});

const emit = defineEmits(["click"]);
const attrs = useAttrs();
const generated = useId();
// A consumer-provided `id` wins over the generated one.
const id = computed(() => attrs.id ?? generated);

const ctx = inject("app-tabs", null);
if (!ctx) {
  throw new Error("<AppTab> must be used inside <AppTabs>");
}

const entry = reactive({ id });
const unregister = ctx.registerTab(entry);
onBeforeUnmount(unregister);

const index = computed(() => ctx.indexOfTab(id.value));
const selected = computed(() => index.value === ctx.selectedIndex.value);
const panelId = computed(() => ctx.panels[index.value]?.id);

function select() {
  if (props.disabled) return;
  ctx.select(index.value);
}

function onClick(event) {
  select();
  emit("click", event);
}

function onKeydown(event) {
  if (props.disabled) return;
  ctx.onTabKeydown(event);
}

const tabAttrs = computed(() => ({
  role: "tab",
  id: id.value,
  type: "button",
  "aria-selected": selected.value ? "true" : "false",
  "aria-controls": panelId.value,
  tabindex: selected.value ? 0 : -1,
  "data-selected": selected.value ? "" : undefined,
  onClick,
  onKeydown,
}));

const slotAttrs = computed(() => {
  const { type, ...rest } = tabAttrs.value;
  return rest;
});
</script>

<template>
  <slot
    v-if="as === 'template'"
    :selected="selected"
    :attrs="slotAttrs"
    :select="select"
  />
  <button
    v-else
    v-bind="{ ...attrs, ...tabAttrs }"
    :disabled="disabled || undefined"
  >
    <slot :selected="selected" :attrs="slotAttrs" :select="select" />
  </button>
</template>
