import { SOCCER_SPORT_ID } from "@/utilities/sport-ids";
const defaultSportId = SOCCER_SPORT_ID;

export const useLiveSportsNavigationStore = defineStore(
  "live-sports-navigation-store",
  {
    state: () => ({
      selectedSportId: "",
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
  }
);
