import API from "../services/API";
import { useMatches2Store } from "./matches2";
import { useSportsQueryParamsStore } from "./sports-query-params";

export const useCompetionsStore = defineStore("competions-store", {
  state: () => ({
    error: null,
    pending: false,
    responseOK: false,
    competitions: [],
    selectedCompetitions: [],
    markets: [],
  }),

  actions: {
    async fetchCompetions() {
      try {
        this.pending = true;

        this.error = null;
        this.responseOK = false;
        this.competitions = null;

        const { sport, day } = storeToRefs(useSportsQueryParamsStore());

        const response = await API().get(
          `/sportsbook/api/v3/matches-grouped?sport=${
            sport.value
          }&competition=${this.selectedCompetitions.join(",")}&day=${day.value}`
        );
        this.pending = false;

        this.error = null;
        this.responseOK = false;
        const { setMarkets } = useMatches2Store();
        setMarkets(response?.data?.data?.markets);

        this.competitions = response.data.data.competitions;
        this.markets = response?.data?.data?.markets;
      } catch (err) {
        console.log(err);
        this.responseOK = false;
        this.error = err.response.data.statusMessage;
        this.pending = false;
      }
    },

    selectCompetitions(competions) {
      this.selectedCompetitions = competions;
    },

    resetError() {
      this.error = null;
    },
  },
  persist: {
    pick: ["selectedCompetitions"],
  },
});
