/**
 * SageCo Evergreen — Get Properties API
 * Deployed as Base44 backend function
 * Callable at: https://derick-ai-775511bf.base44.app/functions/sagecoGetProperties
 */

Deno.serve(async (req) => {
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
    const search = url.searchParams.get('search') || '';
    const minPrice = parseFloat(url.searchParams.get('min_price')) || 0;
    const maxPrice = parseFloat(url.searchParams.get('max_price')) || 0;
    const category = url.searchParams.get('category') || '';
    const limit = Math.min(parseInt(url.searchParams.get('limit')) || 20, 100);
    const offset = parseInt(url.searchParams.get('offset')) || 0;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://emldbjqegftrngxypeca.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGRianFlZ2Z0cm5neHlwZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMjQzNTIsImV4cCI6MjA5MzkwMDM1Mn0.cofNEj5g3n9ls2HTXFXQG1_IXPUdLINDtYr820u2MtM';

    let queryUrl = `${supabaseUrl}/rest/v1/properties?select=*&status=eq.available&order=created_at.desc&limit=${limit}&offset=${offset}`;

    if (minPrice > 0) queryUrl += `&price=gte.${minPrice}`;
    if (maxPrice > 0) queryUrl += `&price=lte.${maxPrice}`;

    const validCategories = ['Residential', 'Commercial', 'Land', 'Green Project'];
    if (category && validCategories.includes(category)) {
      queryUrl += `&category=eq.${encodeURIComponent(category)}`;
    }

    if (search) {
      const encodedSearch = encodeURIComponent(`%${search}%`);
      queryUrl += `&or=(title.like.${encodedSearch},location.like.${encodedSearch})`;
    }

    const res = await fetch(queryUrl, {
      headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` },
    });

    if (!res.ok) {
      return new Response(JSON.stringify({
        error: 'Failed to fetch properties', properties: [], total: 0,
      }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    const data = await res.json();

    // Get total count
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

    const contentRange = countRes.headers.get('content-range') || '';
    const total = contentRange ? parseInt(contentRange.split('/')[1]) : data.length;

    return new Response(JSON.stringify({
      properties: data,
      total: total,
      limit: limit,
      offset: offset,
      has_more: offset + limit < total,
    }), { status: 200, headers: { ...cors, 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('[GetProperties] Error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred', properties: [], total: 0,
    }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
});
