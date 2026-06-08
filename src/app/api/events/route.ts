import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/server/db/prisma'

// Simple create event (stub for full wizard save)
// In real, validate, handle auth, upload real urls, etc.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const event = await prisma.event.create({
      data: {
        userId: 'demo-user-id', // TODO: from session
        type: body.type,
        status: 'PUBLISHED', // or DRAFT
        slug: body.slug || `${body.personOneName || body.celebrantName}-${Date.now()}`.toLowerCase().replace(/\s+/g, '-'),
        personOneName: body.personOneName,
        personTwoName: body.personTwoName,
        celebrantName: body.celebrantName,
        age: body.age ? parseInt(body.age) : null,
        eventDate: new Date(body.eventDate),
        eventTime: body.eventTime,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        culture: body.culture,
        aiContent: body.aiContent,
        musicUrl: body.music?.url,
        musicCategory: body.music?.category,
        primaryColor: body.aiContent?.primaryColor,
        secondaryColor: body.aiContent?.secondaryColor,
        headingFont: body.aiContent?.headingFont,
        bodyFont: body.aiContent?.bodyFont,
        showGifts: false,
      },
    })

    // Save photos if provided (assume urls)
    if (body.photos && body.photos.length) {
      await prisma.galleryImage.createMany({
        data: body.photos.map((p: any, i: number) => ({
          eventId: event.id,
          url: p.preview || p.url,
          publicId: p.publicId || `demo-${i}`,
          position: i,
          isHero: i === 0,
        })),
      })
    }

    return NextResponse.json({ id: event.id, slug: event.slug })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
