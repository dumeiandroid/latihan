// functions/api/contacts.js
export async function onRequest(context) {
  console.log('API contacts called');
  
  const { env } = context;
  const { DB } = env;
  
  // Debug: Check if DB is available
  if (!DB) {
    console.error('DB binding not found');
    return new Response(JSON.stringify({ error: 'Database binding not found' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  try {
    console.log('Querying database...');
    const { results } = await DB.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    console.log('Query results:', results);
    
    return new Response(JSON.stringify(results), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  } catch (error) {
    console.error('Database error:', error);
    return new Response(JSON.stringify({ 
      error: 'Database error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
