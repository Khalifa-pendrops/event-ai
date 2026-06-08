'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Stub - in real would send email
    setStatus('sent');
  };

  if (status === 'sent') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
        <div className="text-center">
          <h1 className="font-heading text-3xl">Check your email</h1>
          <p className="mt-2 text-[#f5f0e6]/70">If an account exists, a reset link has been sent.</p>
          <Link href="/login" className="btn mt-6 inline-flex">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] px-6">
      <div className="w-full max-w-md">
        <h1 className="font-heading text-4xl tracking-tight text-center mb-8">Reset password</h1>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full"
            required
          />
          <button type="submit" className="btn w-full">Send reset link</button>
        </form>
        <p className="text-center mt-4 text-sm">
          <Link href="/login" className="text-[#C5A26F] hover:underline">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
