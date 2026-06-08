import { NextRequest, NextResponse } from 'next/server'

// Stub AI generation per PRD.
// In real (Phase 5), call OpenAI with specialized prompts for Wedding/Traditional/Birthday.
// Returns structured JSON only, no markdown.
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, personOneName, personTwoName, celebrantName, culture } = body

  // Mock based on input, culturally aware for traditional
  const base = {
    headline: type === 'WEDDING' || type === 'TRADITIONAL_MARRIAGE' 
      ? `${personOneName} & ${personTwoName}` 
      : celebrantName || 'A Special Day',
    tagline: 'With hearts full of joy',
    invitationBody: 'You are cordially invited to share in our celebration of love and new beginnings.',
    primaryColor: '#C5A26F',
    secondaryColor: '#0a0a0a',
    headingFont: 'Cormorant Garamond',
    bodyFont: 'Inter',
  }

  if (type === 'TRADITIONAL_MARRIAGE' && culture) {
    base.invitationBody = `Join us in celebrating the sacred union according to ${culture} tradition.`
    if (culture === 'IGBO') base.tagline = 'Nna anyi na nne anyi'
  }

  const mock = {
    ...base,
    story: type !== 'BIRTHDAY' ? 'Our paths crossed by fate, and love blossomed into this beautiful journey we now embark upon together.' : undefined,
  }

  // Simulate delay
  await new Promise(r => setTimeout(r, 600))

  return NextResponse.json(mock)
}
