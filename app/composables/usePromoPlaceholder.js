// TEMPORARY — placeholder standing in for the PROMO PAGE images while the real
// promo artwork is produced.
//
// Scope is the promo pages only. The homepage banner carousel (TheBanner.vue)
// uses the real BANDA campaign artwork from /public/banners/banda/ and is
// deliberately NOT covered here.
//
// Call sites, all under app/components/promos/:
//   PromoIndex.vue          — replaces the Cloudflare image lookup
//   PromotionDetails.vue    — replaces the CMS `image_url`
//   HakiLeagueFreebets.vue  — replaces its Cloudflare image
// Each keeps its original image source in a comment, so restoring is
// uncommenting rather than reconstructing.
//
// 1997x666 (3:1).
export const PROMO_PLACEHOLDER = "/banners/banda/placeholder.jpg";
