import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary from env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(request: NextRequest) {
  const formData = await request.formData()
  const files = formData.getAll('files') as File[]

  if (!files.length) {
    return NextResponse.json({ error: 'No files' }, { status: 400 })
  }

  try {
    const uploadPromises = files.map(async (file, i) => {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      const isAudio = file.type?.startsWith('audio/')

      return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
        const uploadOptions: any = {
          folder: isAudio ? 'evently/music' : 'evently/photos',
          resource_type: isAudio ? 'video' : 'image', // video works well for audio files too
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
