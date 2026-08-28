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
    class="fill-current text-gray-950 dark:text-white"
    style="color: var(--light-black)"
    aria-hidden="true"
  />

  <Icon
    v-else
    name="tabler:eye-off"
    class="fill-current text-gray-950 dark:text-white"
    style="color: var(--light-black)"
    aria-hidden="true"
  />
</template>
