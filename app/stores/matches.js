import API, { MATCHES_PATH } from "../services/API";
// import { matchesBaseURL } from "../services/API";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import { useSortTypes } from "../composables/useSortTypes";

const { sortByTime, sortByLeague } = useSortTypes();

export const useMatchesStore = defineStore("matches-store", {
  state: () => ({
    /** !--- Start response states ---! */
    landingIsPending: false,
    sportIsPending: false,
    dayIsPending: false,
    pending: false,
    competitionIsPending: false,

    subtypePending: false,
    // subTypeId currently being lazy-loaded, so only that market's row shows
    // its loading state.
    subtypeLoadingId: null,

    error: {
      hasError: false,
      message: "",
      field: "",
    },
    responseOK: false,
    /** !--- End response states ---! */

    /** !--- Start response data ---! */
    countries: [],
    competitions: [],
    sports: [],
    days: [],
    hours: [],
    markets: [],
    meta: null,

    matchDetails: null,
    marketGroups: null,
    /** !--- End response data ---! */

    chunkNumber: 0,
    chunkSize: 100,

    chunkArray: [],

    matchDetailIsLive: false,
  }),

  getters: {
    isOpened: (state) => (index) => {
      const competition = state.competitions[index];
      if (!competition) {
        return false;
      }

      if (competition["isOpened"]) {
        return competition.isOpened;
      }

      const matches = competition?.matches;

      if (!matches) {
        return false;
      }

      return matches.length > 0;
    },
  },

  actions: {
    async fetchLandingMatches() {
      this.resetChunkArray();
      const { resetToDefaults } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        this.beforeAPICallState();
        resetToDefaults();

        this.landingIsPending = true;

        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });
        this.landingIsPending = false;
        this.setCountries(response.data.data.countries);
        this.setCompetitions(response.data.data.competitions);
        this.chunkArrayData();
        this.setDays(response.data.data.days);
        this.setHours(response.data.data.hours);
        this.setMarkets(response.data.data.markets);
        this.setMeta(response.data.data.meta);
        this.afterAPICallSuccessState();
      } catch (err) {
        this.landingIsPending = false;
        this.afterAPICallErrorState(err);
      }
    },
    async fetchSportMatches(sport) {
      this.setCompetitions([]);
      const { resetToDefaults, setSport } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());

      try {
        this.resetChunkArray();
        resetToDefaults();
        setSport(sport);
        this.beforeAPICallState();
        this.sportIsPending = true;
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });
        this.sportIsPending = false;

        this.setCountries(response.data.data.countries);
        this.setCompetitions(response.data.data.competitions);
        this.chunkArrayData();

        this.setDays(response.data.data.days);
        this.setHours(response.data.data.hours);
        this.setMarkets(response.data.data.markets);
        this.setMeta(response.data.data.meta);
        this.afterAPICallSuccessState();
      } catch (err) {
        this.sportIsPending = false;
        this.afterAPICallErrorState(err);
      }
    },
    async pollLiveMatches() {
      // this.setCompetitions([]);

      const { getParams } = storeToRefs(useSportsQueryParamsStore());

      try {
        // resetToDefaults();
        // setResource("live");
        // setDay("");
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });
        this.setCompetitions(response?.data?.data?.competitions);

        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },
    async fetchLiveMatches(sportId) {
      this.setCompetitions([]);

      const { resetToDefaults, setDay, setSport, setResource } =
        useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());

      try {
        resetToDefaults();
        setResource("live");
        setSport(sportId);
        setDay("");
        this.beforeAPICallState();
        this.setCompetitions([]);

        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        // this.setCountries(response.data.data.countries);
        this.setCompetitions(response.data.data.competitions);
        if (!sportId) {
          this.setSports(response.data.data.sports);
          this.setMeta(response.data.data.meta);
        }
        // this.setDays(response.data.data.days);
        // this.setHours(response.data.data.hours);
        // this.setMarkets(response.data.data.markets);
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },

    async fetchDayMatches(day) {
      this.resetChunkArray();

      const { resetToDefaults, setDay } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        resetToDefaults();
        setDay(day);
        this.setCountries([]);
        // this.setCompetitions([]);
        this.setMeta(null);
        this.beforeAPICallState();
        this.dayIsPending = true;

        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });
        this.dayIsPending = false;
        this.setCountries(response.data.data.countries);
        this.setCompetitions(response.data.data.competitions);
        this.chunkArrayData();
        this.setMeta(response.data.data.meta);
        this.afterAPICallSuccessState();
      } catch (err) {
        this.dayIsPending = false;
        this.afterAPICallErrorState(err);
      }
    },
    async fetchHourMatches(hour) {
      const { setHour } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        setHour(hour);
        this.beforeAPICallState();
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        this.setCompetitions(response.data.data.competitions);

        this.setMeta(response.data.data.meta);
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },

    async fetchCountryMatches(country) {
      const { resetToDefaults, setCountry, setSortBy } =
        useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());

      try {
        resetToDefaults();
        setCountry(country);
        setSortBy(sortByLeague);
        this.beforeAPICallState();
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        this.setCompetitions(response.data.data.competitions);
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },

    async fetchCompetitionMatches(competition, index) {
      const { setCompetition, setSortBy } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        // this.resetToDefaults();
        setCompetition(competition);
        setSortBy(sortByLeague);
        this.competitionIsPending = true;
        this.error = {
          hasError: false,
          message: "",
          field: "",
        };
        this.responseOK = false;
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        if (response?.data?.data?.competitions[0]) {
          this.chunkArray[index] = response.data.data.competitions[0];

          this.competitions[index] = response.data.data.competitions[0];
        }
        this.competitionIsPending = false;
        // this.setCompetitions(response.data.data.competitions);
        this.afterAPICallSuccessState();
      } catch (err) {
        this.competitionIsPending = false;
        this.afterAPICallErrorState(err);
      }
    },
    async fetchSortedMatches(sortBy) {
      const { resetToDefaults, setSortBy } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        resetToDefaults();
        setSortBy(sortBy);
        this.beforeAPICallState();
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        if (sortBy === sortByTime) {
          this.setHours(response.data.data.hours);
        } else {
          this.setCompetitions(response.data.data.competitions);
        }
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },
    setCountries(countries) {
      if (this.isNullOrUndefined(countries)) {
        this.countries = [];
        return;
      }
      this.countries = countries;
    },
    setCompetitions(competitions) {
      if (this.isNullOrUndefined(competitions)) {
        this.competitions = [];
        return;
      }

      this.competitions = competitions;
    },
    setSports(sports) {
      if (this.isNullOrUndefined(sports)) {
        this.sports = [];
        return;
      }

      this.sports = sports;
    },
    setDays(days) {
      if (this.isNullOrUndefined(days)) {
        this.days = [];
        return;
      }

      this.days = days;
    },
    setHours(hours) {
      if (this.isNullOrUndefined(hours)) {
        this.hours = [];
        return;
      }

      this.hours = hours;
    },
    setMarkets(markets) {
      if (this.isNullOrUndefined(markets)) {
        this.markets = [];
        return;
      }

      this.markets = markets;
    },
    setMeta(meta) {
      if (this.isNullOrUndefined(meta)) {
        this.meta = null;
        return;
      }

      this.meta = meta;
    },

    isNullOrUndefined(data) {
      if (data === null || data === undefined) {
        return true;
      }
      return false;
    },

    async fetchMatchDetails(id) {
      const queryParamsStore = useSportsQueryParamsStore();
      const { resetToDefaults, setMatchId } = queryParamsStore;

      const endPoint = `${MATCHES_PATH}?sport=&page=0&pageSize=10&competition=&day=&sortBy=&hour=&country=&matchId=${id}&subTypeId=&resource=`;
      try {
        resetToDefaults();
        setMatchId(id);
        this.beforeAPICallState();

        const response = await API().get(endPoint);

        // Stale-response guard: a later navigation wins over this response.
        if (String(queryParamsStore.matchId) !== String(id)) return;

        this.matchDetails = response.data.data.matchInfo;
        this.marketGroups = response.data.data.marketGroups;
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },
    async fetchMatchByDirection(parentMatchId, direction) {
      const { resetToDefaults } = useSportsQueryParamsStore();
      try {
        resetToDefaults();
        this.beforeAPICallState();
        const url = `/sportsbook/api/v2/matche-direction?parentMatchId=${parentMatchId}&direction=${direction}`;

        const response = await API().get(url);

        this.matchDetails = response.data.data.matchInfo;
        this.marketGroups = response.data.data.marketGroups;
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },
    async pollMatchDetails(id) {
      const queryParamsStore = useSportsQueryParamsStore();
      const { resetToDefaults, setMatchId } = queryParamsStore;
      const { getParams } = storeToRefs(queryParamsStore);
      try {
        resetToDefaults();
        setMatchId(id);

        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        // Stale-response guard: the user may have navigated to a different
        // match (or left the page, which blanks matchId) while this request
        // was in flight. Committing it would flash the previous match.
        if (String(queryParamsStore.matchId) !== String(id)) return;

        this.matchDetails = this.mergeMatchDetails(
          this.matchDetails,
          response.data.data.matchInfo
        );
        this.marketGroups = response.data.data.marketGroups;
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },

    // A poll must not reset what the user has expanded or collapsed: the
    // response replaces odds/scores, but each market's isOpened flag is
    // carried over (matched by subTypeId) so the accordion doesn't snap
    // back every refresh.
    mergeMatchDetails(oldDetails, freshDetails) {
      if (!freshDetails) return freshDetails;
      if (
        !oldDetails ||
        String(oldDetails.parentMatchId) !== String(freshDetails.parentMatchId)
      ) {
        return freshDetails;
      }
      const oldMarkets = new Map(
        (oldDetails.markets || []).map((m) => [String(m.subTypeId), m])
      );
      return {
        ...freshDetails,
        markets: (freshDetails.markets || []).map((market) => {
          const old = oldMarkets.get(String(market.subTypeId));
          if (!old) return market;
          const merged =
            old.isOpened === undefined
              ? market
              : { ...market, isOpened: old.isOpened };
          // A market the user drilled into keeps its loaded outcomes if the
          // poll payload came back without them.
          if (!market.matchOutcomes?.length && old.matchOutcomes?.length) {
            return { ...merged, matchOutcomes: old.matchOutcomes };
          }
          return merged;
        }),
      };
    },
    async fetchMatchDetailsSubtype(subTypeId) {
      const queryParamsStore = useSportsQueryParamsStore();
      const { resetToDefaults, setSubTypeId, setMatchId } = queryParamsStore;
      const { getParams } = storeToRefs(queryParamsStore);
      const matchId = this.matchDetails?.parentMatchId;
      try {
        resetToDefaults();
        this.subtypePending = true;
        this.subtypeLoadingId = subTypeId;
        this.error = {
          hasError: false,
          message: "",
          field: "",
        };
        this.responseOK = false;

        // resetToDefaults blanks matchId — restore it or the API returns
        // this subtype's markets for the wrong (unscoped) match set.
        setMatchId(matchId);
        setSubTypeId(subTypeId);
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        // Only merge into the match this request was made for.
        const fetched = response?.data?.data?.markets?.[0];
        const target =
          String(this.matchDetails?.parentMatchId) === String(matchId)
            ? this.findMarket(subTypeId)
            : null;
        if (fetched && target) {
          Object.assign(target, fetched, { isOpened: true });
        }
        setSubTypeId("");
        this.subtypePending = false;
        this.subtypeLoadingId = null;
        this.responseOK = true;
      } catch (err) {
        this.subtypePending = false;
        this.subtypeLoadingId = null;
        this.afterAPICallErrorState(err);
      }
    },

    async fetchMatchBySubtype(subTypeId) {
      const { setSubTypeId } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        this.pending = true;
        this.error = {
          hasError: false,
          message: "",
          field: "",
        };
        this.responseOK = false;

        setSubTypeId(subTypeId);
        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        this.setCompetitions(response.data.data.competitions);

        this.pending = false;
        this.responseOK = true;
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },

    /** ---!  Start set response state section ---! */
    beforeAPICallState() {
      this.pending = true;
      this.error = {
        hasError: false,
        message: "",
        field: "",
      };
      this.responseOK = false;
    },
    afterAPICallSuccessState() {
      this.pending = false;
      this.responseOK = true;
    },
    afterAPICallErrorState(err) {
      console.log(err);
      this.pending = false;
      this.responseOK = false;
      this.error = {
        hasError: true,
        // message: err.response.data.error,
        field: "unknown",
      };
    },
    /** ---!  End set response state section ---! */

    toggleOutcomes(index) {
      const competition = this.competitions[index];
      if (!competition) {
        return;
      }

      if (competition["isOpened"]) {
        competition.isOpened = !competition.isOpened;
      } else {
        competition["isOpened"] = false;
      }
      this.chunkArray[index] = competition;
    },
    // By subTypeId, not array index: the market list in MatchDetails.vue is
    // group-filtered, so a position in the rendered list is not a position
    // in matchDetails.markets. The old index-based toggle also could only
    // ever set isOpened to false, which made expanded markets uncollapsible.
    toggleMarketOutcomes(subTypeId) {
      const market = this.findMarket(subTypeId);
      if (!market) {
        return;
      }
      // Markets render open by default when they already carry outcomes, so
      // an untoggled market's effective state is derived, not stored.
      const currentlyOpen =
        market.isOpened === undefined
          ? (market.matchOutcomes?.length || 0) > 0
          : market.isOpened;
      market.isOpened = !currentlyOpen;
    },

    findMarket(subTypeId) {
      return (this.matchDetails?.markets || []).find(
        (market) => String(market.subTypeId) === String(subTypeId)
      );
    },
    setMatchDetailIsLive(payload) {
      this.matchDetailIsLive = payload;
    },

    getChunkIndices() {
      const startIndex = this.chunkNumber * this.chunkSize;
      const endIndex = startIndex + this.chunkSize;
      return { startIndex, endIndex };
    },

    chunkArrayData() {
      const { startIndex, endIndex } = this.getChunkIndices();
      this.chunkNumber++;
      if (startIndex >= this.competitions.length) return [];
      let data = this.competitions.slice(startIndex, endIndex);

      this.chunkArray.push(...data);
    },

    resetChunkArray() {
      this.chunkArray = [];
      this.chunkNumber = 0;
    },
  },
  persist: false,
});
