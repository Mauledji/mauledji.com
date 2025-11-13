import { useGSAP } from "@gsap/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef } from "react";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedTextLinesProps {
  text: string;
  className?: string;
}

export const AnimatedTextLines: React.FC<AnimatedTextLinesProps> = ({
  text,
  className = "",
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const lineRefs = useRef<(HTMLSpanElement | null)[]>([]);

  const lines: string[] = text.split("\n").filter((line) => line.trim() !== "");

  useGSAP(() => {
    if (lineRefs.current.length > 0) {
      gsap.from(lineRefs.current, {
        y: 100,
        opacity: 0,
        duration: 3,
        stagger: 0.3,
        ease: "back.out",
        scrollTrigger: {
          trigger: containerRef.current,
        },
      });
    }
  });

  return (
    <div ref={containerRef} className={className}>
      {lines.map((line: string, index: number) => (
        <span
          key={index}
          ref={(el: HTMLSpanElement | null) => {
            lineRefs.current[index] = el;
          }}
          className="block leading-relaxed tracking-wide text-pretty"
        >
          {line}
        </span>
      ))}
    </div>
  );
};
