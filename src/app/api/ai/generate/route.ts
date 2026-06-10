import { NextRequest, NextResponse } from 'next/server'

// Stub AI generation per PRD.
// In real (Phase 5), call OpenAI with specialized prompts for Wedding/Traditional/Birthday.
// Returns structured JSON only, no markdown.
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, personOneName, personTwoName, celebrantName, age, culture } = body

  // Stub per PRD: type-aware + culturally sensitive copy.
  // Real version will call OpenAI with specialized system prompts for each EventType.
  let mock: any

  if (type === 'BIRTHDAY') {
    const name = celebrantName || 'the celebrant'
    const ageText = age ? ` ${age}` : ''
    mock = {
      headline: `${name}'s${ageText} Birthday`,
      tagline: 'Another year, another adventure',
      invitationBody: `Join us as we celebrate ${name}'s special day with laughter, cake, and good company.`,
      story: undefined,
      primaryColor: '#C5A26F',
      secondaryColor: '#0a0a0a',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
    }
  } else if (type === 'TRADITIONAL_MARRIAGE') {
    const names = personOneName && personTwoName 
      ? `${personOneName} & ${personTwoName}` 
      : 'the couple'
    mock = {
      headline: names,
      tagline: culture === 'IGBO' ? 'Nna anyi na nne anyi' : 'With hearts full of joy',
      invitationBody: culture 
        ? `Join us in celebrating the sacred union according to ${culture} tradition.`
        : 'You are cordially invited to share in our celebration of love and new beginnings.',
      story: 'Our paths crossed by fate, and love blossomed into this beautiful journey we now embark upon together.',
      primaryColor: '#C5A26F',
      secondaryColor: '#0a0a0a',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
    }
  } else {
    // WEDDING (default romantic)
    const names = personOneName && personTwoName 
      ? `${personOneName} & ${personTwoName}` 
      : 'the couple'
    mock = {
      headline: names,
      tagline: 'With hearts full of joy',
      invitationBody: 'You are cordially invited to share in our celebration of love and new beginnings.',
      story: 'Our paths crossed by fate, and love blossomed into this beautiful journey we now embark upon together.',
      primaryColor: '#C5A26F',
      secondaryColor: '#0a0a0a',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
    }
  }

  // Simulate realistic generation delay
  await new Promise(r => setTimeout(r, 600))

  return NextResponse.json(mock)
}
