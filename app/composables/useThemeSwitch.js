import { ref, watch } from "vue";
import { useLoginStore } from "@/stores/login";
import { storeToRefs } from "pinia";

// One shared isDark ref for the whole app, mirroring what the old shared
// VueUse useDark() instance gave us: every call used to create its own
// instance (app.vue, ThemeSwitch, TheSidebar, ExploreContent, …), so a
// module-level singleton avoids re-running theme-application logic per
// component.
const STORAGE_KEY = "vueuse-color-scheme";

// Never write (or read localStorage for) isDark during SSR: this
// module-level ref is shared across requests on the server and must stay at
// its default there — only client hooks read/write it.
const isDark = ref(true); // default "dark"

if (import.meta.client) {
  const stored = localStorage.getItem(STORAGE_KEY);
  isDark.value = stored !== "light";
}

function applyTheme(value) {
  if (!import.meta.client) return;
  document.body.dataset.theme = value;
  localStorage.setItem(STORAGE_KEY, value);
}

// immediate: import.meta.client applies (and persists) the theme resolved
// above as soon as the module loads on the client; on the server this watch
// is inert (isDark never changes there) and applyTheme() is a no-op anyway.
watch(isDark, (v) => applyTheme(v ? "dark" : "light"), { immediate: import.meta.client });

export function useThemeSwitch() {
  const { isAuthenticated } = storeToRefs(useLoginStore());
  const { themeSwitch } = useLoginStore();
  const toggleDark = () => (isDark.value = !isDark.value);

  function toggleToUserSavedTheme(userTheme) {
    toggleDark();
    if (parseInt(userTheme) === 0 && !isDark.value) {
      toggleDark();
    } else if (parseInt(userTheme) === 1 && isDark.value) {
      toggleDark();
    }
  }
  function changeTheme() {
    toggleDark();
    if (isAuthenticated.value) {
      let theme = isDark.value ? 0 : 1;
      themeSwitch(theme);
    }
  }
  function switchToDark() {
    if (!isDark.value) {
      toggleDark();
    }
  }
  return {
    isDark,
    changeTheme,
    switchToDark,
    toggleToUserSavedTheme,
  };
}
