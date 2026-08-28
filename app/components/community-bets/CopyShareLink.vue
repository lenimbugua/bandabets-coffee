<script setup>
import { useShareToSocials } from "@/composables/useShareToSocials";
import { useClipboard } from "@/composables/useClipboard";
import SocialsIcons from "./SocialsIcons.vue";

const props = defineProps({
  shareUrl: {
    type: String,
    required: true,
  }
});

const { link } = useShareToSocials();

const { copy, copied } = useClipboard({ source: props.shareUrl });

async function copyShareLink() {
  await copy(props.shareUrl);
}
</script>
<template>
  <div class="cursor-pointer flex flex-col items-center" role="button" aria-label="Copy share link" tabindex="0" @click="copyShareLink">
    <SocialsIcons :icon="link" />
    <span v-if="!copied" class="text-gray-600 dark:text-slate-400 text-xs font-medium capitalize mt-2"
      >Copy {{ link }}</span
    >
    <span v-if="copied" class="text-brand-bright text-xs font-bold mt-2"
      >Link Copied!</span
    >
  </div>
</template>
