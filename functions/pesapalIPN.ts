/**
 * SageCo Evergreen — PesaPal IPN (Instant Payment Notification) Handler
 * =====================================================================
 * This is the CRITICAL missing piece identified in the audit:
 * "No IPN handler, no callback verification, no database update"
 *
 * PesaPal sends a POST request to this endpoint after a payment is
 * processed (success or failure). This handler:
 * 1. Verifies the payment status with PesaPal's API
 * 2. Updates the transaction record in Supabase
 * 3. Calls the confirm_payment() database function to create
 *    double-entry ledger entries
 * 4. Updates the related booking/broker status
 *
 * Deploy as: /api/pesapal/ipn
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
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    // 1. Parse the IPN notification from PesaPal
    // PesaPal sends either GET params or POST body depending on configuration
    let notification;

    if (req.method === 'GET') {
      const url = new URL(req.url);
      notification = {
        OrderTrackingId: url.searchParams.get('OrderTrackingId'),
        OrderNotificationType: url.searchParams.get('OrderNotificationType'),
        OrderMerchantReference: url.searchParams.get('OrderMerchantReference'),
      };
    } else {
      notification = await req.json().catch(() => ({}));
    }

    console.log('[IPN] Received notification:', JSON.stringify(notification));

    const { OrderTrackingId, OrderMerchantReference } = notification;

    if (!OrderTrackingId && !OrderMerchantReference) {
      return new Response(JSON.stringify({ error: 'Missing payment reference' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 2. Get PesaPal credentials
    const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    const pesapalEnv = Deno.env.get('PESAPAL_ENV') || 'sandbox';

    const PESAPAL_BASE = pesapalEnv === 'live'
      ? 'https://pay.pesapal.com/v3'
      : 'https://cybqa.pesapal.com/v3';

    // 3. Get OAuth token from PesaPal
    const tokenRes = await fetch(`${PESAPAL_BASE}/api/Auth/RequestToken`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
      },
    });

    const tokenData = await tokenRes.json();
    if (!tokenData.token) {
      console.error('[IPN] Failed to get PesaPal token');
      return new Response(JSON.stringify({ error: 'Auth failed' }), {
        status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 4. Get the actual transaction status from PesaPal
    // This is the VERIFICATION step — we don't trust the notification alone
    const statusRes = await fetch(
      `${PESAPAL_BASE}/api/Transactions/GetTransactionStatus?orderTrackingId=${OrderTrackingId}`,
      {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${tokenData.token}`,
        },
      }
    );

    const statusData = await statusRes.json();

    console.log('[IPN] Payment status from PesaPal:', JSON.stringify(statusData));

    // 5. Verify the payment status
    const paymentStatus = statusData.payment_status_description || statusData.status || 'UNKNOWN';
    const paymentMethod = statusData.payment_method || '';
    const reference = OrderMerchantReference || statusData.merchant_reference || '';

    if (!reference) {
      console.error('[IPN] No reference found in notification');
      return new Response(JSON.stringify({ error: 'No reference' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 6. Call the Supabase confirm_payment() function
    // This function:
    //   - Updates the transaction status
    //   - Creates double-entry ledger entries
    //   - Updates the booking status
    //   - Updates the broker registration status
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      console.error('[IPN] Missing Supabase credentials');
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 503, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Call the RPC function to confirm the payment
    const rpcRes = await fetch(`${supabaseUrl}/rest/v1/rpc/confirm_payment`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p_reference: reference,
        p_pesapal_tracking_id: OrderTrackingId,
        p_pesapal_status: paymentStatus,
        p_payment_method: paymentMethod,
        p_raw_response: statusData,
      }),
    });

    const rpcData = await rpcRes.json();

    if (!rpcRes.ok) {
      console.error('[IPN] confirm_payment() failed:', JSON.stringify(rpcData));
      return new Response(JSON.stringify({
        error: 'Failed to update payment record',
        detail: rpcData.message || rpcData,
      }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    console.log('[IPN] Payment confirmed successfully:', reference, paymentStatus);

    // 7. Return 200 OK to PesaPal (they expect this to stop retrying)
    return new Response(JSON.stringify({
      success: true,
      reference,
      status: paymentStatus,
      ledger: rpcData,
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[IPN] Unexpected error:', error);
    // Return 200 anyway to prevent PesaPal from retrying infinitely
    // (we log the error and can reconcile later)
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal error — payment will be reconciled manually',
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
