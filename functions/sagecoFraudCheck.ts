/**
 * SageCo Evergreen v3 — AI Land Fraud Detection
 * Deployed as Base44 backend function
 * 
 * Detects: duplicate properties, boundary conflicts, document inconsistencies,
 * suspicious listings, GPS/document cross-verification, risk scoring
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
      const { property_id, check_type, force } = body;

      if (!property_id) {
        return new Response(JSON.stringify({ error: 'property_id required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Fetch the property
      const properties = await sbQuery('properties', `id=eq.${property_id}&select=*`);
      if (!properties || properties.length === 0) {
        return new Response(JSON.stringify({ error: 'Property not found' }), {
          status: 404, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
      const property = properties[0];

      // Fetch all properties for comparison
      const allProperties = await sbQuery('properties', 'select=*');
      const issues: any[] = [];
      let totalRiskScore = 0;
      let totalChecks = 0;

      // ── DUPLICATE DETECTION ──
      if (!check_type || check_type === 'duplicate') {
        totalChecks++;
        const duplicates = allProperties.filter((p: any) =>
          p.id !== property_id &&
          (
            // Same title
            (p.title && property.title && p.title.toLowerCase() === property.title.toLowerCase()) ||
            // Same location + similar price (within 5%)
            (p.location && property.location &&
             p.location.toLowerCase() === property.location.toLowerCase() &&
             Math.abs(parseFloat(p.price) - parseFloat(property.price)) / Math.max(parseFloat(property.price), 1) < 0.05) ||
            // Same GPS coordinates (within 0.001 degrees ~ 111m)
            (p.latitude && p.longitude && property.latitude && property.longitude &&
             Math.abs(p.latitude - property.latitude) < 0.001 &&
             Math.abs(p.longitude - property.longitude) < 0.001)
          )
        );

        if (duplicates.length > 0) {
          const riskScore = Math.min(100, duplicates.length * 30);
          totalRiskScore += riskScore;
          issues.push({
            type: 'duplicate',
            severity: riskScore > 50 ? 'high' : 'medium',
            description: `${duplicates.length} potential duplicate(s) found`,
            details: duplicates.map((d: any) => ({
              id: d.id,
              title: d.title,
              location: d.location,
              price: d.price,
              match_reason: d.title?.toLowerCase() === property.title?.toLowerCase() ? 'same_title' :
                d.location?.toLowerCase() === property.location?.toLowerCase() ? 'same_location_price' : 'same_gps',
            })),
            risk_score: riskScore,
          });
        } else {
          totalRiskScore += 0;
          issues.push({
            type: 'duplicate',
            severity: 'low',
            description: 'No duplicates detected',
            risk_score: 0,
          });
        }

        // Save fraud check
        await sbInsert('fraud_checks', {
          id: crypto.randomUUID(),
          property_id,
          check_type: 'duplicate',
          risk_score: duplicates.length > 0 ? Math.min(100, duplicates.length * 30) : 0,
          risk_level: duplicates.length > 0 ? (duplicates.length > 1 ? 'high' : 'medium') : 'low',
          detected_issues: duplicates.length > 0 ? { duplicates } : null,
          status: duplicates.length > 0 ? 'flagged' : 'verified',
        });
      }

      // ── BOUNDARY CONFLICT DETECTION ──
      if (!check_type || check_type === 'boundary_conflict') {
        totalChecks++;
        const conflicts: any[] = [];

        // Check if property has GPS coordinates
        if (property.latitude && property.longitude) {
          // Find properties with overlapping GPS (within 100m)
          const nearby = allProperties.filter((p: any) =>
            p.id !== property_id &&
            p.latitude && p.longitude &&
            Math.abs(p.latitude - property.latitude) < 0.001 &&
            Math.abs(p.longitude - property.longitude) < 0.001
          );
          if (nearby.length > 0) {
            conflicts.push({
              type: 'gps_overlap',
              description: `${nearby.length} property(ies) with overlapping GPS coordinates`,
              properties: nearby.map((p: any) => ({ id: p.id, title: p.title })),
            });
          }
        } else {
          conflicts.push({
            type: 'missing_gps',
            description: 'Property has no GPS coordinates — cannot verify boundaries',
          });
        }

        // Check for drone survey boundary data
        const surveys = await sbQuery('drone_surveys', `property_id=eq.${property_id}&verification_status=eq.verified`);
        if (surveys && surveys.length > 0 && surveys[0].boundary_geojson) {
          // Boundary verified by drone
          issues.push({
            type: 'boundary_conflict',
            severity: 'low',
            description: 'Boundaries verified by drone survey',
            risk_score: 0,
          });
        } else if (conflicts.length === 0) {
          issues.push({
            type: 'boundary_conflict',
            severity: 'medium',
            description: 'No drone survey verification on file — boundary not independently verified',
            risk_score: 20,
          });
          totalRiskScore += 20;
        } else {
          const riskScore = 40 + conflicts.length * 15;
          totalRiskScore += riskScore;
          issues.push({
            type: 'boundary_conflict',
            severity: 'high',
            description: `${conflicts.length} boundary conflict(s) detected`,
            details: conflicts,
            risk_score: riskScore,
          });
        }

        await sbInsert('fraud_checks', {
          id: crypto.randomUUID(),
          property_id,
          check_type: 'boundary_conflict',
          risk_score: conflicts.length > 0 ? Math.min(100, 40 + conflicts.length * 15) : (surveys.length > 0 ? 0 : 20),
          risk_level: conflicts.length > 0 ? 'high' : (surveys.length > 0 ? 'low' : 'medium'),
          detected_issues: conflicts.length > 0 ? { conflicts } : null,
          status: conflicts.length > 0 ? 'flagged' : 'verified',
        });
      }

      // ── DOCUMENT CONSISTENCY CHECK ──
      if (!check_type || check_type === 'document_consistency') {
        totalChecks++;
        const docIssues: string[] = [];

        if (!property.title || property.title.length < 5) docIssues.push('Title too short or missing');
        if (!property.description || property.description.length < 20) docIssues.push('Description too short or missing');
        if (!property.location) docIssues.push('Location not specified');
        if (!property.price || parseFloat(property.price) <= 0) docIssues.push('Invalid or missing price');

        // Check if land passport exists
        const passports = await sbQuery('land_passports', `property_id=eq.${property_id}`);
        if (!passports || passports.length === 0) docIssues.push('No digital land passport — ownership not verified');

        const riskScore = docIssues.length * 15;
        totalRiskScore += riskScore;

        issues.push({
          type: 'document_consistency',
          severity: riskScore > 30 ? 'high' : riskScore > 0 ? 'medium' : 'low',
          description: docIssues.length > 0 ? `${docIssues.length} document issue(s) found` : 'All documents consistent',
          details: docIssues,
          risk_score: riskScore,
        });

        await sbInsert('fraud_checks', {
          id: crypto.randomUUID(),
          property_id,
          check_type: 'document_consistency',
          risk_score: riskScore,
          risk_level: riskScore > 30 ? 'high' : riskScore > 0 ? 'medium' : 'low',
          detected_issues: docIssues.length > 0 ? { issues: docIssues } : null,
          status: docIssues.length > 0 ? 'flagged' : 'verified',
        });
      }

      // ── SUSPICIOUS LISTING DETECTION ──
      if (!check_type || check_type === 'suspicious_listing') {
        totalChecks++;
        const suspiciousFlags: string[] = [];

        const price = parseFloat(property.price) || 0;

        // Price anomalies
        if (price > 0) {
          const allPrices = allProperties.map((p: any) => parseFloat(p.price) || 0).filter((p: number) => p > 0);
          const avgPrice = allPrices.reduce((a: number, b: number) => a + b, 0) / allPrices.length;
          if (price < avgPrice * 0.3) suspiciousFlags.push('Price significantly below market average (possible scam)');
          if (price > avgPrice * 3) suspiciousFlags.push('Price significantly above market average (overpriced)');
        }

        // Broker verification
        if (!property.broker_id) suspiciousFlags.push('No broker assigned to property');
        const brokers = property.broker_id ? await sbQuery('brokers', `id=eq.${property.broker_id}`) : [];
        if (property.broker_id && brokers.length > 0 && !brokers[0].verified) {
          suspiciousFlags.push('Assigned broker is not verified');
        }

        // Recent listing with high price (potential money laundering flag)
        const createdDate = new Date(property.created_at || Date.now());
        const daysOld = (Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
        if (daysOld < 1 && price > 100000000) suspiciousFlags.push('Very recent high-value listing');

        const riskScore = suspiciousFlags.length * 20;
        totalRiskScore += riskScore;

        issues.push({
          type: 'suspicious_listing',
          severity: riskScore > 40 ? 'high' : riskScore > 0 ? 'medium' : 'low',
          description: suspiciousFlags.length > 0 ? `${suspiciousFlags.length} suspicious flag(s)` : 'No suspicious indicators',
          details: suspiciousFlags,
          risk_score: riskScore,
        });

        await sbInsert('fraud_checks', {
          id: crypto.randomUUID(),
          property_id,
          check_type: 'suspicious_listing',
          risk_score: riskScore,
          risk_level: riskScore > 40 ? 'high' : riskScore > 0 ? 'medium' : 'low',
          detected_issues: suspiciousFlags.length > 0 ? { flags: suspiciousFlags } : null,
          status: suspiciousFlags.length > 0 ? 'flagged' : 'verified',
        });
      }

      // ── OVERALL RISK ASSESSMENT ──
      const overallRisk = totalChecks > 0 ? Math.round(totalRiskScore / totalChecks) : 0;
      const riskLevel = overallRisk > 50 ? 'critical' : overallRisk > 30 ? 'high' : overallRisk > 15 ? 'medium' : 'low';

      return new Response(JSON.stringify({
        success: true,
        property_id,
        property_title: property.title,
        overall_risk_score: overallRisk,
        overall_risk_level: riskLevel,
        checks_performed: totalChecks,
        issues: issues,
        summary: riskLevel === 'low'
          ? 'Property passed all fraud checks. Low risk.'
          : riskLevel === 'medium'
          ? 'Property has some risk indicators. Medium risk. Manual review recommended.'
          : riskLevel === 'high'
          ? 'Property has multiple risk indicators. High risk. Manual review required.'
          : 'Property has critical risk indicators. Transaction should be halted pending review.',
        recommendation: riskLevel === 'low'
          ? 'Proceed with transaction'
          : riskLevel === 'medium'
          ? 'Proceed with caution — verify flagged issues before transaction'
          : 'Do not proceed until all flagged issues are resolved',
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
      const checks = await sbQuery('fraud_checks', `property_id=eq.${propertyId}&order=created_at.desc`);
      return new Response(JSON.stringify({ checks, count: checks.length }), {
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
