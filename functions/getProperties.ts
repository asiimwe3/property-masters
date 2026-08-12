/**
 * SageCo Evergreen — Properties List API (FIXED)
 * ================================================
 * Backend function for Vercel API route /api/get-properties
 *
 * Fixes audit finding: "No pagination on the API"
 *
 * This endpoint was already working but needed:
 * 1. Proper pagination support (limit + offset)
 * 2. Input validation on query params
 * 3. Better error handling
 *
 * Environment variables:
 * - SUPABASE_URL
 * - SUPABASE_ANON_KEY
 */

export default async function handler(req: Request): Promise<Response> {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: cors });
  }

  try {
    const url = new URL(req.url);

    // 1. Parse query parameters with validation
    const search = url.searchParams.get('search') || '';
    const minPrice = parseFloat(url.searchParams.get('min_price')) || 0;
    const maxPrice = parseFloat(url.searchParams.get('max_price')) || 0;
    const category = url.searchParams.get('category') || '';
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100); // Max 100 per page
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    // 2. Build the Supabase query
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    // Start building the URL with filters
    let queryUrl = `${supabaseUrl}/rest/v1/properties?select=*&status=eq.available&order=created_at.desc&limit=${limit}&offset=${offset}`;

    // Add price filter
    if (minPrice > 0) {
      queryUrl += `&price=gte.${minPrice}`;
    }
    if (maxPrice > 0) {
      queryUrl += `&price=lte.${maxPrice}`;
    }

    // Add category filter (validate against allowed values)
    const validCategories = ['Residential', 'Commercial', 'Land', 'Green Project'];
    if (category && validCategories.includes(category)) {
      queryUrl += `&category=eq.${encodeURIComponent(category)}`;
    }

    // Add search filter (title or location — using OR)
    if (search) {
      const encodedSearch = encodeURIComponent(`%${search}%`);
      queryUrl += `&or=(title.like.${encodedSearch},location.like.${encodedSearch})`;
    }

    // 3. Fetch from Supabase
    const res = await fetch(queryUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[GetProperties] Supabase error:', errText);
      return new Response(JSON.stringify({
        error: 'Failed to fetch properties',
        properties: [],
        total: 0,
      }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const data = await res.json();

    // 4. Get total count (separate query with head=true)
    let countUrl = `${supabaseUrl}/rest/v1/properties?status=eq.available`;
    if (category && validCategories.includes(category)) {
      countUrl += `&category=eq.${encodeURIComponent(category)}`;
    }

    const countRes = await fetch(countUrl, {
      method: 'GET',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Range': '0-0',
        'Prefer': 'count=exact',
      },
    });

    // Extract total from content-range header
    const contentRange = countRes.headers.get('content-range') || '';
    const total = contentRange ? parseInt(contentRange.split('/')[1]) : data.length;

    // 5. Return paginated results
    return new Response(JSON.stringify({
      properties: data,
      total: total,
      limit: limit,
      offset: offset,
      has_more: offset + limit < total,
    }), {
      status: 200,
      headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[GetProperties] Error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
      properties: [],
      total: 0,
    }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
