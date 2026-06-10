'use client';

import { motion } from 'framer-motion';

interface AnimatedHeroProps {
  names: string;
  dateDisplay: string;
  eventTime: string;
  venueName: string;
  headingFont: string;
}

export function AnimatedHero({
  names,
  dateDisplay,
  eventTime,
  venueName,
  headingFont,
}: AnimatedHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-10 max-w-3xl"
    >
      <p className="mb-4 text-sm tracking-[4px] text-[var(--primary)]">
        YOU ARE INVITED
      </p>
      <h1
        className="font-heading text-7xl tracking-[-2px] md:text-8xl"
        style={{ fontFamily: headingFont }}
      >
        {names}
      </h1>
      <p className="mt-6 text-xl text-[#f5f0e6]/80">{dateDisplay}</p>
      <p className="text-[#f5f0e6]/60">
        {eventTime} • {venueName}
      </p>
    </motion.div>
  );
}
