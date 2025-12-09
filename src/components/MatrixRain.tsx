// src/MatrixRain.tsx
import React, { useEffect, useRef } from 'react';

// Random utility functions
const r = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min;
function pick<T>(...items: T[]): T {
  return items[r(0, items.length - 1)];
}

// Function to get a random character based on specified ranges
function getChar(): string {
  return String.fromCharCode(
    pick(
      r(0x3041, 0x30ff),  // Range for Japanese Hiragana/Katakana
      r(0x2000, 0x206f),  // Range for punctuation and other symbols
      r(0x0020, 0x003f)   // Range for basic punctuation
    )
  );
}

const MatrixRain: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const fontSize = 16;
    const columns = Math.floor(canvas.width / fontSize); // Ensure columns is an integer
  const drops: number[] = Array.from({ length: columns }, () => 1); // Create drops array

    const draw = () => {
      // Clear the canvas with a translucent black rectangle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#0F0'; // Green color
      ctx.font = `${fontSize}px monospace`;

      drops.forEach((drop, index) => {
        const character = getChar(); // Get a random character using the getChar function
        const x = index * fontSize; // Calculate x position
        const y = drop * fontSize;   // Calculate y position

        // Flicker effect for the lead character in every column
        const flicker = Math.random() > 0.5;
        ctx.save();
        ctx.globalAlpha = flicker ? 1 : 0.3 + Math.random() * 0.5;
        ctx.fillStyle = flicker ? '#fff' : '#0F0';
        ctx.fillText(character, x, y);
        ctx.restore();

        // Reset the drop if it goes beyond the canvas
        if (y > canvas.height && Math.random() > 0.975) {
          drops[index] = 0; // Reset the drop
        }
        drops[index]++; // Increment the drop position
      });
    };

    const interval = setInterval(draw, 50); // Set the draw interval
    return () => clearInterval(interval); // Cleanup on component unmount
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={window.innerWidth}
      height={window.innerHeight}
      style={{ display: 'block', position: 'absolute', top: 0, left: 0 }}
    />
  );
};

export default MatrixRain;