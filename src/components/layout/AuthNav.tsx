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
        <span className="text-[#f5f0e6]/70">{session.user.email}</span>
        <Link href="/dashboard" className="hover:text-[#C5A26F]">Dashboard</Link>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="text-[#C5A26F] hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm">
      <Link href="/login" className="hover:text-[#C5A26F]">Sign in</Link>
      <Link href="/register" className="btn text-sm px-4 py-1">Sign up</Link>
    </div>
  );
}
