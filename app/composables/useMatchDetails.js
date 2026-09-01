import { useMatchesStore } from "@/stores/matches";
import { useModalStore } from "@/stores/modal";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import formatStuff from "@/utilities/format-stuff";
import { useScrollToViewedMatch } from "./useScrollToViewedMatch";

const { slugify } = formatStuff();

export function useMatchDetails() {
  function goToMatchDetails(match, router, isLive) {
    const { saveScrolledPosition } = useScrollToViewedMatch();
    const { setMatchDetailIsLive } = useMatchesStore();
    const { setMatchId,setScrollPosition } = useSportsQueryParamsStore();

    const { closeModal } = useModalStore();

    
    closeModal();
    
    setScrollPosition(match.parentMatchId);
    setMatchId(match.parentMatchId);

    if (isLive) {
      setMatchDetailIsLive(true);
    } else {
      setMatchDetailIsLive(false);
    }
    saveScrolledPosition();
    // No fetch here: ViewMatch owns the data. Its useAsyncData covers a
    // fresh mount and its matchId watcher covers same-route navigation, so
    // fetching before the push only duplicated the request — and, for live
    // matches, did it through the silent poll path with no pending state.
    router.push({
      name: "match-details",
      params: {
        sport: slugify(match.sportName) || "sport",
        country: slugify(match.countryName) || "country",
        league: slugify(match.competitionName) || "league",
        matchSlug: slugify(`${match.homeTeam || "home"}-vs-${match.awayTeam || "away"}`),
        id: match.parentMatchId,
      },
    });
  }

  return {
    goToMatchDetails,
  };
}
