// src/components/MatrixRain.tsx

import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei'; 
import { Group } from 'three'; 

// --- Configuration & Global Helpers ---
const RAIN_COUNT = 800; // Total number of columns (reduced for performance)
const RAIN_SPEED = 0.05; // Base speed of the drop
const COLUMN_HEIGHT = 15; // Max characters in a drop
const CHARACTER_SPACING = 0.5; // Vertical space between characters

// Alphanumeric pool, like the video (A-Z, 0-9, and some symbols)
const CHAR_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+=-`~[]{}|;:,.<>/?'.split('');

// Helper to get a random character from the pool
const randomChar = () => CHAR_POOL[Math.floor(Math.random() * CHAR_POOL.length)];


// --- Column Data Structure ---
// Represents the characters and their unique positions/colors
interface RainCharacter {
    id: number;
    char: string;
}

// Function to generate the initial column array
const generateColumn = (): RainCharacter[] => {
    return Array.from({ length: COLUMN_HEIGHT }).map((_, index) => ({
        id: index,
        char: randomChar(),
    }));
};


const CodeColumn: React.FC = () => {
    // State to manage the characters in the column
    const [columnChars, setColumnChars] = useState(generateColumn);
    
    // Refs for position and speed
    const groupRef = useRef<Group>(null!);
    const speed = useMemo(() => RAIN_SPEED * (Math.random() * 0.5 + 0.75), []); // Randomized speed

    // Resetting position and content when off-screen
    const startX = useMemo(() => (Math.random() - 0.5) * 40, []);
    const initialY = useMemo(() => (Math.random() * 50) + 10, []);
    const startZ = useMemo(() => -Math.random() * 50, []);
    

    // Animation Logic
    useFrame((_, delta) => {
        if (groupRef.current) {
            // 1. Movement Logic: Move the entire column group down
            groupRef.current.position.y -= speed * delta * 60; 

            // 2. Reset Logic: If the column falls off-screen
            if (groupRef.current.position.y < -30) {
                groupRef.current.position.y = initialY;
                
                // 3. ⭐️ Flickering/Content Change: 
                // When reset, generate a new pattern for a fresh drop
                setColumnChars(generateColumn()); 
            }
        }
    });

    // ⭐️ Key difference: Render each character individually
    return (
        <group ref={groupRef} position={[startX, initialY, startZ]}>
            {columnChars.map((item, index) => {
                // Determine the character's vertical position in the column
                const yOffset = -index * CHARACTER_SPACING;
                
                // Calculate position relative to the bottom of the drop (index 0)
                // const relativeIndex = COLUMN_HEIGHT - index - 1; 

                // ⭐️ Color/Opacity Logic (The Trailing Head Effect)
                let color = '#00FF00'; // Default bright green
                let opacity = 0.8; 
                
                if (index === 0) {
                    // BRIGHT HEAD: Make the first character white and fully opaque
                    color = '#FFFFFF';
                    opacity = 1.0;
                } else if (index < 5) {
                    // BRIGHT TAIL: Characters just behind the head
                    color = '#00FF00';
                    opacity = 0.8 - (index * 0.1); 
                } else {
                    // FADING TAIL: Characters further back fade to dark green/low opacity
                    color = '#006600'; // Dark green
                    opacity = 0.2 - (index * 0.01);
                }


                
                return (
                    <Text
                        key={item.id}
                        position={[0, yOffset, 0]}
                        font={'/fonts/Roboto_Bold.json'}
                        // @ts-expect-error (Suppressing the Text component type error)
                        size={CHARACTER_SPACING}
                        height={0}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {randomChar()} {/* Ensure characters are re-randomized */}
                        <meshBasicMaterial 
                            color={color} 
                            transparent 
                            opacity={opacity} 
                        />
                    </Text>
                );
            })}
        </group>
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