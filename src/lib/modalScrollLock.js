const LOCK_COUNT_ATTR = "data-modal-lock-count";
const PREV_OVERFLOW_ATTR = "data-modal-prev-overflow";

export const lockModalScroll = () => {
  if (typeof document === "undefined") return;
  const body = document.body;
  const currentCount = Number(body.getAttribute(LOCK_COUNT_ATTR) || "0");

  if (currentCount === 0) {
    body.setAttribute(PREV_OVERFLOW_ATTR, body.style.overflow || "");
    body.style.overflow = "hidden";
    body.classList.add("modal-open");
  }

  body.setAttribute(LOCK_COUNT_ATTR, String(currentCount + 1));
};

export const unlockModalScroll = () => {
  if (typeof document === "undefined") return;
  const body = document.body;
  const currentCount = Number(body.getAttribute(LOCK_COUNT_ATTR) || "0");
  const nextCount = Math.max(0, currentCount - 1);

  if (nextCount > 0) {
    body.setAttribute(LOCK_COUNT_ATTR, String(nextCount));
    return;
  }

  const previousOverflow = body.getAttribute(PREV_OVERFLOW_ATTR) || "";
  body.style.overflow = previousOverflow;
  body.classList.remove("modal-open");
  body.removeAttribute(LOCK_COUNT_ATTR);
  body.removeAttribute(PREV_OVERFLOW_ATTR);
};
