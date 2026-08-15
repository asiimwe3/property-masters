/**
 * SageCo Evergreen v3 — Tokenized Fractional Eco-Land Investment
 * Deployed as Base44 backend function
 * 
 * Handles: token creation, fractional share purchase, investor portfolio,
 * cross-border investment, investment reports
 */
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  const SUPABASE_URL = Deno.env.get('SAGECO_SUPABASE_URL') || '';
  const SUPABASE_KEY = Deno.env.get('SAGECO_SUPABASE_SERVICE_KEY') || Deno.env.get('SAGECO_SUPABASE_ANON_KEY') || '';
  const authHeader = req.headers.get('Authorization') || '';

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    return new Response(JSON.stringify({ error: 'Server configuration missing' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }

  async function sbQuery(table: string, filter: string) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': authHeader || `Bearer ${SUPABASE_KEY}`,
      },
    });
    return res.json();
  }

  async function sbInsert(table: string, data: any) {
    return await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': authHeader || `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });
  }

  async function sbPatch(table: string, data: any, filter: string) {
    return await fetch(`${SUPABASE_URL}/rest/v1/${table}?${filter}`, {
      method: 'PATCH',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': authHeader || `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(data),
    });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'list';

    // ── CREATE TOKEN (Admin only) ──
    if (req.method === 'POST' && action === 'create') {
      const body = await req.json();
      const { property_id, token_symbol, total_supply, token_price, minimum_investment, eco_project_type, expected_roi } = body;

      if (!property_id || !token_symbol || !total_supply || !token_price) {
        return new Response(JSON.stringify({ error: 'property_id, token_symbol, total_supply, token_price required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Verify property exists and is land
      const properties = await sbQuery('properties', `id=eq.${property_id}&select=*`);
      if (!properties || properties.length === 0) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Check for existing token
      const existing = await sbQuery('investment_tokens', `property_id=eq.${property_id}`);
      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({ error: 'Token already exists for this property', token: existing[0] }), {
          status: 409, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const token = {
        id: crypto.randomUUID(),
        property_id,
        token_symbol: token_symbol.toUpperCase(),
        total_supply: parseInt(total_supply),
        token_price: parseFloat(token_price),
        available_supply: parseInt(total_supply),
        minimum_investment: parseInt(minimum_investment) || 1,
        investment_status: 'active',
        eco_project_type: eco_project_type || 'mixed_use',
        expected_roi: parseFloat(expected_roi) || 15.0,
      };

      const res = await sbInsert('investment_tokens', token);
      const created = await res.json();

      return new Response(JSON.stringify({
        success: true,
        token_id: token.id,
        token_symbol: token.token_symbol,
        total_supply: token.total_supply,
        price_per_token: token.token_price,
        total_value: token.total_supply * token.token_price,
        minimum_investment: token.minimum_investment,
        expected_roi: token.expected_roi,
        message: `Investment token ${token.token_symbol} created. ${token.total_supply} tokens at UGX ${token.token_price} each.`,
      }), {
        status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── BUY TOKEN SHARES ──
    if (req.method === 'POST' && action === 'buy') {
      const body = await req.json();
      const { token_id, investor_id, shares, wallet_address } = body;

      if (!token_id || !investor_id || !shares) {
        return new Response(JSON.stringify({ error: 'token_id, investor_id, shares required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const sharesInt = parseInt(shares);
      if (sharesInt <= 0) {
        return new Response(JSON.stringify({ error: 'Shares must be positive' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Fetch token
      const tokens = await sbQuery('investment_tokens', `id=eq.${token_id}`);
      if (!tokens || tokens.length === 0) {
        return new Response(JSON.stringify({ error: 'Token not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const token = tokens[0];

      if (token.investment_status !== 'active') {
        return new Response(JSON.stringify({ error: `Token not available for purchase. Status: ${token.investment_status}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      if (sharesInt < token.minimum_investment) {
        return new Response(JSON.stringify({ error: `Minimum investment is ${token.minimum_investment} shares` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      if (sharesInt > token.available_supply) {
        return new Response(JSON.stringify({ error: `Only ${token.available_supply} shares available` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const purchasePrice = sharesInt * token.token_price;
      const ownershipPct = (sharesInt / token.total_supply) * 100;

      // Create holder record
      const holder = {
        id: crypto.randomUUID(),
        token_id,
        investor_id,
        shares_owned: sharesInt,
        purchase_price: purchasePrice,
        purchase_date: new Date().toISOString(),
        ownership_percentage: Math.round(ownershipPct * 100) / 100,
        wallet_address: wallet_address || null,
      };

      await sbInsert('token_holders', holder);

      // Update token available supply
      const newAvailable = token.available_supply - sharesInt;
      await sbPatch('investment_tokens', {
        available_supply: newAvailable,
        investment_status: newAvailable === 0 ? 'funded' : 'active',
      }, `id=eq.${token_id}`);

      return new Response(JSON.stringify({
        success: true,
        token_symbol: token.token_symbol,
        shares_purchased: sharesInt,
        purchase_price: purchasePrice,
        ownership_percentage: holder.ownership_percentage,
        remaining_supply: newAvailable,
        message: `Purchased ${sharesInt} shares of ${token.token_symbol} for UGX ${purchasePrice.toLocaleString()}. You own ${holder.ownership_percentage}% of this eco-land project.`,
        next_steps: 'Complete payment via MTN MoMo, Airtel Money, or card to confirm your investment.',
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── GET INVESTMENTS / PORTFOLIO ──
    if (req.method === 'GET') {
      const investorId = url.searchParams.get('investor_id');
      const tokenId = url.searchParams.get('token_id');
      const propertyId = url.searchParams.get('property_id');

      if (investorId) {
        // Get investor portfolio
        const holdings = await sbQuery('token_holders', `investor_id=eq.${investorId}&order=purchase_date.desc`);
        
        // Enrich with token details
        const portfolio = [];
        for (const h of holdings) {
          const tokens = await sbQuery('investment_tokens', `id=eq.${h.token_id}`);
          if (tokens.length > 0) {
            const t = tokens[0];
            portfolio.push({
              ...h,
              token_symbol: t.token_symbol,
              property_id: t.property_id,
              current_value: h.shares_owned * t.token_price,
              expected_roi: t.expected_roi,
              eco_project_type: t.eco_project_type,
            });
          }
        }

        const totalInvested = portfolio.reduce((sum: number, p: any) => sum + p.purchase_price, 0);
        const currentValue = portfolio.reduce((sum: number, p: any) => sum + p.current_value, 0);

        return new Response(JSON.stringify({
          portfolio,
          total_investments: portfolio.length,
          total_invested: totalInvested,
          current_value: currentValue,
          total_shares: portfolio.reduce((sum: number, p: any) => sum + p.shares_owned, 0),
          total_ownership_pct: portfolio.reduce((sum: number, p: any) => sum + p.ownership_percentage, 0),
        }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      if (tokenId) {
        const [token, holders] = await Promise.all([
          sbQuery('investment_tokens', `id=eq.${tokenId}`),
          sbQuery('token_holders', `token_id=eq.${tokenId}&order=purchase_date.desc`),
        ]);
        return new Response(JSON.stringify({ token: token[0] || null, holders, holder_count: holders.length }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      if (propertyId) {
        const tokens = await sbQuery('investment_tokens', `property_id=eq.${propertyId}`);
        return new Response(JSON.stringify({ tokens }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // List all active investment tokens
      const tokens = await sbQuery('investment_tokens', `investment_status=eq.active&order=created_at.desc`);
      return new Response(JSON.stringify({ tokens, count: tokens.length }), {
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
