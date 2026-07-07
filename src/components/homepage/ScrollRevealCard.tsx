'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef, type ReactNode } from 'react';

type ScrollRevealCardProps = {
  children: ReactNode;
  className?: string;
  index?: number;
  stagger?: number;
};

export function ScrollRevealCard({
  children,
  className = 'card',
  index = 0,
  stagger = 0.1,
}: ScrollRevealCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, amount: 0.15 });
  const reduceMotion = useReducedMotion();
  const shouldShow = reduceMotion || isInView;

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ transition: 'none' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: shouldShow ? 1 : 0 }}
      transition={{
        duration: 1.4,
        ease: 'easeOut',
        delay: shouldShow ? index * stagger : 0,
      }}
    >
      {children}
    </motion.div>
  );
}
