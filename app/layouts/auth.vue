<script setup>
import AuthTopBar from "@/components/AuthTopBar.vue";
</script>
<template>
  <h1 class="sr-only">Account – Login & Register</h1>
  <div class="min-h-dvh flex flex-col bg-gray-50 dark:bg-background">
    <!-- Mobile: top bar -->
    <div class="flex lg:hidden">
      <AuthTopBar />
    </div>

    <!-- Desktop: full header -->
    <div class="hidden lg:block">
      <HeaderLinks />
    </div>

    <!-- Main content area -->
    <main class="flex-1 w-full max-w-4xl mx-auto px-3">
      <div class="flex min-h-[calc(100dvh-8rem)] lg:gap-8 lg:items-center lg:justify-center lg:py-6">

        <!-- Left: Branded hero panel (desktop only) -->
        <div class="hidden lg:flex lg:w-[440px] xl:w-[500px] shrink-0">
          <div class="auth-hero-panel w-full rounded-2xl flex flex-col p-8 overflow-hidden relative">
            <!-- Decorative elements -->
            <div class="absolute -top-24 -right-24 w-72 h-72 rounded-full auth-glow-1"></div>
            <div class="absolute -bottom-20 -left-20 w-56 h-56 rounded-full auth-glow-2"></div>

            <!-- Top: Logo + headline -->
            <div class="relative z-1">
              <RouterLink :to="{ name: 'home' }">
                <!-- Panel is dark in both themes, so the logo is pinned to
                     its dark-background variant rather than the theme's. -->
                <TheLogo class="[--logo-ink:var(--palette-white)]" />
              </RouterLink>
              <h2 class="mt-6 text-[1.75rem] font-extrabold text-white leading-tight tracking-tight">
                Kenya's Premier<br />Betting Destination.
              </h2>
              <p class="text-sm text-white/50 mt-3 leading-relaxed">
                Join thousands of Kenyans who trust Bandabets for sports betting, Aviator, and instant M-Pesa payouts.
              </p>
            </div>

            <!-- Bottom trust strip -->
            <div class="relative z-1 mt-auto pt-6">
              <div class="flex items-center gap-4">
                <div class="flex items-center gap-1.5">
                  <Icon name="tabler:lock" class="w-3.5 h-3.5 text-white/30" aria-hidden="true" />
                  <span class="text-[0.65rem] text-white/30">Secure</span>
                </div>
                <div class="w-px h-3 bg-white/10"></div>
                <div class="flex items-center gap-1.5">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="w-3.5 h-3.5 text-white/30">
                    <path fill-rule="evenodd" d="M8.5 1.709a.75.75 0 0 0-1 0 8.963 8.963 0 0 1-4.84 2.217.75.75 0 0 0-.654.72 10.499 10.499 0 0 0 5.647 9.672.75.75 0 0 0 .694-.001 10.499 10.499 0 0 0 5.647-9.672.75.75 0 0 0-.654-.719A8.963 8.963 0 0 1 8.5 1.71ZM10.78 7.28a.75.75 0 1 0-1.06-1.06L7.5 8.44 6.28 7.22a.75.75 0 0 0-1.06 1.06l1.75 1.75a.75.75 0 0 0 1.06 0l2.75-2.75Z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-[0.65rem] text-white/30">GRA Licensed</span>
                </div>
                <div class="w-px h-3 bg-white/10"></div>
                <div class="flex items-center gap-1.5">
                  <Icon name="tabler:clock" class="w-3.5 h-3.5 text-white/30" aria-hidden="true" />
                  <span class="text-[0.65rem] text-white/30">Instant M-Pesa</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mobile: form area -->
        <div class="lg:hidden w-full py-4">
          <div class="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/2 p-5">
            <slot />
          </div>
        </div>

        <!-- Right: Form area (desktop) -->
        <div class="hidden lg:flex flex-1 items-center justify-center">
          <div class="w-full max-w-sm rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/2 p-8">
            <slot />
          </div>
        </div>
      </div>
    </main>

    <Footer />
  </div>
</template>

<style scoped>
/* Hero panel gradient */
.auth-hero-panel {
  background: linear-gradient(145deg, var(--surface-elevated), var(--background), var(--surface-deepest));
}

/* Decorative glows */
.auth-glow-1 {
  background: radial-gradient(circle, color-mix(in oklch, var(--primary) 15%, transparent), transparent 70%);
}
.auth-glow-2 {
  background: radial-gradient(circle, color-mix(in oklch, var(--surface-interactive) 12%, transparent), transparent 70%);
}
</style>
