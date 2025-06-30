// functions/api/contact.js
export async function onRequestPost(context) {
  try {
    // Get form data
    const formData = await context.request.formData();
    const name = formData.get('name');
    const email = formData.get('email');
    const message = formData.get('message');

    // Validate data
    if (!name || !email || !message) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Semua field harus diisi'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Insert to database
    const result = await context.env.DB.prepare(
      "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)"
    ).bind(name, email, message).run();

    if (result.success) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Pesan berhasil dikirim!'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      throw new Error('Database insert failed');
    }

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Terjadi kesalahan server'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Handle GET request (optional - untuk test)
export async function onRequestGet(context) {
  return new Response(JSON.stringify({
    message: 'Contact API is working!'
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
