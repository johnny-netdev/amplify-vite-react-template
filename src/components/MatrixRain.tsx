// src/components/MatrixRain.tsx

import React, { useRef, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
// We use the same Text component, but render hundreds of them
import { Text } from '@react-three/drei'; 
import { Mesh } from 'three'; 

// --- Configuration ---
const RAIN_COUNT = 500; // Number of rain columns
const RAIN_SPEED = 0.3; // Speed of the code falling
const BINARY_POOL = ['0', '1'];


const randomChar = () => {
    const randomIndex = Math.floor(Math.random() * BINARY_POOL.length);
    return BINARY_POOL[randomIndex];
};


// Function to generate the initial column string
const generateCodeString = () => {
    const stackLength = Math.floor(Math.random() * 10) + 5;
    let stack = '';
    for (let i = 0; i < stackLength; i++) {
        stack += randomChar() + '\n';
    }
    return stack;
};

// Component to render a single, random column of code
const CodeColumn = () => {
    // 1. Generate random starting position and character for the column
    const startX = (Math.random() - 0.5) * 40; 
    const startY = (Math.random() * 50) + 10;   // Start high above the screen
    const startZ = -Math.random() * 50;       // Spread across Z-axis for depth
    const initialY = startY;

    // 2. State to hold the current position of the column
    const meshRef = useRef<Mesh>(null!);
    const [codeString, setCodeString] = useState(generateCodeString());
    const lastChangeTime = useRef(0);
    const changeInterval = useRef(Math.random() * 0.5 + 0.1);
    
    // 3. Animation Logic
    useFrame((state, delta) => {
        if (meshRef.current) {
            // 1. Movement Logic
            meshRef.current.position.y -= RAIN_SPEED * delta * 60; 

            // Reset when column falls off-screen
            if (meshRef.current.position.y < -30) {
                meshRef.current.position.y = initialY;
                setCodeString(generateCodeString()); // Generate new pattern upon reset
            }

            // 2. ⭐️ Flickering Logic: Check if it's time to change a character
            if (state.clock.elapsedTime > lastChangeTime.current + changeInterval.current) {
                
                // Regenerate a small section of the column (to look like a flicker)
                const newCode = codeString.split('\n').map((char) => {
                    // 10% chance to flip the char (0->1 or 1->0)
                    return Math.random() < 0.1 ? randomChar() : char;
                }).join('\n');
                
                setCodeString(newCode);

                lastChangeTime.current = state.clock.elapsedTime;
                changeInterval.current = Math.random() * 0.5 + 0.1; // Set a new random interval
            }
        }
    });
    
    return (
        <Text
            ref={meshRef}
            position={[startX, startY, startZ]}
            font={'/fonts/Roboto_Bold.json'} // Use your font
            // @ts-expect-error 
            size={0.5}
            height={0} // Make the rain flat, not extruded
            anchorX="center"
            anchorY="top" // Anchor to the top so it drops correctly
        >
            {codeString}
            <meshBasicMaterial 
                color={'#00FF00'} 
                opacity={0.3} 
                transparent 
            />
        </Text>
    );
};


const MatrixRain: React.FC = () => {
    // Generate an array of CodeColumn components
    const columns = useMemo(() => {
        const cols = [];
        for (let i = 0; i < RAIN_COUNT; i++) {
            cols.push(<CodeColumn key={i} />);
        }
        return cols;
    }, []);

    return <group>{columns}</group>;
};

export default MatrixRain;