'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function AuthNav() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="text-sm">Loading...</div>;
  }

  if (session?.user) {
    return (
      <div className="flex items-center gap-4 text-sm">
        <span className="hidden md:inline text-[#f5f0e6]/60 text-xs tracking-wide truncate max-w-[160px]">
          {session.user.name || session.user.email?.split('@')[0]}
        </span>
        <Link 
          href="/dashboard" 
          className="px-4 py-1.5 rounded-full border border-white/20 hover:border-[#C5A26F]/60 hover:text-[#C5A26F] transition-all text-sm"
        >
          Dashboard
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-xs text-[#f5f0e6]/60 hover:text-[#C5A26F] tracking-wider uppercase"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      <Link 
        href="/login" 
        className="px-5 py-2 rounded-full text-[#f5f0e6]/80 hover:text-white transition-colors tracking-wide"
      >
        Log in
      </Link>
      <Link 
        href="/register" 
        className="btn text-sm px-6 py-2 rounded-full"
      >
        Get started
      </Link>
    </div>
  );
}
