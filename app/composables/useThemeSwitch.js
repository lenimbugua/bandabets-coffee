import { useDark, useToggle } from "@vueuse/core";
import { useLoginStore } from "@/stores/login";
import { storeToRefs } from "pinia";

// One useDark instance for the whole app. Every call used to create its own
// (app.vue, ThemeSwitch, TheSidebar, ExploreContent, …) and each instance's
// immediate watcher ran VueUse's transition-suppression routine: inject a
// <style>*{transition:none!important}</style>, read getComputedStyle().opacity
// (a forced style recalculation over the entire document), remove it. On the
// home page that was the largest single JavaScript cost after hydration.
// disableTransition:false skips that routine entirely; theme toggles simply
// let elements with transition-colors animate, which is the nicer behaviour.
// Never write isDark during SSR: this module-level ref is shared across requests on the server and must stay at its default there (writes happen only in client hooks).
let shared = null;
function themeRef() {
  if (!shared) {
    shared = useDark({
      selector: "body",
      attribute: "data-theme",
      valueDark: "dark",
      valueLight: "light",
      disableTransition: false,
    });
  }
  return shared;
}

export function useThemeSwitch() {
  const { isAuthenticated } = storeToRefs(useLoginStore());
  const { themeSwitch } = useLoginStore();
  const isDark = themeRef();
  const toggleDark = useToggle(isDark);

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
