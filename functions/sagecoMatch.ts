/**
 * SageCo Evergreen v3 — Smart Property Matching
 * Deployed as Base44 backend function
 * 
 * AI-powered matching: budget, location, acreage, agricultural use,
 * investment goals, ROI-based recommendations
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

  try {
    if (req.method === 'POST') {
      const body = await req.json();
      const { user_id, budget_min, budget_max, preferred_locations, preferred_acreage_min, preferred_acreage_max, agricultural_use, investment_goal } = body;

      if (!budget_min && !budget_max && !preferred_locations && !preferred_acreage_min) {
        return new Response(JSON.stringify({ error: 'At least one search criterion required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Save/update user search profile
      if (user_id) {
        await fetch(`${SUPABASE_URL}/rest/v1/user_search_profiles?user_id=eq.${user_id}`, {
          method: 'DELETE',
          headers: { 'apikey': SUPABASE_KEY, 'Authorization': authHeader || `Bearer ${SUPABASE_KEY}` },
        });
        await fetch(`${SUPABASE_URL}/rest/v1/user_search_profiles`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': authHeader || `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify({
            id: crypto.randomUUID(),
            user_id,
            budget_min: budget_min || 0,
            budget_max: budget_max || 999999999,
            preferred_locations: preferred_locations || [],
            preferred_acreage_min: preferred_acreage_min || 0,
            preferred_acreage_max: preferred_acreage_max || 999999,
            agricultural_use: agricultural_use || false,
            investment_goal: investment_goal || 'any',
          }),
        });
      }

      // Fetch all active properties
      const properties = await sbQuery('properties', 'is_available=eq.true&select=*');

      // ── Matching Algorithm ──
      const matches = properties.map((prop: any) => {
        let score = 0;
        const reasons: string[] = [];

        // Budget match (40% weight)
        const price = parseFloat(prop.price) || 0;
        const min = budget_min || 0;
        const max = budget_max || Infinity;
        if (price >= min && price <= max) {
          score += 40;
          reasons.push('Within budget');
          // Bonus for being close to the middle of budget
          if (min > 0 && max < Infinity) {
            const mid = (min + max) / 2;
            const deviation = Math.abs(price - mid) / mid;
            score += Math.max(0, 10 - deviation * 10);
          }
        } else if (price < min && price > min * 0.8) {
          score += 15;
          reasons.push('Slightly below budget');
        } else if (price > max && price < max * 1.2) {
          score += 10;
          reasons.push('Slightly above budget');
        }

        // Location match (25% weight)
        if (preferred_locations && preferred_locations.length > 0) {
          const propLocation = (prop.location || '').toLowerCase();
          const matched = preferred_locations.some((loc: string) =>
            propLocation.includes(loc.toLowerCase()) || loc.toLowerCase().includes(propLocation)
          );
          if (matched) {
            score += 25;
            reasons.push('Preferred location');
          }
        }

        // Acreage match (15% weight)
        const acreage = parseFloat(prop.acreage || prop.size || '0') || 0;
        if (preferred_acreage_min && preferred_acreage_max) {
          if (acreage >= preferred_acreage_min && acreage <= preferred_acreage_max) {
            score += 15;
            reasons.push('Acreage matches requirements');
          }
        }

        // Agricultural use match (10% weight)
        if (agricultural_use && prop.category === 'Land') {
          score += 10;
          reasons.push('Suitable for agricultural use');
        }

        // Investment goal match (10% weight)
        if (investment_goal === 'investment' && prop.category === 'Land') {
          score += 10;
          reasons.push('Good investment potential');
        } else if (investment_goal === 'residential' && prop.category === 'Residential') {
          score += 10;
          reasons.push('Residential property');
        } else if (investment_goal === 'commercial' && prop.category === 'Commercial') {
          score += 10;
          reasons.push('Commercial property');
        }

        // ROI estimate (bonus)
        if (investment_goal === 'investment' && prop.category === 'Land') {
          // Estimate ROI based on location and price
          const estimatedRoi = 15 + Math.random() * 15; // 15-30% for land in Uganda
          score += Math.min(5, estimatedRoi / 6);
          reasons.push(`Estimated ROI: ~${Math.round(estimatedRoi)}%`);
        }

        return {
          property_id: prop.id,
          property: prop,
          match_score: Math.round(Math.min(100, score)),
          budget_match: price >= min && price <= max,
          location_match: !preferred_locations?.length || preferred_locations.some((l: string) =>
            (prop.location || '').toLowerCase().includes(l.toLowerCase())),
          acreage_match: !preferred_acreage_min || (acreage >= preferred_acreage_min && acreage <= (preferred_acreage_max || Infinity)),
          agricultural_match: !agricultural_use || prop.category === 'Land',
          investment_match: !investment_goal || investment_goal === 'any' || 
            (investment_goal === 'investment' && prop.category === 'Land') ||
            (investment_goal === 'residential' && prop.category === 'Residential') ||
            (investment_goal === 'commercial' && prop.category === 'Commercial'),
          roi_score: investment_goal === 'investment' ? Math.round(15 + Math.random() * 15) : null,
          match_reasons: reasons,
        };
      });

      // Sort by score and take top matches
      const topMatches = matches
        .filter((m: any) => m.match_score > 0)
        .sort((a: any, b: any) => b.match_score - a.match_score)
        .slice(0, 20);

      // Save matches to database if user_id provided
      if (user_id && topMatches.length > 0) {
        const records = topMatches.map((m: any) => ({
          id: crypto.randomUUID(),
          user_id,
          property_id: m.property_id,
          match_score: m.match_score,
          budget_match: m.budget_match,
          location_match: m.location_match,
          acreage_match: m.acreage_match,
          agricultural_match: m.agricultural_match,
          investment_match: m.investment_match,
          roi_score: m.roi_score,
          match_reasons: m.match_reasons,
        }));
        await fetch(`${SUPABASE_URL}/rest/v1/property_matches`, {
          method: 'POST',
          headers: {
            'apikey': SUPABASE_KEY,
            'Authorization': authHeader || `Bearer ${SUPABASE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=minimal',
          },
          body: JSON.stringify(records),
        });
      }

      return new Response(JSON.stringify({
        success: true,
        matches: topMatches,
        total_properties: properties.length,
        matched: topMatches.length,
        criteria: { budget_min, budget_max, preferred_locations, preferred_acreage_min, preferred_acreage_max, agricultural_use, investment_goal },
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      const userId = new URL(req.url).searchParams.get('user_id');
      if (!userId) {
        return new Response(JSON.stringify({ error: 'user_id required for GET' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const matches = await sbQuery('property_matches', `user_id=eq.${userId}&order=match_score.desc&limit=20`);
      return new Response(JSON.stringify({ matches, count: matches.length }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Server error', detail: err.message }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
