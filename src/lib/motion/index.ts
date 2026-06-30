import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { initSmoothScroll } from "./smoothScroll";
import { buildHeroIntro } from "./heroIntro";
import { initReveals } from "./reveals";
import { initCounters } from "./counters";
import { initParallax } from "./parallax";

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
      runHeroIntro();
      return () => smooth?.destroy();
    } catch (err) {
      // Never leave content stuck at opacity:0 if motion setup throws.
      console.error("[motion] init failed, revealing content", err);
      revealAllInstant();
    }
  });

  // Reduced motion — show everything, no scroll machinery.
  mm.add("(prefers-reduced-motion: reduce)", () => {
    revealAllInstant();
  });
}
