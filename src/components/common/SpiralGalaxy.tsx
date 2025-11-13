import { useGSAP } from '@gsap/react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';

interface GalaxyConfig {
    particleCount: number;
    arms: number;
    radius: number;
    spin: number;
    randomness: number;
    centerColor: string;
    midColor: string;
    outerColor: string;
}

const SpiralGalaxy: React.FC = () => {
    const galaxyRef = useRef<THREE.Group>(null);

    // Configuración
    const config = useMemo<GalaxyConfig>(() => ({
        particleCount: 40000,
        arms: 6,
        radius: 3,
        spin: 5,
        randomness: 0.3,
        centerColor: '#9b59b6',
        midColor: '#e91e63',
        outerColor: '#3498db',
    }), []);

    // Generar geometría de la galaxia
    const [positions, colors, sizes] = useMemo(() => {
        const positions = new Float32Array(config.particleCount * 3);
        const colors = new Float32Array(config.particleCount * 3);
        const sizes = new Float32Array(config.particleCount);

        const centerColor = new THREE.Color(config.centerColor);
        const midColor = new THREE.Color(config.midColor);
        const outerColor = new THREE.Color(config.outerColor);

        for (let i = 0; i < config.particleCount; i++) {
            const i3 = i * 3;

            // Distribución radial con más densidad en el centro
            const radius = Math.pow(Math.random(), 2) * config.radius;
            const armAngle = ((i % config.arms) / config.arms) * Math.PI * 2;
            const spinAngle = radius * config.spin;

            // Posición con espiral
            const x = Math.cos(armAngle + spinAngle) * radius;
            const z = Math.sin(armAngle + spinAngle) * radius;

            // Añadir variación suave
            const randomOffset = config.randomness * radius;
            positions[i3] = x + (Math.random() - 0.5) * randomOffset;
            positions[i3 + 1] = (Math.random() - 0.5) * randomOffset * 0.5;
            positions[i3 + 2] = z + (Math.random() - 0.5) * randomOffset;

            // Gradiente de color suave de 3 puntos
            let mixedColor: THREE.Color;
            const normalizedRadius = radius / config.radius;

            if (normalizedRadius < 0.5) {
                // Centro a medio con más brillo en el centro
                mixedColor = centerColor.clone().lerp(midColor, normalizedRadius * 2);
                // Aumentar luminosidad en el centro
                if (normalizedRadius < 0.1) {
                    mixedColor.multiplyScalar(1);
                }
            } else {
                // Medio a exterior
                mixedColor = midColor.clone().lerp(outerColor, (normalizedRadius - 0.5) * 2);
            }

            colors[i3] = mixedColor.r;
            colors[i3 + 1] = mixedColor.g;
            colors[i3 + 2] = mixedColor.b;

            // Tamaños variables - más grandes en el centro
            if (normalizedRadius < 0.2) {
                sizes[i] = Math.random() * 0.5 + 1;
            } else {
                sizes[i] = Math.random() * 1.5 + 0.5;
            }
        }

        return [positions, colors, sizes];
    }, [config]);

    // Shader material personalizado pero simple
    const shaderMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                uTime: { value: 0 },
                uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float uTime;
                uniform float uPixelRatio;
                
                void main() {
                    vColor = color;
                    vec4 modelPosition = modelMatrix * vec4(position, 1.0);
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectedPosition = projectionMatrix * viewPosition;
                    
                    gl_Position = projectedPosition;
                    
                    // Tamaño adaptativo basado en distancia
                    gl_PointSize = size * (45.0 / -viewPosition.z);
                    gl_PointSize *= uPixelRatio;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    // Crear partículas circulares con bordes suaves
                    float distance = length(gl_PointCoord - vec2(0.5));
                    
                    // Suavizado del borde
                    float strength = 1.0 - smoothstep(0.0, 0.5, distance);
                    strength = pow(strength, 1.5);
                    
                    // Color final con el suavizado aplicado
                    vec3 finalColor = vColor * strength * 1.2;
                    
                    gl_FragColor = vec4(finalColor, strength);
                }
            `,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            transparent: true,
            vertexColors: true
        });
    }, []);

    // Animación suave
    useFrame((state) => {
        if (galaxyRef.current) {
            galaxyRef.current.rotation.y = state.clock.elapsedTime * 0.003;
            shaderMaterial.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    useGSAP(() => {
        if (galaxyRef.current) {
            const tl = gsap.timeline();
            tl.from(galaxyRef.current.position, {
                y: 5,
                duration: 3,
                ease: "circ.out",
            });
        }
    }, []);

    return (
        <group ref={galaxyRef} position={[0, 1.3, 0]}>
            <points material={shaderMaterial}>
                <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
                <bufferAttribute
                    attach="attributes-size"
                    args={[sizes, 1]}
                />
                </bufferGeometry>
            </points>
        </group>

    );
};

export default SpiralGalaxy;