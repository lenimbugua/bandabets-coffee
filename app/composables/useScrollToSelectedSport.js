import { nextTick, onMounted, ref, watch } from "vue";

export function useScrollToSelected(selectedId, options = {}) {
  const {
    behavior = "smooth",
    inline = "center",
    block = "nearest",
    watchSelected = true,
    scrollOnMount = true,
  } = options;

  // id -> HTMLElement map
  const elementRefs = ref({});

  const scrollToSelected = async () => {
    await nextTick();

    const id = selectedId.value;
    if (!id) return;

    const el = elementRefs.value[id];
    if (!el) return;

    // scrollIntoView() always forces a synchronous layout pass, even when the
    // element is already fully in view (the common case: the default/first
    // tab on initial mount). A single batched read of el + its scroll
    // container lets us skip that call entirely in the no-op case — this is
    // the forced-reflow source at el.scrollIntoView() called from mount,
    // traced via Lighthouse's forced-reflow-insight to this composable.
    const container = el.parentElement;
    if (container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      const alreadyVisible =
        elRect.left >= containerRect.left && elRect.right <= containerRect.right;
      if (alreadyVisible) return;
    }

    el.scrollIntoView({
      behavior,
      inline,
      block,
    });
  };

  // 🔹 scroll on mount (useful when navigating back)
  if (scrollOnMount) {
    onMounted(() => {
      if (selectedId.value) {
        scrollToSelected();
      }
    });
  }

  // 🔹 scroll whenever selectedId changes
  if (watchSelected) {
    watch(selectedId, () => {
      scrollToSelected();
    });
  }

  return {
    elementRefs,
    scrollToSelected,
  };
}
