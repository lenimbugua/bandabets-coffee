import { SOCCER_SPORT_ID } from "@/utilities/sport-ids";
import { useMatches2Store } from "../stores/matches2";
import { useSportsStore } from "../stores/sports";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import { useSportsNavigationStore } from "../stores/sports-navigation";

export function useDefaultSport() {
  const { resetToDefaults, setSport } = useSportsQueryParamsStore();
  const { setSelectedSport } = useSportsStore();
  const {resetSelectedSportId} = useSportsNavigationStore();

  const { emptyMatches, getMatches, resetSelectedMarket } = useMatches2Store();
  const initDefaultSport = (shouldFetch) => {
    emptyMatches();
    resetSelectedMarket();
    resetToDefaults();
    setSport(SOCCER_SPORT_ID);
    resetSelectedSportId();
    setSelectedSport("soccer");
    if (shouldFetch) {
      getMatches();
    }
  };
  return {
    initDefaultSport,
  };
}
