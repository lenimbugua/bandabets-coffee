export function useGoogleDataLayers() {
  function pushDataLayerToGoogle(eventObject) {
    
    // Initialize the data layer if it doesn't exist
    window.dataLayer = window.dataLayer || [];

    // Push the  event data to the data layer
    window.dataLayer.push(eventObject);
  }

  // Google Ads conversion ping. gtag.js is loaded by a third-party tag (and
  // blocked by many ad-blockers), so it may be absent — analytics must never
  // break the flow that triggered it (e.g. a successfully placed bet).
  function sendGtagConversion(sendTo, transactionId) {
    if (typeof window === "undefined" || typeof window.gtag !== "function") {
      return;
    }
    window.gtag("event", "conversion", {
      send_to: sendTo,
      transaction_id: transactionId,
    });
  }

  return {
    pushDataLayerToGoogle,
    sendGtagConversion,
  };
}
