/**
 * SageCo Evergreen — PesaPal Payment Initiation (FIXED)
 * =====================================================
 * Backend function for Vercel API route /api/pesapal/initiate
 *
 * Fixes audit finding: "PesaPal token parse error"
 * The old code was getting an HTML error page because the PesaPal API
 * URL or credentials were wrong. This version:
 * 1. Uses PesaPal v3 API URLs (correct sandbox/live endpoints)
 * 2. Validates credentials before making requests
 * 3. Returns clear error messages
 * 4. Records the transaction in Supabase for tracking
 *
 * Environment variables needed:
 * - PESAPAL_CONSUMER_KEY
 * - PESAPAL_CONSUMER_SECRET
 * - PESAPAL_ENV (sandbox or live)
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
    // 1. Parse and validate the request body
    const body = await req.json();

    const required = ['amount', 'currency', 'description', 'email', 'phone', 'reference'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({
          error: `Missing required field: ${field}`
        }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
    }

    // Validate amount is positive
    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Amount must be a positive number' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 2. Get PesaPal API credentials from environment
    const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    const pesapalEnv = Deno.env.get('PESAPAL_ENV') || 'sandbox';

    if (!consumerKey || !consumerSecret) {
      console.error('[PesaPal] Missing credentials. Set PESAPAL_CONSUMER_KEY and PESAPAL_CONSUMER_SECRET.');
      return new Response(JSON.stringify({
        error: 'Payment service not configured. Contact support.'
      }), { status: 503, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    // 3. Determine the correct PesaPal API base URL
    // PesaPal v3 uses different URLs for sandbox vs live
    const PESAPAL_BASE = pesapalEnv === 'live'
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/v3'; // Sandbox URL (note: cybqa for sandbox)

    console.log(`[PesaPal] Using ${pesapalEnv} environment: ${PESAPAL_BASE}`);

    // 4. Get OAuth token from PesaPal
    // PesaPal v3 uses a simple token request with Basic auth
    const tokenRes = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
      },
    });

    // Check if the response is JSON (not HTML like the old error)
    const contentType = tokenRes.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await tokenRes.text();
      console.error('[PesaPal] Token request returned non-JSON:', text.substring(0, 200));
      return new Response(JSON.stringify({
        error: 'Payment service error. Please verify PesaPal credentials.',
        detail: text.substring(0, 200),
      }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const tokenData = await tokenRes.json();

    if (!tokenData.token) {
      console.error('[PesaPal] No token in response:', JSON.stringify(tokenData));
      return new Response(JSON.stringify({
        error: tokenData.error?.message || 'Failed to authenticate with payment service',
      }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    console.log('[PesaPal] Token obtained successfully');

    // 5. Register the IPN URL with PesaPal (required for v3)
    // The IPN URL is where PesaPal sends payment notifications
    const siteUrl = Deno.env.get('SITE_URL') || 'https://sageco-evergreen.vercel.app';
    const ipnUrl = `${siteUrl}/api/pesapal/ipn`;

    let ipnId = '';
    try {
      const ipnRes = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({
          url: ipnUrl,
          ipn_notification_type: 'POST',
        }),
      });

      if (ipnRes.ok) {
        const ipnData = await ipnRes.json();
        ipnId = ipnData.ipn_id || '';
        console.log('[PesaPal] IPN registered:', ipnId);
      }
    } catch (e) {
      console.warn('[PesaPal] IPN registration failed (non-fatal):', e.message);
    }

    // 6. Submit the order to PesaPal
    const orderRes = await fetch(`${PESAPAL_BASE}/api/Transactions/SubmitOrder`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${tokenData.token}`,
      },
      body: JSON.stringify({
        id: body.reference,
        currency: body.currency,
        amount: amount.toString(),
        description: body.description,
        callback_url: body.callback_url,
        notification_id: ipnId || undefined,
        billing_address: {
          email_address: body.email,
          phone_number: body.phone,
          first_name: body.first_name || '',
          last_name: body.last_name || '',
          country: 'UG',
          city: 'Kampala',
        },
      }),
    });

    const orderData = await orderRes.json();

    if (!orderRes.ok || !orderData.redirect_url) {
      console.error('[PesaPal] Order submission failed:', JSON.stringify(orderData));
      return new Response(JSON.stringify({
        error: orderData.error?.message || 'Failed to create payment order',
      }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    console.log('[PesaPal] Order created successfully:', body.reference);

    // 7. Record the transaction in Supabase (for tracking + ledger)
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (supabaseUrl && supabaseKey) {
      try {
        await fetch(`${supabaseUrl}/rest/v1/transactions`, {
          method: 'POST',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify({
            reference: body.reference,
            type: body.reference.startsWith('VIEWING') ? 'viewing_fee'
              : body.reference.startsWith('BROKER-REG') ? 'broker_registration'
              : 'broker_activation',
            status: 'pending',
            amount: amount,
            currency: body.currency,
            customer_email: body.email,
            customer_phone: body.phone,
            customer_name: `${body.first_name || ''} ${body.last_name || ''}`.trim(),
            description: body.description,
            pesapal_order_tracking_id: orderData.order_tracking_id || null,
          }),
        });
        console.log('[PesaPal] Transaction recorded in Supabase');
      } catch (e) {
        console.warn('[PesaPal] Failed to record transaction:', e.message);
      }
    }

    // 8. Return the redirect URL to the client
    return new Response(JSON.stringify({
      redirect_url: orderData.redirect_url,
      order_tracking_id: orderData.order_tracking_id,
      reference: body.reference,
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[PesaPal] Unexpected error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred. Please try again.',
    }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
