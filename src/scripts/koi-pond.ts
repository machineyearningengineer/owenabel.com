/**
 * Ink koi swimming under the ledger paper. Tap the paper to ripple the water;
 * nearby fish dart away. Drawn on a 2D canvas in the page's own ink and accent.
 */
const SEGMENTS = 16;
const RIPPLE_LIFE = 1.8;
// Taps on these keep their normal behaviour and never ripple the pond.
const controls = "a, button, input, textarea, select, label, summary, [role='button']";

type Fish = {
  x: number;
  y: number;
  heading: number;
  turn: number;
  speed: number;
  boost: number;
  size: number;
  spine: { x: number; y: number }[];
  spots: number[];
};
type Ripple = { x: number; y: number; born: number };

const random = (min: number, max: number) => min + Math.random() * (max - min);

function spawn(width: number, height: number): Fish {
  const x = random(width * 0.1, width * 0.9);
  const y = random(height * 0.1, height * 0.9);
  const heading = random(0, Math.PI * 2);
  const size = random(1.5, 2.1);
  return {
    x,
    y,
    heading,
    turn: random(-0.4, 0.4),
    speed: random(16, 26),
    boost: 0,
    size,
    spine: Array.from({ length: SEGMENTS }, (_, i) => ({
      x: x - Math.cos(heading) * i * 5 * size,
      y: y - Math.sin(heading) * i * 5 * size,
    })),
    spots: [2, 5, 8]
      .map((index) => index + Math.floor(random(0, 2)))
      .slice(0, Math.random() < 0.5 ? 2 : 3),
  };
}

/** Half-width of the body at spine index i: full behind the head, tapering to the tail. */
const bodyWidth = (i: number, size: number) => {
  const t = i / (SEGMENTS - 1);
  return (
    (t < 0.22
      ? 0.62 + Math.sin((t / 0.22) * Math.PI * 0.5) * 0.38
      : Math.cos(((t - 0.22) / 0.78) * Math.PI * 0.5) ** 0.8) *
    10 *
    size
  );
};

