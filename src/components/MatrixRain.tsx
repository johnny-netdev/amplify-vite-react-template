import React, { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei'; 
import { Group } from 'three'; // Correctly importing Group for the ref

// --- Configuration & Global Helpers (Matrix Code Character Generation) ---
const RAIN_COUNT = 800;             // Total number of columns (Increased density)
const RAIN_SPEED = 0.05;            // Base speed of the drop (Set to slow)
const COLUMN_HEIGHT = 25;           // Max characters in a drop
const CHARACTER_SPACING = 0.1;      // Vertical space between characters


// Helper to generate a random integer in a range
const r = (from: number, to: number): number => {
    return Math.floor(Math.random() * (to - from + 1)) + from;
};

// Helper to randomly pick one argument
const pick = (...args: any[]): any => {
    return args[r(0, args.length - 1)];
};

// Generate character from specific Unicode ranges (Katakana, symbols, numbers)
const getChar = (): string => {
    return String.fromCharCode(pick(
        r(0x3041, 0x30ff), // Japanese characters
        r(0x2000, 0x206f), // Symbols/punctuation
        r(0x0020, 0x003f)  // Spaces, numbers, common symbols
    ));
};
const randomChar = getChar; 


// --- Column Data Structure ---
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
    const [columnChars, setColumnChars] = useState(generateColumn);
    
    // Using Group ref for the column container
    const groupRef = useRef<Group>(null!); 
    
    // Randomized speed for each column
    const speed = useMemo(() => RAIN_SPEED * (Math.random() * 0.5 + 0.75), []); 

    // Position setup (Decreased spread range from 40 to 25)
    const startX = useMemo(() => (Math.random() - 0.5) * 25, []);
    const initialY = useMemo(() => (Math.random() * 50) + 10, []);
    const startZ = useMemo(() => -Math.random() * 25, []);
    

    // Animation Logic (Movement and Reset)
    // Note: We use '_' instead of 'state' because it is not read (no flicker logic)
    useFrame((_, delta) => {
        if (groupRef.current) {
            // 1. Movement Logic
            groupRef.current.position.y -= speed * delta * 60; 

            // 2. Reset Logic
            if (groupRef.current.position.y < -30) {
                groupRef.current.position.y = initialY;
                
                // Regenerate content for a fresh drop
                setColumnChars(generateColumn()); 
            }
        }
    });

    // ⭐️ Key difference: Render each character individually for gradient control
    return (
        <group ref={groupRef} position={[startX, initialY, startZ]}>
            {columnChars.map((item, index) => {
                // Determine the character's vertical position in the column
                const yOffset = -index * CHARACTER_SPACING;
                
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
                        font={'/fonts/Roboto_Bold.json'} // Ensure your font supports CJK
                        // @ts-expect-error (Suppressing the Text component type error)
                        size={CHARACTER_SPACING}
                        height={0}
                        anchorX="center"
                        anchorY="middle"
                    >
                        {item.char} {/* Use the character from the state array */}
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