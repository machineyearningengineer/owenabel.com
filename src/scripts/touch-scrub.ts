/**
 * iPhone Safari drags a range input only from its thumb: a finger that lands
 * anywhere else on the track and slides does nothing. For touch, once the
 * finger moves sideways this follows it, as Android Chrome already does,
 * firing the same input and change events the native drag would. A tap is
 * left to the browser, and a vertical swipe still scrolls the page without
 * seeking (touch-action: pan-y).
 */
const THUMB = 16; // the scrubber thumb on touch screens, in global.css
const SLOP = 6;

export function touchScrub(range: HTMLInputElement, signal: AbortSignal) {
  let finger: { id: number; x: number; y: number; moving: boolean } | undefined;
  range.style.touchAction = "pan-y";

  const follow = (event: PointerEvent) => {
    const box = range.getBoundingClientRect();
    const min = Number(range.min || 0);
    const max = Number(range.max || 100);
    const step = Number(range.step) || 1;
    const t = Math.max(
      0,
      Math.min(1, (event.clientX - box.left - THUMB / 2) / (box.width - THUMB)),
    );
    const value = String(Math.round((min + t * (max - min)) / step) * step);
    if (value === range.value) return;
    range.value = value;
    range.dispatchEvent(new Event("input", { bubbles: true }));
  };
  const lift = (event: PointerEvent) => {
    if (event.pointerId !== finger?.id) return;
    const moved = finger.moving;
    finger = undefined;
    if (moved) range.dispatchEvent(new Event("change", { bubbles: true }));
  };

  range.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "touch") return;
      finger = { id: event.pointerId, x: event.clientX, y: event.clientY, moving: false };
    },
    { signal },
  );
  range.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerId !== finger?.id) return;
      if (!finger.moving) {
        const dx = Math.abs(event.clientX - finger.x);
        if (dx < SLOP || dx < Math.abs(event.clientY - finger.y)) return;
        finger.moving = true;
      }
      follow(event);
    },
    { signal },
  );
  range.addEventListener("pointerup", lift, { signal });
  range.addEventListener("pointercancel", lift, { signal });
}
