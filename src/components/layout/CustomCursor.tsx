import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        const isTouchDevice = () => {
            const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
            const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
            return hasCoarsePointer && !hasFinePointer;
        };
        const prefersReducedMotion = window.matchMedia(
            '(prefers-reduced-motion: reduce)'
        ).matches;

        // Sin puntero fino o con reduced-motion: cursor nativo, sin isla.
        if (isTouchDevice() || prefersReducedMotion) {
            setShouldRender(false);
        }
    }, []);

    useGSAP(() => {
        if (!shouldRender) return;

        const cursor = cursorRef.current;
        if (!cursor) return;

        // Solo cuando el cursor custom realmente corre se oculta el nativo
        // (la regla CSS está scoped a esta clase).
        document.documentElement.classList.add('has-custom-cursor');

        const position = {
            previous: { x: -100, y: -100 },
            current: { x: -100, y: -100 },
            target: { x: -100, y: -100 }
        };

        const lerpAmount = 0.15;
        let rafId: number | null = null;

        // El cursor crece sobre elementos interactivos — blend difference
        // hace que se sienta como una lupa de foco, no como decoración.
        // Sobre campos de texto se ENCOGE: un puntero de precisión que no
        // tapa el texto ni el caret del formulario.
        const INTERACTIVE = 'a, button, [role="button"], input, textarea, select, [data-cursor-hover]';
        const TEXT_FIELD = 'input, textarea, select';
        const hoverState = { scale: 1 };
        let hovered: Element | null = null;

        const handleMouseOver = (e: MouseEvent) => {
            const target = (e.target as Element | null)?.closest(INTERACTIVE) ?? null;
            if (target === hovered) return;
            hovered = target;
            const scale = target ? (target.matches(TEXT_FIELD) ? 0.5 : 1.6) : 1;
            gsap.to(hoverState, {
                scale,
                duration: 0.3,
                ease: 'power3.out',
                overwrite: true,
            });
        };

        const handleMouseMove = (e: MouseEvent) => {
            position.target.x = e.clientX;
            position.target.y = e.clientY;
        };

        const lerp = (start: number, end: number, factor: number) => {
            return start + (end - start) * factor;
        };

        const animate = () => {
            position.current.x = lerp(position.current.x, position.target.x, lerpAmount);
            position.current.y = lerp(position.current.y, position.target.y, lerpAmount);

            const deltaX = position.current.x - position.previous.x;
            const deltaY = position.current.y - position.previous.y;

            position.previous.x = position.current.x;
            position.previous.y = position.current.y;

            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            // El estiramiento por velocidad se atenúa mientras el cursor está
            // agrandado sobre un elemento interactivo — foco estable, no gelatina.
            const stretchDamp = 1 / hoverState.scale;
            const stretchFactor = Math.min(distance * 0.08, 1.2) * stretchDamp;
            const scaleX = (0.8 + stretchFactor) * hoverState.scale;
            const scaleY = (0.8 - stretchFactor * 0.4) * hoverState.scale;

            gsap.set(cursor, {
                x: position.current.x,
                y: position.current.y,
                rotation: angle,
                scaleX: scaleX,
                scaleY: scaleY
            });

            rafId = requestAnimationFrame(animate);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseover', handleMouseOver);
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseover', handleMouseOver);
            if (rafId) cancelAnimationFrame(rafId);
            document.documentElement.classList.remove('has-custom-cursor');
        };
    }, [shouldRender]);

    if (!shouldRender) return null;

    return (
        <div
            ref={cursorRef}
            aria-hidden="true"
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '30px',
                height: '30px',
                pointerEvents: 'none',
                zIndex: 9999,
                transform: 'translate(-50%, -50%)',
                mixBlendMode: 'difference',
            }}
        >
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    backgroundColor: 'white',
                }}
            />
        </div>
    );
};

export default CustomCursor;
