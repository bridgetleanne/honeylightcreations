const { createClient } = require('@supabase/supabase-js');

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
    const { fileDataUrl, name, tags = [], available = true } = JSON.parse(event.body || '{}');

    if (!fileDataUrl || !name) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'fileDataUrl and name are required' }),
      };
    }

    const mimeMatch = fileDataUrl.match(/^data:([^;]+);base64,/);
    if (!mimeMatch || !['image/png', 'image/svg+xml'].includes(mimeMatch[1])) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ success: false, error: 'Only PNG and SVG files are allowed' }),
      };
    }

    // Upload to Cloudinary (unsigned upload via preset)
    const cloudRes = await fetch(
      `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file: fileDataUrl,
          upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
          folder: 'honeylightcreations/designs',
        }),
      }
    );

    if (!cloudRes.ok) {
      const err = await cloudRes.json().catch(() => ({}));
      throw new Error(`Cloudinary upload failed: ${err.error?.message || cloudRes.statusText}`);
    }

    const cloudData = await cloudRes.json();

    // Save metadata to Supabase
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

    const { data, error } = await supabase
      .from('HoneyLightUploads')
      .insert({
        name,
        tags,
        available,
        public_id: cloudData.public_id,
        image_url: cloudData.secure_url,
      })
      .select()
      .single();

    if (error) throw new Error(`Database error: ${error.message}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ success: true, message: 'Design uploaded successfully', design: data }),
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
