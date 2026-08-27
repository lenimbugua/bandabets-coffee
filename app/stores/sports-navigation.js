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

  persist: true,
});
