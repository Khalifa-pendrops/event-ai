import Link from 'next/link';
import { Plus, Eye, Users } from 'lucide-react';
import prisma from '@/server/db/prisma';

export default async function DashboardPage() {
  // TODO: replace with real user from session
  const events = await prisma.event.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: { rsvps: true },
      },
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
          <div className="mt-12 card text-center">
            <p className="text-[#f5f0e6]/70">You haven&apos;t created any events yet.</p>
            <Link href="/dashboard/events/create" className="btn mt-6 inline-flex">
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
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs ${event.status === 'PUBLISHED' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {event.status}
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-4 text-sm text-[#f5f0e6]/70">
                  <div className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> {event.viewCount || 0}
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
