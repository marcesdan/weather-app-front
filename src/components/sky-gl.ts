import type { Sky } from "@/lib/sky";

// One full-screen fragment shader, no library. GLSL ES 1.0 so it runs on WebGL1 and every Android WebView we support.
const FRAG = `
precision mediump float;
uniform vec2 uRes;
uniform float uTime, uDay, uGolden, uCloud, uRain, uSnow, uStorm, uFog, uFlash;
uniform vec2 uSun, uWind;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), u.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.03 + 17.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float aspect = uRes.x / uRes.y;
  vec2 p = vec2(uv.x * aspect, uv.y);
  vec2 drift = uWind * 0.004 * uTime; // clouds travel with the real wind

  // Sky: night indigo -> day blue, warmed at the horizon around sunrise and sunset, greyed by overcast.
  vec3 nightTop = vec3(0.02, 0.035, 0.10), nightLow = vec3(0.07, 0.09, 0.20);
  vec3 dayTop = vec3(0.10, 0.31, 0.64), dayLow = vec3(0.34, 0.55, 0.80);
  vec3 sky = mix(mix(nightLow, nightTop, uv.y), mix(dayLow, dayTop, uv.y), uDay);
  sky = mix(sky, vec3(0.96, 0.55, 0.30), uGolden * pow(1.0 - uv.y, 2.5) * 0.7);
  float grey = clamp(uCloud * 0.7 + uStorm * 0.3 + uRain * 0.2, 0.0, 1.0);
  vec3 overcast = mix(vec3(0.10, 0.12, 0.16), vec3(0.30, 0.34, 0.41), uDay) * (1.0 - 0.45 * uStorm);
  sky = mix(sky, overcast, grey * 0.85);

  // Stars and moon at night; sun by day. Both fade behind cloud.
  vec2 g = floor(p * 90.0);
  float star = step(0.995, hash(g)) * smoothstep(0.22, 0.0, length(fract(p * 90.0) - 0.5)) * (0.6 + 0.4 * sin(uTime * 2.0 + hash(g + 3.0) * 30.0));
  sky += star * (1.0 - uDay) * (1.0 - uCloud) * smoothstep(0.25, 0.8, uv.y);
  // The sun rises at the sides and passes above the top edge at noon, so its glow frames the reading
  // instead of sitting behind it. The moon keeps to the upper right.
  vec2 sp = mix(vec2(0.86 * aspect, 0.8), vec2(uSun.x * aspect, 0.16 + 0.98 * uSun.y), step(0.001, uDay));
  float d = length(p - sp);
  vec3 sunCol = mix(vec3(1.0, 0.72, 0.42), vec3(1.0, 0.95, 0.82), uSun.y);
  float clear = 1.0 - uCloud * 0.85;
  sky += uDay * clear * (sunCol * smoothstep(0.06, 0.045, d) + sunCol * 0.4 * exp(-d * 3.5));
  sky += (1.0 - uDay) * clear * vec3(0.85, 0.88, 0.95) * (smoothstep(0.035, 0.03, d) + 0.12 * exp(-d * 9.0));

  // Two cloud decks, coverage from the reported cloud percentage.
  float cover = 1.0 - uCloud;
  float c1 = smoothstep(cover - 0.05, cover + 0.30, fbm(p * vec2(1.6, 3.2) + drift + vec2(0.0, uTime * 0.002)));
  float c2 = smoothstep(cover + 0.05, cover + 0.40, fbm(p * vec2(3.0, 5.0) + drift * 1.6 + 40.0));
  // A full deck is a heavy, darker grey (that is what overcast looks like, and white text stays legible on it).
  vec3 lit = mix(vec3(0.30, 0.33, 0.42), vec3(0.72, 0.75, 0.82), uDay) * (1.0 - 0.55 * uStorm) * (1.0 - 0.38 * uCloud * uDay);
  lit = mix(lit, vec3(1.0, 0.75, 0.6), uGolden * 0.35);
  vec3 shade = lit * mix(0.55, 0.75, uDay);
  vec3 cloudCol = mix(shade, lit, smoothstep(0.2, 0.9, uv.y));
  cloudCol += uFlash * vec3(0.9, 0.9, 1.0); // lightning lights the clouds from inside
  sky = mix(sky, cloudCol, c1 * 0.85);
  sky = mix(sky, cloudCol * 1.05, c2 * 0.6);

  // Rain: thin streaks tilted by the wind, three depths.
  float tilt = clamp(uWind.x * 0.035, -0.6, 0.6);
  float rain = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 q = vec2(p.x + p.y * tilt, p.y) * vec2(70.0 + fi * 35.0, 2.5 + fi);
    q.y += uTime * (9.0 + fi * 4.0);
    vec2 cell = floor(q);
    float h = hash(cell + fi * 7.0);
    float x = abs(fract(q.x) - h);
    float drop = smoothstep(0.06, 0.0, x) * smoothstep(0.0, 0.5, fract(q.y)) * step(1.0 - uRain * 0.9, h);
    rain += drop * (0.35 + fi * 0.15);
  }
  sky = mix(sky, vec3(0.80, 0.86, 0.95), clamp(rain, 0.0, 1.0) * 0.55 * uRain);

  // Snow: soft flakes drifting with the wind.
  float snow = 0.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 q = p * (10.0 + fi * 8.0);
    q.y += uTime * (0.6 + fi * 0.35);
    q.x += uTime * uWind.x * 0.05 + sin(uTime * 0.7 + q.y * 0.8) * 0.3;
    vec2 cell = floor(q);
    vec2 o = vec2(hash(cell), hash(cell + 9.0));
    float f = smoothstep(0.09 - fi * 0.02, 0.0, length(fract(q) - o)) * step(0.45, hash(cell + 3.0));
    snow += f;
  }
  sky = mix(sky, vec3(1.0), clamp(snow, 0.0, 1.0) * uSnow * 0.85);

  // Fog: a pale band that thickens toward the ground.
  sky = mix(sky, mix(vec3(0.22, 0.24, 0.28), vec3(0.44, 0.47, 0.52), uDay), uFog * (0.55 + 0.45 * (1.0 - uv.y)));

  // Keep white text legible near the top: a gentle deepening of the upper sky.
  sky *= 1.0 - 0.22 * smoothstep(0.45, 1.0, uv.y);
  sky *= mix(1.0, 0.8, uDay); // daylight exposure: small white text holds 4.5:1 over open sky
  gl_FragColor = vec4(sky + uFlash * 0.25, 1.0);
}`;

