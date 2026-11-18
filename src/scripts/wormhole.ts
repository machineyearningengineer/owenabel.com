/**
 * Scroll-driven tunnel of exhibit tiles, built from CSS 3D transforms.
 * Rings of tiles sit on a cylinder; scrolling moves them toward the viewer and
 * recycles each ring to the back once it passes the camera.
 */
const PER_RING = 12;
const RINGS = 14;

export function mountWormhole(section: HTMLElement) {
  const tunnel = section.querySelector<HTMLElement>(".wormhole");
  const stage = section.querySelector<HTMLElement>("[data-wormhole-stage]");
  const tube = section.querySelector<HTMLElement>("[data-wormhole-tube]");
  const sources = [...section.querySelectorAll<HTMLAnchorElement>("[data-exhibit]")];
  if (!tunnel || !stage || !tube || sources.length === 0) return;

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const rings: HTMLElement[] = [];

  for (let ring = 0; ring < RINGS; ring += 1) {
    const el = document.createElement("div");
    el.className = "wormhole-ring";
    for (let slot = 0; slot < PER_RING; slot += 1) {
      const source = sources[(ring * 5 + slot * 7) % sources.length];
      const img = source?.querySelector("img");
      if (!source || !img) continue;
      const tile = document.createElement("a");
      tile.className = "wormhole-tile";
      tile.href = source.href;
      tile.tabIndex = -1;
      const angle = (360 / PER_RING) * slot + (ring % 2) * 15;
      tile.style.setProperty("--angle", `${angle}deg`);
      // Keep text the right way up on the ceiling half of the tunnel.
      if (angle > 90 && angle < 270) tile.dataset.flip = "";
      const copy = document.createElement("img");
      copy.src = img.currentSrc || img.src;
      copy.alt = "";
      copy.decoding = "async";
      tile.append(copy);
      el.append(tile);
    }
    tube.append(el);
    rings.push(el);
  }

  let radius = 0;
  let spacing = 0;
  let perspective = 0;
  let frame = 0;

  const measure = () => {
    const { width, height } = stage.getBoundingClientRect();
    radius = Math.max(170, Math.min(width, height) * (width < 600 ? 0.72 : 0.62));
    const tileWidth = 2 * radius * Math.tan(Math.PI / PER_RING) * 1.01;
    spacing = tileWidth * 0.66;
    perspective = Math.max(width, height) * 0.62;
    stage.style.perspective = `${perspective}px`;
    tube.style.setProperty("--radius", `${radius}px`);
    tube.style.setProperty("--tile-w", `${tileWidth}px`);
    tube.style.setProperty("--tile-d", `${spacing * 0.96}px`);
  };

  const render = () => {
    frame = 0;
    const rect = tunnel.getBoundingClientRect();
    const travel = Math.max(rect.height - innerHeight, 1);
    const progress = Math.min(Math.max(-rect.top / travel, 0), 1);
    const length = spacing * RINGS;
    const distance = progress * length * 2.2;
    const nearest = perspective * 0.55;
    tube.style.transform = `rotateZ(${progress * 50}deg)`;
    rings.forEach((ring, index) => {
      // Wrap each ring into [nearest - length, nearest) so the tunnel never ends.
      let z = -index * spacing + distance;
      z = ((((z - nearest) % length) + length) % length) - length + nearest;
      const depth = (nearest - z) / length;
      ring.style.transform = `translateZ(${z}px)`;
      ring.style.setProperty(
        "--fade",
        String(Math.min(1, (1 - depth) * 1.6) * Math.min(1, depth * 9)),
      );
    });
  };

  const queue = () => {
    if (!frame) frame = requestAnimationFrame(render);
  };

  const update = () => {
    section.dataset.mode = reducedMotion.matches ? "still" : "tunnel";
    measure();
    render();
  };

  addEventListener("scroll", queue, { passive: true });
  new ResizeObserver(update).observe(stage);
  reducedMotion.addEventListener("change", update);
  update();
}
