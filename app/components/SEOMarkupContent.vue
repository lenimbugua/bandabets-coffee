<script setup>
import { ref } from "vue";

const isExpanded = ref(false);

const sections = [
  {
    title: "Global Soccer Betting",
    text: "Whether you call it soccer or football, the beautiful game draws crowds and punters from around the globe. Place an online bet on almost any professional football league worldwide with Bandabets.",
    extra: "Follow us for great soccer betting tips, the latest football news, and predictions. Our expert information could make you the next millionaire in Kenya through online sports betting!",
  },
  {
    title: "English Premier League",
    text: "There is a lot of English Premier League action on Bandabets, guaranteeing many betting markets. Many Kenyan punters are EPL fans, as shown by Kenya's love for Arsenal and Manchester United.",
    extra: "Customers can select from Arsenal, Manchester City, Chelsea, and Liverpool. With English Premier League action year-round, customers have many opportunities to win.",
  },
  {
    title: "Local Team Support",
    text: "Bandabets proudly supports Kenyan football. We feature local teams in our sports markets, allowing you to bet on the Kenyan Premier League — from AFC Leopards to Gor Mahia, fans have impressive odds for their favourite teams.",
  },
];

const steps = [
  "You must be at least 18 years old to register.",
  "Visit bandabets.com on your PC or phone.",
  "Click the Join icon at the top right of the website.",
  "Enter your phone number and a secure password.",
  "Verify your account with the OTP code sent to your phone.",
  "Accept Bandabets's terms and conditions to activate your account.",
];
</script>

<template>
  <article class="mx-3">
    <div class="rounded-xl bg-white dark:bg-white/[0.02] border border-gray-200/80 dark:border-white/[0.06] overflow-hidden">

      <!-- Toggle header -->
      <button
        class="w-full flex items-center justify-between px-4 py-3.5 transition-colors hover:bg-gray-50 dark:hover:bg-white/[0.02]"
        @click="isExpanded = !isExpanded"
      >
        <div class="flex items-center gap-2.5">
          <div class="w-6 h-6 rounded-lg bg-brand-bright/10 flex items-center justify-center shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 text-brand-bright">
              <path d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm4.78 1.97a.75.75 0 0 1 0 1.06L5.81 8l.97.97a.75.75 0 1 1-1.06 1.06l-1.5-1.5a.75.75 0 0 1 0-1.06l1.5-1.5a.75.75 0 0 1 1.06 0Zm2.44 1.06a.75.75 0 0 1 1.06-1.06l1.5 1.5a.75.75 0 0 1 0 1.06l-1.5 1.5a.75.75 0 1 1-1.06-1.06l.97-.97-.97-.97Z" />
            </svg>
          </div>
          <span class="text-[0.75rem] font-bold text-gray-800 dark:text-white/70">
            About Soccer Betting
          </span>
        </div>
        <Icon
          name="tabler:chevron-down"
          class="w-4 h-4 text-gray-500 dark:text-white/25 transition-transform duration-300"
          :class="isExpanded ? 'rotate-180' : ''"
          aria-hidden="true"
        />
      </button>

      <!-- Expandable content -->
      <div
        class="grid transition-all duration-300 ease-in-out"
        :class="isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'"
      >
        <div class="overflow-hidden">
          <div class="border-t border-gray-200 dark:border-white/[0.04]">

            <!-- Hero intro -->
            <div class="px-4 pt-5 pb-4">
              <h2 class="text-base sm:text-lg font-bold text-gray-800 dark:text-white/80 mb-2">
                Sports Betting at Bandabets
              </h2>
              <p class="text-[0.75rem] leading-relaxed text-gray-500 dark:text-white/40">
                Join our community of soccer betting fans with Bandabets. Register and deposit money in your wallet to bet on your favourite football teams across the world.
              </p>
            </div>

            <!-- Content sections -->
            <div class="px-4 pb-4 space-y-4">
              <div
                v-for="section in sections"
                :key="section.title"
                class="pl-3.5 border-l-2 border-brand-bright/20"
              >
                <h3 class="text-[0.72rem] font-bold text-gray-700 dark:text-white/60 mb-1.5">
                  {{ section.title }}
                </h3>
                <p class="text-[0.7rem] leading-relaxed text-gray-500 dark:text-white/35">
                  {{ section.text }}
                </p>
                <p v-if="section.extra" class="text-[0.7rem] leading-relaxed text-gray-500 dark:text-white/35 mt-1.5">
                  {{ section.extra }}
                </p>
              </div>
            </div>

            <!-- CTA banner -->
            <div class="mx-4 mb-4 p-4 rounded-xl bg-gradient-to-r from-brand-bright/8 to-brand-bright/3 dark:from-brand-bright/10 dark:to-brand-bright/[0.02] border border-brand-bright/10">
              <h3 class="text-[0.75rem] font-bold text-gray-800 dark:text-white/70 mb-1.5">
                Open a Bandabets Account
              </h3>
              <p class="text-[0.7rem] leading-relaxed text-gray-500 dark:text-white/40">
                Register for a betting account with Bandabets to enjoy higher odds and massive wins. Our secure portal ensures safe transactions, including instant deposits and withdrawals.
              </p>
            </div>

            <!-- Steps -->
            <div class="px-4 pb-5">
              <h3 class="text-[0.72rem] font-bold text-gray-700 dark:text-white/60 mb-3">
                How to Register
              </h3>
              <div class="space-y-2">
                <div
                  v-for="(step, idx) in steps"
                  :key="idx"
                  class="flex items-start gap-2.5"
                >
                  <span class="shrink-0 w-5 h-5 rounded-full bg-gray-200 dark:bg-white/[0.05] flex items-center justify-center text-[0.6rem] font-bold text-gray-600 dark:text-white/35 mt-px">
                    {{ idx + 1 }}
                  </span>
                  <p class="text-[0.7rem] leading-relaxed text-gray-500 dark:text-white/35 pt-0.5">
                    {{ step }}
                  </p>
                </div>
              </div>
              <p class="mt-3 text-[0.7rem] leading-relaxed text-gray-500 dark:text-white/35">
                Once registered, you can deposit funds and start placing bets on your favourite teams.
              </p>
            </div>

          </div>
        </div>
      </div>

    </div>
  </article>
</template>