const VERT = `attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }`;

type Uniforms = Record<string, WebGLUniformLocation | null>;
const KEYS = ["uRes", "uTime", "uDay", "uGolden", "uCloud", "uRain", "uSnow", "uStorm", "uFog", "uFlash", "uSun", "uWind"];

export type SkyHandle = { set(sky: Sky): void; stop(): void } | null;

// Draws at a fraction of the CSS size: a sky is soft, and this keeps phones cool.
const SCALE = 0.6;
const EASE_MS = 1200;

export function startSky(canvas: HTMLCanvasElement, initial: Sky): SkyHandle {
  const gl = canvas.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" });
  if (!gl) return null;
  const prog = gl.createProgram()!;
  for (const [type, src] of [
    [gl.VERTEX_SHADER, VERT],
    [gl.FRAGMENT_SHADER, FRAG],
  ] as const) {
    const s = gl.createShader(type)!;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
    gl.attachShader(prog, s);
  }
  gl.linkProgram(prog);
  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const u: Uniforms = Object.fromEntries(KEYS.map((k) => [k, gl.getUniformLocation(prog, k)]));

  const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let from = { ...initial };
  let to = { ...initial };
  let changedAt = 0;
  let raf = 0;
  let running = false;
  let flash = 0;
  let nextFlash = 3;
  const t0 = performance.now();

  const mix = (a: Sky, b: Sky, k: number) =>
    Object.fromEntries(Object.keys(b).map((key) => [key, a[key as keyof Sky] + (b[key as keyof Sky] - a[key as keyof Sky]) * k])) as Sky;

  const resize = () => {
    const w = Math.round(canvas.clientWidth * SCALE);
    const h = Math.round(canvas.clientHeight * SCALE);
    if (canvas.width !== w || canvas.height !== h) ((canvas.width = w), (canvas.height = h));
    return w > 0 && h > 0;
  };

  const draw = (now: number) => {
    if (!resize()) return false; // hidden in Ionic's stack: nothing to draw
    const time = (now - t0) / 1000;
    const k = Math.min(1, (now - changedAt) / EASE_MS);
    const e = 1 - Math.pow(1 - k, 3);
    const s = mix(from, to, e);
    if (s.storm > 0.5 && !still && time > nextFlash) {
      flash = 1;
      nextFlash = time + 3 + Math.random() * 7;
    }
    flash *= 0.86;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.uniform2f(u.uRes, canvas.width, canvas.height);
    gl.uniform1f(u.uTime, still ? 40 : time);
    gl.uniform1f(u.uDay, s.day);
    gl.uniform1f(u.uGolden, s.golden);
    gl.uniform1f(u.uCloud, s.cloud);
    gl.uniform1f(u.uRain, s.rain);
    gl.uniform1f(u.uSnow, s.snow);
    gl.uniform1f(u.uStorm, s.storm);
    gl.uniform1f(u.uFog, s.fog);
    gl.uniform1f(u.uFlash, flash * s.storm);
    gl.uniform2f(u.uSun, s.sunX, s.sunY);
    gl.uniform2f(u.uWind, s.windX, s.windY);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    return true;
  };

  const loop = (now: number) => {
    if (!draw(now) || document.hidden) {
      running = false;
      return;
    }
    // Reduced motion: keep drawing only while a change eases in, then stop on one still frame.
    if (still && now - changedAt > EASE_MS) {
      running = false;
      return;
    }
    raf = requestAnimationFrame(loop);
  };
  const wake = () => {
    if (running) return;
    running = true;
    raf = requestAnimationFrame(loop);
  };

  const ro = new ResizeObserver(wake); // also resumes when Ionic shows the page again
  ro.observe(canvas);
  document.addEventListener("visibilitychange", wake);
  wake();

  return {
    set(sky) {
      const now = performance.now();
      from = mix(from, to, Math.min(1, (now - changedAt) / EASE_MS));
      to = { ...sky };
      changedAt = now;
      wake();
    },
    stop() {
      cancelAnimationFrame(raf);
      running = false;
      ro.disconnect();
      document.removeEventListener("visibilitychange", wake);
    },
  };
}
