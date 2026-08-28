import { useUtmStore } from "@/stores/utm";

export default defineNuxtRouteMiddleware(async (to) => {
  const { getUtm, getBtag, getReferralCode } = useUtmStore();
  await getUtm(to);
  getBtag(to);
  getReferralCode(to);
});
