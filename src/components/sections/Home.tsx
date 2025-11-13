import { OrbitControls, Preload } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Suspense } from 'react';
import * as THREE from 'three';
import { ACESFilmicToneMapping } from "three";
import AnimatedHeaderSection from "../common/AnimatedHeaderSection";
import NebulaGalaxy from "../common/NebulaGalaxy";


const Home: React.FC = () => {
    const text = `Building in cosmos
    seamless experiences by
    clean code and creativity`;

    return (
        <section
            id="home"
            className="flex flex-col justify-end min-h-screen font-Quicksand relative overflow-hidden"
        >
            <AnimatedHeaderSection
                subTitle="Software Engineer"
                title="Mauricio Ledezma"
                text={text}
                textColor="text-white"
                withSocials={true}
                withScrollTrigger={false}
            />
            <div className="absolute inset-0 -z-50">
                <Canvas
                    camera={{
                        position: [0, -1.5, 1.2],
                        fov: 110,
                        near: 0.01,
                        far: 100
                    }}
                    gl={{
                        toneMapping: ACESFilmicToneMapping,
                        toneMappingExposure: 2
                    }}
                >
                    <Suspense fallback={null}>

                        <NebulaGalaxy

                            totalStars={12000}
                            pointSize={3.5}
                            spiralCount={5}
                            turnsPerSpiral={1}
                            blackHoleRadius={0}
                            colorMode={1}
                            colorPalette={[
                                new THREE.Color(1.0, 0.95, 0.85),
                                new THREE.Color(1.0, 0.8, 0.6),
                                new THREE.Color(1.0, 0.6, 0.8),
                                new THREE.Color(0.9, 0.4, 0.9),
                                new THREE.Color(0.6, 0.4, 1.0),
                                new THREE.Color(0.3, 0.5, 1.0),
                                new THREE.Color(0.15, 0.25, 0.7),
                                new THREE.Color(0.05, 0.1, 0.48)
                            ]}
                            colorIntensity={1}
                            rotationSpeed={0.08}
                            animationSpeed={0.02}
                            scale={2}
                            position={[0, 1, 0.8]}
                            autoRotate={true}
                            animate={true}

                        />

                        <OrbitControls
                            enableZoom={false}
                            enablePan={false}
                            maxPolarAngle={Math.PI * 0.9}  // Permite rotar casi hasta abajo
                            minPolarAngle={Math.PI * 0.1}  // Permite rotar casi hasta arriba
                        />
                        <Preload all />
                    </Suspense>
                </Canvas>
            </div>
        </section>
    );
};

export default Home;