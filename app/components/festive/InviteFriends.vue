<script setup>
import ShareToSocials from "@/components/community-bets/ShareToSocials.vue";
import { useShareToSocials } from "@/composables/useShareToSocials";
import { useClipboard } from "@/composables/useClipboard";
import { ref, toRefs } from "vue";
import { useAffiliateV2Store } from "@/stores/affiliate-v2";

const { affiliateText } = useShareToSocials();

const { promoCode, affiliateUrl, pending } = toRefs(useAffiliateV2Store());
const { copy: copyLink, copied: linkCopied } = useClipboard({
  source: affiliateUrl,
});
const { copy: copyCode, copied: codeCopied } = useClipboard({
  source: promoCode,
});

const { invite } = useAffiliateV2Store();

const msisdn = ref("");

const error = ref(false);
const safaricomPattern =
  /^(?:\+?254|0)?(70\d|71[0-9]|72\d|74[0-68]|75[7-9]|76[8-9]|79\d|1[01][0-6])\d{6}$/;

const handleSubmit = async () => {
  console.log(msisdn.value);
  error.value = !safaricomPattern.test(msisdn.value);
  console.log(safaricomPattern.test(msisdn.value));
  console.log(error);
  if (!error.value) {
    invite(msisdn.value);
  }
};
</script>

<template>
  <div v-if="!promoCode" class="min-h-96 p-6">
    <div
      class="bg-red-600/10 text-red-600 py-6 px-3 border border-red-600 rounded-md"
    >
      You must be an active user who has diposited atleast KES 30 and wagered
      KES 30 in the last 7 days to be eligible to invite friends .
    </div>
  </div>
  <section v-else class="block lg:flex">
    <div class="w-full">
      <div
        class="bg-white dark:bg-surface-elevated/80 backdrop-blur-lg border border-gray-300 dark:border-gray-700 py-2 md:px-4 lg:px-8 shadow-2xl relative overflow-hidden"
      >
        <div class="flex items-center justify-between px-2">
          <h2 class="text-md font-bold text-red-500 mb-2">
            Invite Your Squad with an SMS
          </h2>
        </div>
        <p
          class="dark:text-slate-400 text-gray-600 text-sm mb-3 text-left px-2"
        >
          Enter your friend number. We'll send the SMS. You get paid when they
          play.
        </p>

        <form class="space mb-2 px-2 pb-4" @submit.prevent="handleSubmit">
          <div>
            <label
              class="text-left block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1 ml-1"
              >Phone Number</label
            >
            <div class="relative">
              <div class="relative">
                <div
                  class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"
                >
                  <span class="text-gold-bright font-bold">🇰🇪 +254</span>
                </div>
                <input
                  id="msisdn"
                  v-model="msisdn"
                  type="tel"
                  inputmode="numeric"
                  required
                  name="phone"
                  autocomplete="tel"
                  class="w-full dark:bg-surface-sunken text-gray-950 dark:text-white border dark:border-gray-600 focus:border-gold-bright focus:ring-1 focus:ring-gold rounded-xl py-2 pl-20 pr-36 placeholder-gray-600 font-mono transition-all outline-hidden"
                  placeholder="7XX XXX XXX"
                />
              </div>

              <button
                type="submit"
                class="absolute inset-y-1 right-1 px-3 text-sm bg-linear-to-r from-gold-bright to-gold-deep text-foreground font-bold rounded-xl hover:shadow-lg transform hover:scale-[1.02] transition-all duration-300 flex items-center space-x-0.5 h-[calc(100%-8px)]"
                style="line-height: 1"
              >
                <div class="flex items-center space-x-2">
                  <Icon name="tabler:refresh" v-if="pending" class="h-5 w-5 animate-spin" />
                  <span v-else>📤</span>
                  <span>Send Invite</span>
                </div>
              </button>
            </div>
          </div>
          <div v-if="error" class="flex items-center pt-1">
            <Icon name="tabler:info-circle" class="h-5 w-5 text-red-600" />
            <span class="text-xs text-red-600"
              >Only valid safaricom phone numbers are accepted.</span
            >
          </div>
        </form>

        <div
          class="pt-4 border-t border-gray-300 dark:border-gray-700 space-y-2 px-2"
        >
          <h3 class="text-md font-bold text-red-500 pt-2">
            More ways to Invite friends
          </h3>
          <div
            class="bg-gray-100 dark:bg-surface-sunken border dark:border-gray-600 rounded-xl p-2"
          >
            <ShareToSocials
              :share-url="affiliateUrl"
              :share-text="affiliateText"
            />
          </div>
          <div class="relative">
            <input
              type="text"
              readonly
              :value="promoCode"
              class="w-full bg-gray-100 dark:bg-surface-sunken border dark:border-gray-600 focus:border-gold-bright focus:ring-1 focus:ring-gold rounded-xl py-3 pl-4 pr-28 text-gray-600 dark:text-white text-sm font-mono truncate outline-hidden cursor-text"
            />
            <button
              class="absolute inset-y-1 right-1 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-gold transition-colors duration-300 text-sm h-[calc(100%-8px)]"
              @click="copyCode(promoCode)"
            >
              <span v-if="codeCopied">Copied!</span
              ><span v-else>Copy Code</span>
            </button>
          </div>

          <div class="relative">
            <input
              type="text"
              readonly
              :value="affiliateUrl"
              class="w-full bg-gray-100 dark:bg-surface-sunken border border-gray-200 dark:border-gray-600 focus:border-gold-bright focus:ring-1 focus:ring-gold rounded-xl py-3 pl-4 pr-28 text-gray-600 text-sm truncate outline-hidden cursor-text"
            />
            <button
              class="absolute inset-y-1 right-1 px-4 py-2 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-gold transition-colors duration-300 text-sm h-[calc(100%-8px)]"
              @click="copyLink(affiliateUrl)"
            >
              <span v-if="linkCopied">Copied!</span
              ><span v-else>Copy Link</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
