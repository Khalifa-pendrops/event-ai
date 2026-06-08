'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const eventTypes = ['Wedding', 'Traditional Marriage', 'Birthday'];

const templates = [
  { name: 'Luxury Gold', desc: 'Rich metallics and elegant serif typography' },
  { name: 'Elegant White', desc: 'Timeless ivory and soft gold accents' },
  { name: 'African Heritage', desc: 'Cultural patterns with warm earth tones' },
  { name: 'Floral', desc: 'Romantic blooms and delicate details' },
  { name: 'Modern Minimal', desc: 'Clean lines and refined simplicity' },
  { name: 'Black Premium', desc: 'Dramatic dark with striking gold' },
];

const testimonials = [
  {
    quote: "The most beautiful digital invitation we've ever seen. Our guests couldn't stop raving.",
    name: 'Amara & Chinedu',
    event: 'Traditional Marriage, Lagos',
  },
  {
    quote: 'AI got our love story perfectly. The animations felt so premium and personal.',
    name: 'Aisha & Kwame',
    event: 'Wedding, Accra',
  },
  {
    quote: 'Saved us weeks of design work. The RSVP and analytics are a game changer.',
    name: 'Olu & Blessing',
    event: 'Birthday, Abuja',
  },
];

const faqs = [
  {
    q: 'How does the AI generation work?',
    a: 'Answer a few questions about your event and upload photos. Our specialized models craft culturally appropriate copy, a refined color palette, and elegant typography tailored to your story.',
  },
  {
    q: 'Can I edit the invitation after generation?',
    a: 'Yes. The live editor lets you tweak text, colors, fonts, reorder photos, toggle sections, and add music in real time.',
  },
  {
    q: 'Do guests need to download anything?',
    a: 'No. The microsite works beautifully on any phone or desktop browser. Share via WhatsApp, Instagram, email, or QR code.',
  },
  {
    q: 'Is my data private?',
    a: 'Absolutely. RSVPs and photos are only visible to you. We use secure sessions and never sell your information.',
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0a] text-[#f5f0e6]">
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#C5A26F]/30 bg-[#111111] px-4 py-1 text-sm text-[#C5A26F]">
            <Sparkles className="h-4 w-4" />
            AI-Powered Luxury Invitations
          </div>

          <h1 className="font-heading text-7xl tracking-[-1.5px] md:text-8xl">
            Your Story,<br />Beautifully Told
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-xl text-[#f5f0e6]/70">
            Create stunning, animated event microsites in minutes. No code. Just your story.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/dashboard"
              className="btn group flex items-center gap-2 px-10 py-4 text-base"
            >
              Create Your Invitation
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="#how-it-works"
              className="btn-outline px-8 py-4 text-base"
            >
              See how it works
            </Link>
          </div>
        </div>

        <div className="absolute bottom-12 text-xs uppercase tracking-[3px] text-[#f5f0e6]/40">
          Weddings • Traditional Marriages • Birthdays
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-heading text-center text-5xl tracking-tight">How it works</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { step: '01', title: 'Tell us about your event', desc: 'Choose the type, enter the details, and upload up to six photos.' },
              { step: '02', title: 'AI crafts your invitation', desc: 'We generate culturally appropriate copy, a refined color palette, and elegant typography.' },
              { step: '03', title: 'Share with guests', desc: 'Beautiful link, animated microsite, QR code, and built-in RSVP tracking.' },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-heading text-[#C5A26F]">{item.step}</div>
                <h3 className="mt-4 text-2xl font-medium">{item.title}</h3>
                <p className="mt-2 text-[#f5f0e6]/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <p className="text-sm uppercase tracking-[2px] text-[#C5A26F]">MVP Event Types</p>
          <div className="mt-6 flex flex-wrap justify-center gap-x-6 gap-y-2 text-2xl font-heading">
            {eventTypes.map((type, i) => (
              <span key={i} className="inline-flex items-center">
                {type}
                {i < eventTypes.length - 1 && <span className="mx-3 text-[#C5A26F]">•</span>}
              </span>
            ))}
          </div>
          <p className="mt-4 text-sm text-[#f5f0e6]/60">Built to feel native to each tradition. Easy to extend for future event types.</p>
        </div>
      </section>

      {/* Templates */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[2px] text-[#C5A26F]">Six signature styles</p>
            <h2 className="mt-3 font-heading text-5xl tracking-tight">Beautiful templates, instantly</h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {templates.map((tpl, i) => (
              <div key={i} className="card group">
                <div className="mb-4 h-2 w-12 rounded-full bg-[#C5A26F]/70 transition group-hover:bg-[#C5A26F]" />
                <h3 className="text-2xl font-medium">{tpl.name}</h3>
                <p className="mt-2 text-[#f5f0e6]/70">{tpl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="font-heading text-center text-5xl tracking-tight">Loved by couples and families</h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {testimonials.map((t, i) => (
              <div key={i} className="card">
                <p className="text-lg leading-relaxed">“{t.quote}”</p>
                <div className="mt-6 text-sm">
                  <div className="font-medium">{t.name}</div>
                  <div className="text-[#f5f0e6]/60">{t.event}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <p className="text-sm uppercase tracking-[2px] text-[#C5A26F]">Simple pricing</p>
            <h2 className="mt-3 font-heading text-5xl tracking-tight">Start free. Upgrade when it feels right.</h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {/* Free */}
            <div className="card">
              <div className="text-sm font-medium text-[#C5A26F]">Free</div>
              <div className="mt-2 text-4xl font-heading tracking-tight">₦0</div>
              <ul className="mt-6 space-y-3 text-[#f5f0e6]/80">
                <li>• 1 event</li>
                <li>• Basic templates</li>
                <li>• Up to 50 RSVPs</li>
                <li>• Watermark on published site</li>
              </ul>
              <Link href="/dashboard" className="btn mt-8 w-full justify-center">Get started free</Link>
            </div>

            {/* Premium */}
            <div className="card border-[#C5A26F]/60">
              <div className="text-sm font-medium text-[#C5A26F]">Premium</div>
              <div className="mt-2 text-4xl font-heading tracking-tight">One-time or monthly</div>
              <ul className="mt-6 space-y-3 text-[#f5f0e6]/80">
                <li>• Unlimited events &amp; RSVPs</li>
                <li>• All premium templates</li>
                <li>• Full music library + uploads</li>
                <li>• Analytics &amp; CSV export</li>
                <li>• AI regeneration</li>
                <li>• No watermark</li>
              </ul>
              <Link href="/dashboard" className="btn mt-8 w-full justify-center">Upgrade to Premium</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 py-20">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="font-heading text-center text-5xl tracking-tight">Frequently asked questions</h2>
          <div className="mt-10 space-y-4">
            {faqs.map((faq, i) => (
              <details key={i} className="group rounded-xl border border-white/10 bg-[#161616] p-6 open:border-[#C5A26F]/40">
                <summary className="flex cursor-pointer list-none items-center justify-between text-lg font-medium">
                  {faq.q}
                  <span className="ml-4 text-[#C5A26F] transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-4 text-[#f5f0e6]/75">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="border-t border-white/10 py-20 text-center">
        <h2 className="font-heading text-5xl tracking-tight">Ready to tell your story beautifully?</h2>
        <Link href="/dashboard" className="btn mt-8 inline-flex px-12 py-4 text-lg">
          Create your invitation
        </Link>
        <p className="mt-4 text-xs text-[#f5f0e6]/50">No credit card required • Free plan available</p>
      </section>

      <footer className="border-t border-white/10 py-8 text-center text-xs text-[#f5f0e6]/50">
        © {new Date().getFullYear()} Evently AI. Luxury digital invitations.
      </footer>
    </main>
  );
}
