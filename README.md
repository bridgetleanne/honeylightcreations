# HoneyLight Creations — Website Guide

This is your website! Here's everything you need to know to manage it without touching any code.

---

## Adding a New Design

You only need to do **2 things** to add a new design to the gallery:

### Step 1 — Upload the image

1. Go to your GitHub repository in a browser
2. Click on the **`designs`** folder
3. Click **"Add file"** → **"Upload files"**
4. Drag and drop your PNG file onto the page
5. Scroll down and click **"Commit changes"**

### Step 2 — Add it to the catalog

1. Click on **`catalog.json`** in your repository
2. Click the **pencil icon** (Edit this file) in the top right
3. Find the closing `]` bracket at the very end of the file
4. Add a comma after the last entry, then add your new design on a new line:

```json
  {
    "name": "Your Design Name Here",
    "file": "YOUR FILE NAME EXACTLY AS UPLOADED.png",
    "tags": ["books"]
  }
```

5. Click **"Commit changes"**

The site will update automatically within about 1 minute.

### Available Tags

Use any combination of these tags to help customers filter designs:

| Tag | Use for |
|-----|---------|
| `books` | General book lover designs |
| `humor` | Funny quotes and sayings |
| `anti-social` | Anti Social Book Club designs |
| `holidays` | Holiday-themed (Christmas, Valentine's, etc.) |
| `audiobooks` | Audiobook lover designs |
| `dark-romance` | Dark romance / spicy book designs |
| `animals` | Designs featuring animals (raccoon, ghost, owl, etc.) |
| `fairy` | Fairy/fantasy themed designs |

---

## Removing a Design

1. Open `catalog.json` in the editor (pencil icon)
2. Delete the entire `{ ... }` block for that design (including its trailing comma)
3. Commit changes

You don't have to delete the image file from `designs/` — it just won't show up in the gallery anymore.

---

## Square Catalog API Setup (NEW!)

Your shop now uses Square's Catalog API to display products dynamically. This means you manage all products (stickers, shirts, etc.) in your Square Dashboard, and they automatically appear on your website!

### Initial Setup

#### 1. Get Your Square API Credentials

1. Go to [Square Developer Dashboard](https://developer.squareup.com/apps)
2. Create a new application or select an existing one
3. Go to **Credentials** tab
4. Copy your **Application ID**
5. Copy your **Access Token** (use Sandbox for testing, Production for live site)
6. Go to [Square Dashboard](https://squareup.com/dashboard) → **Locations**
7. Copy your **Location ID**

#### 2. Set Up Products in Square

1. Log into [Square Dashboard](https://squareup.com/dashboard)
2. Go to **Items & Orders** → **Items**
3. Click **Create an Item**

**For Stickers:**
- Name: "Book Lover Sticker" (or specific design name)
- Price: $3.00 (or your price)
- Category: "Stickers"
- Upload product image
- Mark as "Available online"
- Add variations if needed (e.g., different designs)

**For Custom Shirts:**
- Name: "Custom T-Shirt"
- Price: $20.00
- Category: "Shirts"
- Upload sample image
- Mark as "Available online"
- Add variations for sizes (S, M, L, XL, 2XL)

Repeat for all your products!

#### 3. Deploy to Netlify

This integration requires Netlify (not GitHub Pages) because it uses serverless functions.

1. Sign up at [Netlify](https://www.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub repository
4. Build settings:
   - Build command: (leave empty)
   - Publish directory: `.` (root)
5. Click **"Deploy site"**

#### 4. Configure Environment Variables in Netlify

1. In Netlify, go to **Site settings** → **Environment variables**
2. Add these variables:

```
SQUARE_ACCESS_TOKEN = your_access_token_here
SQUARE_APPLICATION_ID = your_app_id_here
SQUARE_LOCATION_ID = your_location_id_here
SQUARE_ENVIRONMENT = sandbox (or "production" when ready)
```

3. Click **"Save"**
4. Go to **Deploys** → **Trigger deploy** → **Deploy site**

#### 5. Test Your Shop

1. Visit your Netlify site URL (e.g., `https://your-site.netlify.app/shop.html`)
2. Products should load automatically from Square
3. Click on a product to see details
4. Click "Buy Now" to test checkout (redirects to Square)

### Managing Products

**To Add a New Product:**
1. Go to Square Dashboard → Items → Create an Item
2. Fill in details, upload image, set price
3. Mark as "Available online"
4. Save — it will appear on your site automatically!

**To Update a Product:**
1. Edit the item in Square Dashboard
2. Changes appear on your site immediately

**To Remove a Product:**
1. In Square Dashboard, mark item as "Not available online"
2. Or delete the item entirely

**To Change Prices:**
1. Update price in Square Dashboard
2. New price shows on your site automatically

### Categories

Products are filtered by category on your shop page:
- **All Products** - Shows everything
- **Stickers** - Shows items with "sticker" in name or category
- **Shirts** - Shows items with "shirt" in name or category

Assign categories in Square Dashboard when creating items.

### Troubleshooting

**Products not loading?**
- Check environment variables are set correctly in Netlify
- Verify products are marked "Available online" in Square
- Check Netlify function logs for errors

**Checkout not working?**
- Verify SQUARE_LOCATION_ID is correct
- Check product has valid variations
- Ensure Square account is active

**Images not showing?**
- Upload images to products in Square Dashboard
- Images must be in Square's system to display

---

## Custom Shirt Orders (Design Gallery)

The design gallery still uses the old payment link method for custom shirt orders:

1. In Square Dashboard, create a **Payment Link** for custom shirts
2. Add custom fields: Design Name, Shirt Color, Size, Notes
3. Copy the payment link URL
4. Open `js/gallery.js` in your repository
5. On line 2, replace `YOUR_SQUARE_SHIRT_PAYMENT_LINK_HERE` with your link:
   ```js
   const SHIRT_PAYMENT_LINK = 'https://square.link/u/XXXXXXXX';
   ```
6. Commit changes

---

## Local Development (Optional)

To test the Square integration locally:

1. Install [Node.js](https://nodejs.org/)
2. Install Netlify CLI: `npm install -g netlify-cli`
3. Clone your repository
4. Create `.env` file with your Square credentials (see `.env.example`)
5. Run `npm install` to install dependencies
6. Run `netlify dev` to start local server
7. Visit `http://localhost:8888/shop.html`

---

## File Overview

```
HoneyLight Creations/
├── index.html              ← Home page
├── designs.html            ← Design gallery (search + filter)
├── shop.html               ← Shop with Square Catalog integration
├── about.html              ← About & contact
├── catalog.json            ← ← ← YOU EDIT THIS to add/remove designs
├── netlify.toml            ← Netlify configuration
├── package.json            ← Dependencies
├── .env.example            ← Environment variables template
├── css/
│   └── style.css           ← All visual styles
├── js/
│   ├── gallery.js          ← ← ← YOU EDIT LINE 2 for shirt payment link
│   └── square-catalog.js   ← Square Catalog integration
├── netlify/
│   └── functions/
│       ├── square-catalog.js   ← Fetches products from Square
│       └── square-checkout.js  ← Creates checkout links
└── designs/                ← ← ← YOU UPLOAD PNGs HERE
```

---

## Migration Notes

**What Changed:**
- Shop page now displays products from Square Catalog API
- Products are managed entirely in Square Dashboard
- No more manual HTML editing for products
- Automatic price and inventory updates
- Professional product cards with images

**What Stayed the Same:**
- Design gallery still works the same way
- Custom shirt orders still use payment links
- Adding designs to gallery unchanged
- All existing designs still work

---

*Need help? Reach out at 985-860-4750.*
