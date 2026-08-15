/**
 * SageCo Evergreen v3 — AI Broker (WhatsApp + Web)
 * Deployed as Base44 backend function
 * 
 * Agentic AI assistant for:
 * - Natural-language property search
 * - Automated property matching
 * - Site-visit scheduling
 * - Automated customer follow-up
 * - WhatsApp-based transactions
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

  // ── NLP Parser: Extract search intent from natural language ──
  function parseSearchIntent(text: string) {
    const lower = text.toLowerCase();
    const intent: any = {
      type: 'search',
      budget_min: null,
      budget_max: null,
      locations: [],
      acreage_min: null,
      acreage_max: null,
      property_type: null,
      agricultural: false,
    };

    // Budget extraction (UGX amounts)
    const budgetPatterns = [
      /(\d+(?:,\d{3})*)\s*(?:million|mil|m)\s*(?:ugx|shillings|shs)?/gi,
      /ugx\s*(\d+(?:,\d{3})*)/gi,
      /(\d+(?:,\d{3})*)\s*ugx/gi,
      /budget.*?(\d+(?:,\d{3})*)/gi,
      /under\s*(\d+(?:,\d{3})*)/gi,
      /below\s*(\d+(?:,\d{3})*)/gi,
      /max.*?(\d+(?:,\d{3})*)/gi,
    ];

    for (const pattern of budgetPatterns) {
      const match = [...lower.matchAll(pattern)];
      if (match.length > 0) {
        const value = parseInt(match[0][1].replace(/,/g, ''));
        if (match[0][0].includes('million') || match[0][0].includes(' mil') || match[0][0].includes('m ')) {
          intent.budget_max = value * 1000000;
        } else if (value > 1000) {
          intent.budget_max = value;
        }
        break;
      }
    }

    // Location extraction
    const ugandanLocations = [
      'kampala', 'kyenjojo', 'fort portal', 'mubende', 'mityana', 'hoima', 'kasese',
      'kabarole', 'kibaale', 'kyegwegwa', 'kagadi', 'masaka', 'jinja', 'entebbe',
      'mukono', 'wakiso', 'luwero', 'mpigi', 'gulu', 'lira', 'mbale', 'soroti',
      'masindi', 'kabale', 'mbarara', 'rukungiri', 'kanungu', 'kisoro', 'ndegeya',
    ];
    for (const loc of ugandanLocations) {
      if (lower.includes(loc)) intent.locations.push(loc);
    }

    // Acreage extraction
    const acrePatterns = [
      /(\d+(?:\.\d+)?)\s*acre/i,
      /(\d+(?:\.\d+)?)\s*(?:acres|ac)/i,
    ];
    for (const pattern of acrePatterns) {
      const match = lower.match(pattern);
      if (match) {
        intent.acreage_max = parseFloat(match[1]);
        break;
      }
    }

    // Property type
    if (lower.includes('land') || lower.includes('plot') || lower.includes('acre')) {
      intent.property_type = 'Land';
      if (lower.includes('farm') || lower.includes('agricult') || lower.includes('crop')) {
        intent.agricultural = true;
      }
    } else if (lower.includes('house') || lower.includes('home') || lower.includes('resident')) {
      intent.property_type = 'Residential';
    } else if (lower.includes('commercial') || lower.includes('office') || lower.includes('shop')) {
      intent.property_type = 'Commercial';
    }

    // Intent type detection
    if (lower.includes('book') || lower.includes('visit') || lower.includes('viewing') || lower.includes('see')) {
      intent.type = 'booking';
    } else if (lower.includes('buy') || lower.includes('purchase') || lower.includes('invest')) {
      intent.type = 'purchase';
    } else if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
      intent.type = 'pricing';
    } else if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('greet')) {
      intent.type = 'greeting';
    }

    return intent;
  }

  // ── Generate AI response ──
  function generateResponse(intent: any, properties: any[], propertyName?: string) {
    switch (intent.type) {
      case 'greeting':
        return {
          message: `Hello! I'm the SAGECO EVERGREEN AI Broker. I can help you find land and property in Uganda. Tell me your budget, preferred location, and what you're looking for. For example: "I'm looking for land in Kyenjojo under 50 million UGX"`,
          action: 'greeting',
          properties: [],
        };

      case 'search': {
        let filtered = properties.filter((p: any) => p.is_available !== false);

        if (intent.budget_max) {
          filtered = filtered.filter((p: any) => parseFloat(p.price) <= intent.budget_max);
        }
        if (intent.locations.length > 0) {
          filtered = filtered.filter((p: any) =>
            intent.locations.some((loc: string) => (p.location || '').toLowerCase().includes(loc.toLowerCase()))
          );
        }
        if (intent.acreage_max) {
          filtered = filtered.filter((p: any) => parseFloat(p.acreage || p.size || '0') <= intent.acreage_max);
        }
        if (intent.property_type) {
          filtered = filtered.filter((p: any) =>
            (p.category || '').toLowerCase().includes(intent.property_type.toLowerCase())
          );
        }

        const top = filtered.slice(0, 5);

        if (top.length === 0) {
          return {
            message: `I couldn't find properties matching your criteria. Try broadening your search — adjust your budget or location. You can also WhatsApp us at 0750 414 366 for personalized help.`,
            action: 'no_results',
            properties: [],
          };
        }

        const propList = top.map((p: any, i: number) =>
          `${i + 1}. ${p.title} — UGX ${parseFloat(p.price).toLocaleString()} (${p.location || 'Uganda'})`
        ).join('\n');

        return {
          message: `I found ${filtered.length} propert${filtered.length === 1 ? 'y' : 'ies'} matching your search:\n\n${propList}\n\nWould you like to book a viewing for any of these? Just reply with the number.`,
          action: 'search_results',
          properties: top.map((p: any) => ({ id: p.id, title: p.title, price: p.price, location: p.location })),
        };
      }

      case 'booking':
        return {
          message: `Great! To book a viewing, I'll need to confirm a few details. You can also book directly at sageco-evergreen.vercel.app/book or call 0750 414 366. The viewing fee is UGX 30,000 (payable via MTN MoMo, Airtel Money, or card). Which property would you like to visit?`,
          action: 'booking_initiated',
          properties: [],
        };

      case 'pricing':
        return {
          message: `Our properties range from UGX 500,000 to UGX 500,000,000. Viewing fees are UGX 30,000 per property. What's your budget range? I can find the best options for you.`,
          action: 'pricing_info',
          properties: [],
        };

      case 'purchase':
        return {
          message: `To purchase a property, we offer secure escrow payments via MTN MoMo, Airtel Money, or card. Funds are held in escrow and released only after GPS-verified site visit and property verification. Tell me which property you're interested in and I'll guide you through the process.`,
          action: 'purchase_info',
          properties: [],
        };

      default:
        return {
          message: `I can help you search for property, book viewings, and guide you through purchases. Try: "Find land in Kyenjojo under 50 million" or "Show me commercial properties in Kampala".`,
          action: 'help',
          properties: [],
        };
    }
  }

  try {
    if (req.method === 'POST') {
      const body = await req.json();
      const { message, user_phone, user_name, conversation_type, conversation_id } = body;

      if (!message || !user_phone) {
        return new Response(JSON.stringify({ error: 'message and user_phone required' }), {
          status: 400, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      // Find or create conversation
      let convId = conversation_id;
      if (!convId) {
        const existingConv = await sbQuery('ai_conversations', `user_phone=eq.${user_phone}&status=eq.active&order=created_at.desc&limit=1`);
        if (existingConv && existingConv.length > 0) {
          convId = existingConv[0].id;
        } else {
          const convRes = await sbInsert('ai_conversations', {
            id: crypto.randomUUID(),
            user_phone,
            user_name: user_name || null,
            conversation_type: conversation_type || 'whatsapp',
            status: 'active',
            last_message_at: new Date().toISOString(),
          });
          const convData = await convRes.json();
          convId = convData[0]?.id;
        }
      }

      // Save user message
      await sbInsert('ai_messages', {
        id: crypto.randomUUID(),
        conversation_id: convId,
        role: 'user',
        content: message,
      });

      // Parse intent
      const intent = parseSearchIntent(message);

      // Fetch properties if search intent
      let properties: any[] = [];
      if (intent.type === 'search' || intent.type === 'pricing' || intent.type === 'purchase') {
        properties = await sbQuery('properties', 'select=*&order=created_at.desc&limit=100');
      }

      // Generate response
      const response = generateResponse(intent, properties);

      // Save assistant message with property matches
      await sbInsert('ai_messages', {
        id: crypto.randomUUID(),
        conversation_id: convId,
        role: 'assistant',
        content: response.message,
        property_matches: response.properties.length > 0 ? response.properties : null,
        action_taken: response.action,
      });

      // Update conversation last_message_at
      await fetch(`${SUPABASE_URL}/rest/v1/ai_conversations?id=eq.${convId}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': authHeader || `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({ last_message_at: new Date().toISOString() }),
      });

      // If booking intent, create broker task
      if (response.action === 'booking_initiated' || (response.action === 'search_results' && response.properties.length > 0)) {
        await sbInsert('broker_tasks', {
          id: crypto.randomUUID(),
          conversation_id: convId,
          task_type: response.action === 'booking_initiated' ? 'schedule' : 'followup',
          status: 'pending',
          payload: {
            user_phone,
            user_name,
            properties: response.properties,
            message_intent: intent.type,
          },
          due_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // Due in 2 hours
        });
      }

      return new Response(JSON.stringify({
        success: true,
        conversation_id: convId,
        response: response.message,
        action: response.action,
        properties: response.properties,
        intent: intent,
        follow_up_task_created: response.action === 'booking_initiated' || (response.action === 'search_results' && response.properties.length > 0),
      }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    if (req.method === 'GET') {
      const phone = new URL(req.url).searchParams.get('phone');
      const convId = new URL(req.url).searchParams.get('conversation_id');

      if (convId) {
        const messages = await sbQuery('ai_messages', `conversation_id=eq.${convId}&order=created_at.asc`);
        return new Response(JSON.stringify({ messages, count: messages.length }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      if (phone) {
        const convs = await sbQuery('ai_conversations', `user_phone=eq.${phone}&order=created_at.desc`);
        return new Response(JSON.stringify({ conversations: convs, count: convs.length }), {
          status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }

      const tasks = await sbQuery('broker_tasks', 'status=eq.pending&order=due_at.asc&limit=20');
      return new Response(JSON.stringify({ pending_tasks: tasks, count: tasks.length }), {
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
