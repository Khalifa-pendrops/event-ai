import prisma from '@/server/db/prisma';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function AdminPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== 'admin') {
    return <div className="p-8">Access denied. Admin only.</div>;
  }

  const [usersCount, eventsCount, rsvpsCount, payments] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.rSVP.count(),
    prisma.payment.findMany({ where: { status: 'success' } }),
  ]);

  const totalRevenue = payments.reduce((sum, p) => sum + p.amount, 0);

  const recentEvents = await prisma.event.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    // Explicit select (defensive against any schema drift + only loads what's rendered)
    select: {
      id: true,
      personOneName: true,
      personTwoName: true,
      celebrantName: true,
      status: true,
      slug: true,
      user: { select: { email: true } },
    },
  });

  const recentRsvps = await prisma.rSVP.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { event: true },
  });

  const TEMPLATE_VARIANTS = [
    'LUXURY_GOLD',
    'ELEGANT_WHITE',
    'AFRICAN_HERITAGE',
    'FLORAL',
    'MODERN_MINIMAL',
    'BLACK_PREMIUM',
  ] as const;

  const users = await prisma.user.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { subscription: true },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-[#f5f0e6]">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-heading text-4xl tracking-tight mb-8">Admin Panel</h1>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="text-3xl font-heading text-[#C5A26F]">{usersCount}</div>
            <div className="text-sm text-[#f5f0e6]/60">Total Users</div>
          </div>
          <div className="card">
            <div className="text-3xl font-heading text-[#C5A26F]">{eventsCount}</div>
            <div className="text-sm text-[#f5f0e6]/60">Total Events</div>
          </div>
          <div className="card">
            <div className="text-3xl font-heading text-[#C5A26F]">{rsvpsCount}</div>
            <div className="text-sm text-[#f5f0e6]/60">Total RSVPs</div>
          </div>
          <div className="card">
            <div className="text-3xl font-heading text-[#C5A26F]">₦{totalRevenue}</div>
            <div className="text-sm text-[#f5f0e6]/60">Total Revenue (success)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="text-xl font-medium mb-4">Recent Events</h2>
            <div className="space-y-3 text-sm">
              {recentEvents.map(event => (
                <div key={event.id} className="flex justify-between items-center border-b border-white/10 pb-2 last:border-0">
                  <div>
                    <div>{event.personOneName || event.celebrantName} {event.personTwoName ? `& ${event.personTwoName}` : ''}</div>
                    <div className="text-xs text-[#f5f0e6]/50">{event.user?.email}</div>
                  </div>
                  <div className="text-[#f5f0e6]/70">{event.status}</div>
                  <Link href={`/e/${event.slug}`} className="text-[#C5A26F] hover:underline" target="_blank">View</Link>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-medium mb-4">Recent RSVPs</h2>
            <div className="space-y-3 text-sm">
              {recentRsvps.map(rsvp => (
                <div key={rsvp.id} className="flex justify-between border-b border-white/10 pb-2 last:border-0">
                  <div>{rsvp.name} - {rsvp.attendanceStatus}</div>
                  <div className="text-[#f5f0e6]/70">{rsvp.event?.slug}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-medium mb-4">Users</h2>
            <div className="space-y-3 text-sm">
              {users.map(user => (
                <div key={user.id} className="flex justify-between border-b border-white/10 pb-2 last:border-0">
                  <div>{user.email} ({user.role})</div>
                  <div className="text-[#f5f0e6]/70">{user.subscription?.plan === 'PREMIUM' ? 'Premium' : 'Free'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h2 className="text-xl font-medium mb-4">Templates</h2>
            <div className="space-y-2 text-sm">
              {TEMPLATE_VARIANTS.map((name) => (
                <div key={name} className="flex justify-between border-b border-white/10 pb-2 last:border-0">
                  <div>{name.replace(/_/g, ' ')}</div>
                  <div className="text-[#f5f0e6]/70">Active</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
