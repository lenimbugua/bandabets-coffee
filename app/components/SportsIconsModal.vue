<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useLoginStore } from "@/stores/login";
import { useThemeSwitch } from "@/composables/useThemeSwitch";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import ExploreContent from "./ExploreContent.vue";

const router = useRouter();
const { isDark } = useThemeSwitch();
const { sportsIconsModal } = useModalTypes();
const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const loginStore = useLoginStore();
const { isAuthenticated } = storeToRefs(loginStore);

function handleLogout() {
  loginStore.logout();
  closeModal();
  router.push({ name: "home" });
}

const closeButtonRef = ref(null);

const isOpen = computed(() => {
  return modalType.value === sportsIconsModal && showModal.value;
});
</script>

<template>
  <AppDialog
    :open="isOpen"
    :initial-focus="closeButtonRef"
    z-class="z-70"
    overlay-class="bg-black/40 backdrop-blur-sm"
    container-class="z-70 flex justify-end h-full"
    panel-class="relative w-full max-w-xs bg-white dark:bg-background h-full flex flex-col shadow-2xl"
    @close="closeModal"
  >
    <template #default="{ titleId }">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
        <h2 :id="titleId" class="text-sm font-bold text-foreground">Explore</h2>
        <button
          ref="closeButtonRef"
          class="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 outline-hidden"
          aria-label="Close"
          @click="closeModal"
        >
          <Icon name="tabler:x" class="w-5 h-5 text-muted-foreground" />
        </button>
      </div>

      <!-- Shared tabs + content -->
      <ExploreContent />

      <!-- Footer -->
      <div class="border-t border-gray-200/60 dark:border-white/6 px-4 py-3 flex items-center justify-between gap-3">
        <!-- Theme toggle (slim pill) -->
        <button
          class="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/10 text-[0.65rem] font-medium text-muted-foreground hover:text-foreground hover:border-gray-300 dark:hover:border-white/20 transition-all"
          @click="isDark = !isDark"
        >
          <Icon v-if="isDark" name="tabler:sun" class="w-3 h-3 text-amber-400" aria-hidden="true" />
          <Icon v-else name="tabler:moon" class="w-3 h-3" aria-hidden="true" />
          <span>{{ isDark ? 'Dark' : 'Light' }}</span>
        </button>

        <!-- Logout (only if logged in) -->
        <button
          v-if="isAuthenticated"
          class="flex items-center gap-1.5 text-[0.7rem] font-medium text-red-500/80 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 transition-colors"
          @click="handleLogout"
        >
          <Icon name="tabler:logout" class="w-3.5 h-3.5" aria-hidden="true" />
          <span>Logout</span>
        </button>
      </div>
    </template>
  </AppDialog>
</template>
