import { SOCCER_SPORT_ID } from "@/utilities/sport-ids";
const defaultPageSize = 10;

export const useSportsQueryParamsStore = defineStore(
  "sports-query-params-store",
  {
    state: () => ({
      /** !--- Start params for matches request ---! */
      sport: SOCCER_SPORT_ID,
      page: 0,
      pageSize: defaultPageSize,
      competition: "",
      day: "",
      sortBy: "",
      hour: "",
      country: "",

      layout: "list",

      resource: "highlight",
      /** !--- End params for matches request ---! */

      /** !--- Start params for match details request  ---! */
      matchId: "",
      subTypeId: "",
      /** !--- End  params for match details request ---! */

      liveSportId: 10,
      scrollId: null,
    }),

    getters: {
      getParams: (state) => {
        return {
          sport: state.sport,
          page: state.page,
          pageSize: state.pageSize,
          competition: state.competition,
          day: state.day,
          sortBy: state.sortBy,
          hour: state.hour,
          country: state.country,
          matchId: state.matchId,
          subTypeId: state.subTypeId,
          resource: state.resource,
        };
      },
    },

    actions: {
      /** ---! Start set params section ---! */
      resetToDefaults() {
        this.sport = SOCCER_SPORT_ID;
        this.page = 0;
        this.pageSize = defaultPageSize;
        this.competition = "";
        this.day = "";
        this.sortBy = "";
        this.hour = "";
        this.country = "";
        this.subTypeId = "";
        this.matchId = "";
        this.resource = "highlight";
      },

      setSport(sport) {
        this.sport = sport;
      },
      setCountry(country) {
        this.country = country;
      },
      setCompetition(competition) {
        this.competition = competition;
      },
      setSortBy(sortBy) {
        this.sortBy = sortBy;
      },
      setDay(day) {
        this.day = day;
      },
      setPage(page) {
        if (!page) {
          page = 0;
        }
        this.page = page;
      },
      setPageSize(pageSize) {
        this.pageSize = pageSize;
      },
      setHour(hour) {
        this.hour = hour;
      },
      setMatchId(matchId) {
        this.matchId = matchId;
      },
      setScrollPosition(matchId) {
        console.log(matchId);
        this.scrollId = matchId;
      },
      setSubTypeId(subTypeId) {
        this.subTypeId = subTypeId;
      },
      setResource(resource) {
        this.resource = resource;
      },
      setLayout(layout) {
        this.layout = layout;
      },
      /** ---!  End set params section ---! */
    },
    persist: {
      // Cookie, not localStorage: these values decide what the homepage
      // renders (active layout tab, sport), so SSR must see them too or
      // every hydration mismatches against the restored client state.
      storage: piniaPluginPersistedstate.cookies({
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: true,
        path: "/",
      }),
      pick: ["sport", "layout", "liveSportId"],
    },
  }
);
