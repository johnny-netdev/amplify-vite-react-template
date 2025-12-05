// src/components/ThreeDBackground.tsx

import React from 'react';
import { Canvas } from '@react-three/fiber';
import CisspText from './CISSPText.tsx'; // Import the animated text component

const ThreeDBackground: React.FC = () => {
  return (
    // 1. CSS Container for Positioning
    <div 
      style={{
        position: 'fixed', // Stays in place relative to the viewport
        top: 0,
        left: 0,
        width: '100vw',    // Full viewport width
        height: '100vh',   // Full viewport height
        zIndex: -1,        // Crucial: Puts it behind all other HTML content
        background: '#0a0a1a' // Deep dark background color for the 'Matrix' feel
      }}
    >
      {/* 2. The React Three Fiber Canvas */}
      {/* This component sets up the WebGL context (the 3D viewport) */}
      <Canvas 
        camera={{ 
          position: [0, 0, 5], // Camera starts 5 units back on the Z-axis
          fov: 75             // Field of view
        }} 
        dpr={[1, 2]} // Performance: Limits the device pixel ratio
      >
        
        {/* 3. Basic Lighting (Illumination for the scene) */}
        
        {/* Ambient light: illuminates all objects equally, creating a base level of light */}
        <ambientLight 
          intensity={0.5} 
          color="#00FF00" // Subtle green tint
        />
        
        {/* Point light: acts like a single light bulb at a specific location */}
        <pointLight 
          position={[10, 10, 10]} 
          intensity={1} 
          color="#00FF00" 
        />
        
        {/* 4. The Animated CISSP Text Object */}
        <CisspText /> 
        
        {/* 5. Optional: A large, dim wireframe sphere for depth/environment */}
        <mesh position={[0, 0, -20]}>
          <sphereGeometry args={[15, 32, 32]} />
          <meshBasicMaterial 
            color="#004d00" 
            wireframe={true} 
            opacity={0.3} 
            transparent 
          />
        </mesh>

      </Canvas>
    </div>
  );
};

export default ThreeDBackground;