<script setup>
import { ref } from "vue";
import TeamStats from "./TeamStats.vue";
const matches = ref([
  {
    parent_match_id: "6771279",
    home_team: "MAN",
    away_team: "BRE",
    h_img: "MAN",
    a_img: "BRE",
    home_id: "1",
    away_id: "10",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "1.83",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.47",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "4.21",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771280",
    home_team: "NFO",
    away_team: "IPS",
    h_img: "NFO",
    a_img: "IPS",
    home_id: "11",
    away_id: "5",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "1.93",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.38",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "3.86",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771281",
    home_team: "MNC",
    away_team: "AVL",
    h_img: "MNC",
    a_img: "AVL",
    home_id: "12",
    away_id: "3",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "2.45",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.2",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "2.85",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771282",
    home_team: "NEW",
    away_team: "SOU",
    h_img: "NEW",
    a_img: "SOU",
    home_id: "13",
    away_id: "8",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "3.43",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.86",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "1.92",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771283",
    home_team: "BOU",
    away_team: "CHE",
    h_img: "BOU",
    a_img: "CHE",
    home_id: "16",
    away_id: "19",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "2.56",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.29",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "2.65",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771284",
    home_team: "CRY",
    away_team: "LEI",
    h_img: "CRY",
    a_img: "LEI",
    home_id: "17",
    away_id: "6",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "1.9",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.39",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "3.99",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771285",
    home_team: "WOL",
    away_team: "ARS",
    h_img: "WOL",
    a_img: "ARS",
    home_id: "20",
    away_id: "2",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "2.83",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.49",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "2.31",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771286",
    home_team: "FUL",
    away_team: "BHA",
    h_img: "FUL",
    a_img: "BHA",
    home_id: "4",
    away_id: "15",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "3.54",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.94",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "1.86",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771287",
    home_team: "TOT",
    away_team: "WHU",
    h_img: "TOT",
    a_img: "WHU",
    home_id: "7",
    away_id: "14",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "1.68",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.67",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "4.91",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
  {
    parent_match_id: "6771288",
    home_team: "LIV",
    away_team: "EVE",
    h_img: "LIV",
    a_img: "EVE",
    home_id: "9",
    away_id: "18",
    start_time: "2025-06-12 02:41:00",
    end_time: "2025-06-12 02:41:35",
    competition_id: "1",
    season_id: "7",
    round_id: "730084",
    previous_score: "0",
    result: "",
    markets: [
      {
        sub_type_id: "1X2",
        odd_type: "1X2",
        outcomes: [
          {
            odd_value: "3.37",
            outcome_id: "1",
            outcome_key: "1",
            outcome_name: "Home Team wins",
            status: "1",
          },
          {
            odd_value: "3.82",
            outcome_id: "X",
            outcome_key: "X",
            outcome_name: "Draw",
            status: "1",
          },
          {
            odd_value: "1.95",
            outcome_id: "2",
            outcome_key: "2",
            outcome_name: "Away Team wins",
            status: "1",
          },
        ],
      },
    ],
  },
]);

function isOpened(index) {
  const competition = matches.value[index];
  if (!competition) {
    return false;
  }

  if (competition["isOpened"]) {
    return competition.isOpened;
  }

  return false;
}

const openStats = (parentMatchId) => {
  matches.value.forEach((match) => {
    if (match.parent_match_id === parentMatchId) {
      match.isOpened = !match.isOpened;
    } else {
      match.isOpened = false;
    }
  });
};
</script>
<template>
  <ul class="flex flex-col pb-12 list-none">
    <li
      v-for="(match, index) in matches"
      :key="`${match.start_time}${match.end_time}${match.home_team}${match.away_team}`"
      class="dark:border-b border-gray-300 dark:border-black"
    >
      <div class="w-full overflow-x-hidden">
        <div class="flex p-1 md:ps-6 justify-between">
          <div class="p-2 ps-0 space-x-1 items-start flex">
            <div class="flex flex-col">
              <div class="flex items-center justify-end gap-0 md:gap-2">
                <button
                  class="cursor-pointer"
                  @click="openStats(match.parent_match_id)"
                >
                  <Icon name="tabler:chart-bar" class="h-6 w-6 text-gray-600 dark:text-slate-500" aria-hidden="true" />
                </button>
                <span class="w-5">
                  <img
                    class="w-full h-auto"
                    width="20"
                    height="20"
                    src="https://storage.livescore.com/images/team/medium/enet/9825.png"
                    alt="Home team logo"
                    loading="lazy"
                  />
                </span>
                <span
                  class="w-7 md:w-9 text-xs text-end font-bold uppercase dark:text-slate-300"
                >
                  ARS
                </span>
              </div>
              <!-- <div class="flex space-x-1 justify-end">
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-red-300/90"></div
                  ></span>
                </div>
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-gray-300/90"></div
                  ></span>
                </div>
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-red-300/90"></div
                  ></span>
                </div>
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-red-300/90"></div
                  ></span>
                </div>
              </div> -->
            </div>
            <div
              class="px-0.5 flex font-bold text-muted dark:text-gray-400 text-center items-center"
            >
              -
            </div>
            <div class="flex flex-col">
              <div class="flex items-end gap-1 md:gap-2">
                <span
                  class="w-7 md:w-9 text-xs text-start font-bold uppercase dark:text-slate-300"
                  >MUN</span
                ><span class="w-5"
                  ><img
                    class="w-full h-auto"
                    width="20"
                    height="20"
                    src="https://storage.livescore.com/images/team/medium/enet/10260.png"
                    alt="Away team logo"
                    loading="lazy"
                /></span>
              </div>
              <!-- <div class="flex space-x-1">
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-gray-300/90"></div
                  ></span>
                </div>
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-red-300/90"></div
                  ></span>
                </div>
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-red-300/90"></div
                  ></span>
                </div>
                <div class="text-center flex">
                  <span class="w-2 rounded-full h-2"
                    ><div class="w-1 rounded-full h-1 bg-red-300/90"></div
                  ></span>
                </div>
              </div> -->
            </div>
          </div>
          <div class="odds flex flex-wrap gap-1">
            <div class="flex flex-wrap items-center gap-0.5 justify-end">
              <button
                class="whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent px-2 md:px-4 flex flex-col text-xs shrink h-8 text-primary font-bold w-11 sm:w-16 rounded-l-md bg-primary/10 dark:bg-red-500/15 hover:text-primary space-x-1 dark:text-gray-300 items-center justify-center"
              >
                <!---->
                <div class="">2.36</div></button
              ><button
                class="whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent px-2 md:px-4 flex flex-col text-xs shrink h-8 text-primary font-bold w-11 sm:w-16 bg-primary/10 dark:bg-red-500/15 hover:text-primary space-x-1 dark:text-gray-300 items-center justify-center"
              >
                <!---->
                <div class="">3.13</div></button
              ><button
                class="whitespace-nowrap ring-offset-background transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent px-2 md:px-4 flex flex-col text-xs shrink h-8 text-primary font-bold w-11 sm:w-16 rounded-r-md bg-primary/10 dark:bg-red-500/15 hover:text-primary space-x-1 dark:text-gray-300 items-center justify-center"
              >
                <!---->
                <div class="">3.13</div>
              </button>
            </div>
          </div>
        </div>
      </div>
      <TeamStats v-if="isOpened(index)" />
    </li>
  </ul>
</template>
