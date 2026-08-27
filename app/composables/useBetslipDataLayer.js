import { useGoogleDataLayers } from "./useGoogleDataLayers";
import { useBetslipStore } from "@/stores/sports-betslip";
import { storeToRefs } from "pinia";

export function useBetslipDataLayer() {
  const currency = "KES";
  const sportBetCartType = "all sports";

  //events types
  const viewCartEvent = "view_cart";
  const addToCartEvent = "add_to_cart";
  const removeFromCartEvent = "remove_from_cart";
  const beginCheckoutEvent = "begin_checkout";
  const purchaseEvent = "purchase";

  const { betslip, possibleWin, totalOdds, stake } = storeToRefs(
    useBetslipStore()
  );
  const { pushDataLayerToGoogle, sendGtagConversion } = useGoogleDataLayers();

  function pushToItems(items, item, index) {
    items.push({
      item_name: `${item.homeTeam} vs ${item.awayTeam}`,
      item_id: item.parentMatchId,
      currency,
      price: item.oddValue, //odds
      item_brand: item.competitionName,
      item_category: item.countryName,
      item_category2: item.sportName,
      item_variant: item.outcomeName, // options for odds are: '1', 'x', '2' , "1 or 2", "x or 2", "1 or x"
      index: index,
      quantity: 1,
    });

    return items;
  }

  function addViewBetslipDataLayer() {
    if (!betslip.value || !betslip.value.length) {
      return;
    }
    pushDataLayerToGoogle({ ecommerce: null }); // Clear the previous ecommerce object.
    const items = [];

    betslip.value.forEach((item, index) => {
      pushToItems(items, item, index);
    });

    const viewBetslipDataLayer = {
      event: viewCartEvent,
      expected_winnings: possibleWin.value,
      total_odds: totalOdds.value, //total odds
      bet_cart_type: sportBetCartType, // options "all sports", "Bandabets league", "midweek jp"
      ecommerce: {
        currency,
        value: stake.value, // stake amount
        items,
      },
    };
    pushDataLayerToGoogle(viewBetslipDataLayer);
  }

  function addToCartDataLayer(item, index) {
    // Measure when a product is added to a betslip
    pushDataLayerToGoogle({ ecommerce: null }); // Clear the previous ecommerce object.
    const items = [];
    pushToItems(items, item, index);
    const addToCartData = {
      event: addToCartEvent,
      bet_cart_type: sportBetCartType, // options "all sports", "Haki league", "midweek jp"
      ecommerce: {
        currency,
        value: "",
        items,
      },
    };
    pushDataLayerToGoogle(addToCartData);
  }
  function removeFromCartDataLayer(customId) {
    let itemToRemove = betslip.value.find((item) => {
      return item.customId == customId;
    });

    if (!itemToRemove) {
      return;
    }

    const index = betslip.value.findIndex((item) => item.customId == customId);

    // Measure when a product is removed from a betslip
    pushDataLayerToGoogle({ ecommerce: null }); // Clear the previous ecommerce object.
    const items = [];
    pushToItems(items, itemToRemove, index);
    const removeFromCartData = {
      event: removeFromCartEvent,
      bet_cart_type: sportBetCartType, // options "all sports", "Haki league", "midweek jp"
      ecommerce: {
        currency,
        value: "",
        items,
      },
    };
    pushDataLayerToGoogle(removeFromCartData);
  }

  function beginCheckoutDataLayer(timestamp) {
    if (!betslip.value || !betslip.value.length) {
      return;
    }

    pushDataLayerToGoogle({ ecommerce: null }); // Clear the previous ecommerce object.
    const items = [];

    betslip.value.forEach((item, index) => {
      pushToItems(items, item, index);
    });

    const beginCheckout = {
      event: beginCheckoutEvent,
      expected_winnings: possibleWin.value,
      total_odds: totalOdds.value, //total odds
      bet_cart_type: sportBetCartType, // options "all sports", "Bandabets league", "midweek jp"
      ecommerce: {
        affiliation: "",
        coupon: "", //add promo code if applicable
        currency,
        value: stake.value, // stake amount
        transaction_id: timestamp,
        shipping: "", //leave blank
        tax: "", //Add Excise Tax
        items,
      },
    };
    pushDataLayerToGoogle(beginCheckout);
  }

  function purchaseDataLayer(timestamp) {
    if (!betslip.value || !betslip.value.length) {
      return;
    }

    pushDataLayerToGoogle({ ecommerce: null }); // Clear the previous ecommerce object.
    const items = [];

    betslip.value.forEach((item, index) => {
      pushToItems(items, item, index);
    });

    const purchaseData = {
      event: purchaseEvent,
      expected_winnings: possibleWin.value,
      total_odds: totalOdds.value, //total odds
      bet_cart_type: sportBetCartType, // options "all sports", "Bandabets league", "midweek jp"
      ecommerce: {
        affiliation: "",
        coupon: "", //add promo code if applicable
        currency,
        value: stake.value, // stake amount
        transaction_id: timestamp,
        shipping: "", //leave blank
        tax: "", //Add Excise Tax
        items,
      },
    };
    pushDataLayerToGoogle(purchaseData);
    sendGtagConversion("AW-16789345990/Y443CN7QgoIaEMat5MU-", timestamp);
  }

  return {
    addToCartDataLayer,
    purchaseDataLayer,
    beginCheckoutDataLayer,
    addViewBetslipDataLayer,
    removeFromCartDataLayer,
  };
}
