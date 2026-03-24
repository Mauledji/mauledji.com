import { useState, useEffect, useRef } from "react";

interface Props {
  images: [string, string];
  name: string;
}

export default function ProjectCarousel({ images, name }: Props) {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = images.length;

  const goTo = (index: number) => {
    setCurrent(((index % total) + total) % total);
  };

  const startAuto = () => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % total);
    }, 3500);
  };

  const stopAuto = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  useEffect(() => {
    startAuto();
    return () => stopAuto();
  }, []);

  return (
    <div
      style={{
        position: "relative",
        borderRadius: "12px",
        overflow: "hidden",
        border: "1px solid rgba(255,255,255,0.07)",
        background: "#0d0d15",
      }}
      onMouseEnter={stopAuto}
      onMouseLeave={startAuto}
    >
      {/* Track */}
      <div
        style={{
          display: "flex",
          width: "100%",
          transform: `translateX(-${current * 100}%)`,
          transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1)",
          willChange: "transform",
          alignItems: "flex-start",
        }}
      >
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt={`${name} screenshot ${i + 1}`}
            loading="lazy"
            decoding="async"
            style={{
              flexShrink: 0,
              width: "100%",
              height: "auto",
              display: "block",
              imageRendering: "-webkit-optimize-contrast" as any,
            }}
          />
        ))}
      </div>

      {/* Gradient overlay bottom */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "linear-gradient(to top, rgba(10,10,15,0.6), transparent)",
          pointerEvents: "none",
        }}
      />

      {/* Dots */}
      <div
        style={{
          position: "absolute",
          bottom: "0.75rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.4rem",
          alignItems: "center",
        }}
      >
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            style={{
              width: i === current ? "18px" : "6px",
              height: "6px",
              borderRadius: i === current ? "3px" : "50%",
              background: i === current ? "#a78bfa" : "rgba(255,255,255,0.3)",
              border: "none",
              cursor: "pointer",
              padding: 0,
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {/* Arrows */}
      {[
        { dir: -1, side: "left" as const, label: "Previous" },
        { dir: 1, side: "right" as const, label: "Next" },
      ].map(({ dir, side, label }) => (
        <button
          key={side}
          onClick={() => goTo(current + dir)}
          aria-label={label}
          className="carousel-arrow-btn"
          style={{
            position: "absolute",
            top: "50%",
            [side]: "0.6rem",
            transform: "translateY(-50%)",
            background: "rgba(10,10,15,0.65)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "50%",
            width: "32px",
            height: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "rgba(255,255,255,0.7)",
            padding: 0,
            transition: "background 0.25s, border-color 0.25s, color 0.25s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(124,58,237,0.55)";
            e.currentTarget.style.borderColor = "rgba(167,139,250,0.4)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(10,10,15,0.65)";
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <polyline points={dir === -1 ? "15 18 9 12 15 6" : "9 18 15 12 9 6"} />
          </svg>
        </button>
      ))}
    </div>
  );
}
