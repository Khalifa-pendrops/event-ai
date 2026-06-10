import { NextRequest, NextResponse } from 'next/server'

// Stub upload API. In production, integrate with Cloudinary as per PRD.
// For now, returns demo image URLs (replace with real upload later).
export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No files' }, { status: 400 })
  }

  // Simulate upload delay and return public demo URLs
  // Real impl: upload to Cloudinary (or S3), return secure_url and public_id.
  // For audio files we return a reliable public demo track so the music preview + published
  // microsite can actually play something (until real per-file audio storage).
  const urls = files.map((file, i) => {
    const isAudio = file.type?.startsWith('audio/')
    if (isAudio) {
      return {
        url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        publicId: `demo-audio-${Date.now()}-${i}`,
      }
    }
    return {
      url: `https://picsum.photos/id/${(i % 10) + 10}/800/600`,
      publicId: `demo-${Date.now()}-${i}`,
    }
  })

  return NextResponse.json({ urls })
}
