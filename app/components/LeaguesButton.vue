<template>
  <RouterLink
    :to="{ name: 'countries' }"
    class="group py-1 flex items-center rounded-md focus:outline-hidden focus-visible:ring-2 focus-visible:ring-primary"
  >
    <div class="flex h-8 sm:h-9 items-center cursor-pointer">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-4 w-4 sm:h-4.5 sm:w-4.5 shrink-0 text-foreground"
        viewBox="0 0 24 24"
      >
        <path
          fill="currentColor"
          d="M5 22V3h16l-2 5l2 5H7v9zm2-11h11.05l-1.2-3l1.2-3H7zm0 0V5z"
        />
      </svg>
      <span
        class="ml-1 block truncate capitalize text-[0.8rem] sm:text-[0.95rem] font-bold text-foreground"
        >Countries</span
      >
      <!-- the chevron is the affordance: this chip navigates away rather than
           toggling something in place -->
      <Icon
        name="tabler:chevron-right"
        class="ml-0.5 h-3 w-3 sm:h-3.5 sm:w-3.5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5"
        aria-hidden="true"
      />
    </div>
  </RouterLink>
</template>
