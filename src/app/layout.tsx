import type { Metadata } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Evently AI — Your Story, Beautifully Told",
  description: "Create luxury AI-powered event microsites in minutes. No code required.",
  icons: {
    icon: "/favicon.ico",
  },
};

import Header from '@/components/layout/Header';
import Link from 'next/link';
import Providers from '@/components/layout/Providers';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#0a0a0a] text-[#f5f0e6]">
        <Providers>
          <Header />
          {children}

          <footer className="border-t border-white/10 bg-[#0a0a0a] mt-auto">
            <div className="max-w-6xl mx-auto px-6 py-12">
              <div className="flex flex-col md:flex-row justify-between gap-y-10">
                <div>
                  <div className="font-heading text-2xl tracking-[-1px] text-[#C5A26F] mb-1">Evently AI</div>
                  <p className="text-sm text-[#f5f0e6]/60 max-w-xs">Luxury invitations. Powered by AI. Designed for the moments that matter.</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-x-12 gap-y-8 text-sm">
                  <div>
                    <div className="font-medium text-[#f5f0e6]/80 mb-3 tracking-wider text-xs">PRODUCT</div>
                    <div className="space-y-1.5 text-[#f5f0e6]/70">
                      <Link href="/#how-it-works" className="block hover:text-[#C5A26F]">How it works</Link>
                      <Link href="/#templates" className="block hover:text-[#C5A26F]">Templates</Link>
                      <Link href="/dashboard" className="block hover:text-[#C5A26F]">Create invitation</Link>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-[#f5f0e6]/80 mb-3 tracking-wider text-xs">COMPANY</div>
                    <div className="space-y-1.5 text-[#f5f0e6]/70">
                      <Link href="/" className="block hover:text-[#C5A26F]">About</Link>
                      <Link href="/" className="block hover:text-[#C5A26F]">Journal</Link>
                      <Link href="/" className="block hover:text-[#C5A26F]">Contact</Link>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-[#f5f0e6]/80 mb-3 tracking-wider text-xs">RESOURCES</div>
                    <div className="space-y-1.5 text-[#f5f0e6]/70">
                      <Link href="/#how-it-works" className="block hover:text-[#C5A26F]">How it works</Link>
                      <Link href="/#pricing" className="block hover:text-[#C5A26F]">Pricing</Link>
                      <Link href="/" className="block hover:text-[#C5A26F]">Support</Link>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium text-[#f5f0e6]/80 mb-3 tracking-wider text-xs">LEGAL</div>
                    <div className="space-y-1.5 text-[#f5f0e6]/70">
                      <Link href="/" className="block hover:text-[#C5A26F]">Privacy</Link>
                      <Link href="/" className="block hover:text-[#C5A26F]">Terms</Link>
                      <Link href="/" className="block hover:text-[#C5A26F]">Cookies</Link>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between text-xs text-[#f5f0e6]/50 tracking-wider">
                <div>© {new Date().getFullYear()} Evently AI. All rights reserved.</div>
                <div className="mt-2 md:mt-0">Crafted for the stories worth telling.</div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
