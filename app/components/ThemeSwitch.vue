<script setup>
import { useThemeSwitch } from "../composables/useThemeSwitch";
const { isDark, changeTheme } = useThemeSwitch();
</script>
<template>
  <button
    class="flex items-center justify-center w-7 h-7 rounded-full text-gray-400 dark:text-white/40 hover:text-amber-500 dark:hover:text-amber-400 transition-colors duration-200"
    aria-label="Toggle theme"
    @click="changeTheme()"
  >
    <!-- Dark mode: show sun -->
    <Icon v-if="isDark" name="tabler:sun" class="w-5 h-5 text-amber-400" aria-hidden="true" />
    <!-- <svg
      v-if="isDark"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      class="w-4 h-4"
    >
      <path
        d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM10 17a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 17ZM17 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 17 10ZM2 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5A.75.75 0 0 1 2 10ZM15.303 4.697a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 0 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM6.818 13.182a.75.75 0 0 1 0 1.06l-1.06 1.061a.75.75 0 1 1-1.061-1.06l1.06-1.061a.75.75 0 0 1 1.061 0ZM15.303 15.303a.75.75 0 0 1-1.06 0l-1.061-1.06a.75.75 0 0 1 1.06-1.061l1.061 1.06a.75.75 0 0 1 0 1.061ZM6.818 6.818a.75.75 0 0 1-1.06 0L4.697 5.757a.75.75 0 0 1 1.06-1.06l1.061 1.06a.75.75 0 0 1 0 1.061Z"
      />
    </svg> -->

    <!-- Light mode: show moon -->
    <Icon v-else name="tabler:moon" class="w-5 h-5" aria-hidden="true" />
  </button>
</template>
