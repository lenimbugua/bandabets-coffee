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
      const { resetToDefaults, setMatchId } = useSportsQueryParamsStore();
      //   const { getParams } = storeToRefs(useSportsQueryParamsStore());

      const endPoint = `${MATCHES_PATH}?sport=&page=0&pageSize=10&competition=&day=&sortBy=&hour=&country=&matchId=${id}&subTypeId=&resource=`;
      try {
        resetToDefaults();
        setMatchId(id);
        this.beforeAPICallState();

        // const response = await API().get(MATCHES_PATH, {
        //   params: getParams.value,
        // });
        const response = await API().get(endPoint);

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
      const { resetToDefaults, setMatchId } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        resetToDefaults();
        setMatchId(id);

        const response = await API().get(MATCHES_PATH, {
          params: getParams.value,
        });

        this.matchDetails = response.data.data.matchInfo;
        this.marketGroups = response.data.data.marketGroups;
        this.afterAPICallSuccessState();
      } catch (err) {
        this.afterAPICallErrorState(err);
      }
    },
    async fetchMatchDetailsSubtype(subTypeId, index) {
      const { resetToDefaults, setSubTypeId } = useSportsQueryParamsStore();
      const { getParams } = storeToRefs(useSportsQueryParamsStore());
      try {
        resetToDefaults();
        this.subtypePending = true;
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

        if (response?.data?.data?.markets[0]) {
          this.matchDetails.markets[index] = response.data.data.markets[0];
        }
        setSubTypeId("");
        this.subtypePending = false;
        this.responseOK = true;
      } catch (err) {
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
    toggleMarketOutcomes(index) {
      const matchDetail = this.matchDetails.markets[index];
      if (!matchDetail) {
        return;
      }

      if (matchDetail["isOpened"]) {
        matchDetail.isOpened = !matchDetail.isOpened;
      } else {
        matchDetail["isOpened"] = false;
      }
      this.matchDetails[index] = matchDetail;
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
