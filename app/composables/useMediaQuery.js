import { getCurrentInstance, getCurrentScope, onMounted, onScopeDispose, ref } from "vue";

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
    let cleanup = null;

    // Register cleanup against whatever scope is ACTIVE AT THIS CALL — not
    // whatever scope happens to be active later, when subscribe() actually
    // runs. That distinction matters because subscribe() itself may run
    // deferred, inside onMounted (see below), and Vue reactivates the
    // *mounting component's own* scope around lifecycle-hook callbacks —
    // which is not necessarily the scope this function was called from.
    // useScreenSizes.js is the case that bites: its first call happens
    // inside default.vue's setup, synchronously inside a detached
    // effectScope(true).run(...). getCurrentScope() here, evaluated
    // synchronously at call time, correctly captures that detached scope
    // (never disposed for the app's lifetime — its refs are cached on
    // nuxtApp and reused). If onScopeDispose() were instead called from
    // inside the deferred onMounted callback, it would bind to
    // default.vue's own scope, so navigating from a default-layout page to
    // any layout:false page would tear down the shared matchMedia
    // listeners on unmount — freezing responsive switching for the rest of
    // the session, since useScreenSizes never re-subscribes.
    if (getCurrentScope()) {
      onScopeDispose(() => cleanup?.());
    }

    const subscribe = () => {
      const mql = window.matchMedia(query);
      const update = () => {
        matches.value = mql.matches;
      };
      update();
      mql.addEventListener("change", update);
      cleanup = () => mql.removeEventListener("change", update);
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
