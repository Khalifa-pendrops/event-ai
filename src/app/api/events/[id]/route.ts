import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/server/db/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const event = await prisma.event.findUnique({
    where: { id },
    include: {
      images: true,
      rsvps: true,
    },
  });

  if (!event) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  return NextResponse.json(event);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const updated = await prisma.event.update({
    where: { id },
    data: {
      status: body.status,
      aiContent: body.aiContent,
      // add more fields as needed
    },
  });

  return NextResponse.json(updated);
}
