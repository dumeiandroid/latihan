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

  // Debug logging
  console.log(`API ${method} request to /api/contacts/${id}`);

  // Validate ID
  if (!id || isNaN(parseInt(id))) {
    return new Response(JSON.stringify({ error: 'Invalid contact ID' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  try {
    switch (method) {
      case 'PUT':
        return await updateContact(request, DB, id, corsHeaders);
      case 'DELETE':
        return await deleteContact(DB, id, corsHeaders);
      default:
        return new Response(JSON.stringify({ error: `Method ${method} not allowed` }), { 
          status: 405, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// PUT update contact
async function updateContact(request, DB, id, corsHeaders) {
  console.log(`Updating contact ${id}...`);

  let requestData;
  try {
    requestData = await request.json();
    console.log('Update request data:', requestData);
  } catch (error) {
    throw new Error('Invalid JSON data');
  }

  const { name, email, message } = requestData;

  // Validation
  if (!name || !email || !message) {
    throw new Error('Name, email, and message are required');
  }

  if (!email.includes('@')) {
    throw new Error('Invalid email format');
  }

  try {
    // First check if contact exists
    const existingContact = await DB.prepare("SELECT id FROM contacts WHERE id = ?").bind(id).first();
    
    if (!existingContact) {
      throw new Error('Contact not found');
    }

    // Update the contact
    const result = await DB.prepare(
      "UPDATE contacts SET name = ?, email = ?, message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?"
    ).bind(name.trim(), email.trim(), message.trim(), id).run();

    console.log('Update result:', result);

    // Verify update was successful
    if (result.changes === 0) {
      throw new Error('No changes were made to the contact');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact updated successfully',
      changes: result.changes
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (dbError) {
    console.error('Database error:', dbError);
    throw new Error(`Failed to update contact: ${dbError.message}`);
  }
}

// DELETE contact
async function deleteContact(DB, id, corsHeaders) {
  console.log(`Deleting contact ${id}...`);

  try {
    // First check if contact exists
    const existingContact = await DB.prepare("SELECT id, name FROM contacts WHERE id = ?").bind(id).first();
    
    if (!existingContact) {
      throw new Error('Contact not found');
    }

    // Delete the contact
    const result = await DB.prepare("DELETE FROM contacts WHERE id = ?").bind(id).run();
    
    console.log('Delete result:', result);

    // Verify deletion was successful
    if (result.changes === 0) {
      throw new Error('Contact could not be deleted');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Contact deleted successfully',
      changes: result.changes
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (dbError) {
    console.error('Database error:', dbError);
    throw new Error(`Failed to delete contact: ${dbError.message}`);
  }
}
