<script setup>
import { useRouter, useRoute } from "vue-router";
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
import ThemeSwitch from "./ThemeSwitch.vue";

import { useLoginStore } from "../stores/login";
import { useLinksStore } from "../stores/links";
import HeaderProfile from "./HeaderProfile.vue";
import DepositButton from "./DepositButton.vue";

import { useModalStore } from "@/stores/modal";

import { useModalTypes } from "@/composables/useModalTypes";
import SearchIcon from "./SearchIcon.vue";

import { storeToRefs } from "pinia";
import NavLinksIcons from "./NavLinksIcons.vue";

import { useDefaultSport } from "@/composables/useDefaultSport";

const { initDefaultSport } = useDefaultSport();

const { token } = storeToRefs(useLoginStore());

const { drawer } = useModalTypes();

const { openModal } = useModalStore();

const router = useRouter();

const { links } = storeToRefs(useLinksStore());

const goToSports = () => {
  initDefaultSport(true);
  router.push({ name: "sports", params: { sport: "soccer" } });
};

const casinoCategoryMap = {
  crash: "crash",
  virtuals: "virtuals",
  "popular-games": "top",
};

function goToLink(path) {
  if (path == "sports") {
    goToSports();
    return;
  }
  if (casinoCategoryMap[path]) {
    router.push({ name: "casino-home", query: { category: casinoCategoryMap[path] } });
    return;
  }
  router.push({ name: path });
}

function isSelected(name) {
  const route = useRoute();
  if (name == "sports") {
    if (route.name === "home") {
      return true;
    }
  }
  if (casinoCategoryMap[name] && route.name === "casino-home") {
    return route.query.category === casinoCategoryMap[name];
  }
  return route.name === name;
}
</script>
<template>
  <div
    class="sticky top-0 bg-transparent"
    style="z-index: 60"
  >
    <div
      class="hidden max-w-[1680px] px-3 mx-auto lg:flex h-16 md:h-20 w-full sm:h-full justify-between items-center sm:py-2"
    >
      <div class="sm:flex justify-between items-center sm:space-x-12">
        <TheLogo />
        <AppTabs role="tablist" aria-label="Site navigation" class="flex space-x-2 items-end">
          <AppTab v-for="link in links" :key="link.name" v-slot="{ attrs }" as="template">
            <div
              role="link"
              :class="[
                'capitalize rounded-md text-md p-2 text-gray-600 dark:text-slate-400 cursor-pointer flex items-center transition-colors duration-200',
                'focus:outline-hidden',

                isSelected(link.path)
                  ? 'font-bold text-brand-bright bg-brand-bright/10 dark:bg-brand-bright/15'
                  : 'font-medium hover:text-gray-900 dark:hover:text-white/80 hover:bg-gray-100/80 dark:hover:bg-white/[0.04]',
              ]"
              v-bind="attrs"
              @click="goToLink(link.path)"
            >
              <NavLinksIcons
                v-if="link.icon"
                :icon="link.icon"
                :icon-css="link.iconCss"
              />
              {{ link.name }}
            </div>
          </AppTab>
        </AppTabs>
      </div>
      <div class="flex justify-between space-x-3 md:space-x-5 items-center">
        <div class="flex flex-col">
          <SearchIcon />
          <span class="dark:text-white text-gray-950 leading-none">Search</span>
        </div>
        <div v-if="!token" class="flex space-x-3 items-center">
          <RouterLink
            :to="{ name: 'login' }"
            :class="['dark:text-white text-gray-950']"
            class="flex items-center justify-center bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-transparent text-sm md:text-md rounded-md font-semibold md:font-extrabold py-0.5 md:py-1.5 px-1.5 sm:px-3 h-10 hover:bg-gray-200/80 dark:hover:bg-white/10 transition-colors duration-200"
          >
            Login
          </RouterLink>
          <RouterLink
            :to="{ name: 'signup' }"
            class="flex items-center justify-center bg-bet hover:bg-bet-hover text-bet-foreground text-sm md:text-md rounded-md whitespace-nowrap font-semibold md:font-extrabold md:py-1 px-1.5 sm:px-3 h-10 shadow-sm transition-colors duration-200"
          >
            Join Now
          </RouterLink>
        </div>
        <DepositButton v-if="token" />
        <HeaderProfile v-if="token" />

        <ThemeSwitch />
      </div>
    </div>

    <div class="flex px-3 lg:hidden justify-between items-center py-2">
      <div class="flex justify-between items-center space-x-1">
        <div class="flex justify-between items-center space-x-1">
          <Icon
            name="tabler:menu-2"
            class="text-gray-950 dark:text-white h-6 w-6"
            @click="openModal(drawer)"
          />
          <TheLogo />
        </div>
      </div>
      <div class="flex flex-col items-center justify-center">
        <SearchIcon />
        <!-- <span class="text-white leading-none text-xs mt-0.5">Search</span> -->
      </div>
      <div class="flex space-x-1 items-center">
        <div v-if="!token" class="flex space-x-1 items-center">
          <RouterLink
            :to="{ name: 'login' }"
            :class="['dark:text-white text-gray-950']"
            class="flex items-center justify-center bg-gray-100 dark:bg-white/20 border border-gray-200 dark:border-transparent uppercase text-sm rounded-md font-semibold md:font-extrabold px-3 py-1.5 hover:bg-gray-200/80 dark:hover:bg-white/25 transition-colors duration-200"
          >
            Login
          </RouterLink>
          <RouterLink
            :to="{ name: 'signup' }"
            :class="['text-white']"
            class="flex items-center justify-center bg-brand-bright dark:bg-brand-teal hover:bg-brand-selected uppercase tracking-wider text-sm rounded-md whitespace-nowrap font-semibold md:font-extrabold md:py-1 px-5 py-1.5 shadow-sm transition-colors duration-200"
          >
            Join
          </RouterLink>
        </div>
        <HeaderProfile v-if="token" />
      </div>
    </div>
  </div>
</template>
