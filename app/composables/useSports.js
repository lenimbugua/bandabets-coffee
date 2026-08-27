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
    iconColor: "text-primary",
    id: SOCCER_SPORT_ID,
    link: "/",
  },
  {
    name: "eSports",
    icon: eSoccer,
    iconColor: "text-amber-700 dark:text-amber-400",
    id: 10915624,
    link: "/",
  },
  {
    name: "basketball",
    icon: basketball,
    iconColor: "text-orange-600 dark:text-orange-400",
    id: 4,
    link: "/",
  },
  {
    name: "tennis",
    icon: tennis,
    iconColor: "text-lime-600 dark:text-lime-400",
    id: 24,
    link: "/",
  },
  {
    name: "cricket",
    icon: cricket,
    iconColor: "text-sky-600 dark:text-sky-400",
    id: 6,
    link: "/",
  },
  {
    name: "rugby",
    icon: rugby,
    iconColor: "text-amber-700 dark:text-amber-400",
    id: 73743,
    link: "/",
  },
  {
    name: "Ice Hockey",
    icon: iceHockey,
    iconColor: "text-cyan-600 dark:text-cyan-400",
    id: 15,
    link: "/",
  },
  {
    name: "Table Tennis",
    icon: tableTennis,
    iconColor: "text-brand-bright",
    id: 269467,
    link: "/",
  },
  {
    name: "handball",
    icon: handball,
    iconColor: "text-rose-600 dark:text-rose-400",
    id: 99614,
    link: "/",
  },
  {
    name: "volleyball",
    icon: volleyball,
    iconColor: "text-blue-600 dark:text-blue-400",
    id: 91189,
    link: "/",
  },
  {
    name: "American Football",
    icon: americanFootball,
    iconColor: "text-amber-600 dark:text-amber-400",
    id: 17,
    link: "/",
  },
  {
    name: "Boxing",
    icon: boxing,
    iconColor: "text-red-700 dark:text-red-400",
    id: 5,
    link: "/",
  },
  {
    name: "Aussie Rules",
    icon: aussieRules,
    iconColor: "text-teal-600 dark:text-teal-400",
    id: 2,
    link: "/",
  },
  {
    name: "Futsal",
    icon: futsal,
    iconColor: "text-primary",
    id: 491393,
    link: "/",
  },
  {
    name: "Golf",
    icon: golf,
    iconColor: "text-emerald-700 dark:text-emerald-400",
    id: 12,
    link: "/",
  },
  {
    name: "Hockey",
    icon: hockey,
    iconColor: "text-yellow-600 dark:text-yellow-400",
    id: 208627,
    link: "/",
  },
  {
    name: "Horse Racing",
    icon: horseRacing,
    iconColor: "text-orange-700 dark:text-orange-400",
    id: 14,
    link: "/",
  },
  {
    name: "Snooker",
    icon: snooker,
    iconColor: "text-amber-700 dark:text-amber-400",
    id: 22,
    link: "/",
  },
  {
    name: "Motor Sport",
    icon: motorSport,
    iconColor: "text-slate-700 dark:text-slate-300",
    id: 16,
    link: "/",
  },
  {
    name: "Badminton",
    icon: badminton,
    iconColor: "text-sky-500 dark:text-sky-400",
    id: 271554,
    link: "/",
  },
  {
    name: "Baseball",
    icon: baseball,
    iconColor: "text-yellow-600 dark:text-yellow-300",
    id: 3,
    link: "/",
  },
  {
    name: "Cycling",
    icon: cycling,
    iconColor: "text-brand-bright",
    id: 7,
    link: "/",
  },
  {
    name: "Darts",
    icon: darts,
    iconColor: "text-pink-600 dark:text-pink-400",
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
