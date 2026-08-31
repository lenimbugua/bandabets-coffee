// Allow-list HTML sanitiser for CMS-authored rich text (promotion
// descriptions) rendered via v-html. Built on ultrahtml - a small pure-JS
// parser that Nuxt itself depends on - so it runs identically during SSR
// and on the client (DOMPurify was a no-op on the server, which meant the
// server response carried the raw CMS HTML until hydration).
//
// Policy: elements not in ALLOWED are unwrapped (their text survives);
// elements in DROP - and any custom element - are removed with their
// subtree; only the attributes listed per element survive; href/src must
// use a safe scheme or be same-origin relative; target is only ever
// "_blank" and then always carries rel="noopener noreferrer"; comments and
// doctypes are removed.
import {
  COMMENT_NODE,
  DOCTYPE_NODE,
  ELEMENT_NODE,
  TEXT_NODE,
  parse,
  renderSync,
  walkSync,
} from "ultrahtml";

const LINK_ATTRS = ["href", "target", "rel", "title"];
const CELL_ATTRS = ["colspan", "rowspan"];

const ALLOWED = {
  p: [], br: [], hr: [],
  strong: [], b: [], em: [], i: [], u: [], s: [], small: [], sub: [], sup: [],
  span: [], div: [], blockquote: [], pre: [], code: [],
  h1: [], h2: [], h3: [], h4: [], h5: [], h6: [],
  ul: [], ol: ["start"], li: [],
  a: LINK_ATTRS,
  img: ["src", "alt", "width", "height"],
  table: [], thead: [], tbody: [], tfoot: [], tr: [],
  th: CELL_ATTRS, td: CELL_ATTRS,
};

const DROP = new Set([
  "script", "style", "iframe", "frame", "object", "embed", "svg", "math",
  "template", "form", "input", "button", "textarea", "select", "option",
  "link", "meta", "base", "noscript", "video", "audio", "source", "canvas",
]);

// Strips ASCII control characters and whitespace that browsers ignore
// inside a scheme (a tab hidden inside "java script:"), plus the C1
// control range, using numeric code point comparisons so no raw control
// bytes or backslash-escape sequences need to live in this source file.
function isUrlNoiseChar(codePoint) {
  const isC0OrSpace = codePoint >= 0 && codePoint <= 32;
  const isC1 = codePoint >= 127 && codePoint <= 159;
  return isC0OrSpace || isC1;
}

// The Unicode replacement character, built via fromCharCode rather than a
// literal escape so no backslash-escape sequence lives in this file.
const REPLACEMENT_CHAR = String.fromCharCode(0xfffd);

function codePointToChar(codePoint) {
  const isSurrogateHalf = codePoint >= 0xd800 && codePoint <= 0xdfff;
  if (!Number.isFinite(codePoint) || codePoint < 0 || codePoint > 0x10ffff || isSurrogateHalf) {
    return REPLACEMENT_CHAR;
  }
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return REPLACEMENT_CHAR;
  }
}

// A deliberately small set of named character references, keyed
// lower-case (lookup lower-cases the reference name before matching).
// Anything not in this map is left untouched, verbatim, by design -
// isSafeUrl's entity-leak check (see below) treats any such leftover
// "&name;" it finds in scheme position as unsafe rather than guessing
// what a browser would decode it to.
const NAMED_ENTITIES = new Map([
  ["amp", "&"],
  ["lt", "<"],
  ["gt", ">"],
  ["quot", '"'],
  ["apos", "'"],
  ["colon", ":"],
  ["sol", "/"],
  ["bsol", "\\"],
  ["num", "#"],
  ["tab", String.fromCharCode(9)],
  ["newline", String.fromCharCode(10)],
  ["nbsp", String.fromCharCode(160)],
]);

