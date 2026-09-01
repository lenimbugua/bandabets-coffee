import API from "../services/API";

export const useNewLiveStore = defineStore("new-live-store", {
  state: () => ({
    competitions: [],
    pending: false,
    responseOK: false,

    selectedSport: {
      sportId: "",
      sportName: "all sports",
      sportBinomen: "allSports",
      matchCount: 0,
    },

    //filters
    competition: "",
    sortBy: "",
    sport: "",
  }),

  actions: {
    async getLiveMatches() {
      try {
        this.pending = true;
        this.responseOK = false;
        const response = await API().get(
          `/sportsbook/api/v3/matches-grouped?sport=${this.sport}&competition=${this.competition}&sortBy=${this.sortBy}&day=&resource=live`
        );

        this.competitions = response.data.data.competitions;

        this.responseOK = true;

        this.pending = false;
      } catch (error) {
        this.pending = false;
      } finally {
        this.pending = false;
      }
    },
    async pollLiveMatches() {
      try {
        this.responseOK = false;
        const response = await API().get(
          `/sportsbook/api/v3/matches-grouped?sport=${this.sport}&competition=${this.competition}&sortBy=${this.sortBy}&day=&resource=live`
        );

        const newCompetitions = response.data.data.competitions;

        this.competitions = this.updateDataAndMaintainState(
          this.competitions,
          newCompetitions
        );

        this.responseOK = true;
      } catch (error) {
        console.log(error);
        this.pending = false;
      } finally {
        this.pending = false;
      }
    },

    // Assume 'oldData' is what you currently have stored in your UI state
    // Assume 'newData' is the fresh JSON response from your polling request

    updateDataAndMaintainState(oldData, newData) {
      return newData.map((newComp) => {
        // 1. Find the matching competition in your existing state
        const existingComp = oldData.find(
          (c) => c.competitionId === newComp.competitionId
        );

        // 2. Return the new data, but inject the 'isOpened' value from the old state
        return {
          ...newComp,
          // If it existed before, keep its state. Otherwise, default to false.
          isOpened: existingComp ? existingComp.isOpened : false,
        };
      });
    },

    setSport(sport) {
      this.sport = sport;
    },
    setCompetition(competition) {
      this.competition = competition;
    },
    setSelectedSport(sport) {
      this.selectedSport = sport;
    },
    setSortBy(sortBy) {
      this.sortBy = sortBy;
    },
    resetSortBy() {
      this.sortBy = "";
    },
    resetAllFilters() {
      this.competition = "";
      this.sortBy = "";
      this.sport = "";
    },
  },
  persist: {
    pick: ["selectedSport", "competition", "sortBy", "sport"],
  },
});
