export default async function handler(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: cors });
  }

  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const srk  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const base = "https://eiyexnuhqdscomilwpqg.supabase.co/rest/v1";

  const u        = new URL(req.url);
  const resource = u.searchParams.get("resource") ?? "menu_items";
  const action   = u.searchParams.get("action") ?? "list";
  const id       = u.searchParams.get("id") ?? "";

  let url    = base + "/" + resource;
  let method = "GET";
  let hdrs: Record<string,string> = {
    "apikey": anon,
    "Authorization": "Bearer " + anon,
    "Content-Type": "application/json",
  };
  let body: string | undefined;

  if (action === "list") {
    const parts = ["select=*"];
    if (resource === "menu_items")    parts.push("order=sort_order.asc");
    if (resource === "rooms")         parts.push("is_available=eq.true", "order=sort_order.asc");
    if (resource === "notifications") parts.push("is_active=eq.true");
    if (resource === "bookings") {
      hdrs = { "apikey": srk, "Authorization": "Bearer " + srk, "Content-Type": "application/json" };
    }
    url += "?" + parts.join("&");

  } else if (action === "create") {
    method = "POST";
    hdrs   = { "apikey": srk, "Authorization": "Bearer " + srk, "Content-Type": "application/json", "Prefer": "return=representation" };
    body   = await req.text();

  } else if (action === "update") {
    if (!id) return new Response('{"error":"id required"}', { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    method = "PATCH";
    hdrs   = { "apikey": srk, "Authorization": "Bearer " + srk, "Content-Type": "application/json", "Prefer": "return=representation" };
    url   += "?id=eq." + id;
    body   = await req.text();

  } else if (action === "delete") {
    if (!id) return new Response('{"error":"id required"}', { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
    method = "DELETE";
    hdrs   = { "apikey": srk, "Authorization": "Bearer " + srk, "Content-Type": "application/json" };
    url   += "?id=eq." + id;
  }

  const init: RequestInit = { method, headers: hdrs };
  if (body !== undefined) init.body = body;

  const r    = await fetch(url, init);
  const text = await r.text();
  let data: unknown = text;
  try { data = JSON.parse(text); } catch { /* keep as text */ }

  return new Response(JSON.stringify(data), {
    status: r.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
