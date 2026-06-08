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
  // Real impl: upload to Cloudinary, return secure_url and public_id
  const urls = files.map((file, i) => ({
    url: `https://picsum.photos/id/${(i % 10) + 10}/800/600`, // demo
    publicId: `demo-${Date.now()}-${i}`,
  }))

  return NextResponse.json({ urls })
}
