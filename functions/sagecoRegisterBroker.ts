/**
 * SageCo Evergreen — Register Broker API (with validation)
 * Deployed as Base44 backend function
 * Callable at: https://derick-ai-775511bf.base44.app/functions/sagecoRegisterBroker
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
    const body = await req.json();

    const required = ['full_name', 'email', 'phone', 'location'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const sanitize = (str) => String(str).replace(/[<>]/g, '').trim();

    const cleanData = {
      full_name: sanitize(body.full_name),
      email: body.email.trim().toLowerCase(),
      phone: body.phone.trim(),
      location: sanitize(body.location),
      specialization: sanitize(body.specialization || ''),
      bio: sanitize(body.bio || ''),
      registration_status: 'pending',
      verified: false,
    };

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://emldbjqegftrngxypeca.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGRianFlZ2Z0cm5neHlwZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMyNDM1MiwiZXhwIjoyMDkzOTAwMzUyfQ.qxKXCKisdivaO-x1nrGcnpmQL8K5Fcs2l69LizuAyLk';

    const insertRes = await fetch(`${supabaseUrl}/rest/v1/brokers`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(cleanData),
    });

    const brokerData = await insertRes.json();

    if (!insertRes.ok) {
      if (brokerData.code === '23505') {
        return new Response(JSON.stringify({ error: 'A broker with this email already exists' }), {
          status: 409, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({
        error: brokerData.message || 'Failed to register broker',
      }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, broker: brokerData[0] }), {
      status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[RegisterBroker] Error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