export function mountKoiPond(canvas: HTMLCanvasElement, surface: HTMLElement, signal: AbortSignal) {
  const ctx = canvas.getContext("2d");
  const count = Number(canvas.dataset.fish ?? 5);
  if (!ctx) return;
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let width = 0;
  let height = 0;
  let fish: Fish[] = [];
  let ripples: Ripple[] = [];
  let ink = "#11110f";
  let accent = "#7b2f1d";
  let clock = 0;
  let last = 0;
  let frame = 0;
  let visible = true;

  const readColours = () => {
    const style = getComputedStyle(document.documentElement);
    ink = style.getPropertyValue("--ink").trim() || ink;
    accent = style.getPropertyValue("--accent").trim() || accent;
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio, 2);
    width = rect.width;
    height = rect.height;
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    if (fish.length === 0 && width > 0)
      fish = Array.from({ length: width < 600 ? Math.min(3, count) : count }, () =>
        spawn(width, height),
      );
  };

  const swim = (f: Fish, dt: number) => {
    // Wander, and turn back toward the pond when near an edge.
    f.turn += random(-1, 1) * dt * 1.2;
    f.turn = Math.max(-0.8, Math.min(0.8, f.turn));
    const margin = 90;
    const toCentre = Math.atan2(height / 2 - f.y, width / 2 - f.x);
    if (f.x < margin || f.x > width - margin || f.y < margin || f.y > height - margin) {
      const delta = Math.atan2(Math.sin(toCentre - f.heading), Math.cos(toCentre - f.heading));
      f.turn += delta * dt * 2.4;
    }
    f.heading += f.turn * dt;
    f.boost *= Math.exp(-dt * 1.6);
    const speed = f.speed * (1 + f.boost);
    f.x += Math.cos(f.heading) * speed * dt;
    f.y += Math.sin(f.heading) * speed * dt;
    // The spine follows the head like a chain.
    f.spine[0] = { x: f.x, y: f.y };
    const gap = 5 * f.size;
    for (let i = 1; i < SEGMENTS; i += 1) {
      const prev = f.spine[i - 1]!;
      const cur = f.spine[i]!;
      const angle = Math.atan2(cur.y - prev.y, cur.x - prev.x);
      f.spine[i] = { x: prev.x + Math.cos(angle) * gap, y: prev.y + Math.sin(angle) * gap };
    }
  };

  const drawFish = (f: Fish) => {
    const left: { x: number; y: number }[] = [];
    const right: { x: number; y: number }[] = [];
    f.spine.forEach((p, i) => {
      const next = f.spine[Math.min(i + 1, SEGMENTS - 1)]!;
      const prev = f.spine[Math.max(i - 1, 0)]!;
      const angle = Math.atan2(prev.y - next.y, prev.x - next.x) + Math.PI / 2;
      const w = bodyWidth(i, f.size);
      left.push({ x: p.x + Math.cos(angle) * w, y: p.y + Math.sin(angle) * w });
      right.push({ x: p.x - Math.cos(angle) * w, y: p.y - Math.sin(angle) * w });
    });
    const tail = f.spine[SEGMENTS - 1]!;
    const beforeTail = f.spine[SEGMENTS - 3]!;
    const tailAngle = Math.atan2(tail.y - beforeTail.y, tail.x - beforeTail.x);
    const sway = Math.sin(clock * 6 + f.size * 10) * 0.35;

    ctx.fillStyle = ink;
    ctx.globalAlpha = 0.13;
    // Pectoral fins.
    const fin = f.spine[3]!;
    const finAngle = Math.atan2(f.spine[2]!.y - f.spine[4]!.y, f.spine[2]!.x - f.spine[4]!.x);
    for (const side of [1, -1]) {
      ctx.beginPath();
      ctx.ellipse(
        fin.x + Math.cos(finAngle + side * 1.9) * 9 * f.size,
        fin.y + Math.sin(finAngle + side * 1.9) * 9 * f.size,
        7 * f.size,
        3 * f.size,
        finAngle + side * 2.3,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
    // Tail fin.
    ctx.beginPath();
    ctx.moveTo(tail.x, tail.y);
    for (const side of [1, -1]) {
      const a = tailAngle + side * 0.55 + sway;
      ctx.quadraticCurveTo(
        tail.x + Math.cos(tailAngle + sway) * 12 * f.size,
        tail.y + Math.sin(tailAngle + sway) * 12 * f.size,
        tail.x + Math.cos(a) * 18 * f.size,
        tail.y + Math.sin(a) * 18 * f.size,
      );
      ctx.lineTo(tail.x, tail.y);
    }
    ctx.fill();
    // Body.
    ctx.globalAlpha = 0.2;
    ctx.beginPath();
    ctx.moveTo(left[0]!.x, left[0]!.y);
    for (const p of left) ctx.lineTo(p.x, p.y);
    for (let i = right.length - 1; i >= 0; i -= 1) ctx.lineTo(right[i]!.x, right[i]!.y);
    ctx.closePath();
    ctx.fill();
    // Spots in the site's accent.
    ctx.fillStyle = accent;
    ctx.globalAlpha = 0.32;
    for (const index of f.spots) {
      const p = f.spine[index]!;
      ctx.beginPath();
      ctx.arc(p.x, p.y, bodyWidth(index, f.size) * 0.62, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  };

  const drawRipples = () => {
    ctx.strokeStyle = ink;
    for (const r of ripples) {
      const age = (clock - r.born) / RIPPLE_LIFE;
      for (const lag of [0, 0.18, 0.36]) {
        const t = age - lag;
        if (t <= 0 || t >= 1) continue;
        ctx.globalAlpha = (1 - t) * 0.22;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 12 + t * 150, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
  };

  const draw = () => {
    ctx.clearRect(0, 0, width, height);
    drawRipples();
    for (const f of fish) drawFish(f);
  };

  const animating = () => visible && !document.hidden && !reducedMotion.matches;

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    clock += dt;
    ripples = ripples.filter((r) => clock - r.born < RIPPLE_LIFE);
    for (const f of fish) swim(f, dt);
    draw();
  };

  const update = () => {
    cancelAnimationFrame(frame);
    readColours();
    resize();
    draw();
    canvas.dataset.ready = "true";
    if (!animating()) return;
    last = performance.now();
    frame = requestAnimationFrame(tick);
  };

  let tap: { id: number; x: number; y: number; at: number } | null = null;
  surface.addEventListener(
    "pointerdown",
    (event) => {
      const onControl = event.target instanceof Element && event.target.closest(controls);
      tap =
        event.isPrimary && event.button === 0 && !onControl
          ? { id: event.pointerId, x: event.clientX, y: event.clientY, at: performance.now() }
          : null;
    },
    { passive: true },
  );
  surface.addEventListener(
    "pointerup",
    (event) => {
      const start = tap;
      tap = null;
      if (!start || start.id !== event.pointerId || !animating()) return;
      if (Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10) return;
      if (performance.now() - start.at > 600) return;
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      ripples.push({ x, y, born: clock });
      for (const f of fish) {
        const distance = Math.hypot(f.x - x, f.y - y);
        if (distance > 240) continue;
        f.heading = Math.atan2(f.y - y, f.x - x) + random(-0.4, 0.4);
        f.turn = 0;
        f.boost = 5 * (1 - distance / 240) + 1;
      }
    },
    { passive: true },
  );

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    update();
  });
  intersection.observe(canvas);
  const resizer = new ResizeObserver(update);
  resizer.observe(canvas);
  const themeWatcher = new MutationObserver(() => {
    readColours();
    draw();
  });
  themeWatcher.observe(document.documentElement, { attributeFilter: ["data-theme"] });
  document.addEventListener("visibilitychange", update, { signal });
  reducedMotion.addEventListener("change", update, { signal });
  // Leaving the page: stop drawing and let go of every observer.
  signal.addEventListener("abort", () => {
    cancelAnimationFrame(frame);
    intersection.disconnect();
    resizer.disconnect();
    themeWatcher.disconnect();
  });
}
