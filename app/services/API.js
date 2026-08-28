// These are runtime-config keys, not URLs. `API()` resolves them at call
// time so the server can be reconfigured without a rebuild. Every call site
// passes them straight to API(), so the identifiers are unchanged.
export const matchesBaseURL = "matchesUrl";
export const instantBaseURL = "instantUrl";
export const authBaseURL = "authUrl";
export const betBaseURL = "betUrl";
export const casinoBaseURL = "casinoUrl";
export const virtualBaseURL = "virtualUrl";
export const virtualLeaguesBaseURL = "virtualLeaguesUrl";
export const kironLiteBaseURL = "kironLiteUrl";
export const affiliateBaseURL = "affiliateUrl";
export const cmsBaseURL = "cmsUrl";
export const affiliateApiBaseURL = "affiliateApiUrl";

// Backend path prefixes. Base hosts come from runtime config above; these
// are the fixed path segments appended to them. Change here, not per call.
export const MATCHES_PATH = "/sportsbook/api/v3/matches";
export const BET_PATH = "/api/lsport/bets";

// Round 7 (native Nuxt): the previous axios instance duplicated the ofetch
// client Nuxt already ships. This adapter keeps axios's call shape —
// `.get(url, { params, headers })`, `.post(url, body, { headers, auth })`,
// `response.data`, `err.response.data.statusMessage` — so no call site
// changes, while the transport is Nuxt's $fetch.
function toResponse(raw) {
  return { data: raw._data, status: raw.status, headers: raw.headers };
}

function toAxiosLikeError(error) {
  // ofetch's FetchError carries the parsed body on .data and the Response on
  // .response; callers read err.response.data.* and err.response.status.
  // Callers also read err.status (axios mirrored the HTTP status onto the
  // error itself), so we mirror it here too.
  const response = error?.response
    ? { data: error.data, status: error.status ?? error.response.status, headers: error.response.headers }
    : undefined;
  const wrapped = new Error(
    error?.data?.statusMessage || error?.data?.message || error?.message || "Request failed",
  );
  wrapped.response = response;
  wrapped.status = response?.status;
  wrapped.cause = error;
  return wrapped;
}

function buildHeaders(config = {}) {
  const headers = { ...(config.headers || {}) };
  if (config.auth) {
    const { username = "", password = "" } = config.auth;
    headers.Authorization = `Basic ${btoa(`${username}:${password}`)}`;
  }
  return headers;
}

export default (service = matchesBaseURL) => {
  const config = useRuntimeConfig();
  const baseURL = config.public[service];
  if (!baseURL) {
    throw new Error(
      `API(): no runtime config value for "${service}". ` +
        `Set NUXT_PUBLIC_${service.replace(/[A-Z]/g, (c) => "_" + c).toUpperCase()}.`,
    );
  }
  const request = async (method, url, body, cfg = {}) => {
    try {
      const raw = await $fetch.raw(url, {
        baseURL,
        method,
        query: cfg.params,
        headers: buildHeaders(cfg),
        body,
      });
      return toResponse(raw);
    } catch (error) {
      throw toAxiosLikeError(error);
    }
  };
  return {
    get: (url, cfg) => request("GET", url, undefined, cfg),
    post: (url, body, cfg) => request("POST", url, body, cfg),
  };
};
