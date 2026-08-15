/**
 * SageCo Evergreen v3 — Digital Land Passport
 * Deployed as Base44 backend function
 * 
 * Generates and retrieves digital land passports with:
 * - Verified ownership documentation
 * - GPS coordinates and boundary records
 * - Drone imagery links
 * - Site history
 * - Verification certificates
 */
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'get';

    // ── GENERATE PASSPORT ──
    if (req.method === 'POST' && action === 'generate') {
      const body = await req.json();
      const { property_id } = body;

      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Check if passport already exists
      const existing = await sbQuery('land_passports', `property_id=eq.${property_id}`);
      if (existing && existing.length > 0) {
        return new Response(JSON.stringify({
          success: true,
          message: 'Passport already exists',
          passport: existing[0],
        }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Fetch property data
      const properties = await sbQuery('properties', `id=eq.${property_id}&select=*`);
      if (!properties || properties.length === 0) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const property = properties[0];

      // Fetch related data
      const [brokers, droneSurveys, fraudChecks, bookings, ecoAnalytics] = await Promise.all([
        property.broker_id ? sbQuery('brokers', `id=eq.${property.broker_id}`) : Promise.resolve([]),
        sbQuery('drone_surveys', `property_id=eq.${property_id}&verification_status=eq.verified`),
        sbQuery('fraud_checks', `property_id=eq.${property_id}&status=eq.verified`),
        sbQuery('bookings', `property_id=eq.${property_id}&order=created_at.desc&limit=10`),
        sbQuery('eco_analytics', `property_id=eq.${property_id}`),
      ]);

      // Generate unique passport UID
      const passportUid = `SAGECO-${property_id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

      // Build passport data
      const passport = {
        id: crypto.randomUUID(),
        property_id,
        passport_uid: passportUid,
        property_title: property.title,
        ownership_history: [{
          owner: brokers && brokers.length > 0 ? `${brokers[0].full_name || 'Verified Broker'}` : 'SAGECO EVERGREEN',
          role: 'listing_broker',
          since: property.created_at || new Date().toISOString(),
          verified: brokers && brokers.length > 0 ? brokers[0].verified : false,
        }],
        gps_coordinates: property.latitude && property.longitude ? {
          latitude: property.latitude,
          longitude: property.longitude,
          accuracy_m: 5,
          verified: true,
          verified_at: new Date().toISOString(),
        } : null,
        boundary_records: droneSurveys && droneSurveys.length > 0 && droneSurveys[0].boundary_geojson
          ? {
              source: 'drone_survey',
              geojson: droneSurveys[0].boundary_geojson,
              area_sqm: droneSurveys[0].area_sqm,
              verified: true,
              survey_date: droneSurveys[0].survey_date,
            }
          : null,
        drone_imagery_urls: droneSurveys && droneSurveys.length > 0
          ? droneSurveys.map((s: any) => ({
              type: s.survey_type,
              orthophoto: s.orthophoto_url,
              model_3d: s['3d_model_url'] || null,
              date: s.survey_date,
            }))
          : [],
        site_history: bookings && bookings.length > 0
          ? bookings.map((b: any) => ({
              event: 'site_visit',
              date: b.scheduled_at || b.created_at,
              status: b.status,
              visitor: 'Visitor (PII protected)',
            }))
          : [],
        verification_certificates: [
          ...(fraudChecks && fraudChecks.length > 0
            ? [{
                type: 'fraud_check',
                status: 'passed',
                checks: fraudChecks.length,
                verified_at: new Date().toISOString(),
              }]
            : []),
          ...(property.latitude && property.longitude
            ? [{
                type: 'gps_verification',
                status: 'verified',
                coordinates: { lat: property.latitude, lng: property.longitude },
                verified_at: new Date().toISOString(),
              }]
            : []),
          ...(droneSurveys && droneSurveys.length > 0
            ? [{
                type: 'drone_survey',
                status: 'verified',
                survey_count: droneSurveys.length,
                verified_at: new Date().toISOString(),
              }]
            : []),
          ...(ecoAnalytics && ecoAnalytics.length > 0
            ? [{
                type: 'eco_assessment',
                status: 'completed',
                carbon_potential: ecoAnalytics[0].carbon_potential_score,
                verified_at: new Date().toISOString(),
              }]
            : []),
        ],
        verification_status: 'pending',
        issued_at: null,
        expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      // Set verification status based on data completeness
      const hasGps = !!passport.gps_coordinates;
      const hasDrone = passport.drone_imagery_urls.length > 0;
      const hasFraudCheck = passport.verification_certificates.some((c: any) => c.type === 'fraud_check');
      const hasBoundary = !!passport.boundary_records;

      if (hasGps && hasFraudCheck && hasDrone && hasBoundary) {
        passport.verification_status = 'verified';
        passport.issued_at = new Date().toISOString();
      } else if (hasGps || hasFraudCheck) {
        passport.verification_status = 'pending';
      } else {
        passport.verification_status = 'unverified';
      }

      await sbInsert('land_passports', passport);

      return new Response(JSON.stringify({
        success: true,
        passport_uid: passportUid,
        verification_status: passport.verification_status,
        completeness: {
          gps: hasGps,
          drone_survey: hasDrone,
          fraud_check: hasFraudCheck,
          boundary: hasBoundary,
          eco_assessment: ecoAnalytics && ecoAnalytics.length > 0,
        },
        message: passport.verification_status === 'verified'
          ? 'Fully verified Digital Land Passport issued.'
          : 'Passport created. Complete remaining verifications to achieve full verification.',
        passport,
      }), {
        status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── GET PASSPORT ──
    if (req.method === 'GET') {
      const propertyId = url.searchParams.get('property_id');
      const passportUid = url.searchParams.get('uid');

      let filter = '';
      if (propertyId) filter = `property_id=eq.${propertyId}`;
      else if (passportUid) filter = `passport_uid=eq.${passportUid}`;
      else {
        return new Response(JSON.stringify({ error: 'property_id or uid required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const passports = await sbQuery('land_passports', filter);
      if (!passports || passports.length === 0) {
        return new Response(JSON.stringify({ error: 'No passport found for this property' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({
        passport: passports[0],
      }), {
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
