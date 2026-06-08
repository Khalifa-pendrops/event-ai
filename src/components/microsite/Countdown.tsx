'use client';

import { useEffect, useState } from 'react';

export function Countdown({ date }: { date: Date | string }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    const target = new Date(date).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, mins, secs });
    }, 1000);

    return () => clearInterval(interval);
  }, [date]);

  return (
    <div className="grid grid-cols-4 gap-4 text-center">
      {[
        { label: 'Days', value: timeLeft.days },
        { label: 'Hours', value: timeLeft.hours },
        { label: 'Mins', value: timeLeft.mins },
        { label: 'Secs', value: timeLeft.secs },
      ].map((item, i) => (
        <div key={i} className="rounded-xl border border-white/10 py-6">
          <div className="font-heading text-4xl tracking-tighter text-[var(--primary)]">{item.value}</div>
          <div className="mt-1 text-[10px] tracking-[1px] text-[#f5f0e6]/50">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
