// functions/api/contacts.js - Complete CRUD API
export async function onRequest(context) {
  const { request, env } = context;
  const { DB } = env;
  const method = request.method;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    switch (method) {
      case 'GET':
        return await getContacts(DB, corsHeaders);
      case 'POST':
        return await createContact(request, DB, corsHeaders);
      default:
        return new Response('Method not allowed', { status: 405, headers: corsHeaders });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// GET all contacts
async function getContacts(DB, corsHeaders) {
  const { results } = await DB.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
  return new Response(JSON.stringify(results), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

// POST create contact
async function createContact(request, DB, corsHeaders) {
  const { name, email, message } = await request.json();
  
  const result = await DB.prepare(
    "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)"
  ).bind(name, email, message).run();
  
  return new Response(JSON.stringify({ 
    success: true, 
    id: result.meta.last_row_id 
  }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
