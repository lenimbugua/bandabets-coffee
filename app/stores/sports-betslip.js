import { useBetslip } from "@/composables/useBetslip";
import { useBetslipDataLayer } from "@/composables/useBetslipDataLayer";
import { useModalTypes } from "@/composables/useModalTypes";
import { useToast } from "@/composables/useToast";
import { useModalStore } from "@/stores/modal";
import { useProfileStore } from "@/stores/profile";
import API, { betBaseURL, BET_PATH } from "../services/API";
import { useDepositStore } from "./deposit";
import { useLoginStore } from "./login";

const { fireErrorToast, fireSuccessToast, positionTopRight } = useToast();

export const useBetslipStore = defineStore("sports-betslip", {
  state: () => ({
    stake: 50,
    betslip: [],
    totalOdds: 0,
    pending: false,
    possibleWin: 0,
    betDetails: null,
    fieldErrors: "",
    afterBetDetails: null,
    responseOK: false,
    nonFieldErrors: "",
    showMainBetslip: false,
    showSmallBetslip: false,
    showBottomBetslip: false,
    showBetPlaceMessage: false,
    betMessage: null,
    betPlaceError: null,
    bookingCode: null,
    customIdToRemove: null,
  }),

  getters: {
    betslipLength: (state) => state.betslip.length,
    selectedMatchIds: (state) => {
      return new Set(state.betslip.map((item) => item.parentMatchId));
    },
  },

  actions: {
    openBottomBetslip() {
      if (!this.showSmallBetslip) this.showBottomBetslip = true;
    },
    closeBottomBetslip() {
      this.showBottomBetslip = false;
    },
    openSmallBetslip() {
      this.showSmallBetslip = true;
    },
    closeSmallBetslip() {
      this.showSmallBetslip = false;
    },
    openMainBetslip() {
      this.showMainBetslip = true;
    },
    closeMainBetslip() {
      this.showMainBetslip = false;
    },

    calculatePossibleWin() {
      const { calculateTotalOdds, calculatePotentialWin } = useBetslip();
      this.totalOdds = calculateTotalOdds(this.betslip);
      this.possibleWin = calculatePotentialWin(this.betslip, this.stake);
    },

    // betslip
    addAnItemToBetslip(payload) {
      const { addToCartDataLayer, removeFromCartDataLayer } =
        useBetslipDataLayer();

      if (payload.clickIsToSelectOutcome) this.openBottomBetslip();

      let betslip = this.betslip;
      // Here click was to select an outcome. Add the selected outcome to betslip
      if (payload.clickIsToSelectOutcome) {
        if (this.siblingExists(betslip, payload)) {
          console.log("sibling exists");
          const { confirmRemoveSlipModal } = useModalTypes();
          const { openModal } = useModalStore();
          openModal(confirmRemoveSlipModal);
          this.customIdToRemove = payload.customId;
          return;
        }
        // First, remove sibling if any from the betslip.
        if (this.possibleWin)
          betslip = betslip.filter((item) => {
            return item.parentMatchId != payload.parentMatchId;
          });

        // add currently selected sibling
        betslip.push(payload);
        addToCartDataLayer(payload, betslip.length - 1);
      } else {
        // Here click was to deselect an outcome.
        removeFromCartDataLayer(payload.customId);

        // Remove item from betslip.
        betslip = betslip.filter((item) => {
          return item.customId !== payload.customId;
        });

        if (!betslip.length) {
          this.showSmallBetslip = false;
          this.showBottomBetslip = false;
          this.betslip = [];
        }
      }
      // mutate the betslip
      this.betslip = betslip;
      this.calculatePossibleWin();
    },

    siblingExists(payload) {
      if (!payload.isBetBuilder) {
        return this.betslip.find((item) => {
          return (
            item.parentMatchId === payload.parentMatchId && item.isBetBuilder
          );
        });
      }

      return this.betslip.find((item) => {
        return (
          item.parentMatchId === payload.parentMatchId && !item.isBetBuilder
        );
      });
    },
    addBetbuilderToBetslip(selections, oddValue) {
      const { addToCartDataLayer } = useBetslipDataLayer();

      if (selections?.selections?.length < 2) {
        fireErrorToast("Please select at least two outcomes", positionTopRight);
        return;
      }
      let customId = selections.selections
        .map((item) => item.multiBetOutcomeName)
        .join("");

      let item = {
        status: 1,
        isBetBuilder: true,
        customId,
        oddValue,
        ...selections,
      };

      let betslip = this.betslip;
      const exists = betslip.some((item) => item.customId === customId);

      if (exists) {
        fireErrorToast("Bet already exists", positionTopRight);
        this.calculatePossibleWin();
        return;
      }

      if (this.siblingExists(betslip, item)) {
        const { confirmRemoveSlipModal } = useModalTypes();
        const { openModal } = useModalStore();
        openModal(confirmRemoveSlipModal);
        this.customIdToRemove = customId;
        return;
      }

      betslip.push(item);
      addToCartDataLayer(selections, betslip.length - 1);
      this.betslip = betslip;
      this.calculatePossibleWin();
      fireSuccessToast("Bet added successfully", positionTopRight);
    },

    deleteAnItemFromBetslip(customId) {
      const { removeFromCartDataLayer } = useBetslipDataLayer();
      removeFromCartDataLayer(customId);
      let betslip = this.betslip;
      betslip = betslip.filter((item) => {
        return item.customId !== customId;
      });
      // hide all betslips when betslip becomes empty by reseting back to default
      if (!betslip.length) {
        this.showSmallBetslip = false;
        this.showBottomBetslip = false;
        this.betslip = [];
        this.setBetslipBookingCode(null);
      }
      // mutate the betslip
      this.betslip = betslip;
      this.calculatePossibleWin();
    },

    setStake(payload) {
      this.stake = payload;
      this.calculatePossibleWin();
    },

    clearBetslip() {
      // clear everything from betslip and reset to back default state
      this.betslip = [];
      this.showBottomBetslip = false;
      this.showSmallBetslip = false;
      this.betslip = [];
      this.closeBottomBetslip();
      this.closeMainBetslip();
      this.closeSmallBetslip();
      this.calculatePossibleWin();
      this.setBetslipBookingCode(null);
    },

    removeDeactivatedMatches() {
      let betslip = this.betslip;
      betslip = betslip.filter((item) => {
        return item.status == 1;
      });

      // hide all betslips when betslip becomes empty by reseting back to default
      if (!betslip.length) {
        //   this.showSmallBetslip = false
        //   this.showBottomBetslip = false
        //   this.betslip = []
        this.setBetslipBookingCode(null);
      }
      // mutate the betslip
      this.betslip = betslip;
      this.calculatePossibleWin();
    },

    async placeBet(afterPlaceBetAction) {
      const { purchaseDataLayer, beginCheckoutDataLayer } =
        useBetslipDataLayer();
      const { token, profileSid } = storeToRefs(useLoginStore());
      const slip = [];
      let betslip = this.betslip;

      //filter out betbuilders
      betslip = betslip.filter((item) => {
        return !item.isBetBuilder;
      });

      betslip.forEach((item) => {
        slip.push({
          live: item.live,
          homeTeam: item.homeTeam,
          awayTeam: item.awayTeam,
          oddType: item.oddType,
          startTime: item.startTime,
          oddValue: item.oddValue,
          outcomeId: item.outcomeId,
          subTypeId: item.subTypeId,
          specifiers: item.specifiers,
          status: item.status,
          sportId: item.sportId,
          prevOddValue: item.prevOddValue,
          outcomeName: item.outcomeName,
          competitionId: item.competitionId,
          twoGoalUpActive: item.twoGoalUpActive,
          parentMatchId: item.parentMatchId,
          timestamp: item.timestamp,
        });
      });

      const { getProfileInfo } = useProfileStore();

      const payload1 = {
        betAmount: this.stake,
        possibleWin: this.possibleWin,
        src: "bet",
        sportsbook: "sportsbook",
        profileSid: profileSid.value,
        view: "home",
        userAgent: "Mozilla/5.0",
        resource: "bet",
        totalOdds: this.totalOdds,
        isOddBoosted: true,
        slip,
        multiBetSlip: this.extractMultiBetSlip(),
      };

      if (this.bookingCode) {
        payload1.bookingCode = this.bookingCode;
      }

      try {
        this.pending = true;
        this.responseOK = false;
        const timestampString = new Date().toISOString();
        beginCheckoutDataLayer(timestampString);
        const response = await API(betBaseURL).post(
          `${BET_PATH}/place-bet`,
          payload1,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
              "X-PROFILE-SID": profileSid.value,
            },
          }
        );

        this.pending = false;

        if (response?.data?.status === "error") {
          if (response?.data?.data) {
            this.betslip = this.mergeArrays(response.data.data);
            this.calculatePossibleWin();
            return;
          } else if (
            response?.data?.message == "Exceeds maximum debit amount."
          ) {
            this.betPlaceError = "Sorry, maximum stake is KSH.10,000";
            const { openModal } = useModalStore();

            const { betPlaceStatus } = useModalTypes();

            openModal(betPlaceStatus);
          } else if (
            response?.data?.message == "Amount is below minimum debit amount."
          ) {
            this.betPlaceError = "Sorry, minimum stake is KSH.10";
            const { openModal } = useModalStore();

            const { betPlaceStatus } = useModalTypes();

            openModal(betPlaceStatus);
          } else if (
            response?.data?.message ==
            "Insufficient balance. Kindly topup your account"
          ) {
            this.betPlaceError = `Sorry, you do not have sufficient balance to stake KSH.${this.stake}. Please top up your account.`;
            const { openModal } = useModalStore();
            const { setDeposit } = useDepositStore();
            const { balance } = storeToRefs(useProfileStore());

            setDeposit(this.stake - balance.value);

            const { betPlaceStatus } = useModalTypes();

            openModal(betPlaceStatus);
          } else {
            this.betPlaceError =
              "Sorry, something went wrong, please try again";
            const { openModal } = useModalStore();
            const { betPlaceStatus } = useModalTypes();

            openModal(betPlaceStatus);
          }
          return;
        }

        this.responseOK = true;

        if (afterPlaceBetAction) {
          afterPlaceBetAction();
        }

        // const { openModal } = useModalStore();

        // const { betPlaceStatus } = useModalTypes();

        // openModal(betPlaceStatus);
        this.afterBetDetails = {
          betId: response?.data?.data?.betDetails?.betId,
          possibleWin: this.possibleWin,
          stake: this.stake,
          totalOdds: this.totalOdds,
          bookingCode: this.bookingCode,
          selections: this.betslip.map((s) => ({
            homeTeam: s.homeTeam,
            awayTeam: s.awayTeam,
            oddType: s.oddType,
            outcomeName: s.outcomeName,
            oddValue: s.oddValue,
          })),
        };

        purchaseDataLayer(timestampString);

        this.clearBetslip();
        this.setBetPlaceMessage();
        await getProfileInfo();
      } catch (error) {
        console.log(error);
        this.responseOK = false;
        this.pending = false;
        if (error.status == 401) {
          const { openLoginModal } = useLoginStore();
          openLoginModal(this.placeBet);
          return;
        }
        if (error.status === 422) {
          const { openModal } = useModalStore();
          this.betPlaceError = error.response.data.message;
          if (
            error.response.data.message ==
            "Insufficient balance. Kindly topup your account"
          ) {
            const { openModal } = useModalStore();
            const { setDeposit } = useDepositStore();
            const { balance } = storeToRefs(useProfileStore());

            setDeposit(Math.ceil(this.stake - balance.value));
            const { insufficientBalance } = useModalTypes();
            openModal(insufficientBalance);
            return;
          }
          const { betPlaceStatus } = useModalTypes();
          openModal(betPlaceStatus);
          return;
        }

        this.betPlaceError = "Sorry, something went wrong, please try again";
        const { openModal } = useModalStore();

        const { betPlaceStatus } = useModalTypes();

        openModal(betPlaceStatus);
      } finally {
        this.pending = false;
      }
    },

    async verifyBetslip() {
      const { token, profileSid } = storeToRefs(useLoginStore());

      try {
        this.pending = true;
        this.responseOK = false;

        const payload = this.convertSlipData();
        payload.multiBetSlip = this.extractMultiBetSlip();
        const response = await API(betBaseURL).post(
          `${BET_PATH}/verify`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token.value}`,
              "X-PROFILE-SID": profileSid.value,
            },
          }
        );

        this.responseOK = true;

        this.pending = false;

        this.betslip = this.mergeArrays(response.data.data);
        this.calculatePossibleWin();
      } catch (error) {
        this.pending = false;
      }
    },

    convertSlipData() {
      let betslip = this.betslip;

      //filter out betbuilders
      betslip = betslip.filter((item) => {
        return !item.isBetBuilder;
      });
      return {
        src: "verify",
        userAgent: "safari",

        slip: betslip.map((item) => ({
          parentMatchId: item.parentMatchId,
          oddValue: item.oddValue,
          outcomeId: item.outcomeId,
          outcomeName: item.outcomeName,
          subTypeId: item.subTypeId,
          specifiers: item.specifiers || "", // Add empty string if specifiers is not present
        })),
      };
    },

    mergeArrays(secondArray) {
      return this.betslip.map((item) => {
        const secondItem = secondArray.find(
          (s) => s.parentMatchId == item.parentMatchId
        );

        if (secondItem) {
          return {
            ...item,
            oddValue: secondItem.oddValue,
            prevOddValue: secondItem.prevOddValue,
            status: secondItem.status,
            deviation: secondItem.deviation,
          };
        }
        return item;
      });
    },

    showNoBetError() {
      fireErrorToast("Please add at least one bet", positionTopRight);
    },

    setBetPlaceMessage() {
      this.showBetPlaceMessage = true;
      this.betMessage = "Bet placed successfully";
      setTimeout(() => {
        this.betMessage = null;
        this.showBetPlaceMessage = false;
      }, 4000);
    },
    setBetslipBookingCode(payload) {
      this.bookingCode = payload;
    },
    clearAfterBetDetails() {
      this.afterBetDetails = null;
    },
    setCustomIdToRemove(payload) {
      this.customIdToRemove = payload;
    },

    extractMultiBetSlip() {
      const multiBetGroups = {};

      this.betslip
        .filter((item) => item.isBetBuilder)
        .forEach((item) => {
          const parentMatchId = item.parentMatchId;
          if (!multiBetGroups[parentMatchId]) {
            multiBetGroups[parentMatchId] = [];
          }

          const slips = item.selections.map((sel) => ({
            parentMatchId: sel.parentMatchId,
            oddValue: item.oddValue,
            outcomeId: sel.outcomeId,
            outcomeName: sel.outcomeName,
            subTypeId: sel.subTypeId,
            specifiers: sel.specifiers,
            sportId: sel.sportId,
            multiBetMarketName: sel.multiBetMarketName,
            multiBetOutComeName: sel.multiBetOutcomeName,
          }));

          multiBetGroups[parentMatchId].push(...slips);
        });

      return Object.entries(multiBetGroups).map(([parentMatchId, slip]) => ({
        parentMatchId: Number(parentMatchId),
        slip,
      }));
    },
  },
  persist: {
    pick: ["betslip", "stake", "bookingCode"],
  },
});
