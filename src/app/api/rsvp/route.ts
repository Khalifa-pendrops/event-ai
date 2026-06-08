import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { eventId, name, email, phone, attendanceStatus, guestCount, message } = body;

    if (!eventId || !name || !attendanceStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await prisma.rSVP.create({
      data: {
        eventId,
        name,
        email: email || null,
        phone: phone || null,
        attendanceStatus,
        guestCount: guestCount || 1,
        message: message || null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to submit RSVP' }, { status: 500 });
  }
}
