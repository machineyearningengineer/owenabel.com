/**
 * Owen's head looks toward the cursor. The sprite is one row of 9 frames:
 * [looking at you, then 8 directions clockwise from straight up].
 * With no cursor (or a still one) it glances around on its own; a tap spins it.
 */
const DIRECTIONS = 8;
const NEAR = 48;
const IDLE_AFTER = 2800;

export function mountOwenHead(head: HTMLElement, signal: AbortSignal) {
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let frame = 0;
  let lastMove = 0;
  let idleTimer = 0;
  let spinning = false;

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
    if (reducedMotion.matches || spinning) return;
    idleTimer = window.setTimeout(
      () => {
        if (performance.now() - lastMove > IDLE_AFTER) {
          show(frame === 0 ? 1 + Math.floor(Math.random() * DIRECTIONS) : 0);
        }
        idle();
      },
      1400 + Math.random() * 1600,
    );
  };

  const spin = () => {
    if (spinning || reducedMotion.matches) return;
    spinning = true;
    let step = 0;
    const turn = window.setInterval(() => {
      show(1 + ((2 + step) % DIRECTIONS));
      step += 1;
      if (step > DIRECTIONS) {
        window.clearInterval(turn);
        spinning = false;
        show(0);
        idle();
      }
    }, 70);
  };

  document.addEventListener(
    "pointermove",
    (event) => {
      if (event.pointerType !== "mouse" || spinning || reducedMotion.matches) return;
      lastMove = performance.now();
      lookAt(event.clientX, event.clientY);
    },
    { passive: true, signal },
  );
  head.addEventListener("click", spin, { signal });
  signal.addEventListener("abort", () => window.clearTimeout(idleTimer));

  // Show the head once the sheet has decoded, so it never appears half-loaded.
  const sheet = new Image();
  sheet.src = "/owen-head-sprite.webp";
  void sheet.decode().then(() => {
    if (signal.aborted) return;
    head.dataset.ready = "true";
    idle();
  });
}
