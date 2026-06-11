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
  initialTop: number;
}

interface FloatingBubblesProps {
  count?: number;
  minOpacity?: number;
  maxOpacity?: number;
  minSize?: number;
  maxSize?: number;
  blur?: number;
}

export function FloatingBubbles({
  count,
  minOpacity = 0.08,
  maxOpacity = 0.3,
  minSize = 10,
  maxSize = 48,
  blur = 0.4,
}: FloatingBubblesProps) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);

  useEffect(() => {
    // Generate bubbles only on client to avoid hydration mismatch from Math.random()
    const bubbleCount = count ?? (window.innerWidth < 640 ? 28 : 45);

    const generated: Bubble[] = Array.from({ length: bubbleCount }, (_, i) => {
      const size = Math.random() * (maxSize - minSize) + minSize;
      // Spread initial top position across a range almost as large as the travel distance (170%).
      // This makes the "group" of bubbles long enough that as the front exits the top,
      // the rear is still entering from the bottom, and resets happen while the stream is still filling the view.
      // Result: continuous back-to-back flow with no noticeable empty periods.
      // (Previously with only 65 spread, the gap was ~ (65/170)*avg_duration ≈ 11 seconds of reduced density after leading bubbles left the top before reset ones refilled the upper view.)
      const initialTop = 20 + Math.random() * 155; // ~20% to ~175% — spread matched to travel for immediate follow
      return {
        id: i,
        size,
        left: Math.random() * 100,
        // Very similar durations = consistent rising speed so the stream stays dense and together
        duration: 27 + Math.random() * 4, // 27-31s
        delay: Math.random() * 1.2,
        opacity: Math.random() * (maxOpacity - minOpacity) + minOpacity,
        xDrift: (Math.random() - 0.5) * 160, // wide range for different directions (left or right drift)
        scale: Math.random() * 0.22 + 0.96,
        initialTop,
      };
    });

    setBubbles(generated);
  }, [count, minOpacity, maxOpacity, minSize, maxSize]);

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
            top: `${bubble.initialTop}%`,
            background:
              'radial-gradient(circle at 35% 30%, rgba(197, 162, 111, 0.9), rgba(197, 162, 111, 0.45) 40%, transparent 72%)',
            boxShadow:
              '0 0 20px rgba(197, 162, 111, 0.5), inset 0 0 12px rgba(255,255,255,0.3)',
            filter: `blur(${blur}px)`,
            opacity: bubble.opacity,
            transform: `scale(${bubble.scale})`,
          }}
          animate={{
            top: `${bubble.initialTop - 170}%`,
            // Non-linear upward path with sway for "different directions" — some drift left, some right, with slight correction for organic floating feel
            x: [0, bubble.xDrift * 1.4, bubble.xDrift * 0.5, bubble.xDrift * 1.1, bubble.xDrift * 0.35],
            opacity: [bubble.opacity, bubble.opacity * 0.75, bubble.opacity * 0.15],
            scale: [bubble.scale, bubble.scale * 1.08, bubble.scale * 0.94],
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
