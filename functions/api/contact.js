export async function onRequest(context) {
  const { DB } = context.env;
  
  try {
    const { results } = await DB.prepare("SELECT * FROM contacts ORDER BY created_at DESC").all();
    return Response.json(results);
  } catch (error) {
    return Response.json({ error: 'Database error' }, { status: 500 });
  }
}
