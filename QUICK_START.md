# Square Catalog Integration - Quick Start Guide

## 🚀 Get Started in 5 Steps

### Step 1: Get Square Credentials (5 minutes)

1. Go to https://developer.squareup.com/apps
2. Create/select your app
3. Copy these from the **Credentials** tab:
   - Application ID
   - Access Token (use Sandbox for testing)
4. Get Location ID from https://squareup.com/dashboard → Locations

### Step 2: Add Products to Square (10 minutes)

1. Go to https://squareup.com/dashboard
2. Navigate to **Items & Orders** → **Items**
3. Click **Create an Item**
4. Add your products:
   - Name, price, description
   - Upload image
   - Set category (Stickers, Shirts, etc.)
   - Mark as "Available online"
5. Repeat for all products

### Step 3: Deploy to Netlify (5 minutes)

1. Sign up at https://www.netlify.com/
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Deploy with default settings

### Step 4: Configure Environment Variables (2 minutes)

In Netlify Dashboard → Site settings → Environment variables, add:

```
SQUARE_ACCESS_TOKEN = your_sandbox_token_here
SQUARE_APPLICATION_ID = your_app_id_here
SQUARE_LOCATION_ID = your_location_id_here
SQUARE_ENVIRONMENT = sandbox
```

Then: **Deploys** → **Trigger deploy** → **Deploy site**

### Step 5: Test Your Shop (5 minutes)

1. Visit `https://your-site.netlify.app/shop.html`
2. Products should load automatically
3. Click a product → Modal opens
4. Click "Buy Now" → Redirects to Square checkout
5. Complete a test purchase

**Total Time: ~30 minutes** ⏱️

---

## 📁 Files Created

```
Your Project/
├── netlify/
│   └── functions/
│       ├── square-catalog.js      ← Fetches products from Square
│       └── square-checkout.js     ← Creates checkout links
├── js/
│   └── square-catalog.js          ← Frontend catalog display
├── css/
│   └── style.css                  ← Updated with catalog styles
├── shop.html                      ← Updated with catalog section
├── netlify.toml                   ← Netlify configuration
├── package.json                   ← Dependencies
├── .env.example                   ← Environment variables template
├── .gitignore                     ← Updated to exclude .env
├── README.md                      ← Updated with full instructions
├── SQUARE_INTEGRATION_PLAN.md     ← Architecture & planning
├── SQUARE_TECHNICAL_SPEC.md       ← Technical specifications
├── SQUARE_SETUP_GUIDE.md          ← Detailed setup guide
└── DEPLOYMENT_CHECKLIST.md        ← Testing & deployment checklist
```

---

## 🎯 What You Get

### Before (Old Way)
- ❌ Manual HTML editing for each product
- ❌ Embedded payment links
- ❌ No product images
- ❌ Static pricing
- ❌ Limited product info

### After (New Way)
- ✅ Products managed in Square Dashboard
- ✅ Automatic updates (price, inventory, images)
- ✅ Professional product cards with images
- ✅ Product detail modals
- ✅ Category filtering
- ✅ Secure checkout via Square
- ✅ Mobile responsive design

---

## 🔧 Common Commands

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
netlify dev
```
Then visit: http://localhost:8888/shop.html

### Deploy to Netlify
```bash
netlify deploy --prod
```

---

## 🐛 Quick Troubleshooting

### Products Not Loading?
1. Check Netlify function logs
2. Verify environment variables
3. Confirm products are "Available online" in Square

### Checkout Not Working?
1. Verify Location ID is correct
2. Check product has variations
3. Ensure Square account is active

### Images Not Showing?
1. Upload images in Square Dashboard
2. Verify image URLs in function logs
3. Clear browser cache

---

## 📚 Documentation

- **Full Setup:** See `SQUARE_SETUP_GUIDE.md`
- **Testing:** See `DEPLOYMENT_CHECKLIST.md`
- **Architecture:** See `SQUARE_INTEGRATION_PLAN.md`
- **Technical Details:** See `SQUARE_TECHNICAL_SPEC.md`
- **User Guide:** See `README.md`

---

## 🎨 Customization

### Change Product Card Layout
Edit `css/style.css` → Search for `.catalog-card`

### Modify Category Filters
Edit `shop.html` → Update `.catalog-filter-btn` buttons

### Adjust Product Grid
Edit `css/style.css` → Modify `.catalog-grid` grid settings

### Change Modal Design
Edit `css/style.css` → Search for `.modal`

---

## 🔐 Security Notes

- ✅ API credentials stored in environment variables (never in code)
- ✅ Serverless functions proxy API calls (credentials never exposed to browser)
- ✅ HTTPS enforced by Netlify
- ✅ CORS properly configured
- ✅ Input validation on all user inputs

---

## 📈 Next Steps

### Going to Production

1. Switch to Production credentials in Square
2. Update Netlify environment variables:
   - `SQUARE_ACCESS_TOKEN` → Production token
   - `SQUARE_ENVIRONMENT` → "production"
3. Redeploy site
4. Test with real purchase
5. Monitor for 24 hours

### Adding More Products

1. Go to Square Dashboard
2. Create new item
3. Mark as "Available online"
4. Product appears automatically on site!

### Updating Prices

1. Edit item in Square Dashboard
2. Change price
3. Save
4. New price shows immediately on site!

---

## 💡 Pro Tips

1. **Use Sandbox First:** Always test with sandbox credentials before going live
2. **Monitor Logs:** Check Netlify function logs regularly for errors
3. **Cache Busting:** Clear browser cache if changes don't appear
4. **Mobile Testing:** Test on real devices, not just browser dev tools
5. **Backup:** Keep old shop.html as backup before deploying

---

## 🆘 Need Help?

1. Check `DEPLOYMENT_CHECKLIST.md` for troubleshooting
2. Review Netlify function logs
3. Verify Square Dashboard settings
4. Contact: 985-860-4750

---

**Ready to launch? Follow the 5 steps above and you'll be live in 30 minutes!** 🚀