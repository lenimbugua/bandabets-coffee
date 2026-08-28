<script setup>
import AppTabs from "@/components/ui/AppTabs.vue";
import AppTabPanel from "@/components/ui/AppTabPanel.vue";
import AffiliatePayments from "./AffiliatePayments.vue";
</script>

<template>
  <div class="bg-card rounded-xl p-5 space-y-4">
    <h3 class="text-lg font-bold text-foreground">My Revenue</h3>

    <AppTabs>
      <div>
        <AppTabPanel>
          <AffiliatePayments />
        </AppTabPanel>
      </div>
    </AppTabs>
  </div>
</template>
