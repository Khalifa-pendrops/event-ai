import { notFound } from 'next/navigation';
import prisma from '@/server/db/prisma';
import { MusicPlayer } from '@/components/microsite/MusicPlayer';
import { RsvpForm } from '@/components/microsite/RsvpForm';
import { Countdown } from '@/components/microsite/Countdown';
import { Gallery } from '@/components/microsite/Gallery';
import { motion } from 'framer-motion';

export default async function MicrositePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      rsvps: true,
    },
  });

  if (!event) {
    notFound();
  }

  const ai = event.aiContent as any || {};
  const primary = event.primaryColor || ai.primaryColor || '#C5A26F';
  const secondary = event.secondaryColor || ai.secondaryColor || '#0a0a0a';
  const headingFont = event.headingFont || ai.headingFont || 'Cormorant Garamond';
  const bodyFont = event.bodyFont || ai.bodyFont || 'Inter';

  const isWeddingOrTraditional = event.type === 'WEDDING' || event.type === 'TRADITIONAL_MARRIAGE';
  const names = isWeddingOrTraditional 
    ? `${event.personOneName} & ${event.personTwoName}` 
    : event.celebrantName;

  const rsvpCount = event.rsvps.length;
  const attending = event.rsvps.filter(r => r.attendanceStatus === 'ATTENDING').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e6]" style={{ '--primary': primary, '--secondary': secondary } as any}>
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(var(--primary)_0.6px,transparent_1px)] bg-[length:4px_4px] opacity-10" />
        
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="relative z-10 max-w-3xl"
        >
          <p className="mb-4 text-sm tracking-[4px] text-[var(--primary)]">YOU ARE INVITED</p>
          <h1 className="font-heading text-7xl tracking-[-2px] md:text-8xl" style={{ fontFamily: headingFont }}>
            {names}
          </h1>
          <p className="mt-6 text-xl text-[#f5f0e6]/80">{new Date(event.eventDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
          <p className="text-[#f5f0e6]/60">{event.eventTime} • {event.venueName}</p>

          <div className="mt-10">
            <a href="#invitation" className="btn inline-flex px-8 py-3 text-sm">Open Invitation</a>
          </div>
        </motion.div>

        <div className="absolute bottom-8 text-[10px] tracking-[2px] text-[#f5f0e6]/40">SCROLL TO BEGIN</div>
      </section>

      {/* Invitation */}
      <section id="invitation" className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <div className="mx-auto mb-8 h-px w-16 bg-[var(--primary)]/60" />
          <p className="font-heading text-2xl leading-relaxed tracking-tight" style={{ fontFamily: headingFont }}>
            {ai.invitationBody || 'You are cordially invited to celebrate this special occasion with us.'}
          </p>
          {ai.tagline && <p className="mt-6 text-sm text-[#f5f0e6]/60">— {ai.tagline}</p>}
        </div>
      </section>

      {/* Countdown */}
      <section className="border-t border-white/10 py-12">
        <div className="mx-auto max-w-md px-6 text-center">
          <p className="mb-6 text-xs tracking-[2px] text-[var(--primary)]">THE DAY IS NEAR</p>
          <Countdown date={event.eventDate} />
        </div>
      </section>

      {/* Story (for wedding/traditional) */}
      {isWeddingOrTraditional && ai.story && (
        <section className="border-t border-white/10 py-16">
          <div className="mx-auto max-w-2xl px-6 text-center">
            <h2 className="font-heading text-4xl tracking-tight mb-6" style={{ fontFamily: headingFont }}>Our Story</h2>
            <p className="text-lg leading-relaxed text-[#f5f0e6]/80">{ai.story}</p>
          </div>
        </section>
      )}

      {/* Details */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-xl px-6 text-center">
          <h2 className="font-heading text-4xl tracking-tight mb-8" style={{ fontFamily: headingFont }}>When &amp; Where</h2>
          <div className="space-y-8 text-lg">
            <div>
              <div className="text-[var(--primary)] text-sm tracking-widest">DATE &amp; TIME</div>
              <div>{new Date(event.eventDate).toLocaleDateString()} at {event.eventTime}</div>
            </div>
            <div>
              <div className="text-[var(--primary)] text-sm tracking-widest">VENUE</div>
              <div>{event.venueName}<br />{event.venueAddress}</div>
            </div>
          </div>
          <a href={`https://maps.google.com/?q=${encodeURIComponent(event.venueAddress)}`} target="_blank" className="btn mt-10 inline-flex px-8 py-3 text-sm">View on Google Maps</a>
        </div>
      </section>

      {/* Gallery */}
      {event.images.length > 0 && (
        <section className="border-t border-white/10 py-16">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-center text-xs tracking-[2px] text-[var(--primary)] mb-6">A FEW MOMENTS</p>
            <Gallery images={event.images} />
          </div>
        </section>
      )}

      {/* Gifts */}
      {event.showGifts && (event.bankName || event.paystackLink) && (
        <section className="border-t border-white/10 py-16">
          <div className="mx-auto max-w-md px-6 text-center">
            <h2 className="font-heading text-4xl tracking-tight mb-6" style={{ fontFamily: headingFont }}>Gifts</h2>
            {event.bankName && (
              <div className="card mb-4 text-left">
                <div className="text-sm text-[var(--primary)]">BANK TRANSFER</div>
                <div className="mt-2">{event.bankName}</div>
                <div>{event.accountName}</div>
                <div className="font-mono">{event.accountNumber}</div>
              </div>
            )}
            {event.paystackLink && (
              <a href={event.paystackLink} target="_blank" className="btn w-full">Send Gift via Paystack</a>
            )}
          </div>
        </section>
      )}

      {/* RSVP */}
      <section className="border-t border-white/10 py-16">
        <div className="mx-auto max-w-md px-6 text-center">
          <h2 className="font-heading text-4xl tracking-tight mb-3" style={{ fontFamily: headingFont }}>Will you be there?</h2>
          <p className="text-[#f5f0e6]/70 mb-8">Please let us know by {new Date(new Date(event.eventDate).getTime() - 14*24*60*60*1000).toLocaleDateString()}.</p>
          <RsvpForm eventId={event.id} slug={slug} />
        </div>
      </section>

      {/* Music */}
      {event.musicUrl && (
        <div className="fixed bottom-4 right-4 z-50">
          <MusicPlayer url={event.musicUrl} category={event.musicCategory} />
        </div>
      )}

      <footer className="border-t border-white/10 py-8 text-center text-xs text-[#f5f0e6]/50">
        <Link href="/" className="hover:text-[var(--primary)]">Evently AI</Link> • Made with love
      </footer>
    </div>
  );
}
