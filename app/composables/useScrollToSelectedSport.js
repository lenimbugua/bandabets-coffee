import { nextTick, onMounted, ref, watch } from "vue";

// Walk up from `el` to find the nearest ancestor that actually scrolls
// horizontally (computed overflow-x of auto/scroll AND scrollWidth >
// clientWidth). `el.parentElement` is typically an unclipped, content-hugging
// wrapper (AppTabs' root div, the `role="tablist"` div, …) whose rect always
// contains the tab's rect, so comparing against it directly would make the
// "already visible" check always true and permanently skip scrollIntoView.
// Only scrollWidth/clientWidth/computed-style are read while walking (no
// layout-forcing rect reads); the caller reads rects once each, only for the
// element and the scrollable ancestor actually found.
function findScrollableAncestor(el) {
  let node = el.parentElement;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    if (
      (style.overflowX === "auto" || style.overflowX === "scroll") &&
      node.scrollWidth > node.clientWidth
    ) {
      return node;
    }
    node = node.parentElement;
  }
  return null;
}

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
    // tab on initial mount). A single batched read of el + its nearest
    // scrolling ancestor lets us skip that call entirely in the no-op case —
    // this is the forced-reflow source at el.scrollIntoView() called from
    // mount, traced via Lighthouse's forced-reflow-insight to this
    // composable. If no scrollable ancestor is found, fall back to the
    // original unconditional scrollIntoView.
    const container = findScrollableAncestor(el);
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
