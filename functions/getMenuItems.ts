export default async function handler(req: Request): Promise<Response> {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });

  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const url  = "https://eiyexnuhqdscomilwpqg.supabase.co/rest/v1/menu_items?select=*&order=sort_order.asc,name.asc";

  const r    = await fetch(url, { headers: { "apikey": anon, "Authorization": "Bearer " + anon } });
  const data = await r.json();

  return new Response(JSON.stringify(data), {
    status: r.status,
    headers: { ...cors, "Content-Type": "application/json" },
  });
}
