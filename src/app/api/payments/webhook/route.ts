import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

// Paystack Webhook Handler
// Configure this URL in your Paystack dashboard: https://yourdomain.com/api/payments/webhook
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!signature || !process.env.PAYSTACK_SECRET_KEY) {
    return NextResponse.json({ error: 'Invalid signature or missing secret' }, { status: 400 })
  }

  // Verify signature
  const hash = crypto
    .createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex')

  if (hash !== signature) {
    console.error('Invalid Paystack webhook signature')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let event
  try {
    event = JSON.parse(body)
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  // Handle successful charge (for gifts or future premium payments)
  if (event.event === 'charge.success') {
    const data = event.data

    console.log('✅ Paystack charge successful:', {
      reference: data.reference,
      amount: data.amount / 100, // convert from kobo
      email: data.customer?.email,
      status: data.status,
      metadata: data.metadata,
    })

    // TODO: In a full implementation you could:
    // - Look up metadata.eventId or metadata.userId
    // - Record a successful gift/payment in DB
    // - Send confirmation email to guest/host
    // - Update any pending transaction status

    // For now we just log (you can expand this)
  }

  // Always acknowledge receipt quickly
  return NextResponse.json({ received: true })
}