<script setup>
const currentYear = new Date().getFullYear();

const socials = [
  {
    name: "X",
    href: "https://x.com/bandabets",
    viewBox: "0 0 24 24",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/bandabets",
    viewBox: "0 0 24 24",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/bandabets",
    viewBox: "0 0 24 24",
    path: "M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z",
  },
  // TikTok removed — no account to link to. Re-add with its href when there is.
];

const quickLinks = [
  { label: "Sports", to: { name: "home" } },
  { label: "Live Betting", to: { name: "live", params: { sport: "football" } } },
  { label: "Casino", to: { name: "casino-home" } },
  { label: "Promotions", to: { name: "promotions" } },
];

// Support column is disabled — see the commented-out block in the template.
// const supportLinks = [];
// const { openSupportModal } = useSupport();

const legalLinks = [
  { label: "Responsible Gambling", to: { name: "responsible-gambling" } },
  { label: "Privacy Policy", to: { name: "privacy-policy" } },
  { label: "Terms of Service", to: { name: "terms-and-conditions" } },
];
</script>

<template>
  <footer class="w-full pb-24 sm:pb-0 mt-8 md:mt-12 bg-surface-deepest border-t border-border/50">
    <div class="max-w-420 mx-auto px-4 sm:px-8 pt-10 pb-6">

      <!-- Columns -->
      <div class="grid grid-cols-2 sm:grid-cols-3 gap-8 mb-8">

        <!-- Brand column -->
        <div class="col-span-2 sm:col-span-1">
          <div class="mb-4">
            <span class="text-base font-bold text-foreground tracking-tight">Bandabets</span>
            <span class="block text-[10px] uppercase tracking-widest text-muted-foreground font-semibold leading-none mt-0.5">Kenya</span>
          </div>
          <p class="text-xs leading-relaxed text-muted-foreground max-w-xs">
            Kenya's premier sports betting and casino platform. Bet smart, win big.
          </p>

          <!-- Social icons -->
          <div class="flex items-center gap-1.5 mt-4">
            <a
              v-for="social in socials"
              :key="social.name"
              :href="social.href"
              target="_blank"
              :aria-label="social.name"
              class="group flex items-center justify-center w-8 h-8 rounded-full bg-foreground/5 text-muted-foreground hover:bg-brand-bright/15 hover:text-brand-bright transition-all duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" :viewBox="social.viewBox" fill="currentColor" class="w-3.5 h-3.5">
                <path :d="social.path" />
              </svg>
            </a>
          </div>
        </div>

        <!-- Quick Links -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Quick Links
          </h4>
          <nav class="space-y-2">
            <RouterLink
              v-for="link in quickLinks"
              :key="link.label"
              :to="link.to"
              class="block text-sm text-muted-foreground hover:text-brand-bright transition-colors duration-150"
            >
              {{ link.label }}
            </RouterLink>
          </nav>
        </div>

        <!-- Support — disabled for now. Restore this column (and the
             useSupport wiring in the script block) to bring it back.
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Support
          </h4>
          <nav class="space-y-2">
            <RouterLink
              v-for="link in supportLinks"
              :key="link.label"
              :to="link.to"
              class="block text-sm text-muted-foreground hover:text-brand-bright transition-colors duration-150"
            >
              {{ link.label }}
            </RouterLink>
            <button
              class="block text-sm text-muted-foreground hover:text-brand-bright transition-colors duration-150 text-left"
              @click="openSupportModal"
            >
              Chat with Support
            </button>
          </nav>
        </div>
        -->

        <!-- Legal -->
        <div>
          <h4 class="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Legal
          </h4>
          <nav class="space-y-2">
            <RouterLink
              v-for="link in legalLinks"
              :key="link.label"
              :to="link.to"
              target="_blank"
              class="block text-sm text-muted-foreground hover:text-brand-bright transition-colors duration-150"
            >
              {{ link.label }}
            </RouterLink>
          </nav>

          <!-- License -->
          <!-- <div class="mt-4 flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-brand-bright/10 flex items-center justify-center shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 text-brand-bright">
                <path fill-rule="evenodd" d="M8 1a3.5 3.5 0 0 0-3.5 3.5V7A1.5 1.5 0 0 0 3 8.5v5A1.5 1.5 0 0 0 4.5 15h7a1.5 1.5 0 0 0 1.5-1.5v-5A1.5 1.5 0 0 0 11.5 7V4.5A3.5 3.5 0 0 0 8 1Zm2 6V4.5a2 2 0 1 0-4 0V7h4Z" clip-rule="evenodd" />
              </svg>
            </div>
            <div>
              <p class="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground leading-none">GRA Licensed</p>
              <p class="text-xs font-bold text-muted-foreground tabular-nums mt-0.5">BK 0001255 · PG 0001254</p>
            </div>
          </div> -->
        </div>
      </div>

      <!-- Divider -->
      <div class="h-px bg-border/50 mb-5"></div>

      <!-- Responsible Gaming banner -->
      <div class="flex flex-col items-center text-center gap-3 mb-5">
        <div class="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
          <span class="text-[10px] font-black text-red-400">18+</span>
        </div>
        <p class="text-xs text-muted-foreground max-w-md">
          Gambling can be addictive. Play responsibly and only bet what you can afford to lose.
        </p>
        <a
          href="https://responsiblegambling.or.ke/"
          target="_blank"
          class="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-brand-bright transition-colors"
        >
          responsiblegambling.or.ke
          <Icon name="tabler:external-link" class="w-2.5 h-2.5" aria-hidden="true" />
        </a>
      </div>

      <!-- License text -->
      <div class="max-w-lg mx-auto mb-5 text-center">
        <p class="text-[10px] leading-relaxed text-muted-foreground">
          Bandabets Kenya is authorized and regulated by the GRA (Gambling Regulatory Authority) under the Gambling Control Act, 2025, Laws of Kenya.
        </p>
        <!-- Hidden until the Bandabets licence numbers are confirmed — the
             pair below are Bandabets's and must not ship under the new brand.
        <p class="mt-1.5 text-[10px] font-semibold tabular-nums text-muted-foreground">
          License Numbers: BK 0001255 and PG 0001254
        </p>
        -->
      </div>

      <!-- Bottom bar -->
      <div class="h-px bg-border/50 mb-4"></div>
      <div class="flex items-center justify-center">
        <p class="text-[11px] text-muted-foreground">
          &copy; {{ currentYear }} Bandabets Kenya. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>
