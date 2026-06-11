import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Real AI generation using OpenAI (with graceful fallback to mock).
// Returns structured JSON only.
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { type, personOneName, personTwoName, celebrantName, age, culture } = body

  const systemPrompt = `You are an expert luxury event copywriter specializing in elegant, culturally sensitive invitations for Nigerian, Ghanaian, and West African events (weddings, traditional marriages, birthdays).

Return ONLY a valid JSON object with exactly these keys (no markdown, no extra text):
{
  "headline": string,          // e.g. "Chidi & Amara" or "Adaeze's 30th Birthday"
  "tagline": string,           // short poetic line (5-8 words)
  "invitationBody": string,    // 1-2 warm paragraphs
  "story": string | null,      // short romantic/celebratory story or null for birthdays
  "primaryColor": "#C5A26F",   // elegant gold-ish hex
  "secondaryColor": "#0a0a0a", // dark
  "headingFont": "Cormorant Garamond",
  "bodyFont": "Inter"
}

Tailor tone and details to the event type. Use the provided names and culture where relevant. Keep language sophisticated and warm.`

  const userPrompt = `Event type: ${type}
${type === 'BIRTHDAY' 
  ? `Celebrant: ${celebrantName || 'Guest'}, Age: ${age || 'N/A'}`
  : `Couple: ${personOneName || ''} & ${personTwoName || ''}`
}
${culture ? `Culture: ${culture}` : ''}

Generate the JSON now.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No content from OpenAI')

    const parsed = JSON.parse(content)

    // Ensure required structure + sensible defaults
    return NextResponse.json({
      headline: parsed.headline || (type === 'BIRTHDAY' ? (celebrantName || 'Celebration') : `${personOneName || ''} & ${personTwoName || ''}`),
      tagline: parsed.tagline || 'With hearts full of joy',
      invitationBody: parsed.invitationBody || 'You are cordially invited to share in our celebration.',
      story: type === 'BIRTHDAY' ? null : (parsed.story || 'Our paths crossed by fate, and love blossomed into this beautiful journey.'),
      primaryColor: parsed.primaryColor || '#C5A26F',
      secondaryColor: parsed.secondaryColor || '#0a0a0a',
      headingFont: 'Cormorant Garamond',
      bodyFont: 'Inter',
    })
  } catch (error) {
    console.error('OpenAI generation failed, falling back to mock:', error)

    // Fallback mock (same as before for reliability)
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
      const names = personOneName && personTwoName ? `${personOneName} & ${personTwoName}` : 'the couple'
      mock = {
        headline: names,
        tagline: culture === 'IGBO' ? 'Nna anyi na nne anyi' : 'With hearts full of joy',
        invitationBody: culture ? `Join us in celebrating the sacred union according to ${culture} tradition.` : 'You are cordially invited to share in our celebration of love and new beginnings.',
        story: 'Our paths crossed by fate, and love blossomed into this beautiful journey we now embark upon together.',
        primaryColor: '#C5A26F',
        secondaryColor: '#0a0a0a',
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Inter',
      }
    } else {
      const names = personOneName && personTwoName ? `${personOneName} & ${personTwoName}` : 'the couple'
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

    return NextResponse.json(mock)
  }
}
