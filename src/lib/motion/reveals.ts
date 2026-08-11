import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

const CARD_SELECTOR = ".project-card, .skill-card, .terminal-card";
const LABEL_SELECTOR = ".constellation-line";

/**
 * Headings opt in via [data-reveal="heading"] and reveal line-by-line from a
 * mask — the most deliberate motion on the page, reserved for section titles.
 */
function revealHeadings(): void {
  gsap.utils.toArray<HTMLElement>('[data-reveal="heading"]').forEach((heading) => {
    const split = new SplitText(heading, {
      type: "lines",
      mask: "lines",
      linesClass: "reveal-line",
    });
    gsap.set(heading, { opacity: 1 });
    gsap.fromTo(
      split.lines,
      { yPercent: 110 },
      {
        yPercent: 0,
        duration: 1,
        ease: "power4.out",
        stagger: 0.1,
        scrollTrigger: { trigger: heading, start: "top 85%", once: true },
      },
    );
  });
}

/**
 * Generic scroll reveals, batched so neighbours that enter together move as a
 * group. Three distinct grammars, assigned by meaning rather than sprinkled:
 *   labels  — drift in laterally (a horizontal axis nothing else uses)
 *   cards   — a longer, softer settle, as if arriving from depth
 *   text    — a tight, quick rise
 * The difference in axis/distance/ease is what stops it reading as one uniform
 * fade-up. No transforms on the blurred glass surface beyond translate.
 */
function revealBlocks(): void {
  ScrollTrigger.batch('[data-animate="section"]', {
    start: "top 86%",
    once: true,
    onEnter: (batch) => {
      const labels = batch.filter((el) => (el as Element).matches(LABEL_SELECTOR));
      const cards = batch.filter((el) => (el as Element).matches(CARD_SELECTOR));
      const text = batch.filter(
        (el) => !(el as Element).matches(`${LABEL_SELECTOR}, ${CARD_SELECTOR}`),
      );

      if (labels.length) {
        // Los labels con decode ya tienen su propia entrada (el scramble):
        // solo fade, sin drift — una gramática por elemento.
        const decoding = labels.filter((el) =>
          (el as Element).querySelector("[data-decode]"),
        );
        const plain = labels.filter((el) => !decoding.includes(el));
        if (decoding.length) {
          gsap.fromTo(
            decoding,
            { opacity: 0 },
            { opacity: 1, duration: 0.6, ease: "power2.out", overwrite: true },
          );
        }
        if (plain.length) {
          gsap.fromTo(
            plain,
            { x: -28, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.1, overwrite: true },
          );
        }
      }
      if (cards.length) {
        gsap.fromTo(
          cards,
          { y: 64, opacity: 0 },
          { y: 0, opacity: 1, duration: 1.1, ease: "power2.out", stagger: 0.14, overwrite: true },
        );
      }
      if (text.length) {
        gsap.fromTo(
          text,
          { y: 34, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", stagger: 0.1, overwrite: true },
        );
      }
    },
  });

  ScrollTrigger.batch('[data-animate="item"]', {
    start: "top 90%",
    once: true,
    onEnter: (batch) => {
      gsap.fromTo(
        batch,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out", stagger: 0.06, overwrite: true },
      );
    },
  });
}

export function initReveals(): void {
  revealHeadings();
  revealBlocks();
}
