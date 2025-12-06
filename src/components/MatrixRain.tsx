// src/components/MatrixRain.tsx

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
// We use the same Text component, but render hundreds of them
import { Text } from '@react-three/drei'; 
import { Mesh } from 'three'; 

// --- Configuration ---
const RAIN_COUNT = 500; // Number of rain columns
const RAIN_SPEED = 0.5; // Speed of the code falling

// Component to render a single, random column of code
const CodeColumn = () => {
    // 1. Generate random starting position and character for the column
    const startX = (Math.random() - 0.5) * 40; // Spread across X-axis
    const startY = (Math.random() * 50) + 10;   // Start high above the screen
    const startZ = -Math.random() * 50;       // Spread across Z-axis for depth
    const initialY = startY;

    // 2. State to hold the current position of the column
    const meshRef = useRef<Mesh>(null!);

    // 3. Animation Logic
    useFrame((_, delta) => {
        if (meshRef.current) {
            // Move the column down
            meshRef.current.position.y -= RAIN_SPEED * delta * 60; 

            // If the column falls off the bottom of the screen, reset it to the top
            if (meshRef.current.position.y < -30) {
                meshRef.current.position.y = initialY;
            }
        }
    });

    // 4. Generate random binary/hex characters for the column
    // The columns will look like a mix of numbers and letters
    const randomChar = () => Math.floor(Math.random() * 10).toString(); 

    // We render a small stack of characters to form a vertical line
    const codeStack = useMemo(() => {
        const stackLength = Math.floor(Math.random() * 10) + 5; // Column length varies
        const stack = [];
        for (let i = 0; i < stackLength; i++) {
            stack.push(
                <React.Fragment key={i}>
                    {randomChar()}
                    <br /> {/* Line break to stack vertically */}
                </React.Fragment>
            );
        }
        return stack;
    }, []);


    // ⭐️ Use the suppression for TSX compatibility with older Drei versions
    
    return (
        <Text
            ref={meshRef}
            position={[startX, startY, startZ]}
            font={'/fonts/bungeetint-regular.json'} // Use your font
            // @ts-expect-error 
            size={0.5}
            height={0} // Make the rain flat, not extruded
            anchorX="center"
            anchorY="top" // Anchor to the top so it drops correctly
        >
            {codeStack}
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