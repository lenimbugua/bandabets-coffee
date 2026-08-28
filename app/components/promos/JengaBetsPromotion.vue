<template>
  <div
    class="min-h-dvh bg-white dark:bg-background text-gray-900 dark:text-white px-6 md:px-12 py-16 transition-colors duration-500 relative overflow-hidden"
  >
    <!-- Background Glow -->
    <div class="absolute inset-0 pointer-events-none">
      <div
        class="absolute top-24 left-10 w-40 h-40 bg-brand-bright/10 dark:bg-brand-bright/20 blur-3xl rounded-full"
      ></div>
      <div
        class="absolute bottom-16 right-10 w-48 h-48 bg-gold-bright/8 dark:bg-gold-bright/15 blur-3xl rounded-full"
      ></div>
    </div>

    <!-- Header -->
    <header class="relative z-10 text-center mb-12">
      <div
        class="inline-flex items-center gap-3 px-4 py-2 bg-brand-bright/10 dark:bg-brand-bright/20 rounded-full text-sm font-semibold text-brand-bright mb-4"
      >
        ⚽ Football Special
      </div>
      <h1 class="text-4xl sm:text-5xl font-extrabold tracking-tight">
        Bandabets <span class="text-brand-bright">Jenga Bet</span>
      </h1>
      <p
        class="mt-4 text-gray-700 dark:text-gray-300 max-w-3xl mx-auto text-lg leading-relaxed"
      >
        Bandabets Jenga Bet lets you create your own customized football bet just
        the way you like it! Combine your favorite football markets into a
        single bet — with your odds automatically calculated as you go.
      </p>
    </header>

    <!-- Description Section -->
    <section class="relative z-10 max-w-4xl mx-auto text-center mb-16">
      <p
        class="text-gray-700 dark:text-gray-300 text-base sm:text-lg leading-relaxed"
      >
        You can include as many selections as you wish within the same fixture,
        and each selection you add updates your combined odds instantly.
        <br class="hidden sm:block" />
        For example, combine
        <span class="text-gold-bright font-semibold">1X2</span>,
        <span class="text-gold-bright font-semibold">Over 2.5</span>,
        <span class="text-gold-bright font-semibold">GG/NG</span>, and
        <span class="text-gold-bright font-semibold">Number of Corners</span> —
        all in one go!
      </p>
    </section>

    <!-- How to Build -->
    <section class="relative z-10 max-w-5xl mx-auto">
      <h2
        class="text-2xl font-bold text-center mb-10 flex items-center justify-center gap-2"
      >
        🛠️ <span>How to Build Your Bandabets Jenga Bet</span>
      </h2>

      <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          class="bg-white dark:bg-surface-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-md hover:shadow-lg dark:shadow-none transition"
        >
          <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">
            1. Navigate
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Go to your preferred fixture or event from the Bandabets Sportsbook.
          </p>
        </div>
        <div
          class="bg-white dark:bg-surface-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-md hover:shadow-lg dark:shadow-none transition"
        >
          <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">
            2. Select “Jenga Bet”
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Tap the
            <span class="text-brand-bright font-semibold">Jenga Bet</span> tab in
            the header of the fixture page.
          </p>
        </div>
        <div
          class="bg-white dark:bg-surface-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-md hover:shadow-lg dark:shadow-none transition"
        >
          <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">
            3. Browse Markets
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Choose from popular football markets like 1X2, GG/NG, or Over/Under
            goals.
          </p>
        </div>
        <div
          class="bg-white dark:bg-surface-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-md hover:shadow-lg dark:shadow-none transition"
        >
          <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">
            4. Watch Odds Update
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Your combined odds update instantly with every new selection.
          </p>
        </div>
        <div
          class="bg-white dark:bg-surface-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-md hover:shadow-lg dark:shadow-none transition"
        >
          <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">
            5. Add to Bet Slip
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Once done, add your Jenga Bet to the bet slip and enter your stake.
          </p>
        </div>
        <div
          class="bg-white dark:bg-surface-elevated rounded-2xl border border-gray-200 dark:border-border-subtle p-6 shadow-md hover:shadow-lg dark:shadow-none transition"
        >
          <h3 class="font-bold text-lg mb-2 text-gray-900 dark:text-white">
            6. Place Your Bet
          </h3>
          <p class="text-sm text-gray-700 dark:text-gray-300">
            Tap “Place Bet” to confirm and enjoy your customized Jenga Bet!
          </p>
        </div>
      </div>

      <!-- Disclaimer -->
      <div class="mt-10 text-center text-sm text-gray-700 dark:text-gray-300">
        ✅ All selections must win for your Jenga Bet to be settled as a win.
        <br />
        If any participant doesn’t start or a market is void, the entire Jenga
        Bet will be voided.
      </div>
    </section>

    <!-- Divider -->
    <div
      class="my-16 w-32 h-1 bg-linear-to-r from-brand-bright via-gold-bright to-brand-bright mx-auto rounded-full"
    ></div>

    <!-- Terms and Conditions -->
    <section class="relative z-10 max-w-2xl mx-auto">
      <h2 class="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
        ⚖️ <span>Terms and Conditions</span>
      </h2>
      <ul
        class="space-y-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed list-disc list-inside"
      >
        <li>
          <span class="font-semibold">1Cut</span> feature is not available with
          Bandabets Jenga Bet.
        </li>
        <li>Live Betting and Cashout are not supported.</li>
        <li>
          <span class="font-semibold">2UP promotion</span> is not supported.
        </li>
        <li>
          Jenga Bet may not be available for all football matches or markets.
        </li>
        <li>
          Bandabets is not responsible for unavailability due to technical
          issues.
        </li>
        <li>
          Bandabets reserves the right to reverse any Jenga Bet settlement
          processed incorrectly.
        </li>
        <li>
          Bandabets reserves the right to accept or decline any Jenga Bet across
          any market or event.
        </li>
        <li>
          Bandabets may amend, suspend, or remove the Jenga Bet feature at any
          time.
        </li>
        <li>Access may be restricted for misuse or abuse of the feature.</li>
      </ul>
    </section>

    <!-- CTA -->
    <div class="mt-16 text-center relative z-10">
      <RouterLink
        :to="{ name: 'home' }"
        class="inline-flex items-center px-8 py-3 rounded-full bg-brand-bright hover:bg-brand-bright text-primary-foreground font-semibold shadow-lg shadow-brand-bright/40 transition-transform transform hover:-translate-y-1"
      >
        Try Jenga Bet Now
        <Icon name="tabler:arrow-right" class="w-5 h-5 ml-2" aria-hidden="true" />
      </RouterLink>
    </div>
  </div>
</template>
