import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initAnimations() {
  document.querySelectorAll('[data-animate="section"]').forEach((section) => {
    const children = section.querySelectorAll('[data-animate="item"]');

    gsap.fromTo(
      section,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true,
        },
      },
    );

    if (children.length > 0) {
      gsap.fromTo(
        children,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.09,
          delay: 0.15,
          scrollTrigger: {
            trigger: section,
            start: "top 82%",
            once: true,
          },
        },
      );
    }
  });

  const heroItems = document.querySelectorAll('[data-animate="hero-item"]');
  if (heroItems.length > 0) {
    gsap.fromTo(
      heroItems,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.12,
        delay: 0.3,
      },
    );
  }
}
