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
            <svg v-if="item.icon === 'deposit'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-brand-bright">
              <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
            </svg>
            <svg v-else-if="item.icon === 'withdraw'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
              <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clip-rule="evenodd" />
            </svg>
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
            <svg v-else-if="item.icon === 'gift'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
              <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 0 0 0-3.75A1.875 1.875 0 0 0 12.75 4.875C12.75 5.496 12.397 6 12 6c-.397 0-.75-.504-.75-1.125A1.875 1.875 0 0 0 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6A2.25 2.25 0 0 0 21 19.5v-6.75h-8.25Z" />
            </svg>
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
          <svg v-else-if="item.icon === 'gift'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
            <path d="M9.375 3a1.875 1.875 0 0 0 0 3.75h1.875v4.5H3.375A1.875 1.875 0 0 1 1.5 9.375v-.75c0-1.036.84-1.875 1.875-1.875h3.193A3.375 3.375 0 0 1 12 2.753a3.375 3.375 0 0 1 5.432 3.997h3.193c1.035 0 1.875.84 1.875 1.875v.75c0 1.036-.84 1.875-1.875 1.875H12.75v-4.5h1.875a1.875 1.875 0 0 0 0-3.75A1.875 1.875 0 0 0 12.75 4.875C12.75 5.496 12.397 6 12 6c-.397 0-.75-.504-.75-1.125A1.875 1.875 0 0 0 9.375 3ZM11.25 12.75H3v6.75a2.25 2.25 0 0 0 2.25 2.25h6v-9ZM12.75 12.75v9h6A2.25 2.25 0 0 0 21 19.5v-6.75h-8.25Z" />
          </svg>
          <svg v-else-if="item.icon === 'code'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
            <path fill-rule="evenodd" d="M3 6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v12a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6Zm14.25 6a.75.75 0 0 1-.22.53l-2.25 2.25a.75.75 0 1 1-1.06-1.06L15.44 12l-1.72-1.72a.75.75 0 1 1 1.06-1.06l2.25 2.25c.141.14.22.331.22.53Zm-10.28-.53a.75.75 0 0 0 0 1.06l2.25 2.25a.75.75 0 1 0 1.06-1.06L8.56 12l1.72-1.72a.75.75 0 1 0-1.06-1.06l-2.25 2.25Z" clip-rule="evenodd" />
          </svg>
          <svg v-else-if="item.icon === 'star'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
            <path fill-rule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.006 5.404.434c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.434 2.082-5.005Z" clip-rule="evenodd" />
          </svg>
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
          <svg v-if="item.icon === 'deposit'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-brand-bright">
            <path d="M2.273 5.625A4.483 4.483 0 0 1 5.25 4.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 3H5.25a3 3 0 0 0-2.977 2.625ZM2.273 8.625A4.483 4.483 0 0 1 5.25 7.5h13.5c1.141 0 2.183.425 2.977 1.125A3 3 0 0 0 18.75 6H5.25a3 3 0 0 0-2.977 2.625ZM5.25 9a3 3 0 0 0-3 3v6a3 3 0 0 0 3 3h13.5a3 3 0 0 0 3-3v-6a3 3 0 0 0-3-3H15a.75.75 0 0 0-.75.75 2.25 2.25 0 0 1-4.5 0A.75.75 0 0 0 9 9H5.25Z" />
          </svg>
          <svg v-else-if="item.icon === 'withdraw'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="w-5 h-5 text-muted-foreground">
            <path fill-rule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25Zm.53 5.47a.75.75 0 0 0-1.06 0l-3 3a.75.75 0 1 0 1.06 1.06l1.72-1.72v5.69a.75.75 0 0 0 1.5 0v-5.69l1.72 1.72a.75.75 0 1 0 1.06-1.06l-3-3Z" clip-rule="evenodd" />
          </svg>
          <span class="text-[0.6rem] font-medium text-foreground text-center leading-tight">{{ item.name }}</span>
        </button>
      </div>
    </div>
  </div>
</template>
