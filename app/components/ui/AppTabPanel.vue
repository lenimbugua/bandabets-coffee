<script setup>
/**
 * AppTabPanel — native replacement for Headless UI's TabPanel. The Nth panel
 * (DOM order) belongs to the Nth AppTab. Renders `<div role="tabpanel">`,
 * hidden (and not rendered, unless `keepAlive`) when not selected.
 *
 *   <AppTabPanel v-slot="{ selected }" class="…">…</AppTabPanel>
 */
import { computed, inject, onBeforeUnmount, useId } from "vue";

const props = defineProps({
  /** Keep the panel's DOM mounted (just `hidden`) while another tab is selected. */
  keepAlive: { type: Boolean, default: false },
});

const id = useId();
const ctx = inject("app-tabs", null);
if (!ctx) {
  throw new Error("<AppTabPanel> must be used inside <AppTabs>");
}

const entry = { id };
const unregister = ctx.registerPanel(entry);
onBeforeUnmount(unregister);

const index = computed(() => ctx.panels.findIndex((p) => p.id === id));
const selected = computed(() => index.value === ctx.selectedIndex.value);
const tabId = computed(() => ctx.tabs[index.value]?.id);
</script>

<template>
  <div
    :id="id"
    role="tabpanel"
    :aria-labelledby="tabId"
    :hidden="!selected"
    :tabindex="selected ? 0 : -1"
  >
    <slot v-if="selected || props.keepAlive" :selected="selected" />
  </div>
</template>
