import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  Color,
  Line,
  LineBasicMaterial,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from "three";

/**
 * WebGL starfield — the depth upgrade over the old 2D canvas version.
 * Stars live in a 3D slab in front of the camera, so mouse and scroll
 * parallax read as real depth: near stars drift more than far ones.
 * Twinkle runs on the GPU. Loaded lazily, desktop only; the CSS starfield
 * remains the mobile/fallback path.
 *
 * Tuning philosophy: stars are small and crisp (points, not bokeh glows),
 * the purple tint is rare and desaturated, and shooting stars are scarce
 * enough to feel lucky. Restraint over spectacle.
 */

const STAR_COUNT = 1800;
const ACCENT_RATIO = 0.03; // fraction of stars gently tinted — accent, not theme
const Z_NEAR = -14;
const Z_FAR = -60;
const FOV = 60;
// Positions are generated once for the widest aspect we care about (32:9),
// so ultrawide monitors and window resizes never expose empty edges.
const MAX_ASPECT = 3.6;
const SPREAD_MARGIN = 1.15;

const MOUSE_SHIFT = 1.0; // world units of camera offset at screen edge
const SCROLL_SHIFT = 0.0009; // world units per scrolled pixel
const MAX_DPR = 1.5; // fondo decorativo: 1.5 es indistinguible de 2 y ahorra fill
const RESIZE_DEBOUNCE_MS = 150;

const STAR_WHITE = new Color("#f8fafc");
// Desaturado a propósito: lee como temperatura de color estelar, no como tema
const STAR_ACCENT = new Color("#c4b5fd");

const VERTEX = /* glsl */ `
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute vec3 aColor;
  attribute float aAlpha;
  uniform float uTime;
  uniform float uPixelRatio;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    float twinkle = 0.7 + 0.3 * sin(uTime * aSpeed + aPhase);
    vColor = aColor;
    vAlpha = aAlpha * twinkle;
    gl_PointSize = aSize * uPixelRatio * (26.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT = /* glsl */ `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    float d = distance(gl_PointCoord, vec2(0.5));
    float alpha = smoothstep(0.5, 0.3, d);
    gl_FragColor = vec4(vColor, alpha * vAlpha * uOpacity);
  }
