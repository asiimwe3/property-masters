/**
 * SageCo Evergreen v3 — Drone & Spatial Verification
 * Deployed as Base44 backend function
 * 
 * Handles: drone mapping uploads, LiDAR scans, 3D model uploads,
 * GPS boundary verification, remote inspection records
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

  try {
    if (req.method === 'POST') {
      const body = await req.json();
      const {
        property_id, survey_type, survey_date, drone_operator_id,
        orthophoto_url, dem_url, point_cloud_url, model_3d_url,
        boundary_geojson, area_sqm, accuracy_level, notes,
      } = body;

      if (!property_id || !survey_type) {
        return new Response(JSON.stringify({ error: 'property_id and survey_type required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const validTypes = ['drone_mapping', 'lidar_scan', '3d_twin', 'gps_verification', 'remote_inspection', 'anti_fraud'];
      if (!validTypes.includes(survey_type)) {
        return new Response(JSON.stringify({ error: `Invalid survey_type. Valid: ${validTypes.join(', ')}` }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Validate GPS boundary if provided
      let verified = false;
      if (boundary_geojson) {
        // Basic GeoJSON validation
        try {
          const geo = typeof boundary_geojson === 'string' ? JSON.parse(boundary_geojson) : boundary_geojson;
          if (geo.type === 'Polygon' && geo.coordinates && Array.isArray(geo.coordinates)) {
            verified = true;
          }
        } catch {
          // Invalid GeoJSON
        }
      }

      const survey = {
        id: crypto.randomUUID(),
        property_id,
        survey_type,
        survey_date: survey_date || new Date().toISOString(),
        drone_operator_id: drone_operator_id || null,
        status: 'uploaded',
        orthophoto_url: orthophoto_url || null,
        dem_url: dem_url || null,
        point_cloud_url: point_cloud_url || null,
        '3d_model_url': model_3d_url || null,
        boundary_geojson: boundary_geojson || null,
        area_sqm: area_sqm || null,
        accuracy_level: accuracy_level || 'standard',
        verification_status: verified ? 'verified' : 'pending',
        notes: notes || null,
      };

      const res = await sbInsert('drone_surveys', survey);
      const created = await res.json();

      return new Response(JSON.stringify({
        success: true,
        survey_id: survey.id,
        verification_status: survey.verification_status,
        message: `Drone survey uploaded: ${survey_type}. Boundary ${verified ? 'verified' : 'pending verification'}.`,
        survey: created[0] || survey,
      }), {
        status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      const propertyId = new URL(req.url).searchParams.get('property_id');
      if (!propertyId) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const surveys = await sbQuery('drone_surveys', `property_id=eq.${propertyId}&order=survey_date.desc`);
      return new Response(JSON.stringify({ surveys, count: surveys.length }), {
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
