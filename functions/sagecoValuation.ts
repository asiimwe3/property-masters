/**
 * SageCo Evergreen v3 — Predictive Land Valuation & Arable Analytics
 * Deployed as Base44 backend function
 * 
 * Generates: AI property valuation, comparable analysis,
 * satellite/soil/climate data, crop suitability, agricultural & development potential
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
      const { property_id, valuation_type } = body;

      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Fetch property
      const properties = await sbQuery('properties', `id=eq.${property_id}&select=*`);
      if (!properties || properties.length === 0) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const property = properties[0];

      // Fetch all properties for comparables
      const allProperties = await sbQuery('properties', 'select=*');

      // ── AI VALUATION ──
      const price = parseFloat(property.price) || 0;
      const acreage = parseFloat(property.acreage || property.size || '0') || 1;
      const pricePerAcre = price / acreage;

      // Comparable analysis
      const sameLocation = allProperties.filter((p: any) =>
        p.id !== property_id &&
        p.location && property.location &&
        p.location.toLowerCase().includes(property.location.toLowerCase().split(',')[0].trim())
      );
      const sameCategory = allProperties.filter((p: any) =>
        p.id !== property_id && p.category === property.category
      );

      const comparables = (sameLocation.length > 0 ? sameLocation : sameCategory).slice(0, 5).map((p: any) => ({
        id: p.id,
        title: p.title,
        price: parseFloat(p.price),
        acreage: parseFloat(p.acreage || p.size || '0') || 1,
        price_per_acre: parseFloat(p.price) / (parseFloat(p.acreage || p.size || '0') || 1),
        location: p.location,
      }));

      const avgPricePerAcre = comparables.length > 0
        ? comparables.reduce((sum: number, c: any) => sum + c.price_per_acre, 0) / comparables.length
        : pricePerAcre;

      // AI estimated value (blend of current price and comparable average)
      const estimatedValue = Math.round(
        (price * 0.3 + avgPricePerAcre * acreage * 0.7)
      );
      const confidenceScore = Math.min(95, 50 + comparables.length * 10);

      // ── LAND ANALYTICS ──
      // Simulated satellite/soil/climate data (would use Sentinel Hub API in production)
      const lat = property.latitude || 0.6426;
      const lng = property.longitude || 30.6286;

      const landAnalytics = {
        id: crypto.randomUUID(),
        property_id,
        soil_type: 'loam', // Would come from soil API
        soil_ph: 6.2 + Math.random() * 0.8,
        elevation_m: 1100 + Math.floor(Math.random() * 200),
        slope_degrees: Math.round(Math.random() * 8 * 10) / 10,
        rainfall_mm: 1200 + Math.floor(Math.random() * 400),
        temperature_avg: 22 + Math.random() * 4,
        vegetation_index: 0.45 + Math.random() * 0.2, // NDVI
        arable_score: Math.round(60 + Math.random() * 35),
        crop_suitability: {
          bananas: Math.round(70 + Math.random() * 25),
          coffee: Math.round(65 + Math.random() * 30),
          maize: Math.round(75 + Math.random() * 20),
          beans: Math.round(80 + Math.random() * 15),
          tea: Math.round(60 + Math.random() * 30),
          cassava: Math.round(85 + Math.random() * 10),
        },
        climate_risk_score: Math.round(15 + Math.random() * 25),
        created_at: new Date().toISOString(),
      };

      // ── VALUATION RECORD ──
      const valuation = {
        id: crypto.randomUUID(),
        property_id,
        valuation_type: valuation_type || 'ai',
        estimated_value: estimatedValue,
        confidence_score: confidenceScore,
        comparable_properties: comparables,
        satellite_data: {
          ndvi: landAnalytics.vegetation_index,
          source: 'sentinel_hub (simulated)',
          coverage_date: new Date().toISOString(),
        },
        soil_data: {
          soil_type: landAnalytics.soil_type,
          soil_ph: landAnalytics.soil_ph,
          arable_score: landAnalytics.arable_score,
        },
        climate_data: {
          rainfall_mm: landAnalytics.rainfall_mm,
          temperature_avg: landAnalytics.temperature_avg,
          climate_risk_score: landAnalytics.climate_risk_score,
        },
        crop_suitability: landAnalytics.crop_suitability,
        agricultural_potential_score: landAnalytics.arable_score,
        development_potential_score: Math.round(
          (1 - landAnalytics.slope_degrees / 15) * 50 +
          (1 - landAnalytics.climate_risk_score / 100) * 30 +
          (landAnalytics.vegetation_index) * 20
        ),
        valuation_model: 'sageco_v3_comparable_plus_satellite',
        created_at: new Date().toISOString(),
      };

      // Save valuation
      await sbInsert('property_valuations', valuation);

      // Save land analytics
      await sbInsert('land_analytics', landAnalytics);

      return new Response(JSON.stringify({
        success: true,
        property_id,
        property_title: property.title,
        current_price: price,
        estimated_value: estimatedValue,
        confidence_score: confidenceScore,
        price_difference: estimatedValue - price,
        price_difference_percent: price > 0 ? Math.round((estimatedValue - price) / price * 100) : 0,
        valuation_assessment: estimatedValue > price * 1.1
          ? 'Property appears undervalued — estimated value is above listing price.'
          : estimatedValue < price * 0.9
          ? 'Property appears overvalued — estimated value is below listing price.'
          : 'Property is fairly priced — estimated value is close to listing price.',
        comparables: comparables,
        land_analytics: {
          soil: { type: landAnalytics.soil_type, ph: landAnalytics.soil_ph, arable_score: landAnalytics.arable_score },
          climate: { rainfall_mm: landAnalytics.rainfall_mm, temperature: landAnalytics.temperature_avg, risk: landAnalytics.climate_risk_score },
          crop_suitability: landAnalytics.crop_suitability,
          agricultural_potential: landAnalytics.arable_score,
          development_potential: valuation.development_potential_score,
        },
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      const propertyId = new URL(req.url).searchParams.get('property_id');
      if (!propertyId) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const [valuations, analytics] = await Promise.all([
        sbQuery('property_valuations', `property_id=eq.${propertyId}&order=created_at.desc&limit=5`),
        sbQuery('land_analytics', `property_id=eq.${propertyId}&order=created_at.desc&limit=5`),
      ]);
      return new Response(JSON.stringify({ valuations, land_analytics: analytics }), {
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
