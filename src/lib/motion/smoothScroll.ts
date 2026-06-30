import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

interface SmoothScroll {
  lenis: Lenis;
  destroy: () => void;
}

/**
 * Initializes Lenis smooth scrolling, synced to GSAP's ScrollTrigger and ticker.
 * Returns null on coarse-pointer (touch) devices, where native scrolling feels
 * better and avoids momentum quirks on iOS. Reduced-motion is gated upstream.
 */
export function initSmoothScroll(): SmoothScroll | null {
  const isTouch = window.matchMedia("(hover: none)").matches;
  if (isTouch) return null;

  const lenis = new Lenis({
    duration: 1.05,
    // easeOutCubic — calm and decisive, never floaty
    easing: (t) => 1 - Math.pow(1 - t, 3),
    smoothWheel: true,
    wheelMultiplier: 1,
    // smooth-scroll in-page anchor links (#projects, #contact) instead of jumping
    anchors: true,
  });

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis;

  return {
    lenis,
    destroy: () => {
      gsap.ticker.remove(raf);
      lenis.off("scroll", onScroll);
      lenis.destroy();
      delete window.__lenis;
    },
  };
}
