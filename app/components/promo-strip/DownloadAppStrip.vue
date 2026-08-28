<script setup>
import { useDownloadApp } from "@/composables/useDownloadApp";
const { downloadApp } = useDownloadApp();

// import { useGoTogooglePlay } from "@/composables/useGoTogooglePlay";

// const { goToGooglePlay } = useGoTogooglePlay();
</script>
<template>
  <div
    class="cursor-pointer px-1 py-1 bg-linear-to-r from-gold-bright via-gold-deep to-brand-bright flex items-center justify-between text-foreground font-bold text-xs"
    @click="downloadApp()"
  >
    <div class="flex justify-between w-full items-center">
      <div class="flex space-x-1">
        <div class="flex space-x-1 justify-between">
          <span class="animate-pulse">🔥</span>
          <span class="animate-pulse">🔥</span>
        </div>
        <span class="text-xs">Download App Today</span>
        <div class="flex space-x-1 justify-between">
          <span class="animate-pulse">🔥</span>
          <span class="animate-pulse">🔥</span>
        </div>
      </div>
      <div>
        <button
          class="bg-linear-to-r from-gold-650 via-lime-600 to-gold-650 text-white p-1 rounded-md flex space-x-0.5"
        >
          <Icon name="tabler:download" class="h-4 w-5 fill-current" aria-hidden="true" />
          <span class="text-xs">Download Now</span>
        </button>
      </div>
    </div>
  </div>
</template>
