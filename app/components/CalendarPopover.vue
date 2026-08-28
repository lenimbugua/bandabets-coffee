<script setup>
import TheCalendar from "./TheCalendar.vue";
import { Menu, MenuButton, MenuItems } from "@headlessui/vue";
</script>

<template>
  <Menu as="div" class="relative inline-block text-left z-50">
    <div>
      <MenuButton aria-label="Pick a date" class="inline-flex w-full justify-center outline-hidden">
        <Icon name="tabler:calendar" class="h-[18px] w-[18px]" aria-hidden="true" />
        <Icon name="tabler:chevron-down" class="-mr-1 h-5 w-5" aria-hidden="true" />
      </MenuButton>
    </div>

    <transition
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="transform scale-95 opacity-0"
      enter-to-class="transform scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="transform scale-100 opacity-100"
      leave-to-class="transform scale-95 opacity-0"
    >
      <MenuItems
        class="absolute right-0 mt-2 w-72 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-hidden"
      >
        <TheCalendar />
      </MenuItems>
    </transition>
  </Menu>
</template>
