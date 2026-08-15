/**
 * SageCo Evergreen — PesaPal Payment Initiation
 * Deployed as Base44 backend function
 * Callable at: https://derick-ai-775511bf.base44.app/functions/sagecoPesapalInitiate
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

    const required = ['amount', 'currency', 'description', 'email', 'phone', 'reference'];
    for (const field of required) {
      if (!body[field]) {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) {
      return new Response(JSON.stringify({ error: 'Amount must be a positive number' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    const pesapalEnv = Deno.env.get('PESAPAL_ENV') || 'sandbox';

    if (!consumerKey || !consumerSecret) {
      return new Response(JSON.stringify({ error: 'Payment service not configured. Contact support.' }), {
        status: 503, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const PESAPAL_BASE = pesapalEnv === 'live'
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/v3';

    const tokenRes = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
      },
    });

    const contentType = tokenRes.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await tokenRes.text();
      return new Response(JSON.stringify({
        error: 'Payment service error. Verify PesaPal credentials.',
        detail: text.substring(0, 200),
      }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const tokenData = await tokenRes.json();
    if (!tokenData.token) {
      return new Response(JSON.stringify({
        error: tokenData.error?.message || 'Failed to authenticate with payment service',
      }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://derick-ai-775511bf.base44.app';
    const ipnUrl = `${siteUrl}/functions/sagecoPesapalIPN`;

    let ipnId = '';
    try {
      const ipnRes = await fetch(`${PESAPAL_BASE}/api/URLSetup/RegisterIPN`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify({ url: ipnUrl, ipn_notification_type: 'POST' }),
      });
      if (ipnRes.ok) {
        const ipnData = await ipnRes.json();
        ipnId = ipnData.ipn_id || '';
      }
    } catch (e) {
      console.warn('[PesaPal] IPN registration failed (non-fatal):', e.message);
    }

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
        callback_url: body.callback_url || ipnUrl,
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
      return new Response(JSON.stringify({
        error: orderData.error?.message || 'Failed to create payment order',
      }), { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://emldbjqegftrngxypeca.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGRianFlZ2Z0cm5neHlwZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMyNDM1MiwiZXhwIjoyMDkzOTAwMzUyfQ.qxKXCKisdivaO-x1nrGcnpmQL8K5Fcs2l69LizuAyLk';

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
      } catch (e) {
        console.warn('[PesaPal] Failed to record transaction:', e.message);
      }
    }

    return new Response(JSON.stringify({
      redirect_url: orderData.redirect_url,
      order_tracking_id: orderData.order_tracking_id,
      reference: body.reference,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[PesaPal] Unexpected error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
