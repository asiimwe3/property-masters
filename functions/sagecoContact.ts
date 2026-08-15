/**
 * SageCo Evergreen — Contact Form API (with rate limiting)
 * Deployed as Base44 backend function
 * Callable at: https://derick-ai-775511bf.base44.app/functions/sagecoContact
 */

const rateLimit = new Map();

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
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
    // Rate limiting — max 5 per IP per hour
    const clientIP = req.headers.get('x-forwarded-for') || 'unknown';
    const now = Date.now();
    const windowMs = 3600000;
    const maxRequests = 5;

    const entry = rateLimit.get(clientIP) || { count: 0, firstRequest: now };
    if (now - entry.firstRequest > windowMs) {
      entry.count = 0;
      entry.firstRequest = now;
    }
    entry.count++;
    rateLimit.set(clientIP, entry);

    if (entry.count > maxRequests) {
      return new Response(JSON.stringify({
        error: 'Too many messages. Please try again later.',
      }), { status: 429, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();

    if (!body.name || !body.email || !body.message) {
      return new Response(JSON.stringify({
        error: 'Name, email, and message are required'
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (body.message.length > 2000) {
      return new Response(JSON.stringify({
        error: 'Message too long (max 2000 characters)'
      }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const sanitize = (str) => String(str).replace(/[<>]/g, '').trim();

    const cleanName = sanitize(body.name);
    const cleanEmail = body.email.trim().toLowerCase();
    const cleanMessage = sanitize(body.message);

    // Store in Supabase if configured
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://emldbjqegftrngxypeca.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGRianFlZ2Z0cm5neHlwZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMyNDM1MiwiZXhwIjoyMDkzOTAwMzUyfQ.qxKXCKisdivaO-x1nrGcnpmQL8K5Fcs2l69LizuAyLk';

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/contact_messages`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            name: cleanName,
            email: cleanEmail,
            message: cleanMessage,
            created_at: new Date().toISOString(),
          }),
        });
      } catch (e) {
        console.warn('[Contact] Storage failed:', e.message);
      }
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Message received. We will get back to you soon!',
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[Contact] Error:', error);
    return new Response(JSON.stringify({ error: 'Something went wrong' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
