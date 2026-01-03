export const runtime = 'nodejs';

import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req) {
  try {
    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'Image URL is required' }), { status: 400 });
    }

    // Upload image from URL to Cloudinary
    const result = await cloudinary.uploader.upload(imageUrl, {
      folder: 'cms_uploads',
      resource_type: 'image',
    });

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (err) {
    console.error('Error uploading to Cloudinary:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}
