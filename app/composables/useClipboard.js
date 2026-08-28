import { ref, unref } from "vue";

// Native replacement for VueUse's useClipboard. `copiedDuring` matches
// VueUse's 1500ms default for how long `copied` stays true after a
// successful copy.
export function useClipboard({ source, copiedDuring = 1500 } = {}) {
  const isSupported = ref(import.meta.client && !!navigator.clipboard);
  const text = ref("");
  const copied = ref(false);
  let timer = null;

  async function copy(value = unref(source)) {
    if (value == null) return;
    await navigator.clipboard.writeText(String(value));
    text.value = String(value);
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(() => {
      copied.value = false;
    }, copiedDuring);
  }

  return { copy, copied, isSupported, text };
}
