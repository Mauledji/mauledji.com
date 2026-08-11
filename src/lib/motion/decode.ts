import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Signal-decode effect for the mono section labels: characters resolve
 * left-to-right out of static, like a transmission locking on. Opt-in via
 * [data-decode], runs once per label when it scrolls into view.
 *
 * Accessibility: the real text lives in a visually-hidden span so screen
 * readers never hear the scramble; the animated text is aria-hidden. Spaces
 * are preserved and the font is mono, so the label never changes width.
 */
const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/#·+";
const DECODE_DURATION = 0.65;
const SCRAMBLE_INTERVAL = 0.045; // seconds between scramble refreshes

function randomChar(): string {
  return CHARSET[Math.floor(Math.random() * CHARSET.length)];
}

function attachDecode(el: HTMLElement): void {
  // dataset guarda el texto real: si el contexto de matchMedia se re-ejecuta
  // (toggle de reduced-motion), textContent ya no es fiable — los spans
  // internos lo duplicarían.
  const original = el.dataset.decodeOriginal ?? el.textContent ?? "";
  if (!original.trim()) return;
  el.dataset.decodeOriginal = original;

  // <span data-decode>TEXT</span> se convierte en:
  //   <span class="sr-only">TEXT</span> (para AT, estable)
  //   <span aria-hidden="true">TEXT</span> (visual, se scramblea)
  const srText = document.createElement("span");
  srText.className = "sr-only";
  srText.textContent = original;
  const visual = document.createElement("span");
  visual.setAttribute("aria-hidden", "true");
  visual.textContent = original;
  el.replaceChildren(srText, visual);

  const restore = () => {
    visual.textContent = original;
  };

  const state = { progress: 0 };
  let lastScramble = -1;

  gsap.to(state, {
    progress: 1,
    duration: DECODE_DURATION,
    ease: "power2.inOut",
    scrollTrigger: { trigger: el, start: "top 88%", once: true },
    onUpdate: () => {
      const resolved = Math.floor(state.progress * original.length);
      // Throttle the random churn so it flickers, not strobes
      const bucket = Math.floor(
        (state.progress * DECODE_DURATION) / SCRAMBLE_INTERVAL,
      );
      if (bucket === lastScramble && state.progress < 1) return;
      lastScramble = bucket;

      let out = "";
      for (let i = 0; i < original.length; i++) {
        const ch = original[i];
        if (i < resolved || ch === " ") out += ch;
        else out += randomChar();
      }
      visual.textContent = out;
    },
    onComplete: restore,
    // Si el tween muere a medias (p. ej. toggle de reduced-motion),
    // el label nunca queda scrambleado.
    onInterrupt: restore,
  });
}

export function initDecode(): void {
  gsap.utils.toArray<HTMLElement>("[data-decode]").forEach(attachDecode);
}
