import { SOCCER_SPORT_ID } from "@/utilities/sport-ids";
import { useCompetionsStore } from "@/stores/competitions";
import { useSportsQueryParamsStore } from "@/stores/sports-query-params";
import formatStuff from "@/utilities/format-stuff";
import { ref, toRefs } from "vue";
import { useRouter } from "vue-router";
import { useMatches2Store } from "../stores/matches2";
import { useSportsStore } from "../stores/sports";
import { useSportsNavigationStore } from "../stores/sports-navigation";

const { slugify } = formatStuff();

const soccer = "soccer";
const basketball = "basketball";
const tennis = "tennis";
const cricket = "cricket";
const rugby = "rugby";
const iceHockey = "iceHockey";
const tableTennis = "tableTennis";
const handball = "handball";
const volleyball = "volleyball";
const americanFootball = "americanFootball";
const boxing = "boxing";
const eSoccer = "esports";
const aussieRules = "aussieRules";
const futsal = "futsal";
const golf = "golf";
const hockey = "hockey";
const horseRacing = "horseRacing";
const snooker = "snooker";
const motorSport = "motorSport";
const badminton = "badminton";
const baseball = "baseball";
const cycling = "cycling";
const darts = "darts";

const games = ref([
  {
    name: "soccer",
    icon: soccer,
    id: SOCCER_SPORT_ID,
    link: "/",
  },
  {
    name: "eSports",
    icon: eSoccer,
    id: 10915624,
    link: "/",
  },
  {
    name: "basketball",
    icon: basketball,
    id: 4,
    link: "/",
  },
  {
    name: "tennis",
    icon: tennis,
    id: 24,
    link: "/",
  },
  {
    name: "cricket",
    icon: cricket,
    id: 6,
    link: "/",
  },
  {
    name: "rugby",
    icon: rugby,
    id: 73743,
    link: "/",
  },
  {
    name: "Ice Hockey",
    icon: iceHockey,
    id: 15,
    link: "/",
  },
  {
    name: "Table Tennis",
    icon: tableTennis,
    id: 269467,
    link: "/",
  },
  {
    name: "handball",
    icon: handball,
    id: 99614,
    link: "/",
  },
  {
    name: "volleyball",
    icon: volleyball,
    id: 91189,
    link: "/",
  },
  {
    name: "American Football",
    icon: americanFootball,
    id: 17,
    link: "/",
  },
  {
    name: "Boxing",
    icon: boxing,
    id: 5,
    link: "/",
  },
  {
    name: "Aussie Rules",
    icon: aussieRules,
    id: 2,
    link: "/",
  },
  {
    name: "Futsal",
    icon: futsal,
    id: 491393,
    link: "/",
  },
  {
    name: "Golf",
    icon: golf,
    id: 12,
    link: "/",
  },
  {
    name: "Hockey",
    icon: hockey,
    id: 208627,
    link: "/",
  },
  {
    name: "Horse Racing",
    icon: horseRacing,
    id: 14,
    link: "/",
  },
  {
    name: "Snooker",
    icon: snooker,
    id: 22,
    link: "/",
  },
  {
    name: "Motor Sport",
    icon: motorSport,
    id: 16,
    link: "/",
  },
  {
    name: "Badminton",
    icon: badminton,
    id: 271554,
    link: "/",
  },
  {
    name: "Baseball",
    icon: baseball,
    id: 3,
    link: "/",
  },
  {
    name: "Cycling",
    icon: cycling,
    id: 7,
    link: "/",
  },
  {
    name: "Darts",
    icon: darts,
    id: 8,
    link: "/",
  },
]);

export function useSports() {
  const router = useRouter();
  const { setSport, resetToDefaults, setResource } =
    useSportsQueryParamsStore();
  const { layout } = toRefs(useSportsQueryParamsStore());

  const { setSelectedSport } = useSportsStore();

  const { emptyMatches, getMatches, resetSelectedMarket, setSportIsPending } =
    useMatches2Store();
  const { fetchCompetions, selectCompetitions } = useCompetionsStore();

  const fetchCompetitions = () => {
    selectCompetitions([]);
    fetchCompetions();
  };
  async function fetchMatches(sportId, name, icon, goToSports) {
    emptyMatches();
    resetSelectedMarket();
    resetToDefaults();
    setSport(sportId);
    setSelectedSport(icon);
    useSportsNavigationStore().setSelectedSportId(sportId);

    const slugifiedName = slugify(name);

    if (goToSports) {
      router.push({ name: "sports", params: { sport: slugifiedName } });
    }

    if (layout.value === "grid") {
      fetchCompetitions();
      return;
    }

    if (sportId !== SOCCER_SPORT_ID) {
      setResource("upcoming");
    }
    setSportIsPending(true);
    await getMatches();
    setSportIsPending(false);
  }
  return {
    soccer,
    basketball,
    tennis,
    cricket,
    rugby,
    iceHockey,
    tableTennis,
    handball,
    volleyball,
    americanFootball,
    boxing,
    eSoccer,
    aussieRules,
    futsal,
    golf,
    hockey,
    horseRacing,
    snooker,
    motorSport,
    badminton,
    baseball,
    cycling,
    darts,

    fetchMatches,
    games,
  };
}
