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
    //
    // Polls must not reorder what the user is already looking at: rows that
    // shuffle every refresh make the page jump around. Competitions (and the
    // matches inside them) keep their current position and only get fresh
    // data; genuinely new ones append at the bottom. Server ordering is
    // adopted only on explicit loads (getLiveMatches), not on polls.
    updateDataAndMaintainState(oldData, newData) {
      const freshById = new Map(
        newData.map((comp) => [comp.competitionId, comp])
      );
      const merged = [];
      for (const oldComp of oldData) {
        const fresh = freshById.get(oldComp.competitionId);
        if (!fresh) continue; // competition no longer live
        freshById.delete(oldComp.competitionId);
        merged.push({
          ...fresh,
          matches: this.maintainMatchOrder(oldComp.matches, fresh.matches),
          isOpened: oldComp.isOpened,
        });
      }
      for (const fresh of freshById.values()) {
        merged.push({ ...fresh, isOpened: false });
      }
      return merged;
    },

    maintainMatchOrder(oldMatches, newMatches) {
      const freshById = new Map(
        (newMatches || []).map((match) => [match.parentMatchId, match])
      );
      const ordered = [];
      for (const oldMatch of oldMatches || []) {
        const fresh = freshById.get(oldMatch.parentMatchId);
        if (!fresh) continue; // match ended
        freshById.delete(oldMatch.parentMatchId);
        ordered.push(fresh);
      }
      ordered.push(...freshById.values());
      return ordered;
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
