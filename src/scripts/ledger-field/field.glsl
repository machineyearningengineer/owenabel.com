#version 300 es
// Original field by @abel · OpenShaders · https://openshaders.com/@abel
// Ripple gradient adapted from OpenShaders (MIT), as used in the NAIRAA & Chill build.
precision highp float;
precision highp int;

uniform vec2 iResolution;
uniform float iTime;
uniform float uGrainTime;
uniform float uGrainSize;
uniform float uLightMode;
uniform vec3 uDarkBackground;
uniform vec3 uLightBackground;
uniform vec4 uRipples[8];
uniform int uRippleCount;
uniform vec4 uWave;
uniform float uRefraction;
out vec4 fragColor;

const float HUE = 0.625682533;
const float HUE_SPREAD = 0.446564436;
const float HUE_TRAVEL = 1.83343101;
const float CHROMA = 0.160367623;
const float LIGHTNESS = 0.547324479;
const float COLOUR_CYCLE = 0.179977879;
const float THETA = 2.14344549;
const float SHEAR = 0.971200585;
const float SHRINK = 0.957152247;
const float LAYERS = 78.0;
const float WARP_FREQ_X = 0.49568221;
const float WARP_FREQ_Y = 2.41800594;
const float WARP_AMP_X = 0.114199623;
const float WARP_AMP_Y = 0.0275362898;
const float ASPECT_X = 2.52370977;
const float ASPECT_Y = 0.208881482;
const float OFFSET_X = 0.384221137;
const float OFFSET_Y = -0.0223523341;
const float TILT = -2.47300172;
const float ZOOM = 0.992285192;
const float CENTRE_X = -0.508781493;
const float CENTRE_Y = -0.449070275;
const float GLOW_SIZE = 0.00229769154;
const float FALLOFF = 0.310063571;
const float VIGNETTE = 0.122546189;
const float FLOW_SPEED = 0.567834973;
const float BREATH_RATE = 0.581230938;
const float BREATH_AMOUNT = 0.105712391;
const float PHASE = 59.4174309;
const float ECHO = 0.681174695;
const float ECHO_SHIFT = -0.127017483;
const float SOFTNESS = 0.0021388575;
const float LIGHT_SWING = 0.160748288;
const float TAU = 6.28318530718;

vec3 oklchToLinear(float L, float C, float h) {
  float a = C * cos(h), b = C * sin(h);
  float l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  float m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  float s_ = L - 0.0894841775 * a - 1.2914855480 * b;
  vec3 lms = vec3(l_, m_, s_);
  lms = lms * lms * lms;
  return mat3(4.0767416621, -1.2684380046, -0.0041960863,
              -3.3077115913, 2.6097574011, -0.7034186147,
              0.2309699292, -0.3413193965, 1.7076147010) * lms;
}

uvec3 pcg3d(uvec3 v) {
  v = v * 1664525u + 1013904223u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  v ^= v >> 16u;
  v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
  return v;
}

vec2 waveGradient(vec2 p) {
  vec2 grad = vec2(0.0);
  float k = TAU / uWave.y;
  float w2 = uWave.z * uWave.z;
  for (int i = 0; i < 8; i++) {
    if (i >= uRippleCount) break;
    vec4 rp = uRipples[i];
    vec2 dv = p - rp.xy;
    float r = length(dv);
    float front = uWave.x * rp.z;
    float s = r - front;
    float env = exp(-s * s / w2) * exp(-uWave.w * rp.z) * rp.w;
    env *= smoothstep(0.0, 0.35, rp.z) * smoothstep(0.0, uWave.y * 0.7, r);
    env *= inversesqrt(1.0 + front / uWave.y * 0.2);
    if (env < 0.0015) continue;
    float dh = (k * cos(s * k) - 2.0 * s / w2 * sin(s * k)) * env;
    grad += dv / max(r, 1e-4) * dh * uWave.y * 0.16;
  }
  return grad;
}

void main() {
  vec2 R = iResolution.xy;
  vec2 screenPos = (gl_FragCoord.xy - 0.5 * R) / R.y;
  vec2 pos = -(screenPos + waveGradient(screenPos) * uRefraction);
  float t = iTime * FLOW_SPEED + PHASE;
  float breath = (-sin(iTime * BREATH_RATE * 1.5) + sin(iTime * BREATH_RATE + 1.0)) * 0.25 + 0.5;

  vec2 u = (pos - vec2(CENTRE_X, CENTRE_Y)) * (ZOOM - breath * BREATH_AMOUNT);
  float ct = cos(TILT), st = sin(TILT);
  u = mat2(ct, st, -st, ct) * u;
  mat2 fold = mat2(cos(THETA), sin(THETA), -SHEAR, cos(THETA));

  float hue0 = HUE * TAU;
  float hue1 = hue0 + HUE_SPREAD * TAU;
  vec3 color = vec3(0.0);
  for (float i = 1.0; i <= 96.0; i += 1.0) {
    if (i > LAYERS) break;
    u.x += -sin(u.y * WARP_FREQ_X + t + i * 0.007) * WARP_AMP_X;
    u.y += -sin(u.x * WARP_FREQ_Y - t + i * 0.02) * WARP_AMP_Y;
    u = fold * u * SHRINK;
    vec2 q = u - vec2(OFFSET_X + breath * 0.1, OFFSET_Y);
    vec2 s = vec2(q.x * ASPECT_X, q.y * ASPECT_Y);
    float glow = GLOW_SIZE / (dot(s, s) + SOFTNESS);
    vec2 e = vec2((q.x - ECHO_SHIFT) * ASPECT_X, s.y);
    glow += ECHO * GLOW_SIZE / (dot(e, e) + SOFTNESS);
    glow *= 0.25 + breath * 0.4;
    float r = length(u);
    float k = sin(i * COLOUR_CYCLE + t * 1.2 + r * HUE_TRAVEL) * 0.5 + 0.5;
    vec3 tint = clamp(oklchToLinear(LIGHTNESS + LIGHT_SWING * k, CHROMA * (0.75 + 0.35 * k), mix(hue0, hue1, k)), 0.0, 1.0);
    color += glow * tint * exp2(-r * FALLOFF);
  }

  vec3 x = max(color, 0.0);
  color = (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14);
  color = pow(clamp(color, 0.0, 1.0), vec3(0.85, 0.92, 0.98));
  color *= 1.0 - smoothstep(0.5, 1.6, length(pos)) * VIGNETTE;

  vec3 dark = uDarkBackground + color * (1.0 - uDarkBackground);
  float strength = max(color.r, max(color.g, color.b));
  vec3 light = uLightBackground * (1.0 - strength) + color * 0.96;
  color = mix(dark, light, uLightMode);

  float shade = dot(color, vec3(1.0 / 3.0));
  float frame = floor(uGrainTime * 24.0);
  vec2 cell = floor((R - gl_FragCoord.xy) / uGrainSize);
  vec2 noise = vec2(pcg3d(uvec3(uvec2(cell), uint(frame))).xy) / 4294967295.0;
  color += (noise.x + noise.y - 1.0) * (0.016 + 0.045 * 4.0 * shade * (1.0 - shade));
  fragColor = vec4(clamp(color, 0.0, 1.0), 1.0);
}
