import fragmentSource from "./field.glsl?raw";

const vertexSource = `#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}`;

// Taps on these keep their normal behaviour and never start a ripple.
const controls = "a, button, input, textarea, select, label, summary, [role='button']";
const PAPER = { light: [0.937, 0.937, 0.925], dark: [0.067, 0.071, 0.075] } as const;
const PIXEL_BUDGET = 700_000;
const FRAME_MS = 33;
const RIPPLE_LIFE = 5.25;

type Ripple = { x: number; y: number; born: number };

function compile(gl: WebGL2RenderingContext, kind: number, source: string) {
  const shader = gl.createShader(kind);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) return shader;
  gl.deleteShader(shader);
  return null;
}

function createProgram(gl: WebGL2RenderingContext) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, fragmentSource);
  if (!vertex || !fragment) return null;
  const program = gl.createProgram();
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (gl.getProgramParameter(program, gl.LINK_STATUS)) return program;
  gl.deleteProgram(program);
  return null;
}

const isDark = () => document.documentElement.dataset.theme === "dark";

/** Paints the @abel field behind `surface`; taps on the surface send an ink ripple through it. */
export function mountLedgerField(canvas: HTMLCanvasElement, surface: HTMLElement) {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: false,
    powerPreference: "low-power",
  });
  const program = gl && createProgram(gl);
  if (!gl || !program) return;
  gl.useProgram(program);

  const uniform = (name: string) => gl.getUniformLocation(program, name);
  const u = {
    resolution: uniform("iResolution"),
    time: uniform("iTime"),
    grainTime: uniform("uGrainTime"),
    grainSize: uniform("uGrainSize"),
    lightMode: uniform("uLightMode"),
    ripples: uniform("uRipples"),
    rippleCount: uniform("uRippleCount"),
    wave: uniform("uWave"),
    refraction: uniform("uRefraction"),
  };
  gl.uniform3fv(uniform("uDarkBackground"), PAPER.dark);
  gl.uniform3fv(uniform("uLightBackground"), PAPER.light);

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const rippleValues = new Float32Array(32);
  let ripples: Ripple[] = [];
  let elapsed = 2;
  let last = 0;
  let frame = 0;
  let visible = true;
  let lost = false;

  const resize = () => {
    const { width, height } = canvas.getBoundingClientRect();
    const scale = Math.min(devicePixelRatio, Math.sqrt(PIXEL_BUDGET / Math.max(width * height, 1)));
    canvas.width = Math.max(1, Math.round(width * scale));
    canvas.height = Math.max(1, Math.round(height * scale));
    gl.viewport(0, 0, canvas.width, canvas.height);
  };

  const draw = () => {
    const rect = canvas.getBoundingClientRect();
    const height = Math.max(rect.height, 1);
    ripples = ripples.filter((ripple) => elapsed - ripple.born < RIPPLE_LIFE);
    ripples.forEach((ripple, index) => {
      rippleValues.set(
        [
          (ripple.x - rect.left - rect.width / 2) / height,
          (rect.height / 2 - ripple.y + rect.top) / height,
          elapsed - ripple.born,
          1,
        ],
        index * 4,
      );
    });
    gl.uniform4fv(u.ripples, rippleValues);
    gl.uniform1i(u.rippleCount, ripples.length);
    gl.uniform4f(u.wave, 260 / height, 190 / height, 190 / height, 0.85);
    gl.uniform1f(u.refraction, 42 / height);
    gl.uniform2f(u.resolution, canvas.width, canvas.height);
    gl.uniform1f(u.grainSize, Math.max(1, (canvas.width / Math.max(canvas.clientWidth, 1)) * 1.4));
    gl.uniform1f(u.lightMode, isDark() ? 0 : 1);
    gl.uniform1f(u.time, 2 + (elapsed - 2) * 0.6);
    gl.uniform1f(u.grainTime, elapsed);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  };

  const animating = () => !lost && visible && !document.hidden && !reducedMotion.matches;

  const tick = (now: number) => {
    frame = requestAnimationFrame(tick);
    if (now - last < FRAME_MS) return;
    elapsed += Math.min(now - last, 100) / 1000;
    last = now;
    draw();
  };

  const update = () => {
    cancelAnimationFrame(frame);
    if (lost) return;
    resize();
    if (!animating()) ripples = [];
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
      const moved = Math.hypot(event.clientX - start.x, event.clientY - start.y);
      if (moved > 10 || performance.now() - start.at > 600) return;
      if (ripples.length === 8) ripples.shift();
      ripples.push({ x: event.clientX, y: event.clientY, born: elapsed });
    },
    { passive: true },
  );

  new IntersectionObserver(([entry]) => {
    visible = entry?.isIntersecting ?? false;
    update();
  }).observe(canvas);
  new ResizeObserver(update).observe(canvas);
  new MutationObserver(() => draw()).observe(document.documentElement, {
    attributeFilter: ["data-theme"],
  });
  document.addEventListener("visibilitychange", update);
  reducedMotion.addEventListener("change", update);
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
    lost = true;
    cancelAnimationFrame(frame);
    canvas.dataset.ready = "false";
  });
}
