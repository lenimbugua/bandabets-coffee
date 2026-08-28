<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useThemeSwitch } from "@/composables/useThemeSwitch";

import { useModalStore } from "@/stores/modal";
import { useSports } from "@/composables/useSports";
import { useCasino } from "@/composables/useCasino";
import { useSportsIcons } from "@/composables/useSportsIcons";
import SecondaryNavIcons from "./SecondaryNavIcons.vue";

const svgIconNames = new Set([
  "soccer", "esports", "basketball", "tennis", "cricket", "rugby",
  "iceHockey", "tableTennis", "handball", "americanFootball", "boxing",
  "volleyball", "waterpolo", "eSoccer", "futsal", "aussieRules", "golf",
  "hockey", "horseRacing", "snooker", "motorSport", "badminton",
  "baseball", "cycling", "darts",
]);

function toCamelCase(str = "") {
  if (!str) return "";
  return str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .toLowerCase()
    .split(" ")
    .map((word, i) => (i === 0 ? word : word[0].toUpperCase() + word.slice(1)))
    .join("");
}

function hasSvgIcon(sportIcon) {
  return svgIconNames.has(toCamelCase(sportIcon));
}

const router = useRouter();
const { isDark } = useThemeSwitch();
const { closeModal } = useModalStore();
const { games, fetchMatches } = useSports();
const { categories } = useCasino();
const { getSportsIcon } = useSportsIcons();

const activeTab = ref("all");

const tabs = [
  { id: "all", label: "All" },
  { id: "sports", label: "Sports" },
  { id: "games", label: "Games" },
  { id: "others", label: "Others" },
  { id: "payment", label: "Payment" },
];

const otherItems = [
  { name: "Code Center", icon: "clipboard", route: { name: "share-bets" } },
  { name: "Promotions", icon: "gift", route: { name: "promotions" } },
  { name: "Load Code", icon: "code", route: { name: "share-bets" } },
];

const paymentItems = [
  { name: "Deposit", icon: "deposit", route: { name: "deposit" } },
  { name: "Withdraw", icon: "withdraw", route: { name: "withdraw" } },
];

function getCategoryEmoji(binomen) {
  const map = { crash: '💥', virtuals: '🎮', slots: '🎰', live: '🔴', table: '🃏', lite: '⚡' };
  return map[binomen] || '🎲';
}

function handleSportClick(sport) {
  closeModal();
  fetchMatches(sport.id, sport.name, sport.icon, true);
}

function handleCategoryClick(cat) {
  closeModal();
  router.push({ name: "casino-home", query: { category: cat.cat_binomen || cat.binomen || "all" } });
}

function handleItemClick(item) {
  closeModal();
  router.push(item.route);
}
</script>

