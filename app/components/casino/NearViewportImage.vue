<script setup>
// An <img> whose src is only assigned once the element is near the viewport.
// Chrome's native loading="lazy" margin on slow connections is wide enough to
// fetch every tile in a horizontally scrolling strip at once; this observer
// (150 px margin, honours clipping by the strip's overflow) fetches only
// the tiles a user is about to see.
const props = defineProps({
  src: { type: String, required: true },
  alt: { type: String, default: "" },
  rootMargin: { type: String, default: "150px" },
});

const PLACEHOLDER =
  "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const el = ref(null);
const near = ref(false);
let observer = null;

onMounted(() => {
  if (!("IntersectionObserver" in window)) {
    near.value = true;
    return;
  }
  observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        near.value = true;
        observer.disconnect();
        observer = null;
      }
    },
    { rootMargin: props.rootMargin },
  );
  observer.observe(el.value);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});
</script>

<template>
  <img
    ref="el"
    :src="near ? src : PLACEHOLDER"
    :alt="alt"
    width="300"
    height="300"
    decoding="async"
  />
</template>
