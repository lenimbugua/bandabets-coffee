<script setup>
import { useModalStore } from "@/stores/modal";
import { inject } from "vue";
const { closeModal } = useModalStore();
const dialogTitleId = inject("dialogTitleId", null);
</script>
<template>
  <div class="relative">
    <!-- Close button -->
    <button
      class="absolute top-0 right-0 p-1.5 rounded-full text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 transition-colors z-10"
      @click="closeModal"
    >
      <Icon name="tabler:x" class="w-5 h-5" />
    </button>

    <!-- Green checkmark — overlapping top of card -->
    <div class="flex justify-center -mt-12 mb-3">
      <div class="rounded-full bg-white dark:bg-card p-1.5 shadow-lg">
        <div class="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-[0_0_20px_oklch(55%_0.2_145/0.4)]">
          <Icon name="tabler:check" class="w-9 h-9 text-white" aria-hidden="true" />
        </div>
      </div>
    </div>

    <!-- Title -->
    <h3 :id="dialogTitleId" class="text-xl font-bold text-center text-gray-900 dark:text-white mb-4">
      Successful!
    </h3>

    <!-- Bet details -->
    <BetPlaced />
  </div>
</template>
