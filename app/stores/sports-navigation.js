import { SOCCER_SPORT_ID } from "@/utilities/sport-ids";
const defaultSportId = SOCCER_SPORT_ID;

export const useSportsNavigationStore = defineStore("sports-navigation-store", {
  state: () => ({
    selectedSportId: defaultSportId,
  }),

  actions: {
    setSelectedSportId(id) {
      this.selectedSportId = id;
    },
    resetSelectedSportId() {
      this.selectedSportId = defaultSportId;
    },
  },

  // Cookie, not localStorage: selectedSportId decides which sport tab and
  // quick-access icon render as active, so SSR must see it too or every
  // hydration mismatches against the restored client state.
  persist: {
    storage: piniaPluginPersistedstate.cookies({
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: true,
      path: "/",
    }),
  },
});
