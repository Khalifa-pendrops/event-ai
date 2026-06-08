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

import AuthNav from '@/components/layout/AuthNav';
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
          <header className="border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur sticky top-0 z-50">
            <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
              <Link href="/" className="font-heading text-xl tracking-tight text-[#C5A26F]">Evently AI</Link>
              <AuthNav />
            </div>
          </header>
          {children}
        </Providers>
      </body>
    </html>
  );
}
