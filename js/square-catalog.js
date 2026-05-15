/**
 * Square Catalog Integration
 * Fetches and displays products from Square Catalog API via Netlify Functions
 */

class SquareCatalog {
  constructor(options = {}) {
    this.apiBase = options.apiBase || '/api';
    this.container = options.container;
    this.loadingElement = options.loadingElement;
    this.errorElement = options.errorElement;
    this.onError = options.onError || console.error;
    this.products = [];
    this.currentProduct = null;
    this.currentCategory = 'all';
  }

  /**
   * Fetch products from Square Catalog API
   */
  async fetchProducts(category = 'all') {
    try {
      this.showLoading();
      this.hideError();

      const params = new URLSearchParams();
      if (category && category !== 'all') {
        params.append('category', category);
      }

      const response = await fetch(`${this.apiBase}/square-catalog?${params}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch products');
      }

      this.products = data.products;
      this.currentCategory = category;
      this.renderProducts();
      this.hideLoading();

      return this.products;
    } catch (error) {
      this.hideLoading();
      this.showError(error.message);
      this.onError(error);
      throw error;
    }
  }

  /**
   * Render products in grid
   */
  renderProducts() {
    if (!this.container) return;

    if (this.products.length === 0) {
      this.container.innerHTML = `
        <div class="catalog-empty">
          <p>No products available at this time.</p>
          <p style="font-size:0.9rem;color:var(--text-light);margin-top:0.5rem;">
            Check back soon for new items!
          </p>
        </div>
      `;
      return;
    }

    const productsHTML = this.products.map(product => this.renderProductCard(product)).join('');
    this.container.innerHTML = productsHTML;

    // Add click handlers
    this.container.querySelectorAll('.catalog-card-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId = btn.closest('.catalog-card').dataset.productId;
        const product = this.products.find(p => p.id === productId);
        if (product) {
          this.showProductModal(product);
        }
      });
    });
  }

  /**
   * Render individual product card
   */
  renderProductCard(product) {
    const imageHTML = product.image_url 
      ? `<img src="${product.image_url}" alt="${this.escapeHtml(product.name)}" loading="lazy">`
      : `<div class="catalog-card-no-image">
           <span style="font-size:3rem;">📦</span>
           <p>No image</p>
         </div>`;

    const stockBadge = !product.in_stock 
      ? '<div class="out-of-stock-badge">Out of Stock</div>' 
      : '';

    const priceHTML = product.price 
      ? `<span class="catalog-card-price">${product.price.formatted}</span>`
      : '<span class="catalog-card-price">Price varies</span>';

    return `
      <div class="catalog-card" data-product-id="${product.id}">
        <div class="catalog-card-image">
          ${imageHTML}
          ${stockBadge}
        </div>
        <div class="catalog-card-body">
          <h3 class="catalog-card-title">${this.escapeHtml(product.name)}</h3>
          <p class="catalog-card-description">${this.escapeHtml(product.description || '')}</p>
          <div class="catalog-card-footer">
            ${priceHTML}
            <button class="btn btn-primary catalog-card-btn" ${!product.in_stock ? 'disabled' : ''}>
              ${product.in_stock ? 'View Details' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Show product detail modal
   */
  showProductModal(product) {
    this.currentProduct = product;

    // Create modal if it doesn't exist
    let modal = document.getElementById('product-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'product-modal';
      modal.className = 'modal';
      document.body.appendChild(modal);
    }

    const imageHTML = product.image_url 
      ? `<img src="${product.image_url}" alt="${this.escapeHtml(product.name)}">`
      : `<div class="modal-no-image">
           <span style="font-size:5rem;">📦</span>
           <p>No image available</p>
         </div>`;

    const variationsHTML = product.variations.length > 1 
      ? `
        <div class="modal-variations">
          <label for="variation-select">Select Option:</label>
          <select id="variation-select" class="modal-select">
            ${product.variations.map(v => `
              <option value="${v.id}">${this.escapeHtml(v.name)} - ${v.formatted_price}</option>
            `).join('')}
          </select>
        </div>
      `
      : '';

    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <button class="modal-close" aria-label="Close modal">&times;</button>
        <div class="modal-body">
          <div class="modal-image">
            ${imageHTML}
          </div>
          <div class="modal-details">
            <h2 class="modal-title">${this.escapeHtml(product.name)}</h2>
            <p class="modal-price">${product.price ? product.price.formatted : 'Price varies'}</p>
            <p class="modal-description">${this.escapeHtml(product.description || 'No description available.')}</p>
            
            ${variationsHTML}
            
            <div class="modal-quantity">
              <label for="quantity-input">Quantity:</label>
              <input type="number" id="quantity-input" class="modal-input" value="1" min="1" max="10">
            </div>
            
            <button class="btn btn-primary modal-buy-btn" id="modal-buy-btn">
              Buy Now
            </button>
            
            <p class="modal-notice">
              You'll be redirected to Square's secure checkout to complete your purchase.
            </p>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    modal.querySelector('.modal-overlay').addEventListener('click', () => this.closeModal());
    modal.querySelector('.modal-close').addEventListener('click', () => this.closeModal());
    modal.querySelector('#modal-buy-btn').addEventListener('click', () => this.handleBuyNow());

    // Show modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /**
   * Close product modal
   */
  closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  /**
   * Handle buy now button click
   */
  async handleBuyNow() {
    if (!this.currentProduct) return;

    const buyBtn = document.getElementById('modal-buy-btn');
    const originalText = buyBtn.textContent;
    
    try {
      buyBtn.disabled = true;
      buyBtn.textContent = 'Processing...';

      // Get selected variation
      let variationId;
      const variationSelect = document.getElementById('variation-select');
      if (variationSelect) {
        variationId = variationSelect.value;
      } else if (this.currentProduct.variations.length > 0) {
        variationId = this.currentProduct.variations[0].id;
      } else {
        throw new Error('No product variation available');
      }

      // Get quantity
      const quantityInput = document.getElementById('quantity-input');
      const quantity = parseInt(quantityInput?.value || 1);

      // Create checkout
      const response = await fetch(`${this.apiBase}/square-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          variation_id: variationId,
          quantity: quantity,
          note: `Product: ${this.currentProduct.name}`,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to create checkout');
      }

      // Redirect to Square checkout
      window.location.href = data.checkout_url;

    } catch (error) {
      console.error('Checkout error:', error);
      alert(`Error: ${error.message}\n\nPlease try again or contact us for assistance.`);
      buyBtn.disabled = false;
      buyBtn.textContent = originalText;
    }
  }

  /**
   * Show loading state
   */
  showLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'block';
    }
    if (this.container) {
      this.container.style.display = 'none';
    }
  }

  /**
   * Hide loading state
   */
  hideLoading() {
    if (this.loadingElement) {
      this.loadingElement.style.display = 'none';
    }
    if (this.container) {
      this.container.style.display = 'grid';
    }
  }

  /**
   * Show error message
   */
  showError(message) {
    if (this.errorElement) {
      this.errorElement.style.display = 'block';
      const errorText = this.errorElement.querySelector('.error-message');
      if (errorText) {
        errorText.textContent = message;
      }
    }
  }

  /**
   * Hide error message
   */
  hideError() {
    if (this.errorElement) {
      this.errorElement.style.display = 'none';
    }
  }

  /**
   * Filter products by category
   */
  filterByCategory(category) {
    this.fetchProducts(category);
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Initialize catalog when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const catalogGrid = document.getElementById('catalog-grid');
  if (!catalogGrid) return;

  const catalog = new SquareCatalog({
    container: catalogGrid,
    loadingElement: document.getElementById('catalog-loading'),
    errorElement: document.getElementById('catalog-error'),
  });

  // Load products
  catalog.fetchProducts();

  // Setup category filters
  const filterButtons = document.querySelectorAll('.catalog-filter-btn');
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      
      // Update active state
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Filter products
      catalog.filterByCategory(category);
    });
  });

  // Setup retry button
  const retryBtn = document.getElementById('catalog-retry-btn');
  if (retryBtn) {
    retryBtn.addEventListener('click', () => {
      catalog.fetchProducts(catalog.currentCategory);
    });
  }

  // Make catalog globally accessible for debugging
  window.squareCatalog = catalog;
});

// Made with Bob