<template>
  <!-- Tabs -->
  <div class="flex gap-1 px-3 py-2 border-b border-gray-100 dark:border-white/5 overflow-x-auto scrollbar-hide">
    <button
      v-for="tab in tabs"
      :key="tab.id"
      :class="activeTab === tab.id
        ? 'bg-pill-selected text-pill-selected-foreground'
        : 'bg-gray-100 dark:bg-white/6 text-muted-foreground'"
      class="shrink-0 px-3 py-1 rounded-full text-[0.65rem] font-semibold transition-colors"
      @click="activeTab = tab.id"
    >
      {{ tab.label }}
    </button>
  </div>

  <!-- Content -->
  <div class="flex-1 overflow-y-auto overscroll-contain">
    <!-- All -->
    <div v-if="activeTab === 'all'" class="p-3 space-y-4">
      <!-- Theme section -->
      <div>
        <h3 class="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-2">Theme</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.7rem] font-semibold transition-colors"
            :class="!isDark
              ? 'bg-pill-selected text-pill-selected-foreground'
              : 'bg-gray-50 dark:bg-white/4 text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/8'"
            @click="isDark = false"
          >
            <Icon name="tabler:sun" class="w-4 h-4" />
            Light
          </button>
          <button
            class="flex items-center justify-center gap-1.5 py-2 rounded-lg text-[0.7rem] font-semibold transition-colors"
            :class="isDark
              ? 'bg-pill-selected text-pill-selected-foreground'
              : 'bg-gray-50 dark:bg-white/4 text-muted-foreground hover:bg-gray-100 dark:hover:bg-white/8'"
            @click="isDark = true"
          >
            <Icon name="tabler:moon" class="w-4 h-4" />
            Dark
          </button>
        </div>
      </div>

      <!-- Payment section -->
      <div>
        <h3 class="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-2">Payment</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="item in paymentItems"
            :key="item.name"
            class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
            @click="handleItemClick(item)"
          >
            <Icon v-if="item.icon === 'deposit'" name="tabler:wallet" class="w-5 h-5 text-brand-bright" aria-hidden="true" />
            <Icon v-else-if="item.icon === 'withdraw'" name="tabler:circle-arrow-up-filled" class="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight">{{ item.name }}</span>
          </button>
        </div>
      </div>

      <!-- Sports section -->
      <div>
        <h3 class="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-2">Sports</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="sport in games"
            :key="sport.id"
            class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
            @click="handleSportClick(sport)"
          >
            <SecondaryNavIcons v-if="hasSvgIcon(sport.icon)" :icon="toCamelCase(sport.icon)" icon-css="w-5 h-5 text-foreground/70" />
            <span v-else class="text-lg leading-none">{{ getSportsIcon(sport.icon) || '⚽' }}</span>
            <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight capitalize">{{ sport.name }}</span>
          </button>
        </div>
      </div>

      <!-- Games section -->
      <div>
        <h3 class="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-2">Games</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="cat in categories"
            :key="cat.category_id"
            class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
            @click="handleCategoryClick(cat)"
          >
            <span class="text-lg leading-none">{{ getCategoryEmoji(cat.cat_binomen) }}</span>
            <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight">{{ cat.category_name || cat.name }}</span>
          </button>
        </div>
      </div>

      <!-- Others section -->
      <div>
        <h3 class="text-[0.65rem] font-bold text-muted-foreground uppercase tracking-wider mb-2">Others</h3>
        <div class="grid grid-cols-3 gap-2">
          <button
            v-for="item in otherItems"
            :key="item.name"
            class="relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
            @click="handleItemClick(item)"
          >

            <svg v-if="item.icon === 'clipboard'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
              <path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Zm9.586 4.594a.75.75 0 0 0-1.172-.938l-2.5 3.125a.75.75 0 0 0 .586 1.219h2.336l-2.086 2.607a.75.75 0 1 0 1.172.938l2.5-3.125a.75.75 0 0 0-.586-1.22H10.5l2.086-2.606Z" clip-rule="evenodd" />
            </svg>
            <Icon v-else-if="item.icon === 'gift'" name="tabler:gift" class="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            <svg v-else-if="item.icon === 'code'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
              <path fill-rule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 1 1-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 1 1 1.06-1.06l2.25 2.25c.141.14.22.331.22.53Zm-10.28-.53a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L8.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-2.25 2.25Z" clip-rule="evenodd" />
            </svg>
            <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight">{{ item.name }}</span>
          </button>
        </div>
      </div>

    </div>

    <!-- Sports -->
    <div v-else-if="activeTab === 'sports'" class="p-3">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="sport in games"
          :key="sport.id"
          class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
          @click="handleSportClick(sport)"
        >
          <SecondaryNavIcons v-if="hasSvgIcon(sport.icon)" :icon="toCamelCase(sport.icon)" icon-css="w-5 h-5 text-foreground/70" />
          <span v-else class="text-lg leading-none">{{ getSportsIcon(sport.icon) || '⚽' }}</span>
          <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight capitalize">{{ sport.name }}</span>
        </button>
      </div>
    </div>

    <!-- Games -->
    <div v-else-if="activeTab === 'games'" class="p-3">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="cat in categories"
          :key="cat.category_id"
          class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
          @click="handleCategoryClick(cat)"
        >
          <span class="text-lg leading-none">{{ getCategoryEmoji(cat.cat_binomen) }}</span>
          <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight">{{ cat.category_name || cat.name }}</span>
        </button>
      </div>
    </div>

    <!-- Others -->
    <div v-else-if="activeTab === 'others'" class="p-3">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="item in otherItems"
          :key="item.name"
          class="relative flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
          @click="handleItemClick(item)"
        >
          <span v-if="item.isNew" class="absolute top-1 right-1 text-[0.45rem] font-bold bg-red-500 text-white px-1 rounded">NEW</span>
          <svg v-if="item.icon === 'clipboard'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
            <path fill-rule="evenodd" d="M7.502 6h7.128A3.375 3.375 0 0 1 18 9.375v9.375a3 3 0 0 0 3-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 0 0-.673-.05A3 3 0 0 0 15 1.5h-1.5a3 3 0 0 0-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6ZM13.5 3A1.5 1.5 0 0 0 12 4.5h4.5A1.5 1.5 0 0 0 15 3h-1.5Z" clip-rule="evenodd" />
            <path fill-rule="evenodd" d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 0 1 3 20.625V9.375Zm9.586 4.594a.75.75 0 0 0-1.172-.938l-2.5 3.125a.75.75 0 0 0 .586 1.219h2.336l-2.086 2.607a.75.75 0 1 0 1.172.938l2.5-3.125a.75.75 0 0 0-.586-1.22H10.5l2.086-2.606Z" clip-rule="evenodd" />
          </svg>
          <Icon v-else-if="item.icon === 'gift'" name="tabler:gift" class="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          <svg v-else-if="item.icon === 'code'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
            <path fill-rule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 1 1-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 1 1 1.06-1.06l2.25 2.25c.141.14.22.331.22.53Zm-10.28-.53a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L8.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-2.25 2.25Z" clip-rule="evenodd" />
          </svg>
          <Icon v-else-if="item.icon === 'star'" name="tabler:star" class="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight">{{ item.name }}</span>
        </button>
      </div>
    </div>

    <!-- Payment -->
    <div v-else-if="activeTab === 'payment'" class="p-3">
      <div class="grid grid-cols-3 gap-2">
        <button
          v-for="item in paymentItems"
          :key="item.name"
          class="flex flex-col items-center gap-1 py-2.5 px-1 rounded-lg bg-gray-50 dark:bg-white/4 hover:bg-gray-100 dark:hover:bg-white/8 transition-colors cursor-pointer"
          @click="handleItemClick(item)"
        >
          <Icon v-if="item.icon === 'deposit'" name="tabler:wallet" class="w-5 h-5 text-brand-bright" aria-hidden="true" />
          <Icon v-else-if="item.icon === 'withdraw'" name="tabler:circle-arrow-up-filled" class="w-5 h-5 text-muted-foreground" aria-hidden="true" />
          <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight">{{ item.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
