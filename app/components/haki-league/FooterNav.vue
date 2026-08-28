<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTab from "@/components/ui/AppTab.vue";
</script>
<template>
  <div>
    <AppTabs
      role="tablist"
      aria-label="League navigation"
      class="z-50 rounded-b-0 bg-linear-to-b border border-gray-400 dark:border-black/30 from-red-800 via-card to-card rounded-t-lg shadow-lg text-slate-400 text-md font-medium w-full"
    >
      <!-- <OddStrip /> -->
      <div class="flex">
        <AppTab v-slot="{ selected, attrs }" as="template">
          <button
            class="flex flex-col rounded-none items-center justify-center w-full py-1.5 text-sm focus:outline-hidden"
            :class="[
              selected
                ? 'text-white bg-primary-50/10 font-extrabold'
                : 'hover:bg-primary-500/30 font-medium text-red-100',
            ]"
            v-bind="attrs"
          >
            <svg
              width="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
              data-v-f294f746=""
            >
              <path fill="none" d="M0 0h24v24H0Z" data-v-f294f746=""></path>
              <path
                fill="#fff"
                d="M23 4H1c-.56 0-1 .44-1 1v14c0 .55.448 1 1 1h22c.55 0 1-.45 1-1V5c0-.56-.45-1-1-1ZM12 14c-1.11 0-2-.9-2-2 0-1.11.89-2 2-2 1.1 0 2 .89 2 2 0 1.1-.9 2-2 2ZM2 10h2v4H2v-4Zm0 6h4V8H2V6h9v2.14c-1.72.44-3 2-3 3.85s1.28 3.41 3 3.85v2.14H2v-2Zm20-2h-2v-4h2v4Zm-4-6v8h4v2h-9v-2.15c1.72-.45 3-2 3-3.86 0-1.86-1.28-3.41-3-3.86V5.98h9v2h-4Z"
                data-v-f294f746=""
              ></path>
            </svg>
            <span>Matches</span>
          </button>
        </AppTab>
        <AppTab v-slot="{ selected, attrs }" as="template">
          <button
            class="flex flex-col items-center justify-center w-full py-1.5 text-sm focus:outline-hidden"
            :class="[
              selected
                ? 'text-white bg-primary-50/10 font-extrabold'
                : 'hover:bg-primary-500/30 font-medium text-red-100',
            ]"
            v-bind="attrs"
          >
            <span class="mb-0.5"
              ><svg
                data-v-f294f746=""
                width="24"
                viewBox="0 0 28 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  data-v-f294f746=""
                  d="M2 0C0.895 0 0 0.895 0 2V16C0 17.105 0.895 18 2 18H26C27.105 18 28 17.105 28 16V2C28 0.895 27.105 0 26 0H2ZM21.5 4.85938C23.52 4.85938 24.8008 6.37333 24.8008 8.98633C24.8008 11.5783 23.536 13.1406 21.5 13.1406C19.458 13.1406 18.1992 11.5835 18.1992 8.98047C18.1992 6.37747 19.474 4.85938 21.5 4.85938ZM7.04688 4.86719C8.80687 4.86719 9.98438 5.81117 9.98438 7.20117C9.98438 8.07317 9.47217 8.84684 8.07617 10.0898L6.7793 11.2832V11.3887H10.0938V12.9453H4.11328V11.6113L6.59961 9.27148C7.75461 8.20348 8.05078 7.80675 8.05078 7.34375C8.05078 6.76575 7.62556 6.37891 6.97656 6.37891C6.30056 6.37891 5.83008 6.83637 5.83008 7.48438V7.52148H4V7.49023C4 5.92623 5.22088 4.86719 7.04688 4.86719ZM14 6C14.552 6 15 6.448 15 7C15 7.552 14.552 8 14 8C13.448 8 13 7.552 13 7C13 6.448 13.448 6 14 6ZM21.5 6.39453C20.738 6.39453 20.2305 7.25447 20.2305 8.98047C20.2305 10.7175 20.737 11.6055 21.5 11.6055C22.263 11.6055 22.7734 10.7165 22.7734 8.98047C22.7734 7.25447 22.262 6.39453 21.5 6.39453ZM14 10C14.552 10 15 10.448 15 11C15 11.552 14.552 12 14 12C13.448 12 13 11.552 13 11C13 10.448 13.448 10 14 10Z"
                  fill="#fff"
                ></path></svg
            ></span>
            <span>Results</span>
          </button>
        </AppTab>
        <div class="mx-3 flex flex-col justify-center cursor">
          <button class="py-1.5 text-sm text-center focus:outline-hidden">
            <div class="flex relative flex-col justify-center items-center">
              <div
                class="rounded-full absolute shadow-md -mt-10 h-14 w-14 bg-accent-600 opacity-60"
              ></div>
              <div
                class="rounded-full flex absolute -mt-10 shadow-md items-center justify-center w-10 h-10 bg-amber-500 pulse text-primary-800"
              >
                <span class="font-bold text-lg text-white">4</span>
              </div>
            </div>
          </button>
          <span class="mt-1 text-red-100"> Betslip </span>
        </div>
        <AppTab v-slot="{ selected, attrs }" as="template">
          <button
            class="flex flex-col items-center justify-center w-full py-1.5 text-sm focus:outline-hidden"
            :class="[
              selected
                ? 'text-white bg-primary-50/10 font-extrabold'
                : 'hover:bg-primary-500/30 font-medium text-red-100',
            ]"
            v-bind="attrs"
          >
            <span data-v-f294f746=""
              ><svg
                data-v-f294f746=""
                width="24"
                viewBox="0 0 28 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  data-v-f294f746=""
                  d="M8 0V5H0V20H28V6H21V0H8ZM10 2H19V8H26V18H2V7H10V2ZM13.8438 3L13.625 3.71875C13.625 3.71875 13.5195 4.07812 13.2812 4.4375C13.043 4.79688 12.8008 5 12.5312 5V7C13.1133 7 13.6055 6.80469 14 6.53125V10H16V3H13.8438ZM6.5 9C5.13281 9 4 10.1328 4 11.5V12H6V11.5C6 11.2148 6.21484 11 6.5 11C6.78516 11 7 11.2148 7 11.5V11.7812C7 11.9336 6.92969 12.0625 6.8125 12.1562L4.375 14.125L4 14.4062V16H9V14H7.71875L8.0625 13.7188C8.65625 13.2461 9 12.5391 9 11.7812V11.5C9 10.1328 7.86719 9 6.5 9ZM19 10V12H19.5312L19.375 12.125L19 12.4062V14H21.5C21.7852 14 22 14.2148 22 14.5C22 14.7852 21.7852 15 21.5 15H19V17H21.5C22.8672 17 24 15.8672 24 14.5C24 13.4375 23.2266 12.7031 22.2812 12.3438L22.8438 11.875L23.2188 11.5938V10H19Z"
                  fill="#fff"
                ></path></svg
            ></span>
            <span>Standings</span>
          </button>
        </AppTab>
        <AppTab v-slot="{ selected, attrs }" as="template">
          <RouterLink
            :to="{ name: 'home' }"
            class="flex flex-col rounded-none items-center justify-center w-full py-1.5 text-sm focus:outline-hidden"
            :class="[
              selected
                ? 'text-white bg-primary-50/10 font-extrabold'
                : 'hover:bg-primary-500/30 font-medium text-red-100',
            ]"
            v-bind="attrs"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="text-white h-5 w-7 fill-current"
              viewBox="0 0 24 24"
            >
              <!-- Icon from Material Symbols by Google - https://github.com/google/material-design-icons/blob/master/LICENSE -->
              <path
                fill="currentColor"
                d="M8 12v-2h8v2zm0-4V6h8v2zm-2 6h8.975L18 17.95V4H6zm0 6h11.05L14 16H6zm14 2H4V2h16zM6 20V4zm0-4v-2z"
              />
            </svg>
            <span>My Bets</span>
          </RouterLink>
        </AppTab>
      </div>
    </AppTabs>
  </div>
</template>
