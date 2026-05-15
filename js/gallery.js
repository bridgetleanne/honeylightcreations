// Square Catalog Integration for Design Gallery
const ALL_TAGS = ['books', 'humor', 'anti-social', 'holidays', 'audiobooks', 'dark-romance', 'animals', 'fairy'];

let allDesigns = [];
let activeTag = null;
let searchQuery = '';
let squareProducts = [];
let currentDesign = null;

// Fetch Square products on page load
async function fetchSquareProducts() {
  try {
    const response = await fetch('/api/square-catalog');
    const data = await response.json();
    if (data.success) {
      squareProducts = data.products;
    }
  } catch (error) {
    console.error('Failed to fetch Square products:', error);
  }
}

// Show product selection modal for a design
function showProductModal(designName, designImage) {
  currentDesign = { name: designName, image: designImage };
  
  // Create modal if it doesn't exist
  let modal = document.getElementById('design-product-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'design-product-modal';
    modal.className = 'modal';
    document.body.appendChild(modal);
  }

  // Filter products (you can customize this logic)
  const availableProducts = squareProducts.filter(p => p.in_stock);

  if (availableProducts.length === 0) {
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content" style="max-width: 500px;">
        <button class="modal-close" onclick="closeDesignModal()">&times;</button>
        <div class="modal-body" style="display: block; padding: 2rem; text-align: center;">
          <h2 class="modal-title">Order "${escapeHtml(designName)}"</h2>
          <div style="margin: 2rem 0;">
            <img src="designs/${encodeURIComponent(designImage)}" alt="${escapeHtml(designName)}" style="max-width: 200px; border-radius: 8px;">
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
        ? `<img src="${product.image_url}" alt="${escapeHtml(product.name)}">`
        : '<div style="background: var(--pink-pale); padding: 2rem; text-align: center; color: var(--text-light);">📦</div>';
      
      return `
        <div class="product-option-card" onclick="selectProduct('${product.id}')">
          <div class="product-option-image">
            ${imageHTML}
          </div>
          <div class="product-option-info">
            <h4>${escapeHtml(product.name)}</h4>
            <p class="product-option-price">${product.price ? product.price.formatted : 'Price varies'}</p>
          </div>
        </div>
      `;
    }).join('');

    modal.innerHTML = `
      <div class="modal-overlay" onclick="closeDesignModal()"></div>
      <div class="modal-content" style="max-width: 700px;">
        <button class="modal-close" onclick="closeDesignModal()">&times;</button>
        <div class="modal-body" style="display: block; padding: 2rem;">
          <h2 class="modal-title" style="margin-bottom: 1rem;">Order "${escapeHtml(designName)}"</h2>
          
          <div style="margin-bottom: 2rem; text-align: center;">
            <img src="designs/${encodeURIComponent(designImage)}" alt="${escapeHtml(designName)}" style="max-width: 200px; border-radius: 8px; box-shadow: var(--shadow);">
          </div>

          <p style="color: var(--text-mid); margin-bottom: 1.5rem; text-align: center;">
            Choose a product type to order with this design:
          </p>

          <div class="product-options-grid">
            ${productsHTML}
          </div>

          <p style="font-size: 0.85rem; color: var(--text-light); text-align: center; margin-top: 1.5rem;">
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
}

// Select a product and proceed to checkout
async function selectProduct(productId) {
  if (!currentDesign) return;

  const product = squareProducts.find(p => p.id === productId);
  if (!product) return;

  // Show loading state
  const modal = document.getElementById('design-product-modal');
  const modalBody = modal.querySelector('.modal-body');
  modalBody.innerHTML = `
    <div style="text-align: center; padding: 3rem;">
      <div class="spinner"></div>
      <p style="margin-top: 1rem; color: var(--text-mid);">Creating your order...</p>
    </div>
  `;

  try {
    // Get the first variation (or let user select if multiple)
    const variationId = product.variations && product.variations.length > 0 
      ? product.variations[0].id 
      : null;

    if (!variationId) {
      throw new Error('Product has no variations available');
    }

    // Create checkout with design name in notes
    const response = await fetch('/api/square-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variation_id: variationId,
        quantity: 1,
        note: `Design: ${currentDesign.name}`,
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
    modalBody.innerHTML = `
      <div style="text-align: center; padding: 2rem;">
        <p style="color: var(--pink-deep); margin-bottom: 1rem;">❌ Error creating checkout</p>
        <p style="color: var(--text-mid); margin-bottom: 1.5rem;">${escapeHtml(error.message)}</p>
        <button class="btn btn-primary" onclick="closeDesignModal()">Close</button>
        <p style="font-size: 0.85rem; color: var(--text-light); margin-top: 1rem;">
          Please try again or <a href="about.html#contact">contact us</a> for assistance.
        </p>
      </div>
    `;
  }
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Render design card
function renderCard(design) {
  const tags = design.tags.map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <div class="design-card" data-name="${design.name.toLowerCase()}" data-tags="${design.tags.join(' ')}">
      <div class="design-card-img">
        <img src="designs/${encodeURIComponent(design.file)}" alt="${escapeHtml(design.name)}" loading="lazy" />
      </div>
      <div class="design-card-body">
        <div class="design-card-name">${escapeHtml(design.name)}</div>
        <div class="design-card-tags">${tags}</div>
        <button class="btn btn-primary design-card-btn" onclick="showProductModal('${escapeHtml(design.name).replace(/'/g, "\\'")}', '${design.file}')">
          Order This Design
        </button>
      </div>
    </div>`;
}

// Apply filters to design gallery
function applyFilters() {
  const grid = document.getElementById('gallery-grid');
  const filtered = allDesigns.filter(d => {
    const matchesSearch = !searchQuery || d.name.toLowerCase().includes(searchQuery);
    const matchesTag = !activeTag || d.tags.includes(activeTag);
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

  fetch('catalog.json')
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
