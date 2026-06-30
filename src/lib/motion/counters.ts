import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Counts numeric stats up from zero when they scroll into view.
 * Markup: <span data-counter="30" data-counter-suffix="+">0</span>
 */
export function initCounters(): void {
  gsap.utils.toArray<HTMLElement>("[data-counter]").forEach((el) => {
    const target = Number(el.dataset.counter);
    if (Number.isNaN(target)) return;
    const suffix = el.dataset.counterSuffix ?? "";
    const obj = { val: 0 };

    gsap.to(obj, {
      val: target,
      duration: 1.6,
      ease: "power2.out",
      snap: { val: 1 },
      onUpdate: () => {
        el.textContent = `${Math.round(obj.val)}${suffix}`;
      },
      scrollTrigger: { trigger: el, start: "top 88%", once: true },
    });
  });
}
