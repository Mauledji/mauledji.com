import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Depth on scroll. The hero content drifts up and dims as it leaves — a quiet
 * sense of parting — while the starfield lags slightly behind the page for
 * parallax separation. Everything is transform/opacity and scrubbed.
 */
export function initParallax(): void {
  const hero = document.querySelector("#hero");
  const heroContent = document.querySelector<HTMLElement>(".hero-content");
  if (hero && heroContent) {
    gsap.to(heroContent, {
      yPercent: -14,
      opacity: 0.15,
      ease: "none",
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
      },
    });
  }

  // Subtle starfield drift — bg colour matches the page, so the revealed edge
  // is invisible. Desktop only (mobile uses a separate CSS starfield).
  const starfield = document.querySelector<HTMLElement>("#starfield");
  if (starfield) {
    gsap.to(starfield, {
      yPercent: 5,
      ease: "none",
      scrollTrigger: { start: 0, end: "max", scrub: 0.6 },
    });
  }

  // Generic opt-in depth: <el data-parallax="0.2">
  gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
    const speed = Number(el.dataset.parallax) || 0.15;
    gsap.to(el, {
      yPercent: -speed * 100,
      ease: "none",
      scrollTrigger: {
        trigger: el,
        start: "top bottom",
        end: "bottom top",
        scrub: true,
      },
    });
  });
}
