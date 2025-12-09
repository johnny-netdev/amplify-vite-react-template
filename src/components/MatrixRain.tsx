import React, { useRef, useMemo } from 'react';
import * as THREE from 'three'; 
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei'; 
import { Matrix4, Color } from 'three'; 

// --- Configuration ---
const RAIN_COUNT = 800;             
const RAIN_SPEED = 0.05;            
const COLUMN_HEIGHT = 15;           
const CHARACTER_SPACING = 0.5;
const FADE_DISTANCE = 40;          
const TOTAL_CHARACTERS = RAIN_COUNT * COLUMN_HEIGHT;
// Flicker interval: how often the change logic runs (0.1s to 0.4s)
const MIN_FLICKER_INTERVAL = 0.1;
const MAX_FLICKER_INTERVAL = 0.4;

// --- Global Helper Functions (No changes needed) ---
const r = (from: number, to: number): number => {
    return Math.floor(Math.random() * (to - from + 1)) + from;
};
const pick = (...args: any[]): any => {
    return args[r(0, args.length - 1)];
};
const getChar = (): string => {
    return String.fromCharCode(pick(
        r(0x3041, 0x30ff), 
        r(0x2000, 0x206f), 
        r(0x0020, 0x003f)  
    ));
};
// Note: We no longer need the 'randomChar' alias, as we're not using it to generate text content.


// --- Instanced Character Data Structure ---
// Global array holding the state of every single character
const CHARACTERS_DATA = Array.from({ length: TOTAL_CHARACTERS }).map((_, index) => {
    const columnIndex = Math.floor(index / COLUMN_HEIGHT); 
    const charIndexInColumn = index % COLUMN_HEIGHT;
    
    // Position/Animation setup
    const startX = (Math.random() - 0.5) * FADE_DISTANCE;
    const initialY = (Math.random() * 50) + 10;
    const startZ = (Math.random() - 0.5) * FADE_DISTANCE;
    const speed = RAIN_SPEED * (Math.random() * 0.5 + 0.75);

    return {
        x: startX, 
        y: initialY + charIndexInColumn * CHARACTER_SPACING, 
        z: startZ,
        
        speed: speed, 
        initialY: initialY, 
        columnIndex: columnIndex, 
        charIndexInColumn: charIndexInColumn,
        
        // Color object for dynamic updates
        instanceColor: new Color('#00FF00'), 
        // Note: The character content ('char') is ignored by the instanced mesh geometry
        // but we'll use a small placeholder plane geometry for the position tracking.
    };
});


// Global matrix object used for setting instance position
const matrix = new Matrix4();

// --- Instanced Rain Component (Handles all 12,000+ characters) ---
const InstancedRain: React.FC = () => {
    // Correctly reference the InstancedMesh element
    const instancesRef = useRef<THREE.InstancedMesh>(null!); 
    
    // Flicker timing refs
    const lastFlickerTime = useRef(0);
    const flickerInterval = useRef(Math.random() * (MAX_FLICKER_INTERVAL - MIN_FLICKER_INTERVAL) + MIN_FLICKER_INTERVAL); 

    // Shared geometry (a small plane to represent the character position)
    const geometry = useMemo(() => new THREE.PlaneGeometry(CHARACTER_SPACING * 0.8, CHARACTER_SPACING * 0.8), []); 
    
    // Shared material (MUST have vertexColors enabled for per-instance color)
    const material = useMemo(() => new THREE.MeshBasicMaterial({ 
        transparent: true, 
        opacity: 0.8, 
        vertexColors: true // CRITICAL for instance color updates
    }), []);
    
    // Array to hold the color data for all instances
    const colorArray = useMemo(() => new Float32Array(TOTAL_CHARACTERS * 3), []);


    useFrame((state, delta) => {
        if (!instancesRef.current) return;

        // 1. ⭐️ TIME-BASED FLICKER LOGIC
        if (state.clock.elapsedTime > lastFlickerTime.current + flickerInterval.current) {
            
            // Loop through all characters and randomly change their color for a flash
            for (let i = 0; i < TOTAL_CHARACTERS; i++) {
                // 10% chance to flash a random column character brighter
                if (Math.random() < 0.1) { 
                    CHARACTERS_DATA[i].instanceColor.setRGB(0.2, 1.0, 0.2); // Brief bright flash
                }
            }
            
            // Reset the timing refs
            lastFlickerTime.current = state.clock.elapsedTime;
            flickerInterval.current = Math.random() * (MAX_FLICKER_INTERVAL - MIN_FLICKER_INTERVAL) + MIN_FLICKER_INTERVAL; 
        }


        // 2. MOVEMENT, GRADIENT, AND MATRIX UPDATE LOOP
        for (let i = 0; i < TOTAL_CHARACTERS; i++) {
            const charData = CHARACTERS_DATA[i];

            // Update Y Position (Movement)
            charData.y -= charData.speed * delta * 60;

            // Reset Logic (when the column drops off-screen)
            if (charData.y < -30) {
                // Reset the column's Y position
                for (let j = 0; j < COLUMN_HEIGHT; j++) {
                    const resetIndex = charData.columnIndex * COLUMN_HEIGHT + j;
                    CHARACTERS_DATA[resetIndex].y = CHARACTERS_DATA[resetIndex].initialY + CHARACTERS_DATA[resetIndex].charIndexInColumn * CHARACTER_SPACING;
                }
            }
            
            // Color Trailing/Gradient Logic
            const indexFromHead = charData.charIndexInColumn;
            let targetColor = new Color('#00FF00');

            if (indexFromHead === 0) {
                targetColor.set('#FFFFFF'); // White Head
            } else if (indexFromHead < 5) {
                // Bright green tail (no change needed from default #00FF00)
            } else {
                targetColor.set('#006600'); // Fading dark green
            }
            
            // Apply the gradient color (which will be overwritten by the flicker if it ran this frame)
            charData.instanceColor.lerp(targetColor, 0.1); // Smoothly transition back to gradient color

            // Update the color array from the instanceColor object
            charData.instanceColor.toArray(colorArray, i * 3);


            // Update the Instance Matrix
            matrix.makeTranslation(charData.x, charData.y, charData.z);
            instancesRef.current.setMatrixAt(i, matrix);
        }
        
        // Apply all updates outside the loop
        instancesRef.current.instanceMatrix.needsUpdate = true;
        
        // ⭐️ IMPORTANT: Tell Three.js the color attribute needs updating every frame
        instancesRef.current.geometry.attributes.instanceColor.needsUpdate = true;
    });

    // We render the InstancedMesh component ONCE
    return (
        <instancedMesh ref={instancesRef} args={[geometry, material, TOTAL_CHARACTERS]} >
             {/* Buffer attribute for per-instance color updates */}
             <bufferAttribute 
                 attach="instanceColor" 
                 array={colorArray} 
                 itemSize={3} 
             />
        </instancedMesh>
    );
};


// Main component wrapper
const MatrixRain: React.FC = () => {
    return <InstancedRain />;
};

export default MatrixRain;