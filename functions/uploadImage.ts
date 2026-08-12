/**
 * SageCo Evergreen — Image Upload API (FIXED)
 * ============================================
 * Backend function for Vercel API route /api/upload-image
 *
 * Uploads property images to Supabase Storage.
 * Validates file size and type before uploading.
 *
 * Changes:
 * 1. Added file size validation (max 5MB per image)
 * 2. Added file type validation (images only)
 * 3. Added authentication check
 * 4. Better error handling
 *
 * Environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 */

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  try {
    // 1. Check authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    // 2. Validate required fields
    if (!body.imageBase64 || !body.fileName) {
      return new Response(JSON.stringify({
        error: 'Missing imageBase64 or fileName'
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 3. Validate file size (base64 string length ≈ file size × 1.37)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const estimatedSize = (body.imageBase64.length * 3) / 4;

    if (estimatedSize > maxSizeBytes) {
      return new Response(JSON.stringify({
        error: 'Image too large. Maximum size is 5MB.'
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 4. Validate file type (check file extension)
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = body.fileName.toLowerCase().substring(body.fileName.lastIndexOf('.'));

    if (!allowedExtensions.includes(ext)) {
      return new Response(JSON.stringify({
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 5. Upload to Supabase Storage
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const userToken = authHeader.replace('Bearer ', '');

    // Get user ID from token
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    const userData = await userRes.json();
    const userId = userData.id || 'anonymous';

    // Upload to Supabase Storage using service role key
    const filePath = `properties/${userId}/${Date.now()}-${body.fileName}`;
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/property-images/${filePath}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': contentType,
        'x-upsert': 'false',
      },
      body: atob(body.imageBase64),
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error('[UploadImage] Storage upload failed:', errText);
      return new Response(JSON.stringify({
        error: 'Failed to upload image'
      }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 6. Get the public URL
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/property-images/${filePath}`;

    return new Response(JSON.stringify({
      success: true,
      url: publicUrl,
      path: filePath,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[UploadImage] Error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred'
    }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
