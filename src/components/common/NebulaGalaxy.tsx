import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { GalaxyGeometry } from "../galaxy/GalaxyGeometry";
import { GalaxyShader } from "../galaxy/GalaxyShader";

// Galaxy configuration types
export interface GalaxyConfig {
    totalStars?: number;
    pointSize?: number;
    spiralCount?: number;
    turnsPerSpiral?: number;
    blackHoleRadius?: number;
    fadeNear?: number;
    fadeFar?: number;
    colorMode?: 0 | 1 | 2;
    colorPalette?: THREE.Color[];
    colorIntensity?: number;
    rotationSpeed?: number;
    animationSpeed?: number;
}

interface NebulaGalaxyProps extends GalaxyConfig {
    position?: [number, number, number];
    scale?: number;
    autoRotate?: boolean;
    animate?: boolean;
}

const NebulaGalaxy: React.FC<NebulaGalaxyProps> = ({
    position = [0, 0, 0],
    scale = 1,
    autoRotate = true,
    animate = true,
    ...customConfig
}) => {
    const meshRef = useRef<THREE.Points>(null);
    const materialRef = useRef<GalaxyShader>(null);
    const { size } = useThree();

    const config = useMemo(() => {
        return {
            ...customConfig,
        };
    }, [customConfig]);

    const geometry = useMemo(() => {
        return new GalaxyGeometry(config.totalStars || 10000);
    }, [config.totalStars]);

    const material = useMemo(() => {
        const colorPalette = (config.colorPalette || []).map(
            (hex) => new THREE.Color(hex)
        );

        return new GalaxyShader({
            resolution: new THREE.Vector2(size.width, size.height),
            pointSize: config.pointSize,
            totalStars: config.totalStars,
            blackHoleRadius: config.blackHoleRadius,
            blackHolePosition: new THREE.Vector3(0, 0.0, 0.0),
            spiralCount: config.spiralCount,
            turnsPerSpiral: config.turnsPerSpiral,
            fadeNear: config.fadeNear || 1.0,
            fadeFar: config.fadeFar || 5.0,
            colorMode: config.colorMode,
            colorPalette: colorPalette.length > 0 ? colorPalette : undefined,
            colorIntensity: config.colorIntensity,
            time: 0,
        });
    }, [
        size,
        config.pointSize,
        config.totalStars,
        config.blackHoleRadius,
        config.spiralCount,
        config.turnsPerSpiral,
        config.fadeNear,
        config.fadeFar,
        config.colorMode,
        config.colorPalette,
        config.colorIntensity,
    ]);

    // Update resolution on window resize
    useEffect(() => {
        if (materialRef.current) {
            materialRef.current.uniforms.u_resolution.value.set(
                size.width,
                size.height
            );
        }
    }, [size]);

    // Animation loop
    useFrame((state) => {
        if (!meshRef.current || !materialRef.current) return;

        // Usa el tiempo total del estado, no el delta
        const time = state.clock.getElapsedTime();

        if (animate) {
            materialRef.current.uniforms.u_time.value =
                time * (config.animationSpeed || 0.02);
        }

        if (autoRotate) {
            meshRef.current.rotation.z =
                time * (config.rotationSpeed || 0.1);
        }
    });

    return (
        <>
            <points
                ref={meshRef}
                geometry={geometry}
                material={material}
                position={position}
                scale={scale}
            >
                <primitive ref={materialRef} object={material} attach="material" />
            </points>
            <mesh position={position}>
                <sphereGeometry args={[(config.blackHoleRadius ?? 1) * scale * 0.95, 32, 32]} />
                <meshBasicMaterial color="#000000" />
            </mesh>
        </>
    );
};

export default NebulaGalaxy;