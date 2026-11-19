/**
 * Owen's head looks toward the cursor. The sprite is one row of 14 frames
 * (assets/owen-head):
 *   0 looking at you, 1–8 directions clockwise from straight up,
 *   9 wince, 10 teary, 11 annoyed, 12 sigh, 13 shocked.
 * With no cursor (or a still one) it glances around on its own. On touch
 * screens it looks toward where you touch and glances the way you scroll.
 * Clicks escalate within a few seconds: wince, then teary, then annoyed with
 * a cartoon vein, then a sigh, and back to normal. Playing the voice line
 * (any [data-play]) gets a shocked double-take.
 */
const DIRECTIONS = 8;
const WINCE = 9;
const TEARY = 10;
const ANNOYED = 11;
const SIGH = 12;
const SHOCKED = 13;
const NEAR = 48;
const IDLE_AFTER = 2800;
const WINCE_MS = 420;
const TEARY_MS = 1100;
const TEARY_AFTER_CLICKS = 3;
const ANNOY_AFTER_CLICKS = 5;
const CLICK_WINDOW_MS = 4000;
const ANNOYED_MS = 1800;
const SIGH_MS = 1000;
const SHOCKED_MS = 1100;

// Options: `rest` is the face it returns to (the 404 rests shocked) and
// `still` turns off looking around, so only clicks change the face.
export function mountOwenHead(
  head: HTMLElement,
  signal: AbortSignal,
  { rest = 0, still = false } = {},
) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = rest;
  let lastMove = 0;
  let idleTimer = 0;
  let moodTimer = 0;
  let busy = false;
  let clicks: number[] = [];

  const show = (next: number) => {
    if (next === frame) return;
    frame = next;
    head.style.setProperty("--frame", String(next));
  };

  const lookAt = (x: number, y: number) => {
    const rect = head.getBoundingClientRect();
    const dx = x - (rect.left + rect.width / 2);
    const dy = y - (rect.top + rect.height / 2);
    if (Math.hypot(dx, dy) < NEAR) return show(0);
    const angle = (Math.atan2(dx, -dy) + Math.PI * 2) % (Math.PI * 2);
    show(1 + (Math.round(angle / ((Math.PI * 2) / DIRECTIONS)) % DIRECTIONS));
  };

  // Glance in a random direction now and then, coming back to face the reader.
  const idle = () => {
    window.clearTimeout(idleTimer);
    if (reducedMotion.matches || still) return;
    idleTimer = window.setTimeout(
      () => {
        if (!busy && performance.now() - lastMove > IDLE_AFTER) {
          show(frame === 0 ? 1 + Math.floor(Math.random() * DIRECTIONS) : 0);
        }
        idle();
      },
      1400 + Math.random() * 1600,
    );
  };

  const settle = () => {
    busy = false;
    delete head.dataset.mood;
    show(rest);
  };

  const feel = (mood: string, next: number, ms: number, then: () => void) => {
    window.clearTimeout(moodTimer);
    busy = true;
    head.dataset.mood = mood;
    show(next);
    moodTimer = window.setTimeout(then, ms);
  };

  // Hold the anger, sigh it out, then relax.
  const coolDown = () => feel("sigh", SIGH, SIGH_MS, settle);

  const poke = () => {
    const mood = head.dataset.mood;
    if (mood === "annoyed" || mood === "sigh") return;
    const now = performance.now();
    clicks = [...clicks.filter((at) => now - at < CLICK_WINDOW_MS), now];
    if (clicks.length >= ANNOY_AFTER_CLICKS) {
      clicks = [];
      feel("annoyed", ANNOYED, ANNOYED_MS, coolDown);
    } else if (clicks.length >= TEARY_AFTER_CLICKS) {
      feel("teary", TEARY, TEARY_MS, settle);
    } else {
      feel("wince", WINCE, WINCE_MS, settle);
    }
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (still || event.pointerType !== "mouse" || busy || reducedMotion.matches) return;
      lastMove = performance.now();
      lookAt(event.clientX, event.clientY);
    },
    { passive: true, signal },
  );
  // Phones have no cursor: the head looks toward where you touch the page,
  // and glances the way you scroll, then settles back to face you.
  let settleTimer = 0;
  const glance = (next: () => void, ms: number) => {
    if (still || busy || reducedMotion.matches) return;
    lastMove = performance.now();
    next();
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => !busy && show(0), ms);
  };
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType === "mouse" || head.contains(event.target as Node)) return;
      glance(() => lookAt(event.clientX, event.clientY), 1400);
    },
    { passive: true, signal },
  );
  let lastY = window.scrollY;
  let onScreen = false;
  const seen = new IntersectionObserver(([entry]) => (onScreen = Boolean(entry?.isIntersecting)));
  seen.observe(head);
  window.addEventListener(
    "scroll",
    () => {
      const y = window.scrollY;
      const delta = y - lastY;
      lastY = y;
      if (!onScreen || Math.abs(delta) < 4 || matchMedia("(hover: hover)").matches) return;
      // Frame 5 looks down, frame 1 looks up.
      glance(() => show(delta > 0 ? 5 : 1), 500);
    },
    { passive: true, signal },
  );
  head.addEventListener("click", poke, { signal });
  document.addEventListener(
    "click",
    (event) => {
      const mood = head.dataset.mood;
      const played = event.target instanceof Element && event.target.closest("[data-play]");
      if (played && mood !== "annoyed" && mood !== "sigh")
        feel("shocked", SHOCKED, SHOCKED_MS, settle);
    },
    { signal },
  );
  signal.addEventListener("abort", () => {
    window.clearTimeout(idleTimer);
    window.clearTimeout(moodTimer);
    window.clearTimeout(settleTimer);
    seen.disconnect();
  });

  // Show the head once the sheet has decoded, so it never appears half-loaded.
  const sheet = new Image();
  sheet.src = "/owen-head-sprite.webp";
  void sheet.decode().then(() => {
    if (signal.aborted) return;
    head.dataset.ready = "true";
    idle();
  });
}
