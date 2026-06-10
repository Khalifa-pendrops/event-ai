'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import AuthNav from './AuthNav';

export default function Header() {
  const pathname = usePathname();
  const isInvitation = pathname?.startsWith('/e/');

  // On the beautiful invitation experience, keep the header extremely minimal
  // so it doesn't compete with the guest experience.
  if (isInvitation) {
    return (
      <header className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between text-sm">
          <Link 
            href="/" 
            className="font-heading text-lg tracking-tight text-[#C5A26F]/90 hover:text-[#C5A26F] transition-colors"
          >
            Evently AI
          </Link>
          <div className="text-[#f5f0e6]/50 text-xs tracking-[2px] hidden sm:block">
            AN INVITATION
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-white/10 bg-[#0a0a0a]/95 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-10">
          <Link 
            href="/" 
            className="font-heading text-2xl tracking-[-1px] text-[#C5A26F] hover:text-white transition-colors flex items-center gap-2"
          >
            <span className="font-medium">Evently</span>
            <span className="text-sm font-normal tracking-[2px] text-[#C5A26F]/70">AI</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#f5f0e6]/80">
            <Link href="/#how-it-works" className="hover:text-[#C5A26F] transition-colors">How it Works</Link>
            <Link href="/#templates" className="hover:text-[#C5A26F] transition-colors">Templates</Link>
            <Link href="/#pricing" className="hover:text-[#C5A26F] transition-colors">Pricing</Link>
          </nav>
        </div>
        
        <AuthNav />
      </div>
    </header>
  );
}
