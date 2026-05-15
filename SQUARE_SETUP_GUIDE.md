# Square Catalog API - Quick Setup Guide

## Prerequisites

Before implementation, you'll need:

1. ✅ Square Developer Account
2. ✅ Square Application created
3. ✅ Products added to Square Catalog
4. ✅ Netlify account (for hosting serverless functions)

## Step 1: Get Your Square API Credentials

### A. Create/Access Square Application

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Click "Create App" or select existing app
3. Note your **Application ID** (found in app settings)

### B. Generate Access Token

1. In your app dashboard, go to "Credentials"
2. Choose environment:
   - **Sandbox** (for testing) - Use sandbox credentials
   - **Production** (for live site) - Use production credentials
3. Copy your **Access Token**
   - ⚠️ **IMPORTANT:** Never commit this to Git!

### C. Get Location ID

1. In Square Dashboard, go to "Locations"
2. Copy your **Location ID**
3. Or use the API: `GET /v2/locations`

## Step 2: Set Up Products in Square Catalog

### Option A: Use Square Dashboard (Recommended)

1. Go to [Square Dashboard](https://squareup.com/dashboard)
2. Navigate to **Items & Orders** → **Items**
3. Click **Create an Item**
4. For each product:
   - Add name (e.g., "Book Lover Sticker Pack")
   - Add description
   - Set price
   - Upload image (recommended: 1000x1000px)
   - Add variations if needed (sizes, colors)
   - Set category (e.g., "Stickers", "Shirts")
   - Mark as available online

### Option B: Use Square API

```javascript
// Example: Create item via API
POST /v2/catalog/object
{
  "idempotency_key": "unique-key",
  "object": {
    "type": "ITEM",
    "id": "#sticker-pack-1",
    "item_data": {
      "name": "Book Lover Sticker Pack",
      "description": "5 cute book-themed stickers",
      "category_id": "#stickers",
      "variations": [
        {
          "type": "ITEM_VARIATION",
          "id": "#sticker-pack-1-regular",
          "item_variation_data": {
            "name": "Regular",
            "pricing_type": "FIXED_PRICING",
            "price_money": {
              "amount": 500,
              "currency": "USD"
            }
          }
        }
      ]
    }
  }
}
```

## Step 3: Configure Netlify

### A. Install Netlify CLI (Optional, for local testing)

```bash
npm install -g netlify-cli
```

### B. Set Environment Variables

**In Netlify Dashboard:**
1. Go to Site Settings → Environment Variables
2. Add the following variables:

```
SQUARE_ACCESS_TOKEN=your_access_token_here
SQUARE_APPLICATION_ID=your_app_id_here
SQUARE_LOCATION_ID=your_location_id_here
SQUARE_ENVIRONMENT=sandbox
```

**For Local Development (.env file):**
```bash
# Create .env file (add to .gitignore!)
SQUARE_ACCESS_TOKEN=your_sandbox_token
SQUARE_APPLICATION_ID=your_app_id
SQUARE_LOCATION_ID=your_location_id
SQUARE_ENVIRONMENT=sandbox
```

### C. Update .gitignore

```
# Add to .gitignore
.env
.env.local
netlify/functions/node_modules
node_modules/
```

## Step 4: Project Structure

After implementation, your project will look like:

```
honeylight-creations/
├── netlify/
│   └── functions/
│       ├── square-catalog.js      # Fetch products
│       └── square-checkout.js     # Create checkout
├── js/
│   ├── gallery.js                 # Existing
│   └── square-catalog.js          # NEW - Catalog display
├── css/
│   └── style.css                  # Updated with catalog styles
├── shop.html                      # Updated with catalog section
├── netlify.toml                   # NEW - Netlify config
├── package.json                   # NEW - Dependencies
├── .env                           # NEW - Local env vars (gitignored)
└── .gitignore                     # Updated
```

## Step 5: Testing Checklist

### Before Going Live:

- [ ] Test with Square Sandbox environment
- [ ] Verify all products display correctly
- [ ] Test product modal functionality
- [ ] Test checkout redirect
- [ ] Verify images load properly
- [ ] Test on mobile devices
- [ ] Check error handling (disconnect internet, etc.)
- [ ] Verify loading states work
- [ ] Test with different product types
- [ ] Confirm prices display correctly

### Switch to Production:

1. Change `SQUARE_ENVIRONMENT` to `production`
2. Update `SQUARE_ACCESS_TOKEN` to production token
3. Test thoroughly in production
4. Monitor for errors

## Step 6: Common Issues & Solutions

### Issue: "Unauthorized" Error

**Solution:** 
- Verify access token is correct
- Check token hasn't expired
- Ensure token has correct permissions

### Issue: No Products Showing

**Solution:**
- Verify products exist in Square Catalog
- Check products are marked as "available online"
- Verify location ID is correct
- Check browser console for errors

### Issue: Images Not Loading

**Solution:**
- Verify images uploaded to Square
- Check image URLs in API response
- Ensure CORS is configured (Square handles this)

### Issue: Checkout Redirect Fails

**Solution:**
- Verify variation ID is correct
- Check product is in stock
- Ensure checkout URL is valid
- Check browser console for errors

## Step 7: Going Live

1. **Test Everything in Sandbox**
   - Complete multiple test purchases
   - Verify all flows work correctly

2. **Switch to Production**
   - Update environment variables
   - Deploy to Netlify
   - Test with real products

3. **Monitor**
   - Check Netlify function logs
   - Monitor Square Dashboard for orders
   - Watch for error reports

## Support Resources

- [Square API Documentation](https://developer.squareup.com/docs)
- [Square Catalog API](https://developer.squareup.com/docs/catalog-api/what-it-does)
- [Square Checkout API](https://developer.squareup.com/docs/checkout-api/what-it-does)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

## Security Best Practices

✅ **DO:**
- Store API credentials in environment variables
- Use HTTPS for all requests
- Validate all user input
- Implement rate limiting
- Log errors (but not sensitive data)

❌ **DON'T:**
- Commit API credentials to Git
- Expose access tokens in client code
- Store sensitive data in localStorage
- Skip input validation
- Log full API responses (may contain sensitive data)

## Next Steps

Once you've completed this setup:

1. Review the implementation plan in `SQUARE_INTEGRATION_PLAN.md`
2. Check technical specifications in `SQUARE_TECHNICAL_SPEC.md`
3. Switch to **Code mode** to begin implementation
4. Follow the todo list step-by-step

---

**Ready to implement?** Switch to Code mode and we'll build this integration together! 🚀