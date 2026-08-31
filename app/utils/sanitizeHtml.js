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
// bytes or backslash-u escapes need to live in this source file.
function isUrlNoiseChar(codePoint) {
  const isC0OrSpace = codePoint >= 0 && codePoint <= 32;
  const isC1 = codePoint >= 127 && codePoint <= 159;
  return isC0OrSpace || isC1;
}

const SAFE_SCHEMES = new Set(["http", "https", "mailto", "tel"]);
const SCHEME_RE = /^([a-zA-Z][a-zA-Z0-9+.-]*):/;

function isSafeUrl(value) {
  let cleaned = "";
  for (const char of value) {
    if (!isUrlNoiseChar(char.codePointAt(0))) cleaned += char;
  }
  if (cleaned === "") return true;
  // Protocol-relative ("//evil.example/x") reaches an attacker-controlled
  // host without ever naming a scheme, so reject it before scheme sniffing.
  if (cleaned.startsWith("//")) return false;
  const match = SCHEME_RE.exec(cleaned);
  // No scheme at all: a same-origin relative path, query string, or
  // fragment ("x.png", "/promo", "?a=1", "#x", "./x", "../x") - safe.
  if (!match) return true;
  return SAFE_SCHEMES.has(match[1].toLowerCase());
}

function escapeAttr(value) {
  return value.replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function cleanAttributes(name, attributes, allowed) {
  const out = {};
  for (const [rawKey, rawValue] of Object.entries(attributes ?? {})) {
    const key = rawKey.toLowerCase();
    if (!allowed.includes(key)) continue;
    const value = rawValue == null ? "" : String(rawValue);
    if ((key === "href" || key === "src") && !isSafeUrl(value)) continue;
    out[key] = escapeAttr(value);
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
}