`;

interface ShootingStar {
  line: Line;
  material: LineBasicMaterial;
  head: Points;
  headMaterial: PointsMaterial;
  velocity: { x: number; y: number };
  life: number;
  fade: number;
  maxOpacity: number;
  active: boolean;
}

export interface Starfield {
  destroy: () => void;
}

function buildStarGeometry(): BufferGeometry {
  const positions = new Float32Array(STAR_COUNT * 3);
  const sizes = new Float32Array(STAR_COUNT);
  const phases = new Float32Array(STAR_COUNT);
  const speeds = new Float32Array(STAR_COUNT);
  const colors = new Float32Array(STAR_COUNT * 3);
  const alphas = new Float32Array(STAR_COUNT);

  const halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * -Z_FAR * SPREAD_MARGIN;
  const halfW = halfH * MAX_ASPECT;

  for (let i = 0; i < STAR_COUNT; i++) {
    // pow < 1 biases stars toward the far plane — depth reads denser at distance
    const depth = Math.pow(Math.random(), 0.65);
    positions[i * 3] = (Math.random() * 2 - 1) * halfW;
    positions[i * 3 + 1] = (Math.random() * 2 - 1) * halfH;
    positions[i * 3 + 2] = Z_NEAR + (Z_FAR - Z_NEAR) * depth;

    sizes[i] = Math.random() * 1.2 + 0.8;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = Math.random() * 1.1 + 0.35;
    alphas[i] = Math.random() * 0.6 + 0.35;

    const tint = Math.random() < ACCENT_RATIO ? STAR_ACCENT : STAR_WHITE;
    colors[i * 3] = tint.r;
    colors[i * 3 + 1] = tint.g;
    colors[i * 3 + 2] = tint.b;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new BufferAttribute(phases, 1));
  geometry.setAttribute("aSpeed", new BufferAttribute(speeds, 1));
  geometry.setAttribute("aColor", new BufferAttribute(colors, 3));
  geometry.setAttribute("aAlpha", new BufferAttribute(alphas, 1));
  return geometry;
}

const TRAIL_SEGMENTS = 16;
const TRAIL_PLANE_Z = -30;

function buildShootingStar(scene: Scene): ShootingStar {
  const positions = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
  const colors = new Float32Array((TRAIL_SEGMENTS + 1) * 3);
  // Additive blending: a black tail is an invisible tail, so the gradient
  // from black to white gives the classic fading trail without per-vertex alpha.
  for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
    const t = i / TRAIL_SEGMENTS;
    const v = Math.pow(t, 1.6);
    colors[i * 3] = v;
    colors[i * 3 + 1] = v;
    colors[i * 3 + 2] = v;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new BufferAttribute(positions, 3));
  geometry.setAttribute("color", new BufferAttribute(colors, 3));

  const material = new LineBasicMaterial({
    vertexColors: true,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });

  const line = new Line(geometry, material);
  line.visible = false;
  line.frustumCulled = false;
  scene.add(line);

  // Punto brillante en la cabeza — las LineBasicMaterial rasterizan a 1 px de
  // dispositivo, casi invisibles en HiDPI; la cabeza mantiene el destello.
  const headGeometry = new BufferGeometry();
  headGeometry.setAttribute(
    "position",
    new BufferAttribute(new Float32Array(3), 3),
  );
  const headMaterial = new PointsMaterial({
    color: 0xffffff,
    size: 2.4,
    sizeAttenuation: false,
    transparent: true,
    opacity: 0,
    blending: AdditiveBlending,
    depthWrite: false,
  });
  const head = new Points(headGeometry, headMaterial);
  head.visible = false;
  head.frustumCulled = false;
  scene.add(head);

  return {
    line,
    material,
    head,
    headMaterial,
    velocity: { x: 0, y: 0 },
    life: 0,
    fade: 0,
    maxOpacity: 0,
    active: false,
  };
}

export function initStarfield(canvas: HTMLCanvasElement): Starfield | null {
  let renderer: WebGLRenderer;
  try {
    renderer = new WebGLRenderer({
      canvas,
      alpha: true,
      antialias: false,
      powerPreference: "high-performance",
    });
  } catch {
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
  renderer.setClearColor(0x000000, 0);

  const scene = new Scene();
  const camera = new PerspectiveCamera(
    FOV,
    window.innerWidth / window.innerHeight,
    0.1,
    120,
  );

  const starGeometry = buildStarGeometry();
  const starMaterial = new ShaderMaterial({
    vertexShader: VERTEX,
    fragmentShader: FRAGMENT,
    uniforms: {
      uTime: { value: 0 },
      uPixelRatio: { value: renderer.getPixelRatio() },
      uOpacity: { value: 1 },
    },
    transparent: true,
    depthWrite: false,
    blending: AdditiveBlending,
  });
  const stars = new Points(starGeometry, starMaterial);
  stars.frustumCulled = false;
  scene.add(stars);

  const trails: ShootingStar[] = [
    buildShootingStar(scene),
    buildShootingStar(scene),
    buildShootingStar(scene),
  ];

  // --- Interaction state, all lerped for calm motion ---
  const mouse = { x: 0, y: 0 };
  const cam = { x: 0, y: 0 };
  // scrollY se cachea desde el evento (passive) — leerlo dentro del rAF
  // puede forzar layout si otro callback ensució el frame antes.
  let scrollPos = window.scrollY;
  let time = 0;
  let lastFrame = performance.now();
  let rafId = 0;
  let running = false;
  let spawnTimer = 4; // primer meteoro poco después de cargar
  let destroyed = false;
  let resizeTimer = 0;

  const onMouseMove = (e: MouseEvent) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = (e.clientY / window.innerHeight) * 2 - 1;
  };

  const onScroll = () => {
    scrollPos = window.scrollY;
  };

  function planeHalfExtents(): { halfW: number; halfH: number } {
    const halfH = Math.tan((FOV / 2) * (Math.PI / 180)) * -TRAIL_PLANE_Z;
    return { halfW: halfH * camera.aspect, halfH };
  }

  function spawnTrail(trail: ShootingStar): void {
    const { halfW, halfH } = planeHalfExtents();
    const fromTop = Math.random() > 0.4;
    const x = fromTop ? (Math.random() * 2 - 1) * halfW : -halfW;
    const y = fromTop ? halfH : Math.random() * halfH;

    const angle = (Math.random() * 30 + 25) * (Math.PI / 180);
    const speed = Math.random() * 14 + 22; // world units per second

    trail.velocity.x = Math.cos(angle) * speed;
    trail.velocity.y = -Math.sin(angle) * speed;
    trail.life = 0;
    trail.fade = Math.random() * 0.9 + 0.7; // life advance per second
    trail.maxOpacity = Math.random() * 0.4 + 0.3;
    trail.active = true;
    trail.line.visible = true;
    trail.head.visible = true;

    const pos = trail.line.geometry.getAttribute("position") as BufferAttribute;
    const len = Math.random() * 4 + 5;
    const dirX = trail.velocity.x / speed;
    const dirY = trail.velocity.y / speed;
    for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
      const t = 1 - i / TRAIL_SEGMENTS;
      pos.setXYZ(i, x - dirX * len * t, y - dirY * len * t, TRAIL_PLANE_Z);
    }
    pos.needsUpdate = true;
  }

  function stepTrails(dt: number): void {
    spawnTimer -= dt;
    if (spawnTimer <= 0) {
      const idle = trails.find((t) => !t.active);
      if (idle) spawnTrail(idle);
      spawnTimer = Math.random() * 9 + 7; // cada 7–16 s — lo raro se disfruta
    }

    for (const trail of trails) {
      if (!trail.active) continue;
      trail.life += trail.fade * dt;
      if (trail.life >= 1) {
        trail.active = false;
        trail.line.visible = false;
        trail.head.visible = false;
        trail.material.opacity = 0;
        trail.headMaterial.opacity = 0;
        continue;
      }
      const opacity =
        trail.life < 0.3
          ? (trail.life / 0.3) * trail.maxOpacity
          : trail.maxOpacity * (1 - (trail.life - 0.3) / 0.7);
      trail.material.opacity = opacity;
      trail.headMaterial.opacity = Math.min(opacity * 1.6, 1);

      const pos = trail.line.geometry.getAttribute(
        "position",
      ) as BufferAttribute;
      const dx = trail.velocity.x * dt;
      const dy = trail.velocity.y * dt;
      for (let i = 0; i <= TRAIL_SEGMENTS; i++) {
        pos.setXYZ(i, pos.getX(i) + dx, pos.getY(i) + dy, TRAIL_PLANE_Z);
      }
      pos.needsUpdate = true;

      const headPos = trail.head.geometry.getAttribute(
        "position",
      ) as BufferAttribute;
      headPos.setXYZ(
        0,
        pos.getX(TRAIL_SEGMENTS),
        pos.getY(TRAIL_SEGMENTS),
        TRAIL_PLANE_Z,
      );
      headPos.needsUpdate = true;
    }
  }

  function frame(now: number): void {
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;
    time += dt;

    // Mouse parallax + scroll lag, both eased — near stars shift more (real depth)
    cam.x += (mouse.x * MOUSE_SHIFT - cam.x) * 0.045;
    cam.y += (-mouse.y * MOUSE_SHIFT + scrollPos * SCROLL_SHIFT - cam.y) * 0.045;
    camera.position.x = cam.x;
    camera.position.y = cam.y;

    starMaterial.uniforms.uTime.value = time;
    stepTrails(dt);

    renderer.render(scene, camera);
    rafId = requestAnimationFrame(frame);
  }

  function start(): void {
    if (running || destroyed) return;
    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stop(): void {
    if (!running) return;
    running = false;
    cancelAnimationFrame(rafId);
  }

  const onVisibility = () => {
    if (document.hidden) stop();
    else start();
  };

  function applyResize(): void {
    if (destroyed) return;
    // Refrescar el pixel ratio: la ventana pudo migrar a un monitor de otro DPR
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, MAX_DPR));
    starMaterial.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight, false);
  }

  const onResize = () => {
    // Debounce: arrastrar el borde de la ventana dispara decenas de eventos
    // por segundo y cada setSize realoca el drawing buffer.
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(applyResize, RESIZE_DEBOUNCE_MS);
  };

  function destroy(): void {
    if (destroyed) return;
    destroyed = true;
    stop();
    window.clearTimeout(resizeTimer);
    window.removeEventListener("resize", onResize);
    window.removeEventListener("mousemove", onMouseMove);
    window.removeEventListener("scroll", onScroll);
    document.removeEventListener("visibilitychange", onVisibility);
    starGeometry.dispose();
    starMaterial.dispose();
    for (const trail of trails) {
      trail.line.geometry.dispose();
      trail.material.dispose();
      trail.head.geometry.dispose();
      trail.headMaterial.dispose();
    }
    renderer.dispose();
    canvas.classList.remove("is-live");
  }

  // Pérdida de contexto WebGL: WebGLRenderer (three r185) ya la maneja —
  // render() se vuelve no-op y al restaurarse el contexto re-sube geometría
  // y shaders automáticamente. Un handler propio solo lo empeoraría.

  applyResize();
  window.addEventListener("resize", onResize);
  window.addEventListener("mousemove", onMouseMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.addEventListener("visibilitychange", onVisibility);

  start();
  canvas.classList.add("is-live");

  return { destroy };
}
