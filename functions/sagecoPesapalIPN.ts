/**
 * SageCo Evergreen — PesaPal IPN (Instant Payment Notification) Handler
 * Deployed as Base44 backend function
 * Callable at: https://derick-ai-775511bf.base44.app/functions/sagecoPesapalIPN
 */

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
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

    const { OrderTrackingId, OrderMerchantReference } = notification;

    if (!OrderTrackingId && !OrderMerchantReference) {
      return new Response(JSON.stringify({ error: 'Missing payment reference' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const consumerKey = Deno.env.get('PESAPAL_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('PESAPAL_CONSUMER_SECRET');
    const pesapalEnv = Deno.env.get('PESAPAL_ENV') || 'sandbox';

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

    const tokenData = await tokenRes.json();
    if (!tokenData.token) {
      return new Response(JSON.stringify({ error: 'Auth failed' }), {
        status: 502, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

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

    const paymentStatus = statusData.payment_status_description || statusData.status || 'UNKNOWN';
    const paymentMethod = statusData.payment_method || '';
    const reference = OrderMerchantReference || statusData.merchant_reference || '';

    if (!reference) {
      return new Response(JSON.stringify({ error: 'No reference' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      return new Response(JSON.stringify({ error: 'Database not configured' }), {
        status: 503, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Update transaction status
    const updateRes = await fetch(`${supabaseUrl}/rest/v1/transactions?reference=eq.${encodeURIComponent(reference)}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        status: paymentStatus === 'Completed' ? 'completed' : 'failed',
        pesapal_payment_status: paymentStatus,
        pesapal_payment_method: paymentMethod,
        raw_response: statusData,
        updated_at: new Date().toISOString(),
      }),
    });

    const updatedTxn = await updateRes.json();

    // If payment completed, create ledger entries
    if (paymentStatus === 'Completed' && updatedTxn[0]) {
      const txn = updatedTxn[0];
      const txnId = txn.id;
      const txnAmount = parseFloat(txn.amount) || 0;
      const txnType = txn.type || 'viewing_fee';

      // Determine account mapping
      let revenueAccount = 'viewing_fees';
      if (txnType === 'broker_registration' || txnType === 'broker_activation') {
        revenueAccount = 'broker_fees';
      } else if (txnType === 'property_purchase') {
        revenueAccount = 'property_sales';
      }

      // Create debit (cash increases) and credit (revenue increases)
      const ledgerEntries = [
        {
          transaction_id: txnId,
          account: 'cash',
          entry_type: 'debit',
          amount: txnAmount,
          description: `Cash received for ${txnType} - ${reference}`,
        },
        {
          transaction_id: txnId,
          account: revenueAccount,
          entry_type: 'credit',
          amount: txnAmount,
          description: `Revenue from ${txnType} - ${reference}`,
        },
      ];

      await fetch(`${supabaseUrl}/rest/v1/ledger_entries`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify(ledgerEntries),
      });

      // Update booking status if this was a viewing fee
      if (txnType === 'viewing_fee' && txn.booking_id) {
        await fetch(`${supabaseUrl}/rest/v1/bookings?id=eq.${txn.booking_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ payment_status: 'paid', status: 'confirmed' }),
        });
      }

      // Update broker status if this was a registration
      if ((txnType === 'broker_registration' || txnType === 'broker_activation') && txn.broker_id) {
        await fetch(`${supabaseUrl}/rest/v1/brokers?id=eq.${txn.broker_id}`, {
          method: 'PATCH',
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            registration_status: 'active',
            verified: true,
          }),
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      reference,
      status: paymentStatus,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[IPN] Unexpected error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: 'Internal error — payment will be reconciled manually',
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
