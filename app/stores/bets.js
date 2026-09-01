import { useToast } from "@/composables/useToast";
import { useProfileStore } from "@/stores/profile";
import API, { betBaseURL } from "../services/API";
import { useLoginStore } from "./login";
const { fireErrorToast, fireSuccessToast, positionTopRight } = useToast();
export const useBetsStore = defineStore("bets-store", {
  state: () => ({
    showBetslip: false,
    bets: [],
    allIsPending: false,
    responseOK: false,
    selectedId: null,
    betDetails: null,
    selectedBet: null,
    pending: false,
  }),

  actions: {
    async fetchBets(status) {
      this.responseOK = false;
      const { profileSid, token } = storeToRefs(useLoginStore());
      try {
        const response = await API(betBaseURL).get(
          `/api/v2/bets/profile?profileSid=${profileSid.value}&status=${status}`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
              "X-PROFILE-SID": profileSid.value,
            },
          },
        );

        this.responseOK = true;

        this.bets = response.data.data;
      } catch (err) {
        if (err.status == 401) {
          const { openLoginModal } = useLoginStore();
          openLoginModal(this.fetchBets);
          return;
        }
      }
    },
    async fetchBetslip() {
      this.pending = true;
      this.responseOK = false;
      const { profileSid, token } = storeToRefs(useLoginStore());
      try {
        const response = await API(betBaseURL).get(
          `/api/bets/slip?profileSid=${profileSid.value}&betId=${this.selectedId}`,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
              "X-PROFILE-SID": profileSid.value,
            },
          },
        );

        this.responseOK = true;
        this.pending = false;

        this.betDetails = response.data.data;
      } catch (err) {
        if (err.status == 401) {
          const { openLoginModal } = useLoginStore();
          openLoginModal(this.fetchBetslip);
          return;
        }
        this.pending = false;
      }
    },
    async cancelBet(betId) {
      this.pending = true;
      this.responseOK = false;
      const { profileSid, token } = storeToRefs(useLoginStore());
      try {
        const response = await API(betBaseURL).post(
          `/api/bets/cancel?betId=${betId}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
              "X-PROFILE-SID": profileSid.value,
            },
          },
        );

        this.responseOK = true;
        this.selectedId = null;
        this.betDetails = response.data.data;
        fireSuccessToast("Bet cancelled successfully", positionTopRight);
        const { getProfileInfo } = useProfileStore();
        await this.fetchBets(0);
        await getProfileInfo();
        this.pending = false;
      } catch (err) {
        this.pending = false;
        this.selectedId = null;
        if (err.status == 401) {
          const { openLoginModal } = useLoginStore();
          openLoginModal(this.fetchBetslip);
          return;
        }
        fireErrorToast(err.response.data.message, positionTopRight);
      }
    },

    setSelectedBet(id, bet) {
      this.selectedId = id;
      this.selectedBet = bet;
    },
    clearSelectedId() {
      this.selectedId = null;
    },
    setAllIsPending(payload) {
      this.allIsPending = payload;
    },
    setPending(payload) {
      this.pending = payload;
    },
  },
  persist: {
    pick: ["selectedId", "selectedBet"],
  },
});
