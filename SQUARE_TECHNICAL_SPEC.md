# Square Catalog Integration - Technical Specification

## API Endpoints

### Serverless Function: `/api/square-catalog`

**Method:** GET

**Query Parameters:**
- `category` (optional) - Filter by category (e.g., "stickers", "shirts")
- `limit` (optional) - Number of items to return (default: 50)

**Response Format:**
```json
{
  "success": true,
  "products": [
    {
      "id": "ITEM_ID",
      "name": "Product Name",
      "description": "Product description",
      "price": {
        "amount": 500,
        "currency": "USD",
        "formatted": "$5.00"
      },
      "image_url": "https://...",
      "variations": [
        {
          "id": "VARIATION_ID",
          "name": "Size: Small",
          "price": 500
        }
      ],
      "category": "stickers",
      "in_stock": true
    }
  ],
  "count": 10
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "code": "SQUARE_API_ERROR"
}
```

### Serverless Function: `/api/square-checkout`

**Method:** POST

**Request Body:**
```json
{
  "item_id": "ITEM_ID",
  "variation_id": "VARIATION_ID",
  "quantity": 1,
  "note": "Optional customer note"
}
```

**Response Format:**
```json
{
  "success": true,
  "checkout_url": "https://checkout.square.site/...",
  "order_id": "ORDER_ID"
}
```

## Frontend JavaScript API

### SquareCatalog Class

```javascript
class SquareCatalog {
  constructor(options) {
    this.apiBase = options.apiBase || '/api';
    this.container = options.container;
    this.onError = options.onError;
    this.onProductClick = options.onProductClick;
  }

  async fetchProducts(filters = {}) {
    // Fetch products from serverless function
  }

  renderProducts(products) {
    // Render product grid
  }

  showProductModal(product) {
    // Display product details in modal
  }

  async createCheckout(itemId, variationId, quantity) {
    // Generate checkout URL and redirect
  }
}
```

### Usage Example

```javascript
const catalog = new SquareCatalog({
  container: document.getElementById('catalog-grid'),
  onError: (error) => console.error(error),
  onProductClick: (product) => catalog.showProductModal(product)
});

// Load and display products
catalog.fetchProducts({ category: 'stickers' });
```

## HTML Structure

### Catalog Grid Container

```html
<section class="catalog-section">
  <div class="container">
    <h2 class="section-title">Shop Our Catalog</h2>
    
    <!-- Filter/Category Tabs -->
    <div class="catalog-filters">
      <button class="filter-btn active" data-category="all">All</button>
      <button class="filter-btn" data-category="stickers">Stickers</button>
      <button class="filter-btn" data-category="shirts">Shirts</button>
    </div>

    <!-- Loading State -->
    <div class="catalog-loading" id="catalog-loading">
      <div class="spinner"></div>
      <p>Loading products...</p>
    </div>

    <!-- Error State -->
    <div class="catalog-error" id="catalog-error" style="display:none;">
      <p>Unable to load products. Please try again later.</p>
      <button class="btn btn-primary" onclick="catalog.fetchProducts()">Retry</button>
    </div>

    <!-- Product Grid -->
    <div class="catalog-grid" id="catalog-grid">
      <!-- Products rendered here -->
    </div>
  </div>
</section>
```

### Product Card Template

```html
<div class="catalog-card" data-product-id="{id}">
  <div class="catalog-card-image">
    <img src="{image_url}" alt="{name}" loading="lazy">
    {if !in_stock}
    <div class="out-of-stock-badge">Out of Stock</div>
    {/if}
  </div>
  <div class="catalog-card-body">
    <h3 class="catalog-card-title">{name}</h3>
    <p class="catalog-card-description">{description}</p>
    <div class="catalog-card-footer">
      <span class="catalog-card-price">{price.formatted}</span>
      <button class="btn btn-primary catalog-card-btn" {if !in_stock}disabled{/if}>
        {if in_stock}Buy Now{else}Out of Stock{/if}
      </button>
    </div>
  </div>
</div>
```

### Product Modal

