<script setup>
defineProps({
  show: {
    type: Boolean,
    required: true,
  },
});
</script>
<template>
  <Icon
    v-if="show"
    name="tabler:eye"
    class="w-[17px] h-4 text-gray-950 dark:text-white"
    style="color: var(--light-black)"
    aria-hidden="true"
  />

  <Icon
    v-else
    name="tabler:eye-off"
    class="w-[17px] h-4 text-gray-950 dark:text-white"
    style="color: var(--light-black)"
    aria-hidden="true"
  />
</template>
