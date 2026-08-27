// app/plugins/mixpanel.client.js
//
// Mixpanel is deferred: the library (core build, no session-recorder) is
// dynamically imported after the browser is idle, so it is not part of the
// entry chunk and never competes with first paint. Until it arrives,
// $mixpanel is a thin queue with the same call surface the app uses
// (track / identify / people.set); queued calls replay in order once the
// real instance is initialised.
const MIXPANEL_TOKEN = "855f027f4230678f61f56685e72643b4";

export default defineNuxtPlugin(() => {
  let real = null;
  const queue = [];

  const call = (method, args) => {
    if (real) {
      method === "people.set" ? real.people.set(...args) : real[method](...args);
    } else {
      queue.push([method, args]);
    }
  };

  let resolveReady;
  const ready = new Promise((resolve) => {
    resolveReady = resolve;
  });

  const proxy = {
    track: (...args) => call("track", args),
    identify: (...args) => call("identify", args),
    people: { set: (...args) => call("people.set", args) },
    ready,
  };

  const load = async () => {
    try {
      const { default: mixpanel } = await import(
        "mixpanel-browser/src/loaders/loader-module-core"
      );
      mixpanel.init(MIXPANEL_TOKEN, {
        debug: import.meta.dev,
        track_pageview: true,
      });
      real = mixpanel;
      for (const [method, args] of queue.splice(0)) call(method, args);
      resolveReady(mixpanel);
    } catch (err) {
      // Analytics must never break the app; keep queuing silently.
      if (import.meta.dev) console.warn("[mixpanel] failed to load", err);
    }
  };

  const idle =
    typeof window.requestIdleCallback === "function"
      ? (cb) => window.requestIdleCallback(cb, { timeout: 5000 })
      : (cb) => setTimeout(cb, 1500);
  idle(load);

  return { provide: { mixpanel: proxy } };
});
