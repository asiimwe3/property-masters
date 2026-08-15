/**
 * SageCo Evergreen — Upload Image API (with auth + validation)
 * Deployed as Base44 backend function
 * Callable at: https://derick-ai-775511bf.base44.app/functions/sagecoUploadImage
 */

Deno.serve(async (req) => {
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();

    if (!body.imageBase64 || !body.fileName) {
      return new Response(JSON.stringify({ error: 'Missing imageBase64 or fileName' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Validate file size (base64 ≈ file size × 1.37)
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB
    const estimatedSize = (body.imageBase64.length * 3) / 4;

    if (estimatedSize > maxSizeBytes) {
      return new Response(JSON.stringify({ error: 'Image too large. Maximum size is 5MB.' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp'];
    const ext = body.fileName.toLowerCase().substring(body.fileName.lastIndexOf('.'));

    if (!allowedExtensions.includes(ext)) {
      return new Response(JSON.stringify({
        error: `Invalid file type. Allowed: ${allowedExtensions.join(', ')}`
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
    const userToken = authHeader.replace('Bearer ', '');

    // Get user ID
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseAnonKey || '',
        'Authorization': `Bearer ${userToken}`,
      },
    });
    const userData = await userRes.json();
    const userId = userData.id || 'anonymous';

    // Upload to Supabase Storage
    const filePath = `properties/${userId}/${Date.now()}-${body.fileName}`;
    const contentType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';

    // Convert base64 to binary
    const binaryString = atob(body.imageBase64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/property-images/${filePath}`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': contentType,
        'x-upsert': 'false',
      },
      body: bytes.buffer,
    });

    if (!uploadRes.ok) {
      return new Response(JSON.stringify({ error: 'Failed to upload image' }), {
        status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const publicUrl = `${supabaseUrl}/storage/v1/object/public/property-images/${filePath}`;

    return new Response(JSON.stringify({ success: true, url: publicUrl, path: filePath }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[UploadImage] Error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
