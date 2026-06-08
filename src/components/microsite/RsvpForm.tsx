'use client';

import { useState } from 'react';

export function RsvpForm({ eventId, slug }: { eventId: string; slug: string }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    attendanceStatus: 'ATTENDING' as 'ATTENDING' | 'DECLINED' | 'PENDING',
    guestCount: 1,
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, eventId }),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="card text-center">
        <p className="text-lg">Thank you! Your RSVP has been received.</p>
        <p className="text-sm text-[#f5f0e6]/60 mt-2">We look forward to celebrating with you.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <input 
        type="text" 
        placeholder="Full name" 
        value={form.name} 
        onChange={e => setForm({ ...form, name: e.target.value })} 
        className="w-full" 
        required 
      />
      <input 
        type="email" 
        placeholder="Email address" 
        value={form.email} 
        onChange={e => setForm({ ...form, email: e.target.value })} 
        className="w-full" 
      />
      <input 
        type="tel" 
        placeholder="Phone (optional)" 
        value={form.phone} 
        onChange={e => setForm({ ...form, phone: e.target.value })} 
        className="w-full" 
      />
      <select 
        value={form.attendanceStatus} 
        onChange={e => setForm({ ...form, attendanceStatus: e.target.value as any })} 
        className="w-full" 
        required
      >
        <option value="ATTENDING">Yes, with pleasure</option>
        <option value="DECLINED">Regretfully, no</option>
        <option value="PENDING">I&apos;ll try my best</option>
      </select>
      <input 
        type="number" 
        min="1" 
        placeholder="Number of guests" 
        value={form.guestCount} 
        onChange={e => setForm({ ...form, guestCount: parseInt(e.target.value) || 1 })} 
        className="w-full" 
      />
      <textarea 
        placeholder="Message for the couple (optional)" 
        rows={3} 
        value={form.message} 
        onChange={e => setForm({ ...form, message: e.target.value })} 
        className="w-full" 
      />
      <button type="submit" disabled={status === 'loading'} className="btn w-full">
        {status === 'loading' ? 'Sending...' : 'Send RSVP'}
      </button>
      {status === 'error' && <p className="text-red-400 text-sm text-center">Something went wrong. Please try again.</p>}
    </form>
  );
}
