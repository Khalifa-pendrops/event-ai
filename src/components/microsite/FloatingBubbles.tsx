'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  size: number;
  left: number;
  duration: number;
  delay: number;
  opacity: number;
  xDrift: number;
  scale: number;
}

export function FloatingBubbles() {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Generate bubbles only on client to avoid hydration mismatch from Math.random()
    const bubbleCount = window.innerWidth < 640 ? 14 : 22;

    const generated: Bubble[] = Array.from({ length: bubbleCount }, (_, i) => {
      const size = Math.random() * 38 + 10;
      return {
        id: i,
        size,
        left: Math.random() * 100,
        duration: Math.random() * 26 + 24,
        delay: Math.random() * 15,
        opacity: Math.random() * 0.22 + 0.08,
        xDrift: (Math.random() - 0.5) * 90,
        scale: Math.random() * 0.35 + 0.9,
      };
    });

    setBubbles(generated);
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <motion.div
          key={bubble.id}
          className="absolute rounded-full"
          style={{
            width: bubble.size,
            height: bubble.size,
            left: `${bubble.left}%`,
            bottom: `-${bubble.size * 1.2}px`,
            background:
              'radial-gradient(circle at 35% 30%, rgba(197, 162, 111, 0.85), rgba(197, 162, 111, 0.35) 40%, transparent 75%)',
            boxShadow:
              '0 0 18px rgba(197, 162, 111, 0.4), inset 0 0 10px rgba(255,255,255,0.25)',
            filter: 'blur(0.4px)',
            opacity: bubble.opacity,
            transform: `scale(${bubble.scale})`,
          }}
          animate={{
            y: [0, -1400],
            x: [0, bubble.xDrift],
            opacity: [bubble.opacity, bubble.opacity * 0.65, bubble.opacity * 0.15],
            scale: [bubble.scale, bubble.scale * 1.15, bubble.scale * 0.88],
          }}
          transition={{
            duration: bubble.duration,
            delay: bubble.delay,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ))}
    </div>
  );
}