```html
<div class="modal" id="product-modal">
  <div class="modal-overlay" onclick="closeModal()"></div>
  <div class="modal-content">
    <button class="modal-close" onclick="closeModal()">&times;</button>
    
    <div class="modal-body">
      <div class="modal-image">
        <img src="{image_url}" alt="{name}">
      </div>
      
      <div class="modal-details">
        <h2>{name}</h2>
        <p class="modal-price">{price.formatted}</p>
        <p class="modal-description">{description}</p>
        
        <!-- Variations (if applicable) -->
        <div class="modal-variations" id="modal-variations">
          <label>Select Option:</label>
          <select id="variation-select">
            {foreach variations}
            <option value="{id}">{name} - {price.formatted}</option>
            {/foreach}
          </select>
        </div>
        
        <!-- Quantity -->
        <div class="modal-quantity">
          <label>Quantity:</label>
          <input type="number" id="quantity-input" value="1" min="1" max="10">
        </div>
        
        <!-- Buy Button -->
        <button class="btn btn-primary modal-buy-btn" onclick="handleBuyNow()">
          Buy Now
        </button>
      </div>
    </div>
  </div>
</div>
```

## CSS Classes

### Catalog Grid
- `.catalog-section` - Main section wrapper
- `.catalog-filters` - Filter button container
- `.filter-btn` - Individual filter button
- `.filter-btn.active` - Active filter state
- `.catalog-grid` - Product grid container (CSS Grid)
- `.catalog-loading` - Loading state container
- `.catalog-error` - Error state container

### Product Cards
- `.catalog-card` - Individual product card
- `.catalog-card-image` - Image container
- `.catalog-card-body` - Content container
- `.catalog-card-title` - Product name
- `.catalog-card-description` - Product description
- `.catalog-card-footer` - Price and button container
- `.catalog-card-price` - Price display
- `.catalog-card-btn` - Buy button
- `.out-of-stock-badge` - Out of stock overlay

### Modal
- `.modal` - Modal wrapper
- `.modal-overlay` - Dark background overlay
- `.modal-content` - Modal content container
- `.modal-close` - Close button
- `.modal-body` - Modal body (flex container)
- `.modal-image` - Product image in modal
- `.modal-details` - Product details section
- `.modal-variations` - Variation selector
- `.modal-quantity` - Quantity input
- `.modal-buy-btn` - Buy now button

## Netlify Configuration

### netlify.toml

```toml
[build]
  functions = "netlify/functions"
  publish = "."

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200
```

### Environment Variables

Set in Netlify Dashboard → Site Settings → Environment Variables:

```
SQUARE_ACCESS_TOKEN=your_access_token_here
SQUARE_APPLICATION_ID=your_app_id_here
SQUARE_LOCATION_ID=your_location_id_here
SQUARE_ENVIRONMENT=sandbox  # or "production"
```

## Package Dependencies

### package.json

```json
{
  "name": "honeylight-creations",
  "version": "1.0.0",
  "dependencies": {
    "square": "^35.0.0"
  },
  "devDependencies": {
    "@netlify/functions": "^2.0.0"
  }
}
```

## Error Codes

- `SQUARE_API_ERROR` - Error from Square API
- `INVALID_REQUEST` - Invalid request parameters
- `NETWORK_ERROR` - Network connection issue
- `CHECKOUT_ERROR` - Error creating checkout
- `NOT_FOUND` - Product not found
- `OUT_OF_STOCK` - Product out of stock

## Performance Considerations

1. **Caching:**
   - Cache catalog data for 5 minutes in browser
   - Use ETags for conditional requests
   - Implement stale-while-revalidate pattern

2. **Image Optimization:**
   - Use Square's image CDN with size parameters
   - Lazy load images below the fold
   - Provide responsive image sizes

3. **Loading States:**
   - Show skeleton screens during load
   - Progressive enhancement
   - Optimistic UI updates

4. **Rate Limiting:**
   - Implement client-side debouncing
   - Server-side rate limiting in functions
   - Graceful degradation on limit exceeded

## Testing Checklist

- [ ] Catalog loads successfully
- [ ] Products display with correct information
- [ ] Images load properly
- [ ] Filters work correctly
- [ ] Product modal opens and closes
- [ ] Variation selection works
- [ ] Checkout redirect functions
- [ ] Error states display properly
- [ ] Loading states show correctly
- [ ] Mobile responsive design
- [ ] Accessibility (keyboard navigation, screen readers)
- [ ] Performance (load time < 3s)

## Browser Support

- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 10+)

## Accessibility Requirements

- ARIA labels on interactive elements
- Keyboard navigation support
- Focus indicators visible
- Alt text on all images
- Color contrast meets WCAG AA
- Screen reader announcements for dynamic content