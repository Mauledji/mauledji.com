import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { Starfield } from "../starfield";
import { initSmoothScroll } from "./smoothScroll";
import { buildHeroIntro } from "./heroIntro";
import { initReveals } from "./reveals";
import { initCounters } from "./counters";
import { initParallax } from "./parallax";
import { initDecode } from "./decode";

gsap.registerPlugin(ScrollTrigger);

const REVEAL_SELECTOR =
  '[data-animate], [data-reveal="heading"], [data-hero-name]';

/** Reveals every animated element immediately — the reduced-motion fallback. */
function revealAllInstant(): void {
  gsap.set(REVEAL_SELECTOR, { opacity: 1, clearProps: "transform" });
  gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
    el.textContent = `${el.dataset.counter}${el.dataset.counterSuffix ?? ""}`;
  });
}

/** Runs the hero intro once fonts are ready so SplitText measures real lines. */
function runHeroIntro(): void {
  let started = false;
  const start = () => {
    if (started) return;
    started = true;
    buildHeroIntro();
    ScrollTrigger.refresh();
  };
  if (document.fonts?.ready) {
    document.fonts.ready.then(start);
    // Fallback so the hero never stays blank if fonts are slow or fail to load.
    window.setTimeout(start, 700);
  } else {
    start();
  }
}

/** Switches the background to the static CSS starfield (mobile/fallback path). */
function useCssStarfield(): void {
  document.documentElement.classList.add("starfield-fallback");
}

/**
 * Loads the WebGL starfield after the page is idle so it never competes with
 * the hero for bandwidth or main-thread time. Returns a cleanup function.
 */
function scheduleStarfield(): () => void {
  const canvas = document.querySelector<HTMLCanvasElement>("#starfield");
  if (!canvas) return () => {};

  let cancelled = false;
  let starfield: Starfield | null = null;

  const load = () => {
    import("../starfield")
      .then((mod) => {
        if (cancelled) return;
        starfield = mod.initStarfield(canvas);
        if (starfield) {
          // Limpia un fallback previo (p. ej. si reduced-motion estuvo activo)
          document.documentElement.classList.remove("starfield-fallback");
        } else {
          useCssStarfield();
        }
      })
      .catch(() => {
        if (!cancelled) useCssStarfield();
      });
  };

  // timeout: garantiza la carga aunque la página nunca quede idle
  // (p. ej. abierta en una pestaña en segundo plano).
  const idle =
    "requestIdleCallback" in window
      ? (cb: () => void) => window.requestIdleCallback(cb, { timeout: 2500 })
      : (cb: () => void) => window.setTimeout(cb, 350);
  if (document.readyState === "complete") {
    idle(load);
  } else {
    window.addEventListener("load", () => idle(load), { once: true });
  }

  return () => {
    cancelled = true;
    starfield?.destroy();
    starfield = null;
  };
}

/**
 * Entry point wired from the layout. A single matchMedia owns every responsive
 * and reduced-motion decision, and GSAP reverts each context automatically when
 * its query stops matching.
 */
export function initMotion(): void {
  const mm = gsap.matchMedia();

  // Full motion — honours prefers-reduced-motion.
  mm.add("(prefers-reduced-motion: no-preference)", () => {
    try {
      const smooth = initSmoothScroll();
      initReveals();
      initCounters();
      initParallax();
      initDecode();
      runHeroIntro();

      const isDesktop = window.matchMedia("(hover: hover)").matches;
      let destroyStarfield: (() => void) | undefined;
      if (isDesktop) {
        destroyStarfield = scheduleStarfield();
      }

      return () => {
        smooth?.destroy();
        destroyStarfield?.();
      };
    } catch (err) {
      // Never leave content stuck at opacity:0 if motion setup throws.
      console.error("[motion] init failed, revealing content", err);
      revealAllInstant();
    }
  });

  // Reduced motion — show everything, no scroll machinery, static background.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    revealAllInstant();
    useCssStarfield();
    // Si el usuario reactiva el motion, el contexto no-preference decide de
    // nuevo — sin esto, la escena WebGL renderizaría en un canvas oculto.
    return () => {
      document.documentElement.classList.remove("starfield-fallback");
    };
  });
}
