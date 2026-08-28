import { useGoogleDataLayers } from "@/composables/useGoogleDataLayers";
import API, { authBaseURL } from "../services/API";
import { useLoginStore } from "./login";

export const useProfileStore = defineStore("profile-store", {
  state: () => ({
    error: null,
    pending: false,
    responseOK: false,
    balance: null,
    deposit: null,
    balanceBeforeDeposit: null,
    bonus: null,
  }),

  actions: {
    async getProfileInfo(shouldOpenModal = true) {
      try {
        this.pending = true;
        this.error = null;
        this.responseOK = false;
        const { token, msisdn, profileSid } = storeToRefs(useLoginStore());
        if (!token.value || !msisdn.value) {
          this.pending = false;
          this.responseOK = true;
          return;
        }

        const response = await API(authBaseURL).post(
          "/auth/api/v1/profile/balance",
          { msisdn: msisdn.value },
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
              "X-PROFILE-SID": profileSid.value,
            },
          }
        );

        this.balance = response?.data?.extra.balance;
        this.bonus = response?.data?.extra.bonus;
        this.pending = false;
        this.responseOK = true;
      } catch (err) {
        this.pending = false;
        if (err.status == 401) {
          const { openLoginModal } = useLoginStore();
          openLoginModal(this.getProfileInfo, shouldOpenModal);
          return;
        }
        this.responseOK = false;
        this.error = err?.response?.data?.statusMessage;
      }
    },

    depositDataLayer() {
      const { pushDataLayerToGoogle, sendGtagConversion } =
        useGoogleDataLayers();

      pushDataLayerToGoogle({
        event: "deposit",
        deposit: this.deposit,
      });

      sendGtagConversion(
        "AW-16789345990/NgY6CPfc6pIaEMat5MU-",
        new Date().toISOString(),
      );
    },

    setBalanceBeforeDeposit(deposit) {
      this.balanceBeforeDeposit = this.balance;
      this.deposit = deposit;
    },

    pushToDatalayerIfDeposit() {
      if (!this.balanceBeforeDeposit) return;
      if (this.balanceBeforeDeposit < this.balance) {
        this.depositDataLayer();
        this.balanceBeforeDeposit = null;
        this.deposit = null;
      }
    },

    resetError() {
      this.error = null;
    },
  },

  persist: {
    pick: ["balance", "bonus"],
  },
});
