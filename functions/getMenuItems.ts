import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const base44 = createClientFromRequest(req);
    // Use service role to allow public read of menu items
    const allItems = await base44.asServiceRole.entities.MenuItem.list();

    const items = (allItems || []).filter((item: any) => item.is_available !== false);

    const categoryOrder = ["Breakfast", "Lunch", "Dinner", "Drinks", "Desserts", "Snacks"];
    items.sort((a: any, b: any) => {
      const catDiff = categoryOrder.indexOf(a.category) - categoryOrder.indexOf(b.category);
      if (catDiff !== 0) return catDiff;
      return (a.sort_order || 0) - (b.sort_order || 0);
    });

    return Response.json({ items }, { headers: corsHeaders });
  } catch (error: any) {
    return Response.json({ error: error.message, items: [] }, { status: 200, headers: corsHeaders });
  }
});
