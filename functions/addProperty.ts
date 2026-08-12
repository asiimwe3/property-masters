/**
 * SageCo Evergreen — Add Property API (FIXED)
 * =============================================
 * Backend function for Vercel API route /api/add-property
 *
 * Fixes audit finding: "Schema mismatch — tries to insert `views` column"
 *
 * Changes:
 * 1. Removed the `views` column from the insert (it was causing the error)
 * 2. Added input validation
 * 3. Added authentication check (requires Bearer token)
 * 4. Added authorization check (user must be a registered broker)
 * 5. Records the property with proper broker_id
 *
 * Environment variables:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SUPABASE_ANON_KEY
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
    // 1. Check authentication — require a Bearer token
    const authHeader = req.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const userToken = authHeader.replace('Bearer ', '');

    // 2. Parse and validate the request body
    const body = await req.json();

    // Validate required fields
    const required = ['title', 'price', 'location'];
    for (const field of required) {
      if (!body[field] || String(body[field]).trim() === '') {
        return new Response(JSON.stringify({
          error: `Missing required field: ${field}`
        }), { status: 400, headers: { ...cors, 'Content-Type': 'application/json' } });
      }
    }

    // Validate price is a positive number
    const price = parseFloat(body.price);
    if (isNaN(price) || price <= 0) {
      return new Response(JSON.stringify({ error: 'Price must be a positive number' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // Validate category
    const validCategories = ['Residential', 'Commercial', 'Land', 'Green Project'];
    if (body.category && !validCategories.includes(body.category)) {
      return new Response(JSON.stringify({ error: 'Invalid category' }), {
        status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 3. Get the user's ID from Supabase using their token
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // Verify the user's token
    const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'apikey': Deno.env.get('SUPABASE_ANON_KEY') || '',
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

    // 4. Check if user is a registered broker (authorization)
    const brokerRes = await fetch(
      `${supabaseUrl}/rest/v1/brokers?id=eq.${userId}&registration_status=in.(registered,active)&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
        },
      }
    );

    const brokerData = await brokerRes.json();
    if (!brokerData || brokerData.length === 0) {
      return new Response(JSON.stringify({
        error: 'Only registered brokers can list properties'
      }), {
        status: 403, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // 5. Insert the property — NO `views` column (that was the bug!)
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
        broker_id: userId, // Link to the authenticated broker
        status: 'available',
        // NOTE: `views` column removed — it doesn't exist in the schema
      }),
    });

    const propertyData = await insertRes.json();

    if (!insertRes.ok) {
      console.error('[AddProperty] Insert failed:', JSON.stringify(propertyData));
      return new Response(JSON.stringify({
        error: propertyData.message || 'Failed to add property',
      }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
    }

    console.log('[AddProperty] Property created:', propertyData[0]?.id);

    return new Response(JSON.stringify({
      success: true,
      property: propertyData[0],
    }), {
      status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('[AddProperty] Error:', error);
    return new Response(JSON.stringify({
      error: 'An unexpected error occurred',
    }), { status: 500, headers: { ...cors, 'Content-Type': 'application/json' } });
  }
}
