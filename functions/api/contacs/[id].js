// functions/api/contacts/[id].js - Update & Delete specific contact
export async function onRequest(context) {
  const { request, env, params } = context;
  const { DB } = env;
  const method = request.method;
  const id = params.id;
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Handle preflight
  if (method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    switch (method) {
      case 'PUT':
        return await updateContact(request, DB, id, corsHeaders);
      case 'DELETE':
        return await deleteContact(DB, id, corsHeaders);
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

// PUT update contact
async function updateContact(request, DB, id, corsHeaders) {
  const { name, email, message } = await request.json();
  
  await DB.prepare(
    "UPDATE contacts SET name = ?, email = ?, message = ? WHERE id = ?"
  ).bind(name, email, message, id).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

// DELETE contact
async function deleteContact(DB, id, corsHeaders) {
  await DB.prepare("DELETE FROM contacts WHERE id = ?").bind(id).run();
  
  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}
