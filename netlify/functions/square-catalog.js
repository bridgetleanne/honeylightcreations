/**
 * Netlify Function: Square Catalog API Proxy
 * Fetches products from Square Catalog API and returns formatted data
 */

const { Client, Environment } = require('square');

// Initialize Square client
const getSquareClient = () => {
  const environment = process.env.SQUARE_ENVIRONMENT === 'production' 
    ? Environment.Production 
    : Environment.Sandbox;

  return new Client({
    accessToken: process.env.SQUARE_ACCESS_TOKEN,
    environment: environment,
  });
};

// Format price for display
const formatPrice = (amount, currency = 'USD') => {
  const dollars = amount / 100;
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(dollars);
};

// Extract image URL from catalog object
const getImageUrl = (catalogObject) => {
  if (catalogObject.imageIds && catalogObject.imageIds.length > 0) {
    // Image URLs are constructed from image IDs
    // Square provides images via their CDN
    return catalogObject.imageIds[0];
  }
  return null;
};

// Format catalog item for frontend
const formatCatalogItem = (item, images = {}) => {
  const itemData = item.itemData;
  
  // Get the first variation for default pricing
  const variations = itemData.variations || [];
  const defaultVariation = variations[0];
  
  let price = null;
  if (defaultVariation && defaultVariation.itemVariationData.priceMoney) {
    const priceMoney = defaultVariation.itemVariationData.priceMoney;
    price = {
      amount: priceMoney.amount,
      currency: priceMoney.currency,
      formatted: formatPrice(priceMoney.amount, priceMoney.currency),
    };
  }

  // Get image URL
  let imageUrl = null;
  if (itemData.imageIds && itemData.imageIds.length > 0) {
    const imageId = itemData.imageIds[0];
    if (images[imageId]) {
      imageUrl = images[imageId].imageData.url;
    }
  }

  // Format variations
  const formattedVariations = variations.map(v => {
    const varData = v.itemVariationData;
    const varPrice = varData.priceMoney;
    return {
      id: v.id,
      name: varData.name,
      price: varPrice ? varPrice.amount : 0,
      formatted_price: varPrice ? formatPrice(varPrice.amount, varPrice.currency) : '$0.00',
      sku: varData.sku || null,
      ordinal: varData.ordinal || 0,
    };
  });

  // Sort variations by ordinal
  formattedVariations.sort((a, b) => a.ordinal - b.ordinal);

  return {
    id: item.id,
    name: itemData.name,
    description: itemData.description || '',
    price: price,
    image_url: imageUrl,
    variations: formattedVariations,
    category: itemData.categoryId || null,
    available: itemData.availableOnline !== false,
    in_stock: !itemData.isDeleted && itemData.availableOnline !== false,
  };
};

// Main handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ 
        success: false, 
        error: 'Method not allowed',
        code: 'METHOD_NOT_ALLOWED',
      }),
    };
  }

  try {
    // Validate environment variables
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      throw new Error('SQUARE_ACCESS_TOKEN not configured');
    }

    const client = getSquareClient();
    const { catalogApi } = client;

    // Parse query parameters
    const params = event.queryStringParameters || {};
    const category = params.category;
    const limit = parseInt(params.limit) || 100;

    // Fetch catalog items
    const response = await catalogApi.listCatalog(undefined, 'ITEM');

    if (!response.result.objects) {
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          products: [],
          count: 0,
        }),
      };
    }

    // Fetch all images separately
    const imageIds = [];
    response.result.objects.forEach(item => {
      if (item.itemData && item.itemData.imageIds) {
        imageIds.push(...item.itemData.imageIds);
      }
    });

    // Fetch images if any exist
    let images = {};
    if (imageIds.length > 0) {
      try {
        const imageResponse = await catalogApi.batchRetrieveCatalogObjects({
          objectIds: imageIds,
          includeRelatedObjects: false,
        });
        
        if (imageResponse.result.objects) {
          imageResponse.result.objects.forEach(img => {
            images[img.id] = img;
          });
        }
      } catch (imageError) {
        console.error('Error fetching images:', imageError);
        // Continue without images
      }
    }

    // Format items
    let products = response.result.objects
      .filter(item => item.type === 'ITEM')
      .map(item => formatCatalogItem(item, images))
      .filter(item => item.available); // Only include available items

    // Filter by category if specified
    if (category && category !== 'all') {
      products = products.filter(p => {
        // Match category ID or check if name contains category
        return p.category === category || 
               p.name.toLowerCase().includes(category.toLowerCase());
      });
    }

    // Limit results
    if (limit > 0) {
      products = products.slice(0, limit);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        products: products,
        count: products.length,
      }),
    };

  } catch (error) {
    console.error('Square Catalog API Error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: error.message || 'Failed to fetch catalog',
        code: 'SQUARE_API_ERROR',
      }),
    };
  }
};

// Made with Bob
