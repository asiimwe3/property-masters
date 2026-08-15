/**
 * SageCo Evergreen v3 — Remote Site-Visit Technology
 * Deployed as Base44 backend function
 * 
 * Handles: GPS check-in, geotagged media, drone inspection links,
 * virtual tours, automated visit reports
 */
Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, PATCH, OPTIONS',
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
    const action = url.searchParams.get('action') || 'schedule';

    // ── SCHEDULE VISIT ──
    if (req.method === 'POST' && action === 'schedule') {
      const body = await req.json();
      const { property_id, visitor_id, broker_id, visit_type, scheduled_at } = body;

      if (!property_id || !visitor_id || !scheduled_at) {
        return new Response(JSON.stringify({ error: 'property_id, visitor_id, scheduled_at required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const validTypes = ['physical', 'virtual', 'drone'];
      const vType = validTypes.includes(visit_type) ? visit_type : 'physical';

      const visit = {
        id: crypto.randomUUID(),
        property_id,
        visitor_id,
        broker_id: broker_id || null,
        visit_type: vType,
        status: 'scheduled',
        scheduled_at,
        completed_at: null,
        gps_checkin: null,
        geotagged_media: null,
        drone_inspection_url: null,
        virtual_tour_url: vType === 'virtual' ? `https://sageco-evergreen.vercel.app/properties/${property_id}/tour` : null,
        visit_report: null,
        auto_report: null,
      };

      const res = await sbInsert('site_visits', visit);
      const created = await res.json();

      return new Response(JSON.stringify({
        success: true,
        visit_id: visit.id,
        visit_type: vType,
        status: 'scheduled',
        scheduled_at,
        virtual_tour_url: visit.virtual_tour_url,
        message: `${vType === 'physical' ? 'Physical' : vType === 'virtual' ? 'Virtual' : 'Drone'} site visit scheduled for ${scheduled_at}.`,
      }), {
        status: 201, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── GPS CHECK-IN ──
    if (req.method === 'POST' && action === 'checkin') {
      const body = await req.json();
      const { visit_id, gps_lat, gps_lng, accuracy_m } = body;

      if (!visit_id || gps_lat === undefined || gps_lng === undefined) {
        return new Response(JSON.stringify({ error: 'visit_id, gps_lat, gps_lng required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Verify GPS against property coordinates
      const visits = await sbQuery('site_visits', `id=eq.${visit_id}&select=*`);
      if (!visits || visits.length === 0) {
        return new Response(JSON.stringify({ error: 'Visit not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const visit = visits[0];

      const properties = await sbQuery('properties', `id=eq.${visit.property_id}&select=*`);
      const property = properties[0] || {};

      let gpsVerified = false;
      let distanceM = null;
      if (property.latitude && property.longitude) {
        // Haversine distance
        const R = 6371000; // Earth radius in meters
        const dLat = (gps_lat - property.latitude) * Math.PI / 180;
        const dLng = (gps_lng - property.longitude) * Math.PI / 180;
        const a = Math.sin(dLat/2) ** 2 + Math.cos(property.latitude * Math.PI/180) * Math.cos(gps_lat * Math.PI/180) * Math.sin(dLng/2) ** 2;
        distanceM = Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
        gpsVerified = distanceM < 200; // Within 200m of property
      }

      await sbPatch('site_visits', {
        gps_checkin: {
          lat: gps_lat,
          lng: gps_lng,
          accuracy_m: accuracy_m || null,
          checked_in_at: new Date().toISOString(),
          distance_to_property_m: distanceM,
          verified: gpsVerified,
        },
      }, `id=eq.${visit_id}`);

      return new Response(JSON.stringify({
        success: true,
        visit_id,
        gps_verified: gpsVerified,
        distance_to_property_m: distanceM,
        message: gpsVerified
          ? `GPS check-in verified. You are ${distanceM}m from the property.`
          : `GPS check-in recorded but you appear to be ${distanceM || 'unknown distance'} from the property. Verification pending broker approval.`,
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── UPLOAD GEOTAGGED MEDIA ──
    if (req.method === 'POST' && action === 'media') {
      const body = await req.json();
      const { visit_id, media_url, media_type, gps_lat, gps_lng, caption } = body;

      if (!visit_id || !media_url) {
        return new Response(JSON.stringify({ error: 'visit_id and media_url required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const visits = await sbQuery('site_visits', `id=eq.${visit_id}&select=*`);
      if (!visits || visits.length === 0) {
        return new Response(JSON.stringify({ error: 'Visit not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const existingMedia = visits[0].geotagged_media || [];
      const newMedia = [...existingMedia, {
        url: media_url,
        type: media_type || 'photo',
        gps: gps_lat && gps_lng ? { lat: gps_lat, lng: gps_lng } : null,
        caption: caption || null,
        uploaded_at: new Date().toISOString(),
      }];

      await sbPatch('site_visits', { geotagged_media: newMedia }, `id=eq.${visit_id}`);

      return new Response(JSON.stringify({
        success: true,
        visit_id,
        media_count: newMedia.length,
        message: 'Geotagged media uploaded.',
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── COMPLETE VISIT + AUTO-REPORT ──
    if (req.method === 'POST' && action === 'complete') {
      const body = await req.json();
      const { visit_id, report_text, broker_notes } = body;

      const visits = await sbQuery('site_visits', `id=eq.${visit_id}&select=*`);
      if (!visits || visits.length === 0) {
        return new Response(JSON.stringify({ error: 'Visit not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const visit = visits[0];

      // Generate auto report
      const autoReport = {
        visit_id,
        visit_type: visit.visit_type,
        property_id: visit.property_id,
        scheduled_at: visit.scheduled_at,
        completed_at: new Date().toISOString(),
        gps_checkin: visit.gps_checkin,
        media_count: visit.geotagged_media?.length || 0,
        gps_verified: visit.gps_checkin?.verified || false,
        has_drone: !!visit.drone_inspection_url,
        has_virtual_tour: !!visit.virtual_tour_url,
        broker_notes: broker_notes || null,
        report_generated: new Date().toISOString(),
      };

      await sbPatch('site_visits', {
        status: 'completed',
        completed_at: new Date().toISOString(),
        visit_report: report_text || null,
        auto_report: autoReport,
      }, `id=eq.${visit_id}`);

      return new Response(JSON.stringify({
        success: true,
        visit_id,
        status: 'completed',
        auto_report: autoReport,
        message: 'Site visit completed. Auto-report generated.',
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    // ── GET VISITS ──
    if (req.method === 'GET') {
      const propertyId = url.searchParams.get('property_id');
      const visitorId = url.searchParams.get('visitor_id');
      const visitId = url.searchParams.get('id');

      let filter = '';
      if (visitId) filter = `id=eq.${visitId}`;
      else if (propertyId) filter = `property_id=eq.${propertyId}&order=scheduled_at.desc&limit=20`;
      else if (visitorId) filter = `visitor_id=eq.${visitorId}&order=scheduled_at.desc&limit=20`;
      else filter = `order=scheduled_at.desc&limit=20`;

      const visits = await sbQuery('site_visits', filter);
      return new Response(JSON.stringify({ visits, count: visits.length }), {
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
