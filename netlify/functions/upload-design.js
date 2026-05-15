/**
 * Netlify Function: Upload Design with Blob Storage
 * Handles SVG/PNG uploads, saves to Netlify Blobs, and updates catalog
 */

const { parseMultipartForm } = require('@netlify/functions');
const path = require('path');

// Try to load Netlify Blobs, but handle if it's not available
let getStore, connectLambda;
try {
  const blobsModule = require('@netlify/blobs');
  getStore = blobsModule.getStore;
  connectLambda = blobsModule.connectLambda;
  console.log('Netlify Blobs loaded successfully');
} catch (error) {
  console.error('Failed to load @netlify/blobs:', error.message);
  getStore = null;
  connectLambda = null;
}

// Validate file type
function isValidFileType(filename) {
  const validExtensions = ['.svg', '.png'];
  const ext = path.extname(filename).toLowerCase();
  return validExtensions.includes(ext);
}

// Sanitize filename
function sanitizeFilename(filename) {
  const ext = path.extname(filename);
  let name = path.basename(filename, ext);
  
  // Replace spaces and special characters with hyphens
  name = name.replace(/[^a-zA-Z0-9-]/g, '-');
  name = name.replace(/-+/g, '-');
  name = name.replace(/^-+|-+$/g, '');
  name = name.toLowerCase();
  
  // Add timestamp for uniqueness
  const timestamp = Date.now();
  
  return `${name}-${timestamp}${ext}`;
}

// Verify authentication token
function verifyAuth(event) {
  const authHeader = event.headers.authorization || event.headers.Authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }
  
  const token = authHeader.substring(7);
  return token && token.length > 0;
}

// Main handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed',
      }),
    };
  }

  try {
    // Connect to Netlify Blobs (required for Lambda compatibility)
    if (connectLambda) {
      connectLambda(event);
      console.log('Connected to Netlify Blobs');
    }

    // Verify authentication
    if (!verifyAuth(event)) {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Unauthorized',
        }),
      };
    }

    // Parse multipart form data
    let fields, files;
    try {
      const parsed = await parseMultipartForm(event);
      fields = parsed.fields;
      files = parsed.files;
      console.log('Parsed form data:', {
        fieldsKeys: Object.keys(fields || {}),
        filesCount: files?.length || 0
      });
    } catch (parseError) {
      console.error('Form parsing error:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: `Failed to parse form data: ${parseError.message}`,
        }),
      };
    }
    
    if (!files || files.length === 0) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'No file uploaded',
        }),
      };
    }

    const file = files[0];
    const designName = fields.name;
    
    let tags = [];
    try {
      tags = JSON.parse(fields.tags || '[]');
    } catch (e) {
      console.error('Tags parsing error:', e);
      tags = [];
    }

    // Validate inputs
    if (!designName) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Design name is required',
        }),
      };
    }

    // Validate file type
    if (!isValidFileType(file.filename)) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid file type. Only SVG and PNG files are allowed.',
        }),
      };
    }

    // Validate file size (20MB max)
    const maxSize = 20 * 1024 * 1024;
    if (file.content.length > maxSize) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'File size exceeds 20MB limit',
        }),
      };
    }

    // Sanitize filename
    const sanitizedFilename = sanitizeFilename(file.filename);

    // Check if Netlify Blobs is available
    if (!getStore) {
      console.error('Netlify Blobs not available');
      return {
        statusCode: 503,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'File storage not configured. Please contact administrator.',
          details: '@netlify/blobs package not available'
        }),
      };
    }

    // Get Netlify Blob stores
    let designsStore, catalogStore;
    try {
      designsStore = getStore({
        name: 'designs',
        siteID: process.env.SITE_ID || context.siteId,
        token: process.env.NETLIFY_TOKEN || context.token,
      });
      catalogStore = getStore({
        name: 'catalog',
        siteID: process.env.SITE_ID || context.siteId,
        token: process.env.NETLIFY_TOKEN || context.token,
      });
      console.log('Blob stores initialized successfully');
    } catch (error) {
      console.error('Error initializing Blob stores:', error);
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Failed to initialize storage',
          details: error.message
        }),
      };
    }

    // Save file to Blob Storage
    try {
      await designsStore.set(sanitizedFilename, file.content, {
        metadata: {
          contentType: file.type,
          originalName: file.filename,
          uploadDate: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Error saving file to Blob storage:', error);
      throw new Error(`Failed to save file: ${error.message}`);
    }

    // Create design entry
    const designEntry = {
      id: `design-${Date.now()}`,
      name: designName,
      file: sanitizedFilename,
      tags: tags,
      uploadDate: new Date().toISOString(),
      available: true
    };

    // Get existing catalog
    let catalog = [];
    try {
      const catalogData = await catalogStore.get('catalog.json', { type: 'json' });
      if (catalogData) {
        catalog = catalogData;
      }
    } catch (error) {
      console.log('No existing catalog, creating new one');
    }

    // Add new design to catalog
    catalog.push(designEntry);

    // Save updated catalog
    try {
      await catalogStore.set('catalog.json', JSON.stringify(catalog, null, 2), {
        metadata: {
          contentType: 'application/json',
          lastUpdated: new Date().toISOString(),
        }
      });
    } catch (error) {
      console.error('Error saving catalog:', error);
      throw new Error(`Failed to update catalog: ${error.message}`);
    }

    console.log(`Design uploaded successfully: ${sanitizedFilename}`);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Design uploaded successfully',
        design: designEntry,
      }),
    };

  } catch (error) {
    console.error('Upload error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to upload design',
      }),
    };
  }
};

// Made with Bob