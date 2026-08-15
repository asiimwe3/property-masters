/**
 * SageCo Evergreen — Add Property API (with auth + validation)
 * Deployed as Base44 backend function
 * Callable at: https://derick-ai-775511bf.base44.app/functions/sagecoAddProperty
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
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const userToken = authHeader.replace('Bearer ', '');
    const body = await req.json();

    const required = ['title', 'price', 'location'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return new Response(JSON.stringify({ error: `Missing required field: ${field}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return new Response(JSON.stringify({ error: 'Price must be a positive number' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const validCategories = ['Residential', 'Commercial', 'Land', 'Green Project'];
    if (body.category && !validCategories.includes(body.category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://emldbjqegftrngxypeca.supabase.co';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGRianFlZ2Z0cm5neHlwZWNhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODMyNDM1MiwiZXhwIjoyMDkzOTAwMzUyfQ.qxKXCKisdivaO-x1nrGcnpmQL8K5Fcs2l69LizuAyLk';
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtbGRianFlZ2Z0cm5neHlwZWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgzMjQzNTIsImV4cCI6MjA5MzkwMDM1Mn0.cofNEj5g3n9ls2HTXFXQG1_IXPUdLINDtYr820u2MtM';

    // Verify user token
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': supabaseAnonKey || '',
        'Authorization': `Bearer ${userToken}`,
      },
    });

    if (!userRes.ok) {
      return new Response(JSON.stringify({ error: 'Invalid authentication token' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const userData = await userRes.json();
    const userId = userData.id;

    // Check if user is a registered broker
    const brokerRes = await fetch(
      `${supabaseUrl}/rest/v1/brokers?id=eq.${userId}&registration_status=in.(registered,active)&select=id`,
      { headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` } }
    );

    const brokerData = await brokerRes.json();
    if (!brokerData || brokerData.length === 0) {
      return new Response(JSON.stringify({ error: 'Only registered brokers can list properties' }), {
        status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Insert property (NO views column — that was the bug)
    const insertRes = await fetch(`${supabaseUrl}/rest/v1/properties`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({
        title: body.title,
        description: body.description || null,
        price: price,
        location: body.location,
        category: body.category || 'Residential',
        bedrooms: body.bedrooms ? parseInt(body.bedrooms) : null,
        bathrooms: body.bathrooms ? parseInt(body.bathrooms) : null,
        area_sqft: body.area_sqft ? parseFloat(body.area_sqft) : null,
        images: body.images || [],
        broker_id: userId,
        status: 'available',
      }),
    });

    const propertyData = await insertRes.json();

    if (!insertRes.ok) {
      return new Response(JSON.stringify({
        error: propertyData.message || 'Failed to add property',
      }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ success: true, property: propertyData[0] }), {
      status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[AddProperty] Error:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred' }), {
      status: 500, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
