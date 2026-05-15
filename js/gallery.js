// Square shirt payment link — paste your link here after setting it up in Square Dashboard
const SHIRT_PAYMENT_LINK = 'YOUR_SQUARE_SHIRT_PAYMENT_LINK_HERE';

const ALL_TAGS = ['books', 'humor', 'anti-social', 'holidays', 'audiobooks', 'dark-romance', 'animals', 'fairy'];

let allDesigns = [];
let activeTag = null;
let searchQuery = '';

function buildOrderUrl(designName) {
  if (SHIRT_PAYMENT_LINK === 'YOUR_SQUARE_SHIRT_PAYMENT_LINK_HERE') {
    return 'about.html#contact';
  }
  const url = new URL(SHIRT_PAYMENT_LINK);
  url.searchParams.set('note', `Design: ${designName}`);
  return url.toString();
}

function renderCard(design) {
  const orderUrl = buildOrderUrl(design.name);
  const tags = design.tags.map(t => `<span class="tag">${t}</span>`).join('');
  return `
    <div class="design-card" data-name="${design.name.toLowerCase()}" data-tags="${design.tags.join(' ')}">
      <div class="design-card-img">
        <img src="designs/${encodeURIComponent(design.file)}" alt="${design.name}" loading="lazy" />
      </div>
      <div class="design-card-body">
        <div class="design-card-name">${design.name}</div>
        <div class="design-card-tags">${tags}</div>
        <a href="${orderUrl}" class="btn btn-primary design-card-btn" ${SHIRT_PAYMENT_LINK !== 'YOUR_SQUARE_SHIRT_PAYMENT_LINK_HERE' ? 'target="_blank" rel="noopener"' : ''}>
          Order This Design
        </a>
      </div>
    </div>`;
}

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

function initFilterTags() {
  const container = document.getElementById('filter-tags');
  if (!container) return;
  container.innerHTML = ALL_TAGS.map(tag => `
    <button class="filter-tag" data-tag="${tag}" onclick="setTag('${tag}')">${tag}</button>
  `).join('');
}

function setTag(tag) {
  activeTag = activeTag === tag ? null : tag;
  document.querySelectorAll('.filter-tag').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tag === activeTag);
  });
  applyFilters();
}

function init() {
  initFilterTags();

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
