import { gsap } from "gsap";

/**
 * Magnetic pull on opt-in elements: <el data-magnetic> or
 * <el data-magnetic="0.4"> for a custom strength. The element leans toward
 * the cursor while hovered and settles back calmly on leave — same motion
 * grammar as the rest of the site (power easings, never springy).
 *
 * The element's center is measured once on mouseenter, so the in-flight
 * transform never feeds back into the math. Desktop-only — gated upstream.
 *
 * Note: magnetic elements must not have a CSS transition on transform,
 * or the two easings fight each other.
 */
export function initMagnetic(): () => void {
  const cleanups: Array<() => void> = [];

  gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
    const strength = Number.parseFloat(el.dataset.magnetic ?? "") || 0.3;
    const xTo = gsap.quickTo(el, "x", { duration: 0.4, ease: "power3.out" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.4, ease: "power3.out" });
    let centerX = 0;
    let centerY = 0;

    const onEnter = () => {
      // Medir sin la traslación en curso: descontar el transform actual.
      const rect = el.getBoundingClientRect();
      const currentX = Number(gsap.getProperty(el, "x")) || 0;
      const currentY = Number(gsap.getProperty(el, "y")) || 0;
      centerX = rect.left + rect.width / 2 - currentX;
      centerY = rect.top + rect.height / 2 - currentY;
    };

    const onMove = (e: MouseEvent) => {
      xTo((e.clientX - centerX) * strength);
      yTo((e.clientY - centerY) * strength);
    };

    const onLeave = () => {
      gsap.to(el, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
      });
    };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    cleanups.push(() => {
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
      gsap.set(el, { clearProps: "x,y" });
    });
  });

  return () => cleanups.forEach((fn) => fn());
}
