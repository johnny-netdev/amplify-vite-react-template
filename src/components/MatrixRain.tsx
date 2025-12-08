// src/components/MatrixRain.tsx

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Instances, Instance } from '@react-three/drei'; // ⭐️ New Instancing Imports
import { Group, BufferGeometry, Material, Matrix4 } from 'three'; // Core Three.js types

// --- Configuration ---
const RAIN_COUNT = 800;             
const RAIN_SPEED = 0.05;            
const COLUMN_HEIGHT = 15;           
const CHARACTER_SPACING = 0.5;
const FADE_DISTANCE = 40;           // Horizontal and Depth spread
const TOTAL_CHARACTERS = RAIN_COUNT * COLUMN_HEIGHT;


// Helper functions (Unchanged)
const r = (from: number, to: number): number => {
    return Math.floor(Math.random() * (to - from + 1)) + from;
};
const pick = (...args: any[]): any => {
    return args[r(0, args.length - 1)];
};
const getChar = (): string => {
    return String.fromCharCode(pick(r(0x3041, 0x30ff), r(0x2000, 0x206f), r(0x0020, 0x003f)));
};


// --- Instanced Character Logic ---
const CHARACTERS_DATA = Array.from({ length: TOTAL_CHARACTERS }).map((_, index) => {
    // Determine which column this character belongs to
    const columnIndex = Math.floor(index / COLUMN_HEIGHT); 
    const charIndexInColumn = index % COLUMN_HEIGHT;
    
    // Initial random positions for the column
    const startX = (Math.random() - 0.5) * FADE_DISTANCE;
    const initialY = (Math.random() * 50) + 10;
    const startZ = (Math.random() - 0.5) * FADE_DISTANCE;
    const speed = RAIN_SPEED * (Math.random() * 0.5 + 0.75);

    return {
        // Position of the whole column
        x: startX,
        y: initialY + charIndexInColumn * CHARACTER_SPACING, // Y position of this character
        z: startZ,
        
        // Animation properties
        speed: speed,
        initialY: initialY,
        columnIndex: columnIndex,
        charIndexInColumn: charIndexInColumn,
        
        // Appearance
        color: '#00FF00', // Start with default color
        opacity: 0.8
    };
});

// A single Matrix4 to reuse for updating the instance position
const matrix = new Matrix4();

// ⭐️ The main component that renders and animates ALL instances
const InstancedRain: React.FC<{ geometry: BufferGeometry; material: Material }> = ({ geometry, material }) => {
    const instancesRef = useRef<Group>(null!);

    useFrame((state, delta) => {
        if (!instancesRef.current) return;

        // Loop through all 12,000 characters in the static data array
        for (let i = 0; i < TOTAL_CHARACTERS; i++) {
            const charData = CHARACTERS_DATA[i];

            // 1. Update Y Position (Movement)
            charData.y -= charData.speed * delta * 60;

            // 2. Reset Logic
            if (charData.y < -30) {
                // When character drops off-screen, reset the whole column it belongs to
                // We reset the entire column's starting Y position
                for (let j = 0; j < COLUMN_HEIGHT; j++) {
                    const resetIndex = charData.columnIndex * COLUMN_HEIGHT + j;
                    CHARACTERS_DATA[resetIndex].y = CHARACTERS_DATA[resetIndex].initialY + CHARACTERS_DATA[resetIndex].charIndexInColumn * CHARACTER_SPACING;
                }
            }
            
            // 3. ⭐️ Color/Opacity Logic (The Trailing Head Effect)
            // Calculate position of this character relative to the head (which is at the bottom)
            const indexFromHead = charData.charIndexInColumn;

            let color = '#00FF00';
            let opacity = 0.8;
            
            // Note: Since index 0 is the character at the bottom of the drop, we invert the logic
            // The character with the HIGHEST charIndexInColumn is the one at the top.
            if (indexFromHead === 0) {
                // Head of the drop (index 0) is white/brightest
                color = '#FFFFFF';
                opacity = 1.0;
            } else if (indexFromHead < 5) {
                // Bright green tail
                color = '#00FF00';
                opacity = 0.8 - (indexFromHead * 0.1); 
            } else {
                // Fading dark green tail
                color = '#006600'; 
                opacity = 0.2 - (indexFromHead * 0.01);
            }
            
            // 4. Update the Instance Matrix
            matrix.makeTranslation(charData.x, charData.y, charData.z);
            instancesRef.current.setMatrixAt(i, matrix);
            
            // 5. Update Color (Setting individual instance color is complex, often requires shaders)
            // For now, we rely on the base material color. We will stick to position updates.
        }
        
        // This command tells Three.js to apply all the matrix updates
        instancesRef.current.instanceMatrix.needsUpdate = true;
    });

    // We only need to render the instances once
    return (
        <Instances ref={instancesRef} limit={TOTAL_CHARACTERS} geometry={geometry} material={material}>
            {/* Render a single Instance for every character */}
            {CHARACTERS_DATA.map((_, i) => (
                <Instance key={i} />
            ))}
        </Instances>
    );
};


// ⭐️ The main component that fetches the geometry and sets up the scene
const MatrixRain: React.FC = () => {
    // We need a shared geometry (e.g., a simple box or quad) for all instances
    const geometry = useMemo(() => new THREE.PlaneGeometry(CHARACTER_SPACING, CHARACTER_SPACING), []); 
    const material = useMemo(() => new THREE.MeshBasicMaterial({ color: '#00FF00', transparent: true, opacity: 0.8 }), []);

    // NOTE: True text instancing is highly complex and usually requires external libraries or shaders.
    // The most efficient approach is often to use a simple geometry (like a plane) 
    // and apply the characters via texture maps, but this requires shaders.
    // For this implementation, we will use a simple geometry to track position,
    // which may not display the characters accurately.
    
    return (
        // Returning the Instanced component
        <InstancedRain geometry={geometry} material={material} />
    );
};

export default MatrixRain;