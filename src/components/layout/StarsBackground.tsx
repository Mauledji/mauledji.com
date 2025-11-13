import { useCallback, useEffect, useRef } from 'react';
import * as THREE from 'three';

// Interfaces para las estructuras de datos
interface StarsData {
    points: THREE.Points;
    velocities: Float32Array;
}

interface NebulaData {
    points: THREE.Points;
    material: THREE.ShaderMaterial;
    rotationSpeed: {
        x: number;
        y: number;
        z: number;
    };
}

interface StarsConfig {
    count: number;
    maxRadius: number;
    depth: number;
    velocityRange: [number, number];
    sizeRange: [number, number];
    twinkle: {
        enabled: boolean;
        speedRange: [number, number];
        intensityRange: [number, number];
    };
}

interface NebulaeConfig {
    count: number;
    particlesPerNebula: number;
    colors: number[];
    maxRadius: number;
    opacity: number;
}

interface Config {
    stars: StarsConfig;
    nebulae: NebulaeConfig;
}

const StarsBackground: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const starsRef = useRef<StarsData | null>(null);
    const nebulaeRef = useRef<NebulaData[]>([]);
    const animationIdRef = useRef<number | null>(null);
    const timeRef = useRef<number>(0);

    // Configuración de constantes
    const CONFIG: Config = {
        stars: {
            count: 250,
            maxRadius: 45,
            depth: 50,
            velocityRange: [0.01, 0.001],
            sizeRange: [0.25, 0.3],
            twinkle: {
                enabled: true,
                speedRange: [0.5, 0.8],
                intensityRange: [0.3, 1.0]
            }
        },
        nebulae: {
            count: 35,
            particlesPerNebula: 200,
            colors: [
                0x4a5bb5, 0x8b5a9e, 0x5a7ba5, 0x4a5bb5, 0x8b5a9e, 0x5a7ba5,
                0x4a5bb5, 0x8b5a9e, 0x5a7ba5, 0x4a5bb5, 0x8b5a9e, 0x5a7ba5,
                0x4a5bb5, 0x8b5a9e, 0x5a7ba5, 0x4a5bb5, 0x8b5a9e, 0x5a7ba5,
                0x4a5bb5, 0x8b5a9e, 0x5a7ba5, 0x4a5bb5, 0x8b5a9e, 0x5a7ba5,
                0x4a5bb5, 0x8b5a9e, 0x5a7ba5, 0x4a5bb5, 0x8b5a9e, 0x5a7ba5,
                0x4a5bb5, 0x8b5a9e, 0x5a7ba5, 0x4a5bb5, 0x8b5a9e
            ],
            maxRadius: 25,
            opacity: 0.2
        }
    };

    const createNebulae = useCallback((scene: THREE.Scene): NebulaData[] => {
        const nebulae: NebulaData[] = [];

        for (let n = 0; n < CONFIG.nebulae.count; n++) {
            const particles = CONFIG.nebulae.particlesPerNebula;
            const positions = new Float32Array(particles * 3);
            const sizes = new Float32Array(particles);
            const opacities = new Float32Array(particles);

            const centerX = (Math.random() - 0.5) * 60;
            const centerY = (Math.random() - 0.5) * 40;
            const centerZ = -Math.random() * 40 - 10;

            for (let i = 0; i < particles; i++) {
                const i3 = i * 3;
                const radius = Math.random() * CONFIG.nebulae.maxRadius;
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.random() * Math.PI;

                positions[i3] = centerX + radius * Math.sin(phi) * Math.cos(theta);
                positions[i3 + 1] = centerY + radius * Math.sin(phi) * Math.sin(theta);
                positions[i3 + 2] = centerZ + radius * Math.cos(phi);

                sizes[i] = Math.random() * 8 + 2;
                opacities[i] = Math.random() * 0.3 + 0.1;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    color: { value: new THREE.Color(CONFIG.nebulae.colors[n]) },
                    baseOpacity: { value: CONFIG.nebulae.opacity }
                },
                vertexShader: `
                    attribute float size;
                    attribute float opacity;
                    varying float vOpacity;
                    uniform float time;

                    void main() {
                        vOpacity = opacity;
                        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                        gl_PointSize = size * (300.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `,
                fragmentShader: `
                    uniform vec3 color;
                    uniform float baseOpacity;
                    varying float vOpacity;

                    void main() {
                        vec2 center = gl_PointCoord - vec2(0.5);
                        float dist = length(center);
                        
                        if (dist > 0.5) discard;
                        
                        float alpha = (1.0 - dist * 2.0) * vOpacity * baseOpacity;
                        gl_FragColor = vec4(color, alpha);
                    }
                `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const nebula = new THREE.Points(geometry, material);
            scene.add(nebula);
            nebulae.push({
                points: nebula,
                material,
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.0002,
                    y: (Math.random() - 0.5) * 0.0002,
                    z: (Math.random() - 0.5) * 0.0003
                }
            });
        }

        return nebulae;
    }, [CONFIG.nebulae.count, CONFIG.nebulae.particlesPerNebula, CONFIG.nebulae.colors, CONFIG.nebulae.maxRadius, CONFIG.nebulae.opacity]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Pequeño delay para asegurar que el DOM está listo
        const initTimeout = setTimeout(() => {
            if (!containerRef.current) return;

            // Configuración de la escena
            const scene = new THREE.Scene();
            sceneRef.current = scene;

            // Configuración de la cámara
            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.z = 5;
            cameraRef.current = camera;

            // Configuración del renderer
            const renderer = new THREE.WebGLRenderer({
                alpha: true,
                antialias: true
            });
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            containerRef.current.appendChild(renderer.domElement);
            rendererRef.current = renderer;

            // Crear estrellas con propiedades de twinkle
            const starCount = CONFIG.stars.count;
            const positions = new Float32Array(starCount * 3);
            const velocities = new Float32Array(starCount);
            const sizes = new Float32Array(starCount);
            const twinkleSpeeds = new Float32Array(starCount);
            const twinklePhases = new Float32Array(starCount);

            for (let i = 0; i < starCount; i++) {
                const i3 = i * 3;
                const radius = Math.random() * CONFIG.stars.maxRadius;
                const angle = Math.random() * Math.PI * 2;
                const zPos = Math.sin(angle) * radius - Math.random() * CONFIG.stars.depth;

                positions[i3] = Math.cos(angle) * radius;
                positions[i3 + 1] = (Math.random() - 0.5) * 30;
                positions[i3 + 2] = zPos;

                velocities[i] = CONFIG.stars.velocityRange[0] +
                    Math.random() * (CONFIG.stars.velocityRange[1] - CONFIG.stars.velocityRange[0]);
                sizes[i] = CONFIG.stars.sizeRange[0] +
                    Math.random() * (CONFIG.stars.sizeRange[1] - CONFIG.stars.sizeRange[0]);

                // Estrellas lejanas (z negativo) parpadean más lento
                const depthFactor = Math.abs(zPos) / CONFIG.stars.depth;
                twinkleSpeeds[i] = CONFIG.stars.twinkle.speedRange[0] +
                    (1 - depthFactor) * (CONFIG.stars.twinkle.speedRange[1] - CONFIG.stars.twinkle.speedRange[0]);
                twinklePhases[i] = Math.random() * Math.PI * 2;
            }

            const geometry = new THREE.BufferGeometry();
            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
            geometry.setAttribute('twinkleSpeed', new THREE.BufferAttribute(twinkleSpeeds, 1));
            geometry.setAttribute('twinklePhase', new THREE.BufferAttribute(twinklePhases, 1));

            // Material con shader personalizado para twinkle
            const material = new THREE.ShaderMaterial({
                uniforms: {
                    time: { value: 0 },
                    baseSize: { value: 0.1 }
                },
                vertexShader: `
                attribute float size;
                attribute float twinkleSpeed;
                attribute float twinklePhase;
                uniform float time;
                varying float vOpacity;

                void main() {
                    // Calcular twinkle
                    float twinkle = sin(time * twinkleSpeed + twinklePhase) * 0.5 + 0.5;
                    vOpacity = mix(0.3, 1.0, twinkle);
                    
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z) * (0.8 + twinkle * 0.4);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
                fragmentShader: `
                varying float vOpacity;

                void main() {
                    vec2 center = gl_PointCoord - vec2(0.5);
                    float dist = length(center);
                    
                    if (dist > 0.5) discard;
                    
                    float alpha = (1.0 - dist * 2.0) * vOpacity;
                    gl_FragColor = vec4(1.0, 1.0, 1.0, alpha);
                }
            `,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            const stars = new THREE.Points(geometry, material);
            scene.add(stars);
            starsRef.current = { points: stars, velocities };

            nebulaeRef.current = createNebulae(scene);

            const animate = (): void => {
                timeRef.current += 0.01;
                const positionsArray = stars.geometry.attributes.position.array as Float32Array;

                for (let i = 0; i < starCount; i++) {
                    const i3 = i * 3;
                    positionsArray[i3 + 2] += velocities[i];

                    if (positionsArray[i3 + 2] > 5) {
                        positionsArray[i3 + 2] = -CONFIG.stars.depth;
                        const radius = Math.random() * CONFIG.stars.maxRadius;
                        const angle = Math.random() * Math.PI * 2;
                        positionsArray[i3] = Math.cos(angle) * radius;
                        positionsArray[i3 + 1] = (Math.random() - 0.5) * 30;
                        velocities[i] = CONFIG.stars.velocityRange[0] +
                            Math.random() * (CONFIG.stars.velocityRange[1] - CONFIG.stars.velocityRange[0]);
                    }
                }

                stars.geometry.attributes.position.needsUpdate = true;
                stars.rotation.z += 0.0001;

                material.uniforms.time.value = timeRef.current;

                nebulaeRef.current.forEach((nebula) => {
                    nebula.material.uniforms.time.value = timeRef.current;
                    nebula.points.rotation.x += nebula.rotationSpeed.x;
                    nebula.points.rotation.y += nebula.rotationSpeed.y;
                    nebula.points.rotation.z += nebula.rotationSpeed.z;
                });

                renderer.render(scene, camera);
                animationIdRef.current = requestAnimationFrame(animate);
            };

            animate();

            const handleResize = (): void => {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
            };

            window.addEventListener('resize', handleResize);

            return () => {
                clearTimeout(initTimeout);
                window.removeEventListener('resize', handleResize);

                if (animationIdRef.current !== null) {
                    cancelAnimationFrame(animationIdRef.current);
                }

                if (containerRef.current && renderer.domElement && containerRef.current.contains(renderer.domElement)) {
                    containerRef.current.removeChild(renderer.domElement);
                }

                geometry.dispose();
                material.dispose();

                nebulaeRef.current.forEach((nebula) => {
                    nebula.points.geometry.dispose();
                    nebula.material.dispose();
                });

                renderer.dispose();
            };
        }, 100);

        return () => {
            clearTimeout(initTimeout);
        };
    }, [createNebulae, CONFIG.stars.count, CONFIG.stars.maxRadius, CONFIG.stars.depth, CONFIG.stars.velocityRange, CONFIG.stars.sizeRange, CONFIG.stars.twinkle.speedRange]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 -z-51 pointer-events-none"
            style={{
                width: '100vw',
                height: '100vh'
            }}
        />
    );
};

export default StarsBackground;