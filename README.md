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

## Square Setup — Shirts

Once you have your Square account ready:

1. Log into [Square Dashboard](https://squareup.com/dashboard)
2. Go to **Items** → **Create Item**
3. Name: `Custom T-Shirt`, Price: `$20.00`
4. Go to **Payments** → **Payment Links** → **Create a link**
5. Select your Custom T-Shirt item
6. Under **Additional details**, add custom fields:
   - "Design Name" (required)
   - "Shirt Color" (required)
   - "Size" (required, e.g. S/M/L/XL/2XL)
   - "Notes" (optional)
7. Copy the **link URL**
8. Open `js/gallery.js` in your repository (pencil icon to edit)
9. On the very first line, replace `YOUR_SQUARE_SHIRT_PAYMENT_LINK_HERE` with your copied link:
   ```js
   const SHIRT_PAYMENT_LINK = 'https://square.link/u/XXXXXXXX';
   ```
10. Commit changes

All "Order This Design" buttons will now send customers directly to your Square checkout with the design name pre-filled.

---

## Square Setup — Stickers

1. In Square Dashboard, go to **Items** → **Create Item**
2. Name: `Stickers` — set your price and enable quantity selection
3. Go to **Payments** → **Payment Links** → **Create a link**
4. Select your Stickers item
5. Click **Share** → **Embed** — copy the embed code
6. Open `shop.html` in your repository
7. Find the comment block that says `SQUARE STICKER BUY BUTTON`
8. Replace the placeholder `<a href="#square-setup" ...>Buy Stickers</a>` button and the notice paragraph with your embed code
9. Commit changes

---

## Deploying to GitHub Pages

If you haven't already enabled GitHub Pages:

1. Go to your repository → **Settings** → **Pages**
2. Under **Source**, select **Deploy from a branch**
3. Choose branch: `main` (or `master`), folder: `/ (root)`
4. Click **Save**

Your site will be live at `https://YOUR-USERNAME.github.io/YOUR-REPO-NAME/` within a few minutes.

---

## File Overview

```
HoneyLight Creations/
├── index.html        ← Home page
├── designs.html      ← Design gallery (search + filter)
├── shop.html         ← Sticker shop
├── about.html        ← About & contact
├── catalog.json      ← ← ← YOU EDIT THIS to add/remove designs
├── css/style.css     ← All visual styles
├── js/gallery.js     ← ← ← YOU EDIT LINE 1 to add your Square shirt link
└── designs/          ← ← ← YOU UPLOAD PNGs HERE
```

---

*Need help? Reach out at 985-860-4750.*
