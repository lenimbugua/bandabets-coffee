import { getCurrentInstance, onMounted, onScopeDispose, ref } from "vue";

// Native replacement for VueUse's useMediaQuery + provideSSRWidth.
//
// app/layouts/default.vue renders its entire <slot /> inside three mutually
// exclusive branches driven by useMediaQuery() (via useScreenSizes.js). On
// the server there is no window.matchMedia, so every query needs a
// deterministic fallback or nothing but the sr-only <h1> would ever be
// server-rendered. 390px is used as that fallback width: Google indexes
// mobile-first and this market (Kenyan sports betting) is mobile-dominant,
// so the server (and the client's first synchronous render, before
// matchMedia takes over in onMounted) renders the mobile branch. Because the
// layout branches on JS state rather than CSS media queries, whichever
// branch is server-rendered is the one hydration keeps — using the same
// SSR_WIDTH evaluation on the client's first render (instead of jumping
// straight to matchMedia) is what avoids a hydration mismatch.
export const SSR_WIDTH = 390;

function evaluateForWidth(query, width) {
  const min = /\(min-width:\s*([\d.]+)px\)/.exec(query);
  const max = /\(max-width:\s*([\d.]+)px\)/.exec(query);
  if (!min && !max) return false;
  return (!min || width >= Number(min[1])) && (!max || width <= Number(max[1]));
}

export function useMediaQuery(query) {
  const matches = ref(evaluateForWidth(query, SSR_WIDTH));

  if (import.meta.client) {
    const subscribe = () => {
      const mql = window.matchMedia(query);
      const update = () => {
        matches.value = mql.matches;
      };
      update();
      mql.addEventListener("change", update);
      // Works in both call shapes: inside onMounted the active scope is the
      // component's own (Vue re-activates it for lifecycle-hook callbacks),
      // and for the no-instance path below this runs synchronously inside
      // useScreenSizes.js's detached effectScope.run(), which is likewise
      // the active scope at this point.
      onScopeDispose(() => mql.removeEventListener("change", update));
    };

    // useScreenSizes.js runs this inside a detached effectScope with no
    // owning component instance, where onMounted() is unavailable — subscribe
    // immediately in that case. Inside a component, defer to onMounted so the
    // SSR_WIDTH value above is what actually hydrates.
    if (getCurrentInstance()) {
      onMounted(subscribe);
    } else {
      subscribe();
    }
  }

  return matches;
}
