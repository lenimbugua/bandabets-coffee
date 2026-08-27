import { SOCCER_SPORT_ID } from "@/utilities/sport-ids";
import { useMatches2Store } from "@/stores/matches2";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import API, { MATCHES_PATH } from "../services/API";


export const useLiveMatchesStore = defineStore("live-matches-store", {
  state: () => ({
    pending: false,
    responseOK: false,
    sports: [],
    matches: [],
    markets: [],
    meta: null,
    full: false,
    page: 0,
    previewMatches: [],
    previewPending: false,
    highlightMatches: [],
    highlightPending: false,
  }),

  actions: {
    async getLiveSports() {
      try {
        this.responseOK = false;
        const response = await API().get(
          `${MATCHES_PATH}?sport=&page=0&pageSize=200&competition=&day=&sortBy=&hour=&country=&matchId=&subTypeId=&resource=live`
        );

        const sports = response.data.data.sports;
        this.sports = this.addAllSportsAtBeginning(sports);
        console.log(this.sports);
        this.meta = response.data.data.meta;

        this.pending = false;
        this.responseOK = true;
      } catch (error) {
        this.pending = false;
      }
    },
    async getLiveMatches() {
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      const { setPage, setPageSize, setResource } = useSportsQueryParamsStore();
      setResource("live");
      setPageSize(200);
      setPage("");

      try {
        this.pending = true;
        this.responseOK = false;
        await this.getLiveSports();
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });
        this.matches = response.data.data.matches;

        const { setMarkets, resetSelectedMarket } = useMatches2Store();
        setMarkets(response.data.data.markets);
        resetSelectedMarket();
        this.pending = false;
        this.responseOK = true;
      } catch (error) {
        this.pending = false;
      }
    },

    async pollLiveMatches() {
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      const { setPage, setPageSize, setResource } = useSportsQueryParamsStore();

      setResource("live");
      setPage("");
      setPageSize(200);

      try {
        await this.getLiveSports();
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });
        this.matches = response.data.data.matches;
        const {
          setMarkets,
          // resetSelectedMarket
        } = useMatches2Store();
        setMarkets(response.data.data.markets);
        // resetSelectedMarket();
      } catch (err) {
        console.log(err);
      }
    },

    async getPreviewLiveMatches(sport = "") {
      try {
        this.previewPending = true;
        const response = await API().get(
          `/sportsbook/api/v2/matches-grouped?sport=${sport}&competition=&sortBy=&day=&resource=live`
        );
        this.previewMatches = response.data.data.competitions || [];
        this.previewPending = false;
      } catch (error) {
        this.previewPending = false;
      }
    },

    async getHighlightMatches(sport = "") {
      try {
        this.highlightPending = true;
        const response = await API().get(
          `/sportsbook/api/v2/matches-grouped?sport=${sport || SOCCER_SPORT_ID}&competition=&sortBy=&day=&resource=highlight`
        );
        this.highlightMatches = response.data.data.competitions || [];
        this.highlightPending = false;
      } catch (error) {
        this.highlightPending = false;
      }
    },

    setPending(payload) {
      this.pending = payload;
    },

    async emptyLiveMatches() {
      this.matches = [];
      this.full = false;
      this.page = 0;
    },

    getTotalMatchCount(sports = []) {
      return sports.reduce(
        (total, sport) => total + (sport.matchCount || 0),
        0
      );
    },

    addAllSportsAtBeginning(sports = []) {
      const totalMatchCount = this.getTotalMatchCount(sports);

      const allSports = {
        sportId: "",
        sportName: "all sports",
        sportBinomen: "allSports",
        matchCount: totalMatchCount,
      };

      return [allSports, ...sports];
    },
  },
});
