// Edge routing shared by ArchitectureDiagram and ArchitectureCompare.
// Coordinates are in viewBox units. An edge routes side to side or top to
// bottom with one elbow, chosen from where the two boxes sit.
export type Rect = { x: number; y: number; w: number; h: number };
export type Route = { d: string; lx: number; ly: number; start?: boolean };

export const BOX_HEIGHT = 52;

export function route(a: Rect, b: Rect): Route {
  const horizontal = a.x + a.w <= b.x || b.x + b.w <= a.x;
  if (horizontal) {
    const right = a.x + a.w <= b.x;
    const x1 = right ? a.x + a.w : a.x;
    const x2 = right ? b.x : b.x + b.w;
    const y1 = a.y + a.h / 2;
    const y2 = b.y + b.h / 2;
    const mx = (x1 + x2) / 2;
    const d = y1 === y2 ? `M${x1} ${y1}H${x2}` : `M${x1} ${y1}H${mx}V${y2}H${x2}`;
    return { d, lx: mx, ly: (y1 + y2) / 2 - 7 };
  }
  const down = a.y + a.h <= b.y;
  const y1 = down ? a.y + a.h : a.y;
  const y2 = down ? b.y : b.y + b.h;
  // Use the overlap of the two boxes for a straight vertical line when there is one.
  const lo = Math.max(a.x, b.x);
  const hi = Math.min(a.x + a.w, b.x + b.w);
  if (hi - lo > 20) {
    const x = (lo + hi) / 2;
    return { d: `M${x} ${y1}V${y2}`, lx: x + 8, ly: (y1 + y2) / 2 + 4, start: true };
  }
  const x1 = a.x + a.w / 2;
  const x2 = b.x + b.w / 2;
  const my = (y1 + y2) / 2;
  return { d: `M${x1} ${y1}V${my}H${x2}V${y2}`, lx: (x1 + x2) / 2, ly: my - 7 };
}
