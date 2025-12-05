// src/components/CisspText.tsx

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text3D } from '@react-three/drei';
import { Mesh } from 'three'; // We need the Mesh type from three.js

function CisspText() {
  // 1. Define the Ref with its type: It will hold a Three.js Mesh (or null).
  //    The 'null!' tells TypeScript the ref will be assigned during rendering.
  const meshRef = useRef<Mesh>(null!); 
  
  // 2. Define the path to your JSON font file in the public directory
  //    *** MAKE SURE THIS PATH MATCHES WHERE YOU PUT YOUR FONT! ***
  const fontPath = '/fonts/Roboto_Bold.json'; 

  // 3. The useFrame hook runs on every frame to create the animation loop.
  //    We don't need to explicitly type the state, but we ensure 'delta' is a number.
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Rotate the text slowly on the Y-axis (vertical rotation)
      // delta ensures the rotation is frame-rate independent (same speed on all computers)
      meshRef.current.rotation.y += delta * 0.2; 
    }
  });

  return (
    // The mesh element acts as the container for the 3D text geometry
    <mesh ref={meshRef} position={[-2.5, 0, 0]}>
      
      {/* Text3D creates the 3D geometry for the text 'CISSP' */}
      <Text3D
        font={fontPath}
        size={1.5}          // How large the text appears
        height={0.5}        // How deep the text is (extrusion)
        curveSegments={12}  // Smoothness of the curves
      >
        CISSP
        
        {/* The material defines the artistic look (color, glow, shine) */}
        <meshStandardMaterial
          color={'#00FF00'}       // Primary color: Neon Green
          emissive={'#00FF00'}    // Emissive color: Makes the object glow (looks like it's emitting light)
          emissiveIntensity={1.5} // How strong the glow is
          metalness={0.5}         // Makes it look a bit metallic
          roughness={0.1}         // Makes it smooth and shiny (low roughness)
        />
      </Text3D>
    </mesh>
  );
}

export default CisspText;