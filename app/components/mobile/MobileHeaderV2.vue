<script setup>
import { useModalTypes } from "@/composables/useModalTypes";
import { useLoginStore } from "@/stores/login";
import { useModalStore } from "@/stores/modal";
import { useProfileStore } from "@/stores/profile";
import { storeToRefs } from "pinia";
import SearchIcon from "../SearchIcon.vue";
import TheLogo from "../TheLogo.vue";

const { drawer } = useModalTypes();
const { openModal } = useModalStore();
const { token } = storeToRefs(useLoginStore());
const { balance } = storeToRefs(useProfileStore());
</script>

<template>
  <header
    class="sticky top-0 z-60 flex items-center justify-between px-3 h-14 bg-white dark:bg-background border-b border-gray-200/80 dark:border-border-darkest header-bar"
  >
    <!-- Left: hamburger + logo -->
    <div class="flex items-center gap-2">
      <button aria-label="Open navigation menu" @click="openModal(drawer)">
        <Icon name="tabler:menu-2" class="text-gray-950 dark:text-white w-5 h-5" aria-hidden="true" />
      </button>
      <TheLogo />
    </div>

    <!-- Right: balance/deposit + search + auth -->
    <div class="flex items-center gap-2">
      <!-- Balance + deposit for authenticated users -->
      <div v-if="token" class="flex items-center gap-1">
        <span class="text-[0.65rem] font-bold text-foreground whitespace-nowrap">{{ balance }}</span>
        <RouterLink
          :to="{ name: 'deposit' }"
          class="text-[0.65rem] font-bold px-2.5 py-1 rounded-md bg-brand-bright text-brand-forest"
        >
          Deposit
        </RouterLink>
      </div>

      <SearchIcon />

      <!-- Login/Join for unauthenticated -->
      <div v-if="!token" class="flex gap-1.5">
        <RouterLink
          :to="{ name: 'login' }"
          class="text-[0.65rem] font-semibold px-2 py-1 rounded-md bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-foreground"
        >
          Login
        </RouterLink>
        <RouterLink
          :to="{ name: 'signup' }"
          class="text-[0.65rem] font-bold px-2.5 py-1 rounded-md bg-brand-bright text-primary-foreground"
        >
          Join
        </RouterLink>
      </div>
    </div>
  </header>
</template>

<style scoped>
[data-theme="light"] .header-bar {
  box-shadow: 0 1px 3px oklch(0% 0 0 / 0.06), 0 1px 2px oklch(0% 0 0 / 0.04);
}
</style>
