function verifyAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  return authHeader?.startsWith('Bearer ') && authHeader.substring(7).length > 0;
}

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') return { statusCode: 200, headers, body: '' };
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  if (!verifyAuth(event)) {
    return { statusCode: 401, headers, body: JSON.stringify({ success: false, error: 'Unauthorized' }) };
  }

  try {
    const { name, tags = [], available = true, public_id, image_url } = JSON.parse(event.body || '{}');

    if (!name || !public_id || !image_url) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'name, public_id, and image_url are required' }),
      };
    }

    const res = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/HoneyLightUploads`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ name, tags, available, public_id, image_url }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Database error: ${err.message || res.statusText}`);
    }

    const [design] = await res.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Design saved successfully', design }),
    };
  } catch (error) {
    console.error('Upload error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ success: false, error: error.message || 'Upload failed' }),
    };
  }
};
