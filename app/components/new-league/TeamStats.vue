<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import AppTabPanel from "@/components/ui/AppTabPanel.vue";
import { ref } from "vue";
import HeadToHead from "./HeadToHead.vue";
const tabs = ref([
  {
    name: "Head to Head",
    icon: "🏆",
  },
  {
    name: "Standings",
    icon: "🏆",
  },
  {
    name: "Last 5 Games",
    icon: "🏆",
  },
]);
const data = ref({
  standings: [
    {
      competition: 2,
      season: 25692,
      week: 26,
      value:
        "ATB-47-LWLWD|FCB-47-LDWLD|ATM-46-DDLWL|CLV-45-DDWLW|VIL-45-WLWDD|GIR-44-WWDDW|MAD-44-LDWWL|SOC-44-WWDDL|ESY-43-DWDWW|SEV-35-DLDWD|BET-34-WDWLL|VAL-34-WWDLD|ALV-33-DLLWD|OSA-32-DWLDW|MAL-30-WLWDD|ELC-27-DLLLD|GET-27-LLWDW|LVT-27-DDDLD|RAY-20-LWLLL|OVI-16-LLLWD",
    },
  ],
  headToHeadResults: [
    {
      value: {
        "BET-MAL":
          "MAL-BET-0:4&MAL-BET-3:1&BET-MAL-3:0&BET-MAL-1:1&MAL-BET-1:2",
        "GIR-CLV":
          "CLV-GIR-1:1&GIR-CLV-0:1&CLV-GIR-0:2&GIR-CLV-1:2&CLV-GIR-2:0",
        "VIL-ESY":
          "ESY-VIL-2:0&VIL-ESY-1:0&ESY-VIL-0:1&ESY-VIL-1:2&VIL-ESY-2:0",
        "VAL-ATM":
          "ATM-VAL-3:0&VAL-ATM-0:1&ATM-VAL-1:1&ATM-VAL-1:2&VAL-ATM-1:2",
        "MAD-SEV":
          "SEV-MAD-1:1&MAD-SEV-2:2&SEV-MAD-1:2&MAD-SEV-2:1&SEV-MAD-0:3",
        "ALV-ELC":
          "ELC-ALV-2:2&ALV-ELC-1:0&ELC-ALV-1:1&ALV-ELC-0:2&ELC-ALV-0:2",
        "ATB-OSA":
          "OSA-ATB-0:2&ATB-OSA-5:0&OSA-ATB-0:3&OSA-ATB-1:2&ATB-OSA-3:1",
        "LVT-GET":
          "GET-LVT-0:2&LVT-GET-1:0&GET-LVT-1:1&LVT-GET-1:1&GET-LVT-1:3",
        "SOC-RAY":
          "RAY-SOC-1:2&SOC-RAY-0:1&RAY-SOC-2:1&SOC-RAY-3:0&RAY-SOC-1:1",
        "OVI-FCB":
          "FCB-OVI-2:0&FCB-OVI-3:0&OVI-FCB-0:4&FCB-OVI-4:0&OVI-FCB-1:2",
      },
    },
  ],
  statistics: [
    {
      roundId: 591914,
      matches: [
        {
          competitionId: 2,
          week: 26,
          season: 25692,
          matches:
            "LVT-CLV|ESY-ATM|RAY-VAL|ELC-SEV|GET-VIL|MAL-MAD|OSA-ALV|OVI-BET|FCB-GIR|ATB-SOC",
          results: "1:1|2:2|1:3|1:1|2:3|3:0|1:1|0:2|1:2|1:2",
        },
      ],
    },
    {
      roundId: 591913,
      matches: [
        {
          competitionId: 2,
          week: 25,
          season: 25692,
          matches:
            "SEV-VAL|ESY-ALV|OSA-OVI|CLV-MAD|FCB-BET|MAL-SOC|ELC-GIR|GET-ATB|LVT-ATM|RAY-VIL",
          results: "0:2|2:1|3:1|1:1|1:1|1:2|1:2|0:1|0:0|2:1",
        },
      ],
    },
    {
      roundId: 591912,
      matches: [
        {
          competitionId: 2,
          week: 24,
          season: 25692,
          matches:
            "SEV-GIR|MAL-OVI|ESY-SOC|RAY-BET|ATM-MAD|ELC-VIL|FCB-ATB|CLV-ALV|OSA-GET|VAL-LVT",
          results: "1:1|2:1|1:1|0:2|0:2|1:2|2:1|1:0|0:2|1:1",
        },
      ],
    },
    {
      roundId: 591911,
      matches: [
        {
          competitionId: 2,
          week: 23,
          season: 25692,
          matches:
            "SOC-GET|ATM-ELC|VAL-ESY|SEV-CLV|VIL-OSA|LVT-OVI|BET-ATB|GIR-MAL|ALV-FCB|MAD-RAY",
          results: "0:0|4:0|0:2|2:1|0:0|1:2|2:4|1:1|2:1|1:0",
        },
      ],
    },
    {
      roundId: 591910,
      matches: [
        {
          competitionId: 2,
          week: 22,
          season: 25692,
          matches:
            "GET-BET|RAY-GIR|ELC-VAL|SEV-LVT|ATB-OVI|CLV-ATM|MAL-ALV|ESY-MAD|OSA-SOC|FCB-VIL",
          results: "2:0|1:3|1:1|0:0|1:1|2:0|2:2|1:0|2:1|1:1",
        },
      ],
    },
  ],
});

console.log(data);
</script>
<template>
  <AppTabs>
    <div
      role="tablist"
      aria-label="Team statistics"
      class="w-full justify-between flex rounded-t-md pt-1 group bg-stone-300 shadow-lg"
    >
      <AppTab
        v-for="tab in tabs"
        :key="tab.name"
        v-slot="{ selected, attrs }"
        as="template"
      >
        <div
          :class="[
            ' cursor-pointer  text-[0.8rem] px-3 tracking-wide flex justify-center items-center',
            ' focus:outline-hidden',
            selected
              ? 'text-brand-teal border-b border-red-500'
              : 'text-gray-600',
          ]"
          v-bind="attrs"
        >
          {{ tab.name }}
        </div>
      </AppTab>
    </div>
    <div class="shadow-md bg-gray-200">
      <AppTabPanel><HeadToHead /> </AppTabPanel>
      <AppTabPanel><HeadToHead /> </AppTabPanel>
      <AppTabPanel><HeadToHead /> </AppTabPanel>
    </div>
  </AppTabs>
</template>
