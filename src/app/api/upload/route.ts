import { NextRequest, NextResponse } from 'next/server'

async function getConfiguredCloudinary() {
  const cloud_name = process.env.CLOUDINARY_CLOUD_NAME
  const api_key = process.env.CLOUDINARY_API_KEY
  const api_secret = process.env.CLOUDINARY_API_SECRET

  if (!cloud_name || !api_key || !api_secret) {
    return null
  }

  // A malformed CLOUDINARY_URL (common on Vercel) crashes the SDK at import time.
  // Prefer the explicit vars when all three are set.
  delete process.env.CLOUDINARY_URL

  const { v2: cloudinary } = await import('cloudinary')
  cloudinary.config({ cloud_name, api_key, api_secret, secure: true })
  return cloudinary
}

export async function POST(request: NextRequest) {
  const cloudinary = await getConfiguredCloudinary()
  if (!cloudinary) {
    return NextResponse.json({ error: 'Cloudinary not configured' }, { status: 503 })
  }

  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No files' }, { status: 400 })
  }

  try {
    const uploadPromises = files.map(async (file) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const isAudio = file.type?.startsWith('audio/')

      return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const uploadOptions: Record<string, string> = {
          folder: isAudio ? 'evently/music' : 'evently/photos',
          resource_type: isAudio ? 'video' : 'image',
        }

        cloudinary.uploader.upload_stream(
          uploadOptions,
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error)
              reject(error)
            } else if (result) {
              resolve({
                url: result.secure_url,
                publicId: result.public_id,
              })
            } else {
              reject(new Error('No result from Cloudinary'))
            }
          }
        ).end(buffer)
      })
    })

    const urls = await Promise.all(uploadPromises)

    return NextResponse.json({ urls })
  } catch (error) {
    console.error('Upload failed:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}