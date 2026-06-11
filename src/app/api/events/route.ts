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

    // Enum validation (prevents opaque Prisma enum errors)
    const VALID_TYPES = ['WEDDING', 'TRADITIONAL_MARRIAGE', 'BIRTHDAY'] as const
    const VALID_TEMPLATES = ['LUXURY_GOLD', 'ELEGANT_WHITE', 'AFRICAN_HERITAGE', 'FLORAL', 'MODERN_MINIMAL', 'BLACK_PREMIUM'] as const
    const VALID_CULTURES = ['IGBO', 'YORUBA', 'HAUSA', 'GHANAIAN', 'OTHER'] as const

    if (!VALID_TYPES.includes(body.type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 })
    }
    if (body.template && !VALID_TEMPLATES.includes(body.template)) {
      return NextResponse.json({ error: 'Invalid template' }, { status: 400 })
    }
    if (body.culture && !VALID_CULTURES.includes(body.culture)) {
      return NextResponse.json({ error: 'Invalid culture' }, { status: 400 })
    }

    // Safe parsing to avoid NaN / Invalid Date reaching Prisma (which would 500)
    let age: number | null = null
    if (body.age != null && body.age !== '') {
      const parsed = parseInt(String(body.age), 10)
      if (!isNaN(parsed)) age = parsed
    }

    let eventDate: Date
    try {
      eventDate = new Date(body.eventDate)
      if (isNaN(eventDate.getTime())) throw new Error('bad date')
    } catch {
      return NextResponse.json({ error: 'Invalid event date' }, { status: 400 })
    }

    // Normalize external links so they don't 404 from missing protocol
    const normalizeUrl = (url?: string) =>
      url && !/^https?:\/\//i.test(url) ? `https://${url}` : url || null

    // Generate a reasonably unique slug (timestamp + random for collision resistance)
    const baseSlug = (body.personOneName || body.celebrantName || 'event')
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
    const slug = body.slug || `${baseSlug}-${Date.now().toString(36)}`

    // Use a transaction so that event + gallery + analytics are atomic.
    // Prevents orphan events if a later step (images/analytics) fails.
    const created = await prisma.$transaction(async (tx) => {
      const event = await tx.event.create({
        data: {
          userId: session.user.id,
          type: body.type,
          status: 'PUBLISHED',
          slug,
          personOneName: body.personOneName || null,
          personTwoName: body.personTwoName || null,
          celebrantName: body.celebrantName || null,
          age,
          eventDate,
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

      // Save gallery photos (real Cloudinary URLs from /api/upload when user prepared them)
      if (Array.isArray(body.photos) && body.photos.length) {
        await tx.galleryImage.createMany({
          data: body.photos.map((p: any, i: number) => ({
            eventId: event.id,
            url: p.preview || p.url,
            publicId: p.publicId || `demo-${i}`,
            position: i,
            isHero: !!p.isHero || i === 0,
          })),
        })
      }

      // Ensure analytics record exists (for view tracking)
      await tx.analytics.upsert({
        where: { eventId: event.id },
        create: { eventId: event.id },
        update: {},
      })

      return event
    })

    return NextResponse.json({ id: created.id, slug: created.slug })
  } catch (e: any) {
    console.error('Event create error:', e)
    // Handle unique slug violation gracefully
    if (e?.code === 'P2002' && e?.meta?.target?.includes('slug')) {
      return NextResponse.json({ error: 'Slug already exists, please retry' }, { status: 409 })
    }
    // Surface real error (e.g. schema drift, invalid enum at prisma level, bad data) so client sees actionable message instead of generic mask.
    const msg = (e?.message || 'Failed to create event')
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
