import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(true);

    useEffect(() => {
        const isTouchDevice = () => {
            const hasTouch = 'ontouchstart' in window ||
                navigator.maxTouchPoints > 0;
            const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
            const hasFinePointer = window.matchMedia('(pointer: fine)').matches;
            return hasTouch || (hasCoarsePointer && !hasFinePointer);
        };

        if (isTouchDevice()) {
            setShouldRender(false);
        }
    }, []);

    useGSAP(() => {
        if (!shouldRender) return;

        document.body.style.cursor = 'none';

        const cursor = cursorRef.current;
        if (!cursor) return;

        const position = {
            previous: { x: -100, y: -100 },
            current: { x: -100, y: -100 },
            target: { x: -100, y: -100 }
        };

        const lerpAmount = 0.15;
        let rafId: number | null = null;

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
            const stretchFactor = Math.min(distance * 0.08, 1.2);
            const scaleX = 0.8 + stretchFactor;
            const scaleY = 0.8 - stretchFactor * 0.4;

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
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId) cancelAnimationFrame(rafId);
            document.body.style.cursor = 'auto';
        };
    }, [shouldRender]);

    if (!shouldRender) return null;

    return (
        <div
            ref={cursorRef}
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
