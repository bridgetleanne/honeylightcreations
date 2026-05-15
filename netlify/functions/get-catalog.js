/**
 * Netlify Function: Get Design Catalog
 * Serves catalog.json from Netlify Blob Storage
 * Falls back to static catalog.json if Blob Storage is empty
 */

const { getStore } = require('@netlify/blobs');
const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=60', // Cache for 1 minute
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
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
    // Try to get catalog from Blob Storage first
    const catalogStore = getStore('catalog');
    let catalog = null;

    try {
      catalog = await catalogStore.get('catalog.json', { type: 'json' });
    } catch (blobError) {
      console.log('Catalog not found in Blob Storage, using static file');
    }

    // If no catalog in Blob Storage, fall back to static catalog.json
    if (!catalog || catalog.length === 0) {
      try {
        const staticCatalogPath = path.join(process.cwd(), 'catalog.json');
        const staticCatalog = await fs.readFile(staticCatalogPath, 'utf-8');
        catalog = JSON.parse(staticCatalog);
        console.log('Using static catalog.json');
      } catch (staticError) {
        console.error('Failed to read static catalog:', staticError);
        catalog = [];
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(catalog),
    };

  } catch (error) {
    console.error('Catalog fetch error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Failed to fetch catalog',
      }),
    };
  }
};

// Made with Bob