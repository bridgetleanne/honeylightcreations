# Square Catalog Integration - Deployment Checklist

## Pre-Deployment Setup

### ✅ Square Account Setup

- [ ] Square Developer account created
- [ ] Application created in Square Developer Dashboard
- [ ] Application ID copied
- [ ] Access Token generated (Sandbox for testing)
- [ ] Location ID obtained from Square Dashboard
- [ ] Products added to Square Catalog:
  - [ ] At least one sticker product
  - [ ] At least one shirt product
  - [ ] All products marked as "Available online"
  - [ ] Product images uploaded
  - [ ] Prices set correctly
  - [ ] Categories assigned

### ✅ Netlify Account Setup

- [ ] Netlify account created
- [ ] Repository connected to Netlify
- [ ] Site deployed successfully
- [ ] Environment variables configured:
  - [ ] `SQUARE_ACCESS_TOKEN`
  - [ ] `SQUARE_APPLICATION_ID`
  - [ ] `SQUARE_LOCATION_ID`
  - [ ] `SQUARE_ENVIRONMENT` (set to "sandbox")
- [ ] Site redeployed after adding environment variables

### ✅ Code Verification

- [ ] All files committed to repository
- [ ] `package.json` present
- [ ] `netlify.toml` present
- [ ] `.env.example` present
- [ ] `.gitignore` includes `.env` and `node_modules/`
- [ ] Serverless functions in `netlify/functions/` directory
- [ ] `js/square-catalog.js` included in `shop.html`

## Testing Phase (Sandbox)

### ✅ Catalog Display

- [ ] Visit shop page: `https://your-site.netlify.app/shop.html`
- [ ] Loading spinner appears initially
- [ ] Products load from Square Catalog
- [ ] Product images display correctly
- [ ] Product names display correctly
- [ ] Prices display correctly
- [ ] "View Details" buttons appear on products
- [ ] Category filters work (All, Stickers, Shirts)

### ✅ Product Modal

- [ ] Click on a product card
- [ ] Modal opens with product details
- [ ] Product image displays in modal
- [ ] Product name and description show
- [ ] Price displays correctly
- [ ] Variations dropdown appears (if product has variations)
- [ ] Quantity input works (min 1, max 10)
- [ ] "Buy Now" button is visible
- [ ] Close button (X) works
- [ ] Clicking overlay closes modal

### ✅ Checkout Flow

- [ ] Click "Buy Now" in product modal
- [ ] Button shows "Processing..." state
- [ ] Redirects to Square checkout page
- [ ] Correct product appears in Square checkout
- [ ] Correct quantity appears
- [ ] Correct variation selected (if applicable)
- [ ] Can complete test purchase in sandbox
- [ ] Return URL works after checkout

### ✅ Error Handling

- [ ] Temporarily disable internet → Error message appears
- [ ] Click "Retry" button → Products reload
- [ ] Invalid product → Graceful error handling
- [ ] Network timeout → Error message displays

### ✅ Responsive Design

- [ ] Test on desktop (1920x1080)
- [ ] Test on tablet (768px width)
- [ ] Test on mobile (375px width)
- [ ] Product grid adjusts correctly
- [ ] Modal is readable on mobile
- [ ] Buttons are tappable on mobile
- [ ] Images scale properly

### ✅ Browser Compatibility

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Chrome Mobile (Android)

## Production Deployment

### ✅ Square Production Setup

- [ ] Switch to Production credentials in Square Developer Dashboard
- [ ] Generate Production Access Token
- [ ] Verify all products exist in Production catalog
- [ ] Test products are marked "Available online"
- [ ] Product images uploaded to Production
- [ ] Prices verified in Production

### ✅ Netlify Production Configuration

- [ ] Update environment variables in Netlify:
  - [ ] `SQUARE_ACCESS_TOKEN` → Production token
  - [ ] `SQUARE_ENVIRONMENT` → "production"
- [ ] Trigger new deployment
- [ ] Verify deployment successful
- [ ] Check function logs for errors

### ✅ Production Testing

- [ ] Visit production site
- [ ] Products load correctly
- [ ] Make a real test purchase (small amount)
- [ ] Verify order appears in Square Dashboard
- [ ] Test refund process in Square
- [ ] Verify email notifications work

### ✅ Final Checks

- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (HTTPS)
- [ ] Analytics configured (if desired)
- [ ] Contact information updated
- [ ] Social media links updated
- [ ] Privacy policy/terms added (if required)

## Monitoring & Maintenance

### Daily

- [ ] Check Netlify function logs for errors
- [ ] Monitor Square Dashboard for orders
- [ ] Respond to customer inquiries

### Weekly

- [ ] Review product inventory in Square
- [ ] Update product images if needed
- [ ] Add new products to catalog
- [ ] Check site performance

### Monthly

- [ ] Review Square API usage
- [ ] Check for Square SDK updates
- [ ] Verify all products still available
- [ ] Test checkout flow end-to-end

## Troubleshooting Guide

### Products Not Loading

**Symptoms:** Loading spinner never stops, or error message appears

**Solutions:**
1. Check Netlify function logs for errors
2. Verify environment variables are set correctly
3. Confirm Square Access Token is valid
4. Check products are marked "Available online" in Square
5. Verify Location ID is correct

**How to check function logs:**
1. Go to Netlify Dashboard
2. Click on your site
3. Go to "Functions" tab
4. Click on "square-catalog"
5. View recent invocations and logs

### Checkout Not Working

**Symptoms:** "Buy Now" button doesn't redirect, or shows error

**Solutions:**
1. Verify `SQUARE_LOCATION_ID` is correct
2. Check product has valid variations
3. Ensure product is in stock
4. Verify Square account is active
5. Check browser console for JavaScript errors

### Images Not Displaying

**Symptoms:** Product cards show placeholder instead of images

**Solutions:**
1. Upload images to products in Square Dashboard
2. Verify image URLs in API response (check function logs)
3. Check CORS settings (Square handles this automatically)
4. Try re-uploading images in Square

### Wrong Prices Showing

**Symptoms:** Prices don't match Square Dashboard

**Solutions:**
1. Clear browser cache
2. Trigger new deployment in Netlify
3. Verify prices in Square Dashboard
4. Check for multiple variations with different prices

## Support Resources

- **Square API Documentation:** https://developer.squareup.com/docs
- **Netlify Functions Docs:** https://docs.netlify.com/functions/overview/
- **Square Support:** https://squareup.com/help
- **Netlify Support:** https://www.netlify.com/support/

## Emergency Rollback

If something goes wrong in production:

1. Go to Netlify Dashboard → Deploys
2. Find the last working deployment
3. Click "..." menu → "Publish deploy"
4. Site will revert to previous version
5. Fix issues in development
6. Redeploy when ready

## Success Criteria

✅ **Integration is successful when:**

- Products load automatically from Square
- Customers can browse and filter products
- Product details display correctly
- Checkout redirects to Square successfully
- Orders appear in Square Dashboard
- No errors in Netlify function logs
- Site works on all devices and browsers
- Customer can complete purchase end-to-end

---

**Last Updated:** 2026-05-15
**Version:** 1.0.0