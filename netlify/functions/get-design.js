/**
 * Netlify Function: Get Design Image
 * Serves design images from Netlify Blob Storage
 * Falls back to static designs/ folder if not in Blob Storage
 */

const { getStore } = require('@netlify/blobs');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Get filename from query parameter
  const filename = event.queryStringParameters?.file;

  if (!filename) {
    return {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Filename parameter required' }),
    };
  }

  try {
    // Try to get design from Blob Storage first
    const designsStore = getStore('designs');
    let fileData = null;
    let contentType = 'image/png';

    try {
      const blobData = await designsStore.get(filename, { type: 'arrayBuffer' });
      if (blobData) {
        fileData = Buffer.from(blobData);
        
        // Get metadata for content type
        const metadata = await designsStore.getMetadata(filename);
        if (metadata?.contentType) {
          contentType = metadata.contentType;
        } else {
          // Determine content type from extension
          const ext = path.extname(filename).toLowerCase();
          contentType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
        }
      }
    } catch (blobError) {
      console.log(`Design not found in Blob Storage: ${filename}, trying static file`);
    }

    // If not in Blob Storage, try static designs/ folder
    if (!fileData) {
      try {
        const staticPath = path.join(process.cwd(), 'designs', filename);
        fileData = await fs.readFile(staticPath);
        
        // Determine content type from extension
        const ext = path.extname(filename).toLowerCase();
        contentType = ext === '.svg' ? 'image/svg+xml' : 'image/png';
      } catch (staticError) {
        console.error(`Design not found in static folder: ${filename}`);
        return {
          statusCode: 404,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ error: 'Design not found' }),
        };
      }
    }

    // Return the image
    return {
      statusCode: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
        'Access-Control-Allow-Origin': '*',
      },
      body: fileData.toString('base64'),
      isBase64Encoded: true,
    };

  } catch (error) {
    console.error('Design fetch error:', error);

    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch design' }),
    };
  }
};

// Made with Bob