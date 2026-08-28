import { encryptData } from "@/composables/useEncryption";

export const useUtmStore = defineStore("utm-store", {
  state: () => ({
    extra: null,
    bTag: null,
    referralCode: null,
    utm: null,
  }),

  actions: {
    async getUtm(to) {
      if (to.query.utm_source) {
        const utmParams = {
          utmSource: to.query.utm_source,
          utmMedium: to.query.utm_medium,
          utmCampaign: to.query.utm_campaign,
          utmId: to.query.utm_id,
          utmTerm: to.query.utm_term,
          utmContent: to.query.utm_content,
        };
        this.utm = utmParams;
        this.extra = await encryptData(utmParams);
      }
    },
    getBtag(to) {
      if (to.query.btag) {
        const btag = to.query.btag;
        this.bTag = btag;
      }
    },
    getReferralCode(to) {
      if (to.query.referralCode) {
        const referralCode = to.query.referralCode;
        this.referralCode = referralCode;
      }
    },
    updateReferralCode(referralCode) {
      this.referralCode = referralCode;
    },
  },
  persist: true,
});
