import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cookies, headers } from 'next/headers';
import { randomUUID } from 'crypto';
import prisma from '@/server/db/prisma';
import { MusicPlayer } from '@/components/microsite/MusicPlayer';
import { RsvpForm } from '@/components/microsite/RsvpForm';
import { Countdown } from '@/components/microsite/Countdown';
import { Gallery } from '@/components/microsite/Gallery';
import { AnimatedHero } from '@/components/microsite/AnimatedHero';
import { PaystackGift } from '@/components/microsite/PaystackGift';
import { FloatingBubbles } from '@/components/microsite/FloatingBubbles';

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

  // --- View tracking with deduping ---
  // Middleware sets the 'evly_visitor' cookie if missing.
  // We only create a ViewTracking record (and increment analytics) on the *first* visit
  // by this visitor for this event. Subsequent opens by the same browser are ignored.
  try {
    const cookieStore = await cookies();
    const headersList = await headers();

    // Read cookie set by middleware (or generate locally for this first request's tracking)
    let visitorId = cookieStore.get('evly_visitor')?.value;
    if (!visitorId) {
      visitorId = randomUUID();
    }

    const userAgent = headersList.get('user-agent') || '';
    const deviceType = /Mobi|Android/i.test(userAgent) ? 'mobile' : 'desktop';
    const source = headersList.get('referer') || null;

    // Dedupe: only record if this visitor hasn't viewed this event before
    const existingView = await prisma.viewTracking.findFirst({
      where: {
        eventId: event.id,
        visitorId,
      },
    });

    if (!existingView) {
      await prisma.viewTracking.create({
        data: {
          eventId: event.id,
          visitorId,
          deviceType,
          source,
        },
      });

      // Increment analytics (creates the record for legacy events if needed)
      await prisma.analytics.upsert({
        where: { eventId: event.id },
        create: {
          eventId: event.id,
          totalViews: 1,
          uniqueVisitors: 1,
          mobileViews: deviceType === 'mobile' ? 1 : 0,
          desktopViews: deviceType === 'desktop' ? 1 : 0,
        },
        update: {
          totalViews: { increment: 1 },
          uniqueVisitors: { increment: 1 },
          ...(deviceType === 'mobile'
            ? { mobileViews: { increment: 1 } }
            : { desktopViews: { increment: 1 } }),
          updatedAt: new Date(),
        },
      });
    }
  } catch (e) {
    // Never let view tracking break the page
    console.error('View tracking error:', e);
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

  const dateDisplay = new Date(event.eventDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const rsvpCount = event.rsvps.length;
  const attending = event.rsvps.filter(r => r.attendanceStatus === 'ATTENDING').length;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-[#f5f0e6]" style={{ '--primary': primary, '--secondary': secondary } as any}>
      {/* Hero */}
      <section className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(var(--primary)_0.6px,transparent_1px)] bg-[length:4px_4px] opacity-10" />
        
        {/* Clean, elegant floating bubble animations behind the hero text.
            Inspired by premium sites like Antigravity — soft gold orbs rising gently
            with organic movement and subtle glow. Very low opacity so the text remains crisp. */}
        <FloatingBubbles 
          count={45} 
          minOpacity={0.18} 
          maxOpacity={0.48} 
          minSize={13} 
          maxSize={54} 
          blur={0.25} 
        />

        <AnimatedHero
          names={names}
          dateDisplay={dateDisplay}
          eventTime={event.eventTime}
          venueName={event.venueName}
          headingFont={headingFont}
        />

        <div className="absolute bottom-8 text-[10px] tracking-[2px] text-[#f5f0e6]/40">SCROLL TO BEGIN</div>
      </section>

      {/* Invitation */}
      <section id="invitation" className="border-t border-white/10 py-20 md:py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          {/* Elegant high-end transition divider */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-8 bg-[var(--primary)]/40" />
            <div className="text-[9px] tracking-[4px] text-[var(--primary)]/60">THE INVITATION</div>
            <div className="h-px w-8 bg-[var(--primary)]/40" />
          </div>

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

      {/* Details - system-built-in clean map background (like the bubbles).
          Live Google Maps embed sits fully behind the text. No user-provided image needed.
          Dark overlay ensures text readability. */}
      <section className="relative border-t border-white/10 py-12 md:py-16 min-h-[50vh] md:min-h-[55vh] flex items-center overflow-hidden">
        {/* Full-cover live map as background - automatic from venueAddress */}
        <iframe
          src={`https://www.google.com/maps?q=${encodeURIComponent(event.venueAddress)}&output=embed`}
          className="absolute inset-0 w-full h-full z-0 pointer-events-none opacity-60 grayscale-[0.2] brightness-75"
          style={{ border: 0 }}
          loading="lazy"
          title="Venue location map"
        />

        {/* Overlay for text contrast and elegant look */}
        <div className="absolute inset-0 bg-[#0a0a0a]/75 z-10" />

        <div className="relative z-20 mx-auto max-w-xl px-6 text-center">
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
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(event.venueAddress)}`} 
            target="_blank" 
            className="btn mt-8 inline-flex px-8 py-3 text-sm"
          >
            View on Google Maps
          </a>
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
      {event.showGifts && (
        <section className="border-t border-white/10 py-16">
          <div className="mx-auto max-w-md px-6 text-center">
            <h2 className="font-heading text-4xl tracking-tight mb-3" style={{ fontFamily: headingFont }}>Gifts</h2>
            <p className="text-[#f5f0e6]/70 mb-6 text-sm">
              If you would like to send a monetary gift, you can do so using the details below.
            </p>

            {event.bankName && (
              <div className="card mb-4 text-left border-l-2 border-[var(--primary)] pl-5">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px flex-1 bg-[var(--primary)]/30" />
                  <div className="text-[10px] tracking-[2px] text-[var(--primary)]">BANK TRANSFER</div>
                  <div className="h-px flex-1 bg-[var(--primary)]/30" />
                </div>
                <div className="space-y-3 text-sm">
                  <div>
                    <div className="text-[10px] tracking-widest text-[#f5f0e6]/50">BANK</div>
                    <div className="font-medium tracking-wide">{event.bankName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-widest text-[#f5f0e6]/50">ACCOUNT NAME</div>
                    <div>{event.accountName}</div>
                  </div>
                  <div>
                    <div className="text-[10px] tracking-widest text-[#f5f0e6]/50">ACCOUNT NUMBER</div>
                    <div className="font-mono tracking-[1.5px] text-base">{event.accountNumber}</div>
                  </div>
                </div>
              </div>
            )}

            {event.paystackPublicKey && (
              <PaystackGift publicKey={event.paystackPublicKey} />
            )}

            {!event.bankName && !event.paystackPublicKey && (
              <p className="text-sm text-[#f5f0e6]/60">
                The hosts have enabled gifts. Please ask them directly for details.
              </p>
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

      {/* Music - autoplays on load, minimal hidden control (small icon in corner).
          The invitee sees the subtle indicator while music plays in background. */}
      {event.musicUrl && (
        <div className="fixed bottom-4 right-4 z-50">
          <MusicPlayer 
            url={event.musicUrl} 
            category={event.musicCategory} 
            autoPlay={true} 
            compact={true} 
          />
        </div>
      )}

      <footer className="border-t border-white/10 py-10 text-center text-xs tracking-[1.5px] text-[#f5f0e6]/50">
        <div className="flex flex-col items-center gap-1">
          <div>
            <Link href="/" className="font-medium text-[#C5A26F] hover:text-white transition-colors">Evently AI</Link>
          </div>
          <div className="text-[#f5f0e6]/40">Your story, beautifully told.</div>
        </div>
      </footer>
    </div>
  );
}
