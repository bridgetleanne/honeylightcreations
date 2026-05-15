# Admin Guide - HoneyLight Creations

## 🎨 Design Management System

This guide explains how to use the admin interface to upload new designs and manage your gallery without needing a developer.

---

## 📋 Table of Contents

1. [Accessing the Admin Interface](#accessing-the-admin-interface)
2. [Uploading New Designs](#uploading-new-designs)
3. [Managing Existing Designs](#managing-existing-designs)
4. [Managing Square Products](#managing-square-products)
5. [Troubleshooting](#troubleshooting)

---

## 🔐 Accessing the Admin Interface

### Step 1: Navigate to Admin Page

Visit: `https://honeylightcreations.com/admin.html`

### Step 2: Login

1. Enter your admin password
2. Click "Login"
3. You'll see the Design Manager dashboard

**Note**: Your password is set in the Netlify environment variables. If you don't know it, contact your developer.

---

## 📤 Uploading New Designs

### Step 1: Prepare Your Design File

**File Requirements**:
- ✅ Format: SVG or PNG
- ✅ Size: Under 5MB
- ✅ Resolution: High quality (300 DPI recommended for PNG)
- ✅ Background: Transparent (recommended)

**File Naming Tips**:
- Use descriptive names: `book-worm.svg` instead of `design1.svg`
- Avoid special characters
- Use hyphens instead of spaces

### Step 2: Upload the File

1. **Drag & Drop**: Drag your file onto the upload zone
   - OR -
2. **Click to Browse**: Click the upload zone and select your file

### Step 3: Preview & Verify

- You'll see a preview of your design
- Check that it looks correct
- File name and size will be displayed

### Step 4: Add Design Details

1. **Design Name** (Required)
   - Enter a descriptive name
   - Example: "Book Worm"
   - This is what customers will see

2. **Tags** (Optional but Recommended)
   - Select all relevant tags
   - Tags help customers find designs
   - Available tags:
     - `books` - Book-related designs
     - `humor` - Funny/humorous designs
     - `anti-social` - Introvert themes
     - `holidays` - Holiday-themed
     - `audiobooks` - Audiobook-related
     - `dark-romance` - Dark romance themes
     - `animals` - Animal characters
     - `fairy` - Fairy/fantasy themes

### Step 5: Publish

1. Click "Publish Design"
2. Wait for confirmation message
3. Design appears on website immediately!

**Success!** Your design is now live at `https://honeylightcreations.com/designs.html`

---

## 📊 Managing Existing Designs

### View All Designs

Scroll down to the "Existing Designs" section to see:
- Design thumbnails
- Design names
- Tags
- Management options

### Hide/Show Designs

**To temporarily hide a design**:
1. Find the design in the list
2. Click "Hide" button
3. Design won't appear on website but isn't deleted

**To show a hidden design**:
1. Find the design in the list
2. Click "Show" button
3. Design appears on website again

**Note**: Currently, hiding/showing requires backend implementation. Contact developer if needed.

---

## 🛍️ Managing Square Products

### Adding New Products

**Important**: Products are managed in your Square Dashboard, NOT in this admin interface.

**To add a new product type** (e.g., hoodies, mugs):

1. **Go to Square Dashboard**
   - Visit: https://squareup.com/dashboard
   - Login to your account

2. **Navigate to Items**
   - Click "Items & Orders" in sidebar
   - Click "Items"

3. **Create New Item**
   - Click "+ Create an Item"
   - Enter product details:
     - Name: "Custom Hoodie"
     - Description: "Soft cotton hoodie with custom design"
     - Price: $35.00
     - Category: (optional)

4. **Add Variations** (if needed)
   - Click "Add variations"
   - Add sizes: Small, Medium, Large, XL, 2XL
   - Add colors: Black, Navy, Gray, etc.
   - Set prices for each variation

5. **Enable Online Sales**
   - Toggle "Available Online" to ON
   - This makes it appear on your website

6. **Save**
   - Click "Save"
   - Product appears on website automatically!

### Updating Product Prices

1. Go to Square Dashboard
2. Find the product
3. Click "Edit"
4. Update price
5. Click "Save"
6. New price shows on website immediately

### Removing Products

1. Go to Square Dashboard
2. Find the product
3. Toggle "Available Online" to OFF
4. Product disappears from website

---

## 🔧 Troubleshooting

### Can't Login

**Problem**: "Invalid password" error

**Solutions**:
1. Double-check your password (case-sensitive)
2. Contact developer to reset password
3. Check if ADMIN_PASSWORD is set in Netlify

---

### Upload Fails

**Problem**: "Upload failed" error

**Solutions**:
1. **Check file size**: Must be under 5MB
2. **Check file type**: Only SVG or PNG
3. **Check internet connection**: Ensure stable connection
4. **Try again**: Sometimes temporary issues occur

---

### Design Doesn't Appear

**Problem**: Uploaded design doesn't show on website

**Solutions**:
1. **Refresh the page**: Hard refresh (Ctrl+F5 or Cmd+Shift+R)
2. **Check catalog.json**: Verify design was added
3. **Check file upload**: Ensure file was saved correctly
4. **Contact developer**: May need backend configuration

---

### Product Not Showing

**Problem**: Added product in Square but not on website

**Solutions**:
1. **Check "Available Online"**: Must be enabled in Square
2. **Check stock status**: Must be in stock
3. **Wait a moment**: May take 1-2 minutes to sync
4. **Refresh page**: Clear cache and refresh

---

## 💡 Best Practices

### Design Files

✅ **DO**:
- Use high-resolution images
- Use transparent backgrounds
- Name files descriptively
- Test designs before uploading
- Keep original files backed up

❌ **DON'T**:
- Upload copyrighted images
- Use low-resolution files
- Upload duplicate designs
- Use offensive content

### Product Management

✅ **DO**:
- Keep product descriptions clear
- Use accurate pricing
- Update inventory regularly
- Test checkout process
- Monitor orders

❌ **DON'T**:
- Leave products out of stock
- Use confusing names
- Forget to add variations
- Ignore customer questions

### Security

✅ **DO**:
- Keep admin password secure
- Logout when done
- Use strong password
- Change password periodically

❌ **DON'T**:
- Share admin password
- Use simple passwords
- Leave admin page open
- Access from public computers

---

## 📞 Need Help?

### Common Questions

**Q: How many designs can I upload?**
A: Unlimited! Upload as many as you want.

**Q: Can I edit a design after uploading?**
A: Currently, you need to upload a new version. Contact developer for edit features.

**Q: Can I delete designs?**
A: Hide feature available. Full delete requires developer assistance.

**Q: How do I see which designs are selling?**
A: Check your Square Dashboard for order details and design names.

**Q: Can I upload designs from my phone?**
A: Yes! The admin interface works on mobile devices.

### Contact Developer

If you need help with:
- Password reset
- Technical issues
- New features
- Backend configuration

Contact your developer for assistance.

---

## 🎉 Quick Reference

### Upload Checklist

- [ ] File is SVG or PNG
- [ ] File is under 5MB
- [ ] File has transparent background
- [ ] Design name is descriptive
- [ ] Relevant tags selected
- [ ] Preview looks correct
- [ ] Clicked "Publish Design"
- [ ] Confirmed success message
- [ ] Checked website to verify

### Product Checklist

- [ ] Product created in Square
- [ ] Variations added (if needed)
- [ ] Price set correctly
- [ ] "Available Online" enabled
- [ ] Product appears on website
- [ ] Checkout tested
- [ ] Order received successfully

---

**Last Updated**: May 2026  
**Version**: 1.0

---

Made with ❤️ for HoneyLight Creations