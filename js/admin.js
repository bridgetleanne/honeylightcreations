/**
 * Admin Interface for Design Management
 * Handles authentication, file uploads, and design management
 */

// State
let authToken = null;
let selectedFile = null;
let selectedFileDataUrl = null;
let uploadConfig = null;
let allDesigns = [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  setupEventListeners();
});

// Check if user is authenticated
function checkAuth() {
  authToken = sessionStorage.getItem('admin_token');
  
  if (authToken) {
    showDashboard();
    loadDesigns();
  } else {
    showLogin();
  }
}

// Show login screen
function showLogin() {
  document.getElementById('login-screen').classList.remove('hidden');
  document.getElementById('admin-dashboard').classList.add('hidden');
}

// Show dashboard
async function showDashboard() {
  document.getElementById('login-screen').classList.add('hidden');
  document.getElementById('admin-dashboard').classList.remove('hidden');

  // Fetch Cloudinary config (credentials stay server-side)
  try {
    const res = await fetch('/api/get-upload-config', {
      headers: { 'Authorization': `Bearer ${authToken}` },
    });
    uploadConfig = await res.json();
  } catch (e) {
    console.error('Failed to load upload config:', e);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Upload zone
  const uploadZone = document.getElementById('upload-zone');
  const fileInput = document.getElementById('file-input');

  uploadZone.addEventListener('click', () => fileInput.click());
  
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('dragover');
  });

  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('dragover');
  });

  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) handleFileSelect(file);
  });

  // Upload form
  document.getElementById('upload-form').addEventListener('submit', handleUpload);
}

// Handle login
async function handleLogin(e) {
  e.preventDefault();
  
  const password = document.getElementById('password').value;
  const errorDiv = document.getElementById('login-error');
  
  console.log('Login attempt starting...');
  console.log('Password length:', password.length);
  
  try {
    console.log('Sending request to /api/admin-auth');
    const response = await fetch('/api/admin-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });

    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseText = await response.text();
    console.log('Response text:', responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response from server');
    }

    console.log('Parsed data:', data);

    if (data.success) {
      authToken = data.token;
      sessionStorage.setItem('admin_token', authToken);
      showDashboard();
      loadDesigns();
    } else {
      errorDiv.textContent = data.error || 'Invalid password. Please try again.';
      errorDiv.style.display = 'block';
    }
  } catch (error) {
    console.error('Login error:', error);
    errorDiv.textContent = `Login failed: ${error.message}`;
    errorDiv.style.display = 'block';
  }
}

// Setup tag input event listener
document.addEventListener('DOMContentLoaded', () => {
  const tagInput = document.getElementById('new-tag-input');
  if (tagInput) {
    tagInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addCustomTag();
      }
    });
  }
});

// Logout
function logout() {
  authToken = null;
  sessionStorage.removeItem('admin_token');
  showLogin();
  document.getElementById('password').value = '';
}

// Handle file selection
function handleFileSelect(file) {
  // Validate file type
  const validTypes = ['image/svg+xml', 'image/png'];
  if (!validTypes.includes(file.type)) {
    showError('Please select an SVG or PNG file.');
    return;
  }

  // Validate file size (20MB max)
  const maxSize = 20 * 1024 * 1024; // 20MB
  if (file.size > maxSize) {
    showError('File size must be less than 20MB.');
    return;
  }

  selectedFile = file;

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    selectedFileDataUrl = e.target.result;

    const previewSection = document.getElementById('preview-section');
    const previewImage = document.getElementById('preview-image');
    const fileInfo = document.getElementById('file-info');

    previewImage.src = selectedFileDataUrl;
    fileInfo.textContent = `${file.name} (${formatFileSize(file.size)})`;
    previewSection.style.display = 'block';

    // Show upload form
    document.getElementById('upload-form').classList.remove('hidden');

    // Auto-fill design name from filename
    const designName = file.name.replace(/\.(svg|png)$/i, '').replace(/[-_]/g, ' ');
    document.getElementById('design-name').value = designName;
  };

  reader.readAsDataURL(file);
}

// Handle upload
async function handleUpload(e) {
  e.preventDefault();

  if (!selectedFile || !selectedFileDataUrl) {
    showError('Please select a file first.');
    return;
  }

  const designName = document.getElementById('design-name').value.trim();
  if (!designName) {
    showError('Please enter a design name.');
    return;
  }

  // Get selected tags
  const tags = [];
  document.querySelectorAll('.tag-checkbox:checked').forEach(checkbox => {
    tags.push(checkbox.value);
  });

  // Show loading state
  const publishBtn = document.getElementById('publish-btn');
  const originalText = publishBtn.textContent;
  publishBtn.disabled = true;
  publishBtn.innerHTML = '<span class="loading"></span> Publishing...';

  try {
    if (!uploadConfig?.supabaseUrl || !uploadConfig?.supabaseAnonKey) {
      throw new Error('Upload configuration not loaded. Please refresh and try again.');
    }

    // Step 1: Upload file directly to Supabase Storage
    publishBtn.innerHTML = '<span class="loading"></span> Uploading image...';
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    const safeName = selectedFile.name
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase();
    const fileName = `${safeName}-${Date.now()}.${ext}`;

    const storageRes = await fetch(
      `${uploadConfig.supabaseUrl}/storage/v1/object/designs/${fileName}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${uploadConfig.supabaseServiceKey}`,
          'Content-Type': selectedFile.type,
        },
        body: selectedFile,
      }
    );

    if (!storageRes.ok) {
      const err = await storageRes.json().catch(() => ({}));
      throw new Error(`Image upload failed (${storageRes.status}): ${err.error || err.message || storageRes.statusText}`);
    }

    const imageUrl = `${uploadConfig.supabaseUrl}/storage/v1/object/public/designs/${fileName}`;

    // Step 2: Save metadata directly to Supabase
    publishBtn.innerHTML = '<span class="loading"></span> Saving design...';
    const sbRes = await fetch(
      `${uploadConfig.supabaseUrl}/rest/v1/HoneyLightUploads`,
      {
        method: 'POST',
        headers: {
          'apikey': uploadConfig.supabaseAnonKey,
          'Authorization': `Bearer ${uploadConfig.supabaseAnonKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({
          name: designName,
          tags,
          available: true,
          public_id: `designs/${fileName}`,
          image_url: imageUrl,
        }),
      }
    );

    if (!sbRes.ok) {
      const errorData = await sbRes.json().catch(() => ({}));
      throw new Error(errorData.message || `Database error: ${sbRes.status}`);
    }

    const [data] = await sbRes.json();

    if (data) {
      showSuccess(`Design "${designName}" published successfully!`);
      resetUploadForm();
      loadDesigns();
    } else {
      throw new Error('Upload failed — no data returned from database');
    }
  } catch (error) {
    console.error('Upload error:', error);
    showError(error.message || 'Failed to upload design. Please try again.');
  } finally {
    publishBtn.disabled = false;
    publishBtn.textContent = originalText;
  }
}

// Reset upload form
function resetUploadForm() {
  selectedFile = null;
  selectedFileDataUrl = null;
  document.getElementById('file-input').value = '';
  document.getElementById('design-name').value = '';
  document.querySelectorAll('.tag-checkbox').forEach(cb => cb.checked = false);
  document.getElementById('preview-section').style.display = 'none';
  document.getElementById('upload-form').classList.add('hidden');
}

// Load existing designs
async function loadDesigns() {
  const container = document.getElementById('designs-container');
  
  try {
    const response = await fetch('/api/get-catalog');
    allDesigns = await response.json();

    if (allDesigns.length === 0) {
      container.innerHTML = '<p style="text-align: center; color: var(--text-light);">No designs yet. Upload your first design above!</p>';
      return;
    }

    container.innerHTML = allDesigns.map(design => {
      const tags = Array.isArray(design.tags) ? design.tags : JSON.parse(design.tags || '[]');
      return `
      <div class="design-item" data-id="${design.id}">
        <div class="design-info">
          <img src="${design.image_url}" alt="${escapeHtml(design.name)}" class="design-thumb" />
          <div class="design-details">
            <h4>${escapeHtml(design.name)}</h4>
            <div class="design-tags">${tags.map(t => `#${t}`).join(' ')}</div>
          </div>
        </div>
        <div class="design-actions">
          <button class="btn btn-outline btn-small" onclick="toggleDesignVisibility(${design.id})">
            ${design.available !== false ? 'Hide' : 'Show'}
          </button>
        </div>
      </div>
    `;
    }).join('');
  } catch (error) {
    console.error('Failed to load designs:', error);
    container.innerHTML = '<p style="text-align: center; color: var(--text-light);">Failed to load designs.</p>';
  }
}

// Toggle design visibility
async function toggleDesignVisibility(id) {
  const design = allDesigns.find(d => d.id === id);
  if (!design) return;

  const newAvailable = !design.available;
  const btn = document.querySelector(`.design-item[data-id="${id}"] button`);
  if (btn) { btn.disabled = true; btn.textContent = '...'; }

  try {
    const res = await fetch(
      `${uploadConfig.supabaseUrl}/rest/v1/HoneyLightUploads?id=eq.${id}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': uploadConfig.supabaseServiceKey,
          'Authorization': `Bearer ${uploadConfig.supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ available: newAvailable }),
      }
    );

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || `Update failed (${res.status})`);
    }

    design.available = newAvailable;
    if (btn) {
      btn.disabled = false;
      btn.textContent = newAvailable ? 'Hide' : 'Show';
    }
  } catch (error) {
    console.error('Toggle error:', error);
    showError(error.message || 'Failed to update design visibility.');
    if (btn) { btn.disabled = false; btn.textContent = design.available ? 'Hide' : 'Show'; }
  }
}

// Show success message
function showSuccess(message) {
  const successDiv = document.getElementById('success-message');
  successDiv.textContent = message;
  successDiv.style.display = 'block';
  
  setTimeout(() => {
    successDiv.style.display = 'none';
  }, 5000);

  // Hide error if showing
  document.getElementById('error-message').style.display = 'none';
}

// Show error message
function showError(message) {
  const errorDiv = document.getElementById('error-message');
  errorDiv.textContent = message;
  errorDiv.style.display = 'block';
  
  setTimeout(() => {
    errorDiv.style.display = 'none';
  }, 5000);

  // Hide success if showing
  document.getElementById('success-message').style.display = 'none';
}

// Utility: Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Utility: Escape HTML
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Made with Bob
// Add custom tag function
function addCustomTag() {
  const input = document.getElementById('new-tag-input');
  const tagValue = input.value.trim().toLowerCase();
  
  if (!tagValue) {
    return;
  }
  
  // Sanitize tag value (remove special characters, replace spaces with hyphens)
  const sanitizedTag = tagValue.replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-');
  
  if (!sanitizedTag) {
    showError('Please enter a valid tag name');
    return;
  }
  
  // Check if tag already exists
  const existingTag = document.getElementById(`tag-${sanitizedTag}`);
  if (existingTag) {
    // Just check it if it exists
    existingTag.checked = true;
    input.value = '';
    return;
  }
  
  // Create new tag checkbox and label
  const container = document.getElementById('tags-container');
  const tagId = `tag-${sanitizedTag}`;
  
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = tagId;
  checkbox.className = 'tag-checkbox';
  checkbox.value = sanitizedTag;
  checkbox.checked = true; // Auto-check the new tag
  
  const label = document.createElement('label');
  label.htmlFor = tagId;
  label.className = 'tag-label';
  label.textContent = sanitizedTag;
  
  container.appendChild(checkbox);
  container.appendChild(label);
  
  // Clear input
  input.value = '';
}
