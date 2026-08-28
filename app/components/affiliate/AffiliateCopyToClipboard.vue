<script setup>
import { useAffiliateStore } from "../../stores/affiliate";
import { useClipboard } from "../../composables/useClipboard";
import { storeToRefs } from "pinia";

const { affiliateUrl } = storeToRefs(useAffiliateStore());
const { copy, copied } = useClipboard({ affiliateUrl });
</script>

<template>
  <div class="bg-card rounded-xl p-5 mt-4 space-y-3">
    <div>
      <h3 class="text-base font-semibold text-foreground">Share Your Link</h3>
      <p class="text-sm text-muted-foreground mt-0.5">
        Copy your referral link and share it with friends.
      </p>
    </div>

    <button
      class="w-full flex items-center justify-between bg-input border border-border rounded-lg hover:border-primary/50 transition-colors group"
      @click="copy(affiliateUrl)"
    >
      <span
        class="flex-1 text-sm text-muted-foreground truncate px-4 py-3 text-left"
      >
        {{ affiliateUrl }}
      </span>
      <span
        class="flex items-center gap-1.5 px-4 py-3 border-l border-border text-sm font-medium transition-colors"
        :class="copied ? 'text-brand-bright' : 'text-primary group-hover:text-primary/80'"
      >
        <Icon name="tabler:check" v-if="copied" class="w-4 h-4" />
        <Icon name="tabler:copy" v-else class="w-4 h-4" />
        {{ copied ? "Copied!" : "Copy" }}
      </span>
    </button>
  </div>
</template>
