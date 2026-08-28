<script setup>
import AppDialog from "@/components/ui/AppDialog.vue";
import { storeToRefs } from "pinia";
import { computed, ref } from "vue";
import { useRouter } from "vue-router";

import { useModalTypes } from "@/composables/useModalTypes";
import { useModalStore } from "@/stores/modal";
import { useLoginStore } from "@/stores/login";
import { useDefaultSport } from "@/composables/useDefaultSport";

import TheLogo from "./TheLogo.vue";
import ExploreContent from "./ExploreContent.vue";

const router = useRouter();
const { drawer } = useModalTypes();
const { showModal, modalType } = storeToRefs(useModalStore());
const { closeModal } = useModalStore();
const { initDefaultSport } = useDefaultSport();
const loginStore = useLoginStore();
const { isAuthenticated } = storeToRefs(loginStore);

function handleLogout() {
  loginStore.logout();
  closeModal();
  router.push({ name: "home" });
}

const closeButtonRef = ref(null);

const showDrawer = computed(() => {
  return modalType.value === drawer && showModal.value;
});

function goHome() {
  closeModal();
  initDefaultSport();
  router.push({ name: "home" });
}
</script>

<template>
  <AppDialog
    :open="showDrawer"
    :initial-focus="closeButtonRef"
    aria-label="Menu"
    z-class="z-70"
    overlay-class="bg-black/40 backdrop-blur-sm"
    container-class="flex justify-start h-full"
    panel-class="relative w-full max-w-xs bg-white dark:bg-background h-full flex flex-col shadow-2xl"
    @close="closeModal"
  >
    <!-- Header -->
    <div class="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
      <div class="cursor-pointer" @click="goHome">
        <TheLogo />
      </div>
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

    <!-- Footer: logout only — the theme switcher lives at the top of
         the drawer content (ExploreContent) now -->
    <div
      v-if="isAuthenticated"
      class="border-t border-gray-200/60 dark:border-white/6 px-4 py-3 flex items-center justify-end gap-3"
    >
      <button
        class="flex items-center gap-1.5 text-[0.7rem] font-medium text-red-500/80 hover:text-red-600 dark:text-red-400/70 dark:hover:text-red-400 transition-colors"
        @click="handleLogout"
      >
        <Icon name="tabler:logout" class="w-3.5 h-3.5" aria-hidden="true" />
        <span>Logout</span>
      </button>
    </div>
  </AppDialog>
</template>
