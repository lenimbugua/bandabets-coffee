// Native toast queue — replaces sweetalert2 (~27 KB gzip + injected CSS).
// The queue lives at module level so every caller (Pinia stores included)
// shares it; AppToaster.vue (mounted once in app.vue) renders it. The
// public useToast() API is unchanged from the sweetalert2 version.
import { reactive } from "vue";

export const TOAST_DURATION_MS = 4000;
// SSR-safe only because pushToast() never mutates this on the server (the import.meta.server guard lives there).
export const toasts = reactive([]);
let seq = 0;

export function dismissToast(id) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i > -1) toasts.splice(i, 1);
}

const errorColor = "red";
const successColor = "green";
const successIcon = "success";
const errorIcon = "warning";

const positionTop = "top";
const positionBottomRight = "bottom-right";
const positionTopRight = "top-right";

const KNOWN_POSITIONS = new Set([positionTop, positionTopRight, positionBottomRight]);

// sweetalert2 callers expressed intent as (iconColor, icon); collapse both
// onto one kind so the toaster only needs three visual variants.
function toKind(color, icon) {
  if (color === errorColor || icon === "warning" || icon === "error") return "error";
  if (icon === "info" || icon === "question") return "info";
  return "success";
}

function pushToast({ color, icon, title, position }) {
  // Toasts are a client concern; a store firing during SSR just no-ops.
  if (import.meta.server) return Promise.resolve();
  const id = ++seq;
  toasts.push({
    id,
    kind: toKind(color, icon),
    title: title == null ? "" : String(title),
    position: KNOWN_POSITIONS.has(position) ? position : positionTop,
    duration: TOAST_DURATION_MS,
  });
  return Promise.resolve({ id });
}

export function useToast() {
  // Same shape callers already use: Toast(color, position).fire({ icon, title }).
  const Toast = (color, position = positionTop) => ({
    fire(options = {}) {
      return pushToast({ color, icon: options.icon, title: options.title, position });
    },
  });

  function fireToast(color, icon, title, position = positionTop) {
    Toast(color, position).fire({ icon: icon, title: title });
  }

  function fireSuccessToast(title, position = positionTop) {
    fireToast(successColor, successIcon, title, position);
  }
  function fireErrorToast(title, position = positionTop) {
    fireToast(errorColor, errorIcon, title, position);
  }

  return {
    Toast,
    fireToast,
    errorColor,
    errorIcon,
    successIcon,
    successColor,
    fireErrorToast,
    fireSuccessToast,
    positionTopRight,
    positionBottomRight,
  };
}
