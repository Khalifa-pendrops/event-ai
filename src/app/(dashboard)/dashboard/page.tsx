import Link from 'next/link';
import { Plus, Eye, Users } from 'lucide-react';
import prisma from '@/server/db/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-8">
        <div className="text-center">
          <h1 className="font-heading text-3xl">Sign in required</h1>
          <p className="mt-2 text-[#f5f0e6]/70">Please sign in to access your dashboard.</p>
          <Link href="/login" className="btn mt-6 inline-flex">Sign in</Link>
        </div>
      </div>
    );
  }

  const events = await prisma.event.findMany({
    where: { userId: session.user.id as string },
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { rsvps: true },
      },
      analytics: true,
    },
  });

  return (
    <div className="min-h-screen bg-[#0a0a0a] p-8 text-[#f5f0e6]">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-4xl tracking-tight">Dashboard</h1>
            <p className="mt-1 text-[#f5f0e6]/60">Your events</p>
          </div>
          <Link href="/dashboard/events/create" className="btn flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="mt-12 card text-center py-12">
            <div className="mx-auto w-12 h-12 rounded-full bg-[#C5A26F]/10 flex items-center justify-center mb-4">
              <span className="text-[#C5A26F] text-xl">✧</span>
            </div>
            <p className="text-[#f5f0e6]/70 text-lg">You haven&apos;t created any events yet.</p>
            <p className="text-sm text-[#f5f0e6]/50 mt-1 mb-6">Your first beautiful invitation is just a few steps away.</p>
            <Link href="/dashboard/events/create" className="btn inline-flex">
              Create your first invitation
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div key={event.id} className="card">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-sm uppercase tracking-widest text-[#C5A26F]">{event.type}</div>
                    <h3 className="mt-1 text-xl font-medium">
                      {event.personOneName && event.personTwoName
                        ? `${event.personOneName} & ${event.personTwoName}`
                        : event.celebrantName || 'Untitled Event'}
                    </h3>
                    <div className="text-xs text-[#f5f0e6]/50">{event.template}</div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${event.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {event.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-[#f5f0e6]/70">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {event.analytics?.totalViews ?? 0}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" /> {event._count.rsvps}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Link href={`/dashboard/events/${event.id}`} className="btn-outline flex-1 text-center text-sm py-2">
                    Edit
                  </Link>
                  <Link href={`/e/${event.slug}`} className="btn flex-1 text-center text-sm py-2" target="_blank">
                    View
                  </Link>
                  <form action={async () => {
                    'use server';
                    await prisma.event.delete({ where: { id: event.id } });
                  }}>
                    <button type="submit" className="text-red-400 text-sm px-2">Delete</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
