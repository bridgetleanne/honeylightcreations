/**
 * Netlify Function: Square Checkout Link Generator
 * Creates a checkout link for a specific product/variation
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

// Main handler
exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
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
        code: 'METHOD_NOT_ALLOWED',
      }),
    };
  }

  try {
    // Validate environment variables
    if (!process.env.SQUARE_ACCESS_TOKEN) {
      throw new Error('SQUARE_ACCESS_TOKEN not configured');
    }
    if (!process.env.SQUARE_LOCATION_ID) {
      throw new Error('SQUARE_LOCATION_ID not configured');
    }

    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { item_id, variation_id, quantity = 1, note = '', design } = body;

    // Validate required fields
    if (!variation_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'variation_id is required',
          code: 'INVALID_REQUEST',
        }),
      };
    }

    const client = getSquareClient();
    const { checkoutApi } = client;

    // Format design information for order notes
    let orderNote = note;
    if (design && design.name) {
      orderNote = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📐 DESIGN INFORMATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Design Name: ${design.name}
Design File: ${design.file || 'N/A'}

🔗 VIEW & DOWNLOAD DESIGN:
${design.imageUrl || 'N/A'}

💡 Click the link above to view the full-size
design image for printing.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `.trim();
    }

    // Create checkout request
    const checkoutRequest = {
      idempotencyKey: `${variation_id}-${Date.now()}`,
      order: {
        locationId: process.env.SQUARE_LOCATION_ID,
        lineItems: [
          {
            catalogObjectId: variation_id,
            quantity: quantity.toString(),
            note: orderNote || undefined,
          },
        ],
      },
      checkoutOptions: {
        redirectUrl: `${process.env.URL || 'https://honeylightcreations.com'}/shop.html?order=success`,
        askForShippingAddress: true,
      },
    };

    // Create payment link
    const response = await checkoutApi.createPaymentLink(checkoutRequest);

    if (!response.result.paymentLink) {
      throw new Error('Failed to create payment link');
    }

    // Log design info for debugging (optional)
    if (design) {
      console.log('Order created with design:', {
        name: design.name,
        file: design.file,
        orderId: response.result.paymentLink.orderId
      });
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        checkout_url: response.result.paymentLink.url,
        order_id: response.result.paymentLink.orderId || null,
      }),
    };

  } catch (error) {
    console.error('Square Checkout API Error:', error);

    // Handle specific Square API errors
    let errorMessage = error.message || 'Failed to create checkout';
    let errorCode = 'CHECKOUT_ERROR';

    if (error.errors && error.errors.length > 0) {
      const squareError = error.errors[0];
      errorMessage = squareError.detail || squareError.code;
      errorCode = squareError.code;
    }

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: errorMessage,
        code: errorCode,
      }),
    };
  }
};

// Made with Bob
