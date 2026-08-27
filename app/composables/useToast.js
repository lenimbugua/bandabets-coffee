// sweetalert2 (~27 KB gzip + injected CSS) is only needed once a toast
// actually fires, so it is imported on first use instead of being bundled
// into the login chunk that every page preloads.
let swalPromise = null;
const loadSwal = () =>
  (swalPromise ??= import("sweetalert2")
    .then((m) => m.default)
    .catch((err) => {
      swalPromise = null; // let the next toast retry after a transient chunk-load failure
      throw err;
    }));

const errorColor = "red";
const successColor = "green";
const successIcon = "success";
const errorIcon = "warning";

const positionTop = "top";
const positionBottomRight = "bottom-right";
const positionTopRight = "top-right";

export function useToast() {
  // Returns an object whose fire() resolves once sweetalert2 has loaded and
  // the toast has been shown — the same shape callers already await.
  const Toast = (color, position = positionTop) => ({
    async fire(options) {
      const Swal = await loadSwal();
      return Swal.mixin({
        toast: true,
        position: position,
        iconColor: color,
        customClass: {
          popup: "colored-toast",
        },
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
      }).fire(options);
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
