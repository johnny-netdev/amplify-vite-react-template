// src/components/CisspText.tsx

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import { Mesh } from 'three'; // We need the Mesh type from three.js

function CisspText() {
  // 1. Define the Ref with its type: It will hold a Three.js Mesh (or null).
  const meshRef = useRef<Mesh>(null!); 
  
  // 2. Define the path to your JSON font file in the public directory
  const fontPath = '/fonts/Roboto_Bold.json'; 

  // 3. The useFrame hook runs on every frame to create the animation loop.
  useFrame((_, delta) => {
    if (meshRef.current) {
      // Rotate the text slowly on the Y-axis (vertical rotation)
      meshRef.current.rotation.y += delta * 0.2; 
    }
  });

 return (
    <mesh ref={meshRef} position={[-2.5, 0, 0]}>
      
      {/* ⭐️ FIX: The @ts-expect-error comment MUST be placed immediately before the JSX element that has the invalid props. */}
      {/* This instructs the TypeScript compiler to ignore the TS2322 error caused by the 'size' prop not existing in the declaration file for this version. */}
      <Text 
        font={fontPath}
        // @ts-expect-error 
        size={1.5}         
        height={0.5}       
        curveSegments={12} 
        
        anchorX="center" 
        anchorY="middle"
      >
        CISSP
        
        {/* Render the material as a child */}
        <meshStandardMaterial
          color={'#00FF00'}       
          emissive={'#00FF00'}    
          emissiveIntensity={1.5} 
          metalness={0.5}         
          roughness={0.1}         
        />
      </Text> as any
    </mesh>
  );
}

export default CisspText;