import { gsap } from 'gsap';
import { Atom, BookOpen, Radio, Rocket, Send, Telescope } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Language } from '../../lib/i18n/utils';

interface Props {
  lang?: Language;
}

const sections = [
  { id: 'hero', Icon: Telescope },
  { id: 'about', Icon: Radio },
  { id: 'skills', Icon: Atom },
  { id: 'experience', Icon: BookOpen },
  { id: 'projects', Icon: Rocket },
  { id: 'contact', Icon: Send },
];

const SEGMENT_HEIGHT = 48;
const ICON_SIZE = 20;
const ICON_BOX = 38;

export default function TimelineNav({ lang }: Props) {
  const [activeSection, setActiveSection] = useState('hero');
  const [segmentFills, setSegmentFills] = useState<number[]>(Array(sections.length - 1).fill(0));
  const segmentFillRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-50% 0px -50% 0px',
        threshold: 0,
      }
    );

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;

      const absTops = sections.map(({ id }) => {
        const el = document.getElementById(id);
        if (!el) return 0;
        return el.getBoundingClientRect().top + scrollY;
      });

      const newFills = sections.slice(0, -1).map((_, i) => {
        const start = Math.max(absTops[i] - vh * 0.5, 0);
        const end = absTops[i + 1] - vh * 0.5;
        if (end <= start) return 1;
        return Math.min(Math.max((scrollY - start) / (end - start), 0), 1);
      });

      setSegmentFills(newFills);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    segmentFillRefs.current.forEach((el, i) => {
      if (!el) return;
      gsap.to(el, {
        height: `${segmentFills[i] * 100}%`,
        duration: 0.4,
        ease: 'power2.out',
      });
    });
  }, [segmentFills]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const lenis = window.__lenis;
    if (lenis) lenis.scrollTo(el, { duration: 1.2 });
    else el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <nav
      className="timeline-nav"
      style={{
        position: 'fixed',
        right: '1.5rem',
        top: '50%',
        transform: 'translateY(-50%)',
        zIndex: 40,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
      aria-label="Timeline navigation"
    >
      {sections.map(({ id, Icon }, i) => {
        const isActive = activeSection === id;
        const isLast = i === sections.length - 1;

        return (
          <div
            key={id}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <button
              onClick={() => scrollToSection(id)}
              aria-label={`Go to ${id}`}
              style={{
                width: `${ICON_BOX}px`,
                height: `${ICON_BOX}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                transition: 'background 0.35s ease, border-color 0.35s ease',
                flexShrink: 0,
              }}
            >
              <Icon
                size={ICON_SIZE}
                style={{
                  color: isActive ? '#a78bfa' : 'rgba(255,255,255,0.22)',
                  filter: isActive ? 'drop-shadow(0 0 6px #a78bfa)' : 'none',
                  transform: isActive ? 'scale(1.2)' : 'scale(1)',
                  transition: 'all 0.35s ease',
                  display: 'block',
                }}
              />
            </button>

            {!isLast && (
              <div
                style={{
                  position: 'relative',
                  width: '2px',
                  height: `${SEGMENT_HEIGHT}px`,
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '1px',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                <div
                  ref={(el) => { segmentFillRefs.current[i] = el; }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '0%',
                    background: '#7c3aed',
                    boxShadow: '0 0 8px rgba(124,58,237,0.7)',
                    borderRadius: '1px',
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
