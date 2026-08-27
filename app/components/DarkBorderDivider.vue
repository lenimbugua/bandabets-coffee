<script setup>
import { useThemeSwitch } from "@/composables/useThemeSwitch";
const props = defineProps({
  borderSize: {
    type: String,
    default: "2px",
  },
});

const { isDark } = useThemeSwitch();

function borderCss() {
  const darkBorder = `border-bottom: ${props.borderSize} solid #09070d`;
  const lightBorder = `border-bottom: ${props.borderSize} solid #E5E7EB`;
  return isDark.value ? darkBorder : lightBorder;
}
</script>
<template>
  <div class="w-full border-b" :style="borderCss()"></div>
</template>
