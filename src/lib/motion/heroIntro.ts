import { gsap } from "gsap";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(SplitText);

/**
 * The hero entrance: the name rises from a mask as the signature moment, then
 * the supporting items cascade with intentional offsets. The orbit system fades
 * up underneath. Runs once on load (after fonts) — not scroll-driven.
 */
export function buildHeroIntro(): gsap.core.Timeline {
  const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

  const name = document.querySelector<HTMLElement>("[data-hero-name]");
  const items = gsap.utils.toArray<HTMLElement>('[data-animate="hero-item"]');
  const orbits = document.querySelector<HTMLElement>("[data-hero-orbits]");

  // The name owns its own reveal — exclude it from the generic cascade.
  const cascade = items.filter((el) => !el.hasAttribute("data-hero-name"));

  if (name) {
    const split = new SplitText(name, {
      type: "lines",
      mask: "lines",
      linesClass: "hero-line",
    });
    gsap.set(name, { opacity: 1 });
    tl.fromTo(
      split.lines,
      { yPercent: 118 },
      { yPercent: 0, duration: 1.15, ease: "power4.out", stagger: 0.12 },
      0.1,
    );
  }

  tl.fromTo(
    cascade,
    { y: 26, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.9, stagger: 0.08 },
    name ? 0.5 : 0.1,
  );

  if (orbits) {
    tl.fromTo(
      orbits,
      { opacity: 0 },
      { opacity: 1, duration: 1.8, ease: "power2.out" },
      0.25,
    );
  }

  return tl;
}
