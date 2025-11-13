import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, useState } from 'react';

const CustomCursor = () => {
    const cursorRef = useRef<HTMLDivElement>(null);
    const [shouldRender, setShouldRender] = useState(true);

    // Detectar si es dispositivo táctil
    useEffect(() => {
        const isTouchDevice = () => {
            // Verificar múltiples APIs para mayor precisión
            const hasTouch = 'ontouchstart' in window ||
                navigator.maxTouchPoints > 0;

            // Verificar media query de pointer
            const hasCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
            const hasFinePointer = window.matchMedia('(pointer: fine)').matches;

            // Si solo tiene pointer coarse (táctil), no renderizar cursor
            return hasTouch || (hasCoarsePointer && !hasFinePointer);
        };

        // Si es táctil, no renderizar el componente
        if (isTouchDevice()) {
            setShouldRender(false);
        }
    }, []);

    useGSAP(() => {
        // Solo ejecutar si debe renderizarse
        if (!shouldRender) return;

        // Ocultar el cursor por defecto del sistema
        document.body.style.cursor = 'none';

        const cursor = cursorRef.current;
        if (!cursor) return;

        const position = {
            previous: { x: -100, y: -100 },
            current: { x: -100, y: -100 },
            target: { x: -100, y: -100 }
        };

        const lerpAmount = 0.15; // Velocidad de seguimiento
        let rafId: number | null = null; // Para cancelar requestAnimationFrame

        // Ve hacia donde se mueve el mouse
        const handleMouseMove = (e: MouseEvent) => {
            position.target.x = e.clientX;
            position.target.y = e.clientY;
        };

        const lerp = (start: number, end: number, factor: number) => {
            return start + (end - start) * factor;
        };

        // Animación continua
        const animate = () => {
            // Interpolar posición actual hacia el target
            position.current.x = lerp(position.current.x, position.target.x, lerpAmount);
            position.current.y = lerp(position.current.y, position.target.y, lerpAmount);

            // Calcular la diferencia de movimiento
            const deltaX = position.current.x - position.previous.x;
            const deltaY = position.current.y - position.previous.y;

            // Guardar posición anterior
            position.previous.x = position.current.x;
            position.previous.y = position.current.y;

            // Calcular ángulo de rotación
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

            // Calcular distancia para el estiramiento
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Calcular escala en X (estiramiento) y en Y (compresión)
            const stretchFactor = Math.min(distance * 0.08, 1.2);
            const scaleX = 1 + stretchFactor;
            const scaleY = 1 - stretchFactor * 0.4;

            // Aplicar transformaciones con GSAP
            gsap.set(cursor, {
                x: position.current.x,
                y: position.current.y,
                rotation: angle,
                scaleX: scaleX,
                scaleY: scaleY
            });

            rafId = requestAnimationFrame(animate);
        };

        // Event listeners
        window.addEventListener('mousemove', handleMouseMove);

        // Iniciar animación
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            if (rafId) {
                cancelAnimationFrame(rafId);
            }
            document.body.style.cursor = 'auto';
        };
    }, [shouldRender]);

    // No renderizar nada en dispositivos táctiles
    if (!shouldRender) {
        return null;
    }

    return (
        <div
            ref={cursorRef}
            className="fixed top-0 left-0 w-7.5 h-7.5 pointer-events-none z-99 -translate-x-1/2 -translate-y-1/2 mix-blend-difference"
        >
            <div
                className="w-full h-full rounded-full bg-white backdrop-blur-xs"
            />
        </div>
    );
};

export default CustomCursor;