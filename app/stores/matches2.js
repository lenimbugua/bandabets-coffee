import { useCompetionsStore } from "@/stores/competitions";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import API, { MATCHES_PATH } from "../services/API";

export const useMatches2Store = defineStore("matches2-store", {
  state: () => ({
    pending: false,
    sportIsPending: false,
    calendarIsPending: false,
    responseOK: false,
    matches: [],
    markets: [],
    selectedMarket: null,
    full: false,
    page: 0,

    //scrolling
    scrollTop: 0,
    restoreScroll: false,

    selectedSportId: null,
  }),

  getters: {
    getDefaultMarket: (state) => {
      if (state.selectedMarket) {
        console.log(state.selectedMarket);
        return state.selectedMarket;
      }
      if (!state.markets || !state.markets.length) {
        return;
      }
      return state.markets[0].subTypeId;
    },
  },

  actions: {
    async getMatches() {
      const { getParams, layout } = storeToRefs(useSportsQueryParamsStore());
      const { setPage } = useSportsQueryParamsStore();
      const { fetchCompetions } = useCompetionsStore();

      if (this.full) {
        return;
      }

      if (layout.value === "grid") {
        fetchCompetions();
        return;
      }

      setPage(this.page);
      this.page++;

      try {
        this.pending = true;
        this.responseOK = false;
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        let matches = response.data.data.matches;

        if (!matches.length) {
          this.full = true;
          this.pending = false;
          this.responseOK = true;
          return;
        }

        this.markets = response.data.data.markets;

        this.matches.push(...matches);

        this.pending = false;
        this.responseOK = true;
      } catch (error) {
        this.pending = false;
      }
    },
    async emptyMatches() {
      this.matches = [];
      this.full = false;
      this.page = 0;
    },
    setSelectedMarket(subTypeId) {
      this.selectedMarket = subTypeId;
    },
    resetSelectedMarket() {
      this.selectedMarket = null;
    },
    setMarkets(markets) {
      this.markets = markets;
    },
    setSportIsPending(payload) {
      this.sportIsPending = payload;
    },
    setCalendarIsPending(payload) {
      this.calendarIsPending = payload;
    },

    saveScrollPosition(scrollTop) {
      this.scrollTop = scrollTop;
      this.restoreScroll = true;
    },

    consumeScrollPosition() {
      this.restoreScroll = false;
      return this.scrollTop;
    },

    setSelectedSportId(id) {
      this.selectedSportId = id;
    },
  },
  persist: {
    pick: ["selectedMarket", "selectedSportId", "scrollTop", "restoreScroll"],
  },
});
