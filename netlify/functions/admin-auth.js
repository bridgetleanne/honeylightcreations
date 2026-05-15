/**
 * Netlify Function: Admin Authentication
 * Simple password-based authentication for admin interface
 */

const crypto = require('crypto');

// Simple JWT-like token generation
function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

// Hash password for comparison
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

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
      }),
    };
  }

  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { password } = body;

    if (!password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Password is required',
        }),
      };
    }

    // TEMPORARY: Hardcoded password for testing
    // TODO: Remove this and use environment variable once working
    const HARDCODED_PASSWORD = 'uW[.ScPY3QG+wVf;';
    
    // Get admin password from environment variable (fallback to hardcoded for testing)
    const adminPassword = process.env.ADMIN_PASSWORD || HARDCODED_PASSWORD;
    
    console.log('Auth attempt - Password provided:', !!password);
    console.log('Auth attempt - Password length:', password?.length);
    console.log('Auth attempt - ADMIN_PASSWORD configured:', !!process.env.ADMIN_PASSWORD);
    console.log('Auth attempt - Using hardcoded fallback:', !process.env.ADMIN_PASSWORD);
    
    if (!adminPassword) {
      console.error('ADMIN_PASSWORD environment variable not set');
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Admin authentication not configured. Please set ADMIN_PASSWORD in Netlify environment variables.',
        }),
      };
    }

    // Compare passwords (simple comparison for now)
    // In production, you'd want to use bcrypt or similar
    const passwordMatch = password === adminPassword;
    console.log('Password match:', passwordMatch);
    console.log('Expected password length:', adminPassword.length);
    
    if (passwordMatch) {
      // Generate session token
      const token = generateToken();
      
      // In a real app, you'd store this token in a database
      // For now, we'll just return it
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          token: token,
          message: 'Authentication successful',
        }),
      };
    } else {
      return {
        statusCode: 401,
        headers,
        body: JSON.stringify({
          success: false,
          error: 'Invalid password',
        }),
      };
    }

  } catch (error) {
    console.error('Authentication error:', error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        error: 'Authentication failed',
      }),
    };
  }
};

// Made with Bob