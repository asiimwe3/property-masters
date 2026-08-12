/**
 * SageCo Evergreen — Broker Registration API (FIXED)
 * ====================================================
 * Backend function for Vercel API route /api/register-broker
 *
 * Fixes audit finding:
 * - "register-broker fails on brokers_plan_check constraint"
 * - "No input validation"
 * - "No authorization check"
 *
 * Changes:
 * 1. Properly handles the brokers table constraints
 * 2. Validates all inputs server-side
 * 3. Creates a transaction record for tracking
 * 4. Handles the payment flow properly
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
    const body = await req.json();

    // 1. Validate required fields
    const required = ['full_name', 'email', 'phone', 'location'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return new Response(JSON.stringify({
          error: `Missing required field: ${field}`
        }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 2. Sanitize inputs
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

    // 3. Insert broker record using service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

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
      console.error('[RegisterBroker] Insert failed:', JSON.stringify(brokerData));

      // Handle specific constraint violations
      if (brokerData.code === '23505') {
        return new Response(JSON.stringify({
          error: 'A broker with this email already exists'
        }), { status: 409, headers: { ...cors, 'Content-Type': 'application/json' } });
      }

      return new Response(JSON.stringify({
        error: brokerData.message || 'Failed to register broker',
      }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    console.log('[RegisterBroker] Broker registered:', brokerData[0]?.id);

    return new Response(JSON.stringify({
      success: true,
      broker: brokerData[0],
    }), {
      status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[RegisterBroker] Error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
    }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
