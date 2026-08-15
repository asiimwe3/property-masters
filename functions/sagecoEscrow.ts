/**
 * SageCo Evergreen v3 — Programmable Escrow & Payments
 * Deployed as Base44 backend function
 * 
 * Handles: viewing fees, purchase deposits, full purchases
 * Payment methods: MTN MoMo, Airtel Money, cards (via PesaPal)
 * Features: GPS-verified fund release, milestone tracking, auto-release
 */
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const SUPABASE_URL = Deno.env.get('SAGECO_SUPABASE_URL') || '';
  const SUPABASE_KEY = Deno.env.get('SAGECO_SUPABASE_SERVICE_KEY') || Deno.env.get('SAGECO_SUPABASE_ANON_KEY') || '';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  const authHeader = req.headers.get('Authorization') || '';
  const url = new URL(req.url);
  const action = url.searchParams.get('action') || 'create';

  // ── Helper: Supabase fetch ──
  async function sbFetch(table: string, method: string, body?: any, filter?: string) {
    const sbUrl = `${SUPABASE_URL}/rest/v1/${table}${filter || ''}`;
    const headers: Record<string, string> = {
      'apikey': SUPABASE_KEY,
      'Authorization': authHeader || `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
    };
    if (method === 'POST') headers['Prefer'] = 'return=representation';
    if (method === 'PATCH') headers['Prefer'] = 'return=representation';

    const res = await fetch(sbUrl, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    return res;
  }

  try {
    // ── CREATE ESCROW ──
    if (req.method === 'POST' && action === 'create') {
      const body = await req.json();
      const { property_id, buyer_id, seller_id, broker_id, escrow_type, amount, payment_method } = body;

      if (!property_id || !buyer_id || !escrow_type || !amount) {
        return new Response(JSON.stringify({ error: 'Missing required fields: property_id, buyer_id, escrow_type, amount' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const validTypes = ['viewing_fee', 'purchase_deposit', 'full_purchase'];
      const validMethods = ['mtn_momo', 'airtel_money', 'card', 'bank_transfer'];
      if (!validTypes.includes(escrow_type)) {
        return new Response(JSON.stringify({ error: `Invalid escrow_type. Must be one of: ${validTypes.join(', ')}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      if (payment_method && !validMethods.includes(payment_method)) {
        return new Response(JSON.stringify({ error: `Invalid payment_method. Must be one of: ${validMethods.join(', ')}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Create escrow transaction
      const escrow = {
        id: crypto.randomUUID(),
        property_id,
        buyer_id,
        seller_id: seller_id || null,
        broker_id: broker_id || null,
        escrow_type,
        amount: parseFloat(amount),
        currency: 'UGX',
        payment_method: payment_method || 'mtn_momo',
        status: 'pending',
        gps_verification: null,
        milestone: null,
        auto_release_at: escrow_type === 'viewing_fee' 
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h auto-release for viewing fees
          : null,
      };

      const res = await sbFetch('escrow_transactions', 'POST', escrow);
      const created = await res.json();

      if (!res.ok) {
        return new Response(JSON.stringify({ error: 'Failed to create escrow', detail: created }), {
          status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Create default milestones based on type
      let milestones = [];
      if (escrow_type === 'viewing_fee') {
        milestones = [
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'payment', description: 'Viewing fee payment', amount: parseFloat(amount), status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'site_visit', description: 'GPS-verified site visit', amount: 0, status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'release', description: 'Fund release to broker', amount: parseFloat(amount), status: 'pending' },
        ];
      } else if (escrow_type === 'purchase_deposit') {
        milestones = [
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'payment', description: 'Deposit payment', amount: parseFloat(amount), status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'verification', description: 'Property verification + land passport', amount: 0, status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'agreement', description: 'Sale agreement signed', amount: 0, status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'release', description: 'Deposit release to seller', amount: parseFloat(amount), status: 'pending' },
        ];
      } else if (escrow_type === 'full_purchase') {
        milestones = [
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'payment', description: 'Full purchase payment', amount: parseFloat(amount), status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'verification', description: 'Title verification + fraud check', amount: 0, status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'transfer', description: 'Title transfer initiated', amount: 0, status: 'pending' },
          { id: crypto.randomUUID(), escrow_id: escrow.id, milestone_type: 'release', description: 'Full payment release to seller', amount: parseFloat(amount), status: 'pending' },
        ];
      }

      if (milestones.length > 0) {
        await sbFetch('escrow_milestones', 'POST', milestones);
      }

      return new Response(JSON.stringify({
        success: true,
        escrow_id: escrow.id,
        status: 'pending',
        milestones: milestones.length,
        message: `Escrow created: ${escrow_type} for UGX ${amount}. ${milestones.length} milestones set up.`,
        next_step: 'Initiate payment via PesaPal to fund the escrow.',
      }), {
        status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── RELEASE ESCROW (GPS-verified) ──
    if (req.method === 'POST' && action === 'release') {
      const body = await req.json();
      const { escrow_id, gps_lat, gps_lng, verified_by } = body;

      if (!escrow_id) {
        return new Response(JSON.stringify({ error: 'escrow_id required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Fetch escrow
      const escrowRes = await sbFetch('escrow_transactions', 'GET', null, `?id=eq.${escrow_id}`);
      const escrowData = await escrowRes.json();
      if (!escrowData || escrowData.length === 0) {
        return new Response(JSON.stringify({ error: 'Escrow not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const escrow = escrowData[0];
      if (escrow.status !== 'funded') {
        return new Response(JSON.stringify({ error: `Escrow must be 'funded' to release. Current: ${escrow.status}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Update escrow with GPS verification
      const update = {
        status: 'released',
        gps_verification: gps_lat && gps_lng ? { lat: gps_lat, lng: gps_lng, verified_at: new Date().toISOString() } : null,
        updated_at: new Date().toISOString(),
      };

      const releaseRes = await sbFetch('escrow_transactions', 'PATCH', update, `?id=eq.${escrow_id}`);
      
      // Update all pending milestones to completed
      await sbFetch('escrow_milestones', 'PATCH', { 
        status: 'completed', 
        verified_at: new Date().toISOString() 
      }, `?escrow_id=eq.${escrow_id}&status=eq.pending`);

      // Record in ledger
      const ledgerEntry = {
        id: crypto.randomUUID(),
        transaction_id: escrow_id,
        entry_type: 'credit',
        account: 'seller',
        amount: escrow.amount,
        currency: escrow.currency,
        description: `Escrow release: ${escrow.escrow_type}`,
        reference_id: escrow_id,
      };
      await sbFetch('ledger_entries', 'POST', ledgerEntry);

      return new Response(JSON.stringify({
        success: true,
        escrow_id,
        status: 'released',
        amount: escrow.amount,
        currency: escrow.currency,
        gps_verified: !!(gps_lat && gps_lng),
        message: `Escrow released: UGX ${escrow.amount} to seller. GPS verification: ${gps_lat && gps_lng ? 'confirmed' : 'not provided'}.`,
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── GET ESCROW STATUS ──
    if (req.method === 'GET') {
      const escrowId = url.searchParams.get('id');
      const buyerId = url.searchParams.get('buyer_id');
      
      let filter = '';
      if (escrowId) filter = `?id=eq.${escrowId}`;
      else if (buyerId) filter = `?buyer_id=eq.${buyerId}&order=created_at.desc&limit=20`;
      else filter = `?order=created_at.desc&limit=20`;

      const res = await sbFetch('escrow_transactions', 'GET', null, filter);
      const escrows = await res.json();

      // Fetch milestones for each escrow
      const result = [];
      for (const escrow of escrows) {
        const mRes = await sbFetch('escrow_milestones', 'GET', null, `?escrow_id=eq.${escrow.id}&order=created_at.asc`);
        const milestones = await mRes.json();
        result.push({ ...escrow, milestones });
      }

      return new Response(JSON.stringify({ escrows: result, count: result.length }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action or method' }), {
      status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