// Decodes HTML character references in an attribute value BEFORE any
// safety decision is made about it. ultrahtml stores attribute values
// verbatim (it does not decode entities), and the browser decodes them
// on render - so a scheme check that only looked at the raw, still-encoded
// text would be fail-open against payloads like "&#106;avascript:alert(1)"
// or "javascript&colon;alert(1)". Numeric references accept a missing
// trailing semicolon (browsers do); named references here require one.
function decodeEntities(value) {
  let out = value;
  out = out.replace(/&#x([0-9a-f]+);?/gi, (_match, hex) => codePointToChar(parseInt(hex, 16)));
  out = out.replace(/&#(\d+);?/g, (_match, dec) => codePointToChar(parseInt(dec, 10)));
  out = out.replace(/&([a-zA-Z]+);/g, (match, name) => {
    const char = NAMED_ENTITIES.get(name.toLowerCase());
    return char === undefined ? match : char;
  });
  return out;
}

const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);

function firstIndexOfAny(str, chars) {
  for (let i = 0; i < str.length; i++) {
    if (chars.includes(str[i])) return i;
  }
  return -1;
}

// Expects an already-entity-decoded value (see decodeEntities above).
function isSafeUrl(decodedValue) {
  let cleaned = "";
  for (const char of decodedValue) {
    if (!isUrlNoiseChar(char.codePointAt(0))) cleaned += char;
  }
  if (cleaned === "") return true;

  // Browsers treat backslash the same as forward slash when resolving a
  // URL, so "\evil.example/x" and "/\evil.example/x" are protocol-relative
  // in exactly the way "//evil.example/x" is - normalize before the
  // leading-slash test below.
  const normalized = cleaned.replace(/\\/g, "/");
  if (normalized.startsWith("//")) return false;

  // Anything before the first path/query/fragment boundary that still
  // contains an undecoded "&name" or "&#..." we chose not to resolve
  // (decodeEntities leaves unknown named references untouched) is never
  // trusted - a browser may decode it into something our scheme check
  // never saw.
  const pathBoundary = firstIndexOfAny(normalized, "/?#");
  const prefixSegment = pathBoundary === -1 ? normalized : normalized.slice(0, pathBoundary);
  if (/&[0-9a-z#]/i.test(prefixSegment)) return false;

  const schemeBoundary = firstIndexOfAny(normalized, ":/?#");
  if (schemeBoundary !== -1 && normalized[schemeBoundary] === ":") {
    const scheme = normalized.slice(0, schemeBoundary).toLowerCase();
    return SAFE_SCHEMES.has(scheme);
  }
  // No colon before the first "/", "?", or "#" (or no colon at all): a
  // same-origin relative path, query string, or fragment - safe.
  return true;
}

function escapeAttr(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function cleanAttributes(name, attributes, allowed) {
  const out = {};
  for (const [rawKey, rawValue] of Object.entries(attributes ?? {})) {
    const key = rawKey.toLowerCase();
    if (!allowed.includes(key)) continue;
    const raw = rawValue == null ? "" : String(rawValue);
    // Decode entities up front for every kept attribute, not just
    // href/src, so what we validate and what we escape are always the
    // same (decoded) text a browser would actually see.
    const decoded = decodeEntities(raw);
    if ((key === "href" || key === "src") && !isSafeUrl(decoded)) continue;
    out[key] = escapeAttr(decoded);
  }
  if (name === "a") {
    if (out.target !== "_blank") delete out.target;
    if (out.target === "_blank") out.rel = "noopener noreferrer";
    else delete out.rel;
  }
  return out;
}

function removeChild(parent, node) {
  if (!parent?.children) return;
  parent.children = parent.children.filter((child) => child !== node);
}

function unwrapChild(parent, node) {
  if (!parent?.children) return;
  parent.children = parent.children.flatMap((child) => (child === node ? child.children : child));
}

export function sanitizeHtml(html) {
  if (html == null || html === "") return "";
  try {
    // Known ultrahtml parser limitation, accepted as-is (not fixed here):
    // its attribute tokenizer drops the value of an UNQUOTED attribute
    // entirely (`<a href=/promo>` parses as href=""). This fails closed
    // (the link just loses its href) rather than open, and the CMS rich
    // text editor that feeds this function always emits quoted attributes,
    // so it is not worth hand-rolling a parser to work around.
    const doc = parse(String(html));
    const actions = [];

    walkSync(doc, (node, parent) => {
      switch (node.type) {
        case COMMENT_NODE:
        case DOCTYPE_NODE:
          actions.push(() => removeChild(parent, node));
          return;
        case TEXT_NODE:
          // ultrahtml keeps text verbatim (entities untouched); a bare "<"
          // it did not treat as a tag could still open one for the browser.
          actions.push(() => {
            node.value = node.value.replace(/</g, "&lt;");
          });
          return;
        case ELEMENT_NODE: {
          const name = node.name.toLowerCase();
          if (DROP.has(name) || name.includes("-")) {
            actions.push(() => removeChild(parent, node));
            return;
          }
          const allowed = ALLOWED[name];
          if (!allowed) {
            actions.push(() => unwrapChild(parent, node));
            return;
          }
          actions.push(() => {
            node.name = name;
            node.attributes = cleanAttributes(name, node.attributes, allowed);
          });
          return;
        }
        default:
          return;
      }
    });

    // Children before parents, so a dropped subtree never gets rewritten
    // into a parent that is itself about to be unwrapped.
    for (let i = actions.length - 1; i >= 0; i--) actions[i]();
    return renderSync(doc);
  } catch {
    // Pathological input (e.g. thousands of nested tags) can blow the call
    // stack inside ultrahtml's recursive parse/walk/render - fail closed
    // to an empty string rather than letting a RangeError 500 the SSR
    // render.
    return "";
  }
}
