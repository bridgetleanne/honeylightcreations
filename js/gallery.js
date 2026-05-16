// Square Catalog Integration for Design Gallery
const ALL_TAGS = ['books', 'humor', 'anti-social', 'holidays', 'audiobooks', 'dark-romance', 'animals', 'fairy'];

let allDesigns = [];
let activeTag = null;
let searchQuery = '';
let squareProducts = [];
let currentDesign = null;
let currentProduct = null;

// Fetch Square products on page load
async function fetchSquareProducts() {
  try {
    const response = await fetch('/api/square-catalog');
    const data = await response.json();
    if (data.success) {
      squareProducts = data.products;
      console.log(`Loaded ${squareProducts.length} products from Square`);
    }
  } catch (error) {
    console.error('Failed to fetch Square products:', error);
  }
}

// Show product selection modal for a design
function showProductModal(designId) {
  const design = allDesigns.find(d => d.id === designId);
  if (!design) return;
  const designName = design.name;
  const designImage = design.image_url;
  currentDesign = { name: designName, image: designImage };
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('design-product-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'design-product-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  // Filter products that are in stock
  const availableProducts = squareProducts.filter(p => p.in_stock);

  if (availableProducts.length === 0) {
    modal.innerHTML = `
      <div class="modal-overlay" onclick="closeDesignModal()"></div>
      <div class="modal-content" style="max-width: 500px;">
        <button class="modal-close" onclick="closeDesignModal()">&times;</button>
        <div class="modal-body" style="display: block; padding: 2rem; text-align: center;">
          <h2 class="modal-title">Order "${escapeHtml(designName)}"</h2>
          <div style="margin: 2rem 0;">
            <img src="${designImage}" alt="${escapeHtml(designName)}" style="max-width: 200px; border-radius: 8px;">
          </div>
          <p style="color: var(--text-mid); margin-bottom: 1.5rem;">
            Products are currently being set up in our Square catalog. Please check back soon or contact us to place your order!
          </p>
          <a href="about.html#contact" class="btn btn-primary">Contact Us</a>
        </div>
      </div>
    `;
  } else {
    const productsHTML = availableProducts.map(product => {
      const imageHTML = product.image_url
        ? `<img src="${product.image_url}" alt="${escapeHtml(product.name)}" loading="lazy">`
        : '<div class="product-option-placeholder">📦<br><span>No image</span></div>';
      
      return `
        <div class="product-option-card" onclick="selectProduct('${product.id}')">
          <div class="product-option-image">
            ${imageHTML}
          </div>
          <div class="product-option-info">
            <h4>${escapeHtml(product.name)}</h4>
            <p class="product-option-price">${product.price ? product.price.formatted : 'Price varies'}</p>
            ${product.description ? `<p class="product-option-desc">${escapeHtml(product.description.substring(0, 60))}${product.description.length > 60 ? '...' : ''}</p>` : ''}
          </div>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="modal-overlay" onclick="closeDesignModal()"></div>
      <div class="modal-content design-product-modal">
        <button class="modal-close" onclick="closeDesignModal()">&times;</button>
        <div class="modal-body">
          <div class="modal-header">
            <h2 class="modal-title">Order "${escapeHtml(designName)}"</h2>
            <div class="design-preview">
              <img src="${designImage}" alt="${escapeHtml(designName)}">
            </div>
            <p class="modal-subtitle">Choose a product to apply this design to:</p>
          </div>

          <div class="product-options-grid">
            ${productsHTML}
          </div>

          <p class="modal-footer-note">
            You'll be redirected to Square's secure checkout to complete your order.
          </p>
        </div>
      </div>
    `;
  }

  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close the product selection modal
function closeDesignModal() {
  const modal = document.getElementById('design-product-modal');
  if (modal) {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }
  currentDesign = null;
  currentProduct = null;
}

// Select a product and show variations
function selectProduct(productId) {
  if (!currentDesign) return;

  const product = squareProducts.find(p => p.id === productId);
  if (!product) return;

  currentProduct = product;

  // If product has multiple variations, show selection modal
  if (product.variations && product.variations.length > 1) {
    showVariationModal(product, currentDesign);
  } else {
    // Single variation - proceed directly to checkout
    const variationId = product.variations && product.variations.length > 0
      ? product.variations[0].id
      : null;
    
    if (variationId) {
      proceedToCheckout(variationId, 1);
    } else {
      showError('This product has no variations available. Please contact us.');
    }
  }
}

// Show variation selection modal
function showVariationModal(product, design) {
  const modal = document.getElementById('design-product-modal');
  if (!modal) return;

  // Sort variations by ordinal
  const sortedVariations = [...product.variations].sort((a, b) => a.ordinal - b.ordinal);

  const variationsHTML = sortedVariations.map(v => `
    <option value="${v.id}" data-price="${v.price}">${escapeHtml(v.name)} - ${v.formatted_price}</option>
  `).join('');

  modal.innerHTML = `
    <div class="modal-overlay" onclick="closeDesignModal()"></div>
    <div class="modal-content variation-modal">
      <button class="modal-close" onclick="closeDesignModal()">&times;</button>
      <div class="modal-body">
        <div class="modal-header">
          <h2 class="modal-title">${escapeHtml(product.name)}</h2>
          <p class="modal-subtitle">Design: "${escapeHtml(design.name)}"</p>
        </div>

        <div class="variation-form">
          <div class="form-group">
            <label for="variation-select">Select Option:</label>
            <select id="variation-select" class="form-control">
              ${variationsHTML}
            </select>
          </div>

          <div class="form-group">
            <label for="quantity-input">Quantity:</label>
            <div class="quantity-control">
              <button type="button" class="qty-btn" onclick="adjustQuantity(-1)">−</button>
              <input type="number" id="quantity-input" class="form-control" value="1" min="1" max="10">
              <button type="button" class="qty-btn" onclick="adjustQuantity(1)">+</button>
            </div>
          </div>

          <div class="price-summary">
            <span>Total:</span>
            <span id="total-price" class="price-amount">${product.variations[0].formatted_price}</span>
          </div>

          <button class="btn btn-primary btn-block" onclick="confirmCheckout()">
            Proceed to Checkout
          </button>

          <p class="modal-footer-note">
            You'll be redirected to Square's secure checkout to complete your purchase.
          </p>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');

  // Add event listener to update price when variation changes
  const variationSelect = document.getElementById('variation-select');
  const quantityInput = document.getElementById('quantity-input');
  
  if (variationSelect && quantityInput) {
    const updatePrice = () => {
      const selectedOption = variationSelect.options[variationSelect.selectedIndex];
      const price = parseInt(selectedOption.dataset.price);
      const quantity = parseInt(quantityInput.value);
      const total = price * quantity;
      const formatted = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(total / 100);
      document.getElementById('total-price').textContent = formatted;
    };

    variationSelect.addEventListener('change', updatePrice);
    quantityInput.addEventListener('input', updatePrice);
  }
}

// Adjust quantity
function adjustQuantity(delta) {
  const input = document.getElementById('quantity-input');
  if (!input) return;
  
  const current = parseInt(input.value) || 1;
  const newValue = Math.max(1, Math.min(10, current + delta));
  input.value = newValue;
  
  // Trigger input event to update price
  input.dispatchEvent(new Event('input'));
}

// Confirm checkout from variation modal
function confirmCheckout() {
  const variationSelect = document.getElementById('variation-select');
  const quantityInput = document.getElementById('quantity-input');
  
  if (!variationSelect || !quantityInput) return;
  
  const variationId = variationSelect.value;
  const quantity = parseInt(quantityInput.value) || 1;
  
  proceedToCheckout(variationId, quantity);
}

// Proceed to checkout with design metadata
async function proceedToCheckout(variationId, quantity) {
  if (!currentDesign) return;

  // Show loading state
  const modal = document.getElementById('design-product-modal');
  const modalBody = modal.querySelector('.modal-body');
  modalBody.innerHTML = `
    <div class="loading-state">
      <div class="spinner"></div>
      <p>Creating your order...</p>
      <p class="loading-subtext">Please wait while we prepare your checkout...</p>
    </div>
  `;

  try {
    // Create checkout with design metadata
    const response = await fetch('/api/square-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variation_id: variationId,
        quantity: quantity,
        design: {
          name: currentDesign.name,
          imageUrl: currentDesign.image,
        }
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
    showError(error.message);
  }
}

// Show error message
function showError(message) {
  const modal = document.getElementById('design-product-modal');
  if (!modal) return;

  const modalBody = modal.querySelector('.modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="error-state">
      <div class="error-icon">❌</div>
      <h3>Error Creating Checkout</h3>
      <p class="error-message">${escapeHtml(message)}</p>
      <button class="btn btn-primary" onclick="closeDesignModal()">Close</button>
      <p class="error-help">
        Please try again or <a href="about.html#contact">contact us</a> for assistance.
      </p>
    </div>
  `;
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render design card
function renderCard(design) {
  const tagsArr = Array.isArray(design.tags) ? design.tags : JSON.parse(design.tags || '[]');
  const tags = tagsArr.map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <div class="design-card" data-name="${design.name.toLowerCase()}" data-tags="${tagsArr.join(' ')}">
      <div class="design-card-img">
        <img src="${design.image_url}" alt="${escapeHtml(design.name)}" loading="lazy" />
      </div>
      <div class="design-card-body">
        <div class="design-card-name">${escapeHtml(design.name)}</div>
        <div class="design-card-tags">${tags}</div>
        <button class="btn btn-primary design-card-btn" onclick="showProductModal(${design.id})">
          Order This Design
        </button>
      </div>
    </div>`;
}

// Apply filters to design gallery
function applyFilters() {
  const grid = document.getElementById('gallery-grid');
  const filtered = allDesigns.filter(d => {
    const tagsArr = Array.isArray(d.tags) ? d.tags : JSON.parse(d.tags || '[]');
    const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery);
    const matchesTag = !activeTag || tagsArr.includes(activeTag);
    return matchesSearch && matchesTag;
  });

  if (filtered.length === 0) {
    grid.innerHTML = '<div class="gallery-empty">No designs found. Try a different search or filter.</div>';
  } else {
    grid.innerHTML = filtered.map(renderCard).join('');
  }

  const count = document.getElementById('design-count');
  if (count) count.textContent = `${filtered.length} design${filtered.length !== 1 ? 's' : ''}`;
}

// Initialize filter tags
function initFilterTags() {
  const container = document.getElementById('filter-tags');
  if (!container) return;
  container.innerHTML = ALL_TAGS.map(tag => `
    <button class="filter-tag" data-tag="${tag}" onclick="setTag('${tag}')">${tag}</button>
  `).join('');
}

// Set active tag filter
function setTag(tag) {
  activeTag = activeTag === tag ? null : tag;
  document.querySelectorAll('.filter-tag').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tag === activeTag);
  });
  applyFilters();
}

// Initialize page
function init() {
  initFilterTags();

  // Fetch Square products
  fetchSquareProducts();

  const searchInput = document.getElementById('search-input');
  if (searchInput) {
    const params = new URLSearchParams(window.location.search);
    const preselect = params.get('design');
    if (preselect) searchInput.value = preselect;
    searchInput.addEventListener('input', e => {
      searchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
    searchQuery = searchInput.value.toLowerCase().trim();
  }

  fetch('/api/get-catalog')
    .then(r => r.json())
    .then(data => {
      allDesigns = data;
      applyFilters();
    })
    .catch(() => {
      const grid = document.getElementById('gallery-grid');
      if (grid) grid.innerHTML = '<div class="gallery-empty">Could not load designs. Please try again later.</div>';
    });
}

document.addEventListener('DOMContentLoaded', init);

// Made with Bob
