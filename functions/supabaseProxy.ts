export default async function handler(req: Request): Promise<Response> {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const SUPABASE_ANON = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const SUPABASE_SRK  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const PROJ_REF      = "eiyexnuhqdscomilwpqg";
  const BASE_URL      = `https://${PROJ_REF}.supabase.co/rest/v1`;

  const reqUrl   = new URL(req.url);
  const resource = reqUrl.searchParams.get("resource") ?? "menu_items";
  const action   = reqUrl.searchParams.get("action") ?? "list";
  const id       = reqUrl.searchParams.get("id") ?? "";

  function anonHeaders() {
    return {
      "apikey": SUPABASE_ANON,
      "Authorization": "Bearer " + SUPABASE_ANON,
      "Content-Type": "application/json",
    };
  }

  function serviceHeaders() {
    return {
      "apikey": SUPABASE_SRK,
      "Authorization": "Bearer " + SUPABASE_SRK,
      "Content-Type": "application/json",
      "Prefer": "return=representation",
    };
  }

  let targetUrl = BASE_URL + "/" + resource;
  let method    = "GET";
  let headers   = anonHeaders();
  let body: string | null = null;

  if (action === "list") {
    const qp: string[] = ["select=*"];
    if (resource === "menu_items")    qp.push("order=sort_order.asc,name.asc");
    if (resource === "rooms")         qp.push("order=sort_order.asc", "is_available=eq.true");
    if (resource === "notifications") qp.push("is_active=eq.true", "order=created_at.desc");
    if (resource === "bookings")      headers = serviceHeaders();
    targetUrl += "?" + qp.join("&");

  } else if (action === "create") {
    method  = "POST";
    headers = serviceHeaders();
    body    = await req.text();

  } else if (action === "update") {
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    method    = "PATCH";
    headers   = serviceHeaders();
    targetUrl += "?id=eq." + id;
    body      = await req.text();

  } else if (action === "delete") {
    if (!id) {
      return new Response(JSON.stringify({ error: "id required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    method    = "DELETE";
    headers   = serviceHeaders();
    targetUrl += "?id=eq." + id;
  }

  const fetchOpts: RequestInit = { method, headers };
  if (body !== null) fetchOpts.body = body;

  const sbResp = await fetch(targetUrl, fetchOpts);
  const text   = await sbResp.text();

  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = text;
  }

  return new Response(JSON.stringify(parsed), {
    status: sbResp.status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
