import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import prisma from '@/server/db/prisma'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'

// POST /api/events - create from wizard. Requires authenticated user.
// Uses real session.user.id so events appear in the creator's dashboard.
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    // Basic validation
    if (!body.type || !body.eventDate || !body.eventTime || !body.venueName || !body.venueAddress) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Normalize external links so they don't 404 from missing protocol
    const normalizeUrl = (url?: string) =>
      url && !/^https?:\/\//i.test(url) ? `https://${url}` : url || null;

    // Generate a reasonably unique slug (timestamp + random for collision resistance)
    const baseSlug = (body.personOneName || body.celebrantName || 'event')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const slug = body.slug || `${baseSlug}-${Date.now().toString(36)}`

    const event = await prisma.event.create({
      data: {
        userId: session.user.id,
        type: body.type,
        status: 'PUBLISHED',
        slug,
        personOneName: body.personOneName || null,
        personTwoName: body.personTwoName || null,
        celebrantName: body.celebrantName || null,
        age: body.age ? parseInt(body.age, 10) : null,
        eventDate: new Date(body.eventDate),
        eventTime: body.eventTime,
        venueName: body.venueName,
        venueAddress: body.venueAddress,
        culture: body.culture || null,
        template: body.template || 'LUXURY_GOLD',
        aiContent: body.aiContent || null,
        bankName: body.bankName || null,
        accountNumber: body.accountNumber || null,
        accountName: body.accountName || null,
        paystackLink: normalizeUrl(body.paystackLink), // legacy support
        paystackPublicKey: body.paystackPublicKey || null,
        showGifts: body.showGifts === 'true' || body.showGifts === true,
        musicUrl: body.music?.url || null,
        musicCategory: body.music?.category || null,
        primaryColor: body.aiContent?.primaryColor || null,
        secondaryColor: body.aiContent?.secondaryColor || null,
        headingFont: body.aiContent?.headingFont || null,
        bodyFont: body.aiContent?.bodyFont || null,
      },
    })

    // Save gallery photos (currently demo URLs from /api/upload stub)
    if (Array.isArray(body.photos) && body.photos.length) {
      await prisma.galleryImage.createMany({
        data: body.photos.map((p: any, i: number) => ({
          eventId: event.id,
          url: p.preview || p.url,
          publicId: p.publicId || `demo-${i}`,
          position: i,
          isHero: !!p.isHero || i === 0,
        })),
      })
    }

    return NextResponse.json({ id: event.id, slug: event.slug })
  } catch (e: any) {
    console.error('Event create error:', e)
    // Handle unique slug violation gracefully
    if (e?.code === 'P2002' && e?.meta?.target?.includes('slug')) {
      return NextResponse.json({ error: 'Slug already exists, please retry' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
  }
}
