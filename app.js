/* ===========================
   NextPlay250 – app.js
   =========================== */

// ─── CONSTANTS ───────────────────────────────────────────────
const ADMIN_PASSWORD = 'nextplay250';
const WA_NUMBER      = '250781281517';
const STORE_KEY      = 'np250_jerseys';

// ─── STATE ───────────────────────────────────────────────────
let jerseys       = [];
let editingId     = null;
let imgBase64     = null;
let activeFilter  = 'all';

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  loadJerseys();
  renderStore();
  renderAdmin();
  bindEvents();
  animateCounter('stat-jerseys', jerseys.length);
});

// ─── LOCAL STORAGE ───────────────────────────────────────────
function loadJerseys() {
  try {
    jerseys = JSON.parse(localStorage.getItem(STORE_KEY)) || [];
  } catch { jerseys = []; }
  if (jerseys.length === 0) seedDemoData();
}

function saveJerseys() {
  localStorage.setItem(STORE_KEY, JSON.stringify(jerseys));
}

function seedDemoData() {
  jerseys = [
    {
      id: uid(), club: 'FC Barcelona', name: 'Home Kit 2024/25',
      category: 'football', badge: 'hot',
      desc: 'Official Barça home jersey — sizes S to XXL available. Authentic Nike Dri-FIT fabric, includes embroidered crest.',
      price: 28000, img: ''
    },
    {
      id: uid(), club: 'Real Madrid CF', name: 'Away Jersey 2024/25',
      category: 'football', badge: 'new',
      desc: 'Sleek white-away kit with golden accents. Adidas Climacool technology. Sizes S–XL available.',
      price: 30000, img: ''
    },
    {
      id: uid(), club: 'Manchester City', name: 'Home Kit 2024/25',
      category: 'football', badge: '',
      desc: 'City blue premium home kit. Puma authentic. Includes sponsorship patches. Sizes M–XXL.',
      price: 26000, img: ''
    }
  ];
  saveJerseys();
}

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ─── STORE RENDER ─────────────────────────────────────────────
function renderStore() {
  const grid   = document.getElementById('jerseys-grid');
  const search = document.getElementById('search-input').value.toLowerCase().trim();
  const filtered = jerseys.filter(j => {
    const matchCat  = activeFilter === 'all' || j.category === activeFilter;
    const matchText = !search ||
      j.name.toLowerCase().includes(search) ||
      j.club.toLowerCase().includes(search) ||
      j.desc.toLowerCase().includes(search);
    return matchCat && matchText;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="es-icon">👕</div>
        <h3>No jerseys found</h3>
        <p>${search ? 'Try a different search term.' : 'Check back soon — new drops incoming! 🔥'}</p>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(jerseyCard).join('');
}

function jerseyCard(j) {
  const imgTag = j.img
    ? `<img src="${j.img}" alt="${j.club} – ${j.name}" class="card-img" loading="lazy" />`
    : jerseyPlaceholder(j);

  const badgeHtml = j.badge === 'new'
    ? `<div class="card-badge-new">New Arrival</div>`
    : j.badge === 'hot'
    ? `<div class="card-badge-hot">🔥 Hot Pick</div>`
    : '';

  const waText = encodeURIComponent(
    `Hi NextPlay250! 👋\n\nI'd like to order the following jersey:\n\n` +
    `👕 *${j.name}* – ${j.club}\n` +
    `📝 ${j.desc}\n` +
    `💵 Price: ${formatPrice(j.price)} RWF\n\n` +
    `Please confirm availability and delivery details. Thank you!`
  );

  return `
  <div class="jersey-card" data-id="${j.id}">
    <div class="card-img-wrap">
      ${badgeHtml}
      ${imgTag}
    </div>
    <div class="card-body">
      <div class="card-club">${escHtml(j.club)}</div>
      <div class="card-name">${escHtml(j.name)}</div>
      <div class="card-desc">${escHtml(j.desc)}</div>
      <div class="card-footer">
        <div class="card-price">
          <span class="currency">RWF </span>${formatPrice(j.price)}
        </div>
        <a href="https://wa.me/${WA_NUMBER}?text=${waText}"
           target="_blank" rel="noopener"
           class="order-btn" aria-label="Order ${j.name} on WhatsApp">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.122.555 4.113 1.523 5.845L.057 23.25l5.565-1.453A11.953 11.953 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.84 0-3.579-.474-5.095-1.306l-.361-.213-3.301.862.882-3.216-.235-.373A9.945 9.945 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/>
          </svg>
          Order
        </a>
      </div>
    </div>
  </div>`;
}

function jerseyPlaceholder(j) {
  // SVG placeholder showing club initials
  const colors = {
    football:   ['#1565e8','#0a0e1a'],
    basketball: ['#f97316','#0a0e1a'],
    rugby:      ['#22c55e','#0a0e1a'],
    other:      ['#7c3aed','#0a0e1a']
  };
  const [c1, c2] = colors[j.category] || colors.other;
  const initials = (j.club.split(' ').map(w => w[0]).join('').slice(0,3)).toUpperCase();
  return `<div class="card-img" style="display:flex;align-items:center;justify-content:center;background:linear-gradient(135deg,${c2},${c1}30)">
    <div style="text-align:center">
      <div style="font-size:2.5rem;margin-bottom:4px">👕</div>
      <div style="font-family:'Bebas Neue',sans-serif;font-size:1.4rem;color:${c1};letter-spacing:2px">${initials}</div>
    </div>
  </div>`;
}

// ─── ADMIN RENDER ─────────────────────────────────────────────
function renderAdmin() {
  const list = document.getElementById('admin-jerseys-list');
  const cats = { football: 0, basketball: 0, rugby: 0, other: 0 };
  jerseys.forEach(j => { if (cats[j.category] !== undefined) cats[j.category]++; });

  document.getElementById('admin-stat-total').textContent      = jerseys.length;
  document.getElementById('admin-stat-football').textContent   = cats.football;
  document.getElementById('admin-stat-basketball').textContent = cats.basketball;
  document.getElementById('admin-stat-other').textContent      = cats.rugby + cats.other;

  if (jerseys.length === 0) {
    list.innerHTML = `<div style="color:var(--gray);padding:30px;grid-column:1/-1;text-align:center">No jerseys yet. Add your first one! 👆</div>`;
    return;
  }

  list.innerHTML = jerseys.map(j => {
    const imgTag = j.img
      ? `<img src="${j.img}" alt="${j.name}" />`
      : `<div style="width:100%;aspect-ratio:4/3;display:flex;align-items:center;justify-content:center;background:#1a2233;font-size:2rem">👕</div>`;
    return `
    <div class="admin-jersey-card">
      ${imgTag}
      <div class="admin-card-body">
        <div style="font-size:0.75rem;color:var(--blue-l);font-weight:600;text-transform:uppercase;margin-bottom:4px">${escHtml(j.club)}</div>
        <h3>${escHtml(j.name)}</h3>
        <div class="acp">RWF ${formatPrice(j.price)}</div>
        <div class="admin-card-actions">
          <button class="btn-edit" onclick="editJersey('${j.id}')">✏️ Edit</button>
          <button class="btn-delete" onclick="deleteJersey('${j.id}')">🗑 Delete</button>
        </div>
      </div>
    </div>`;
  }).join('');
}

// ─── BIND EVENTS ──────────────────────────────────────────────
function bindEvents() {
  // Admin trigger (FAQ link in footer)
  document.getElementById('admin-trigger').addEventListener('click', e => {
    e.preventDefault();
    openAuthModal();
  });

  // Auth modal
  document.getElementById('auth-submit-btn').addEventListener('click', submitAuth);
  document.getElementById('auth-cancel-btn').addEventListener('click', closeAuthModal);
  document.getElementById('auth-password').addEventListener('keydown', e => {
    if (e.key === 'Enter') submitAuth();
  });
  document.getElementById('auth-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeAuthModal();
  });

  // Admin panel
  document.getElementById('close-admin-btn').addEventListener('click', closeAdmin);
  document.getElementById('add-jersey-btn').addEventListener('click', () => openJerseyModal());

  // Jersey modal
  document.getElementById('jersey-save-btn').addEventListener('click', saveJersey);
  document.getElementById('jersey-cancel-btn').addEventListener('click', closeJerseyModal);
  document.getElementById('jersey-modal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeJerseyModal();
  });

  // Image upload
  document.getElementById('img-preview-wrap').addEventListener('click', () => {
    document.getElementById('img-file-input').click();
  });
  document.getElementById('img-file-input').addEventListener('change', handleImgUpload);

  // Search
  document.getElementById('search-input').addEventListener('input', () => renderStore());

  // Filter tags
  document.getElementById('filter-tags').addEventListener('click', e => {
    const tag = e.target.closest('.filter-tag');
    if (!tag) return;
    document.querySelectorAll('.filter-tag').forEach(t => t.classList.remove('active'));
    tag.classList.add('active');
    activeFilter = tag.dataset.cat;
    renderStore();
  });

  // Hamburger
  document.getElementById('hamburger-btn').addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.add('open');
  });
  document.getElementById('mobile-close-btn').addEventListener('click', () => {
    document.getElementById('mobile-nav').classList.remove('open');
  });
  document.querySelectorAll('.mobile-nav-link').forEach(a => {
    a.addEventListener('click', () => {
      document.getElementById('mobile-nav').classList.remove('open');
    });
  });
}

// ─── AUTH ─────────────────────────────────────────────────────
function openAuthModal() {
  document.getElementById('auth-password').value = '';
  document.getElementById('auth-error').style.display = 'none';
  document.getElementById('auth-modal').classList.add('open');
  setTimeout(() => document.getElementById('auth-password').focus(), 100);
}

function closeAuthModal() {
  document.getElementById('auth-modal').classList.remove('open');
}

function submitAuth() {
  const pw = document.getElementById('auth-password').value;
  if (pw === ADMIN_PASSWORD) {
    closeAuthModal();
    openAdmin();
  } else {
    document.getElementById('auth-error').style.display = 'block';
    document.getElementById('auth-password').value = '';
    document.getElementById('auth-password').focus();
  }
}

// ─── ADMIN PANEL ──────────────────────────────────────────────
function openAdmin() {
  renderAdmin();
  document.getElementById('admin-panel').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeAdmin() {
  document.getElementById('admin-panel').classList.remove('open');
  document.body.style.overflow = '';
  renderStore();
  animateCounter('stat-jerseys', jerseys.length);
}

// ─── JERSEY MODAL ─────────────────────────────────────────────
function openJerseyModal(j = null) {
  editingId  = j ? j.id : null;
  imgBase64  = j ? j.img : null;

  document.getElementById('jersey-modal-title').textContent =
    j ? '✏️ Edit Jersey' : '➕ Add New Jersey';
  document.getElementById('jersey-modal-sub').textContent =
    j ? 'Update the details below.' : 'Fill in the details below.';

  document.getElementById('jersey-club').value     = j ? j.club : '';
  document.getElementById('jersey-name').value     = j ? j.name : '';
  document.getElementById('jersey-category').value = j ? j.category : 'football';
  document.getElementById('jersey-desc').value     = j ? j.desc : '';
  document.getElementById('jersey-price').value    = j ? j.price : '';
  document.getElementById('jersey-badge').value    = j ? (j.badge || '') : '';

  updateImgPreview(imgBase64);
  document.getElementById('img-file-input').value = '';
  document.getElementById('jersey-modal').classList.add('open');
}

function closeJerseyModal() {
  document.getElementById('jersey-modal').classList.remove('open');
  editingId = null;
  imgBase64 = null;
}

function saveJersey() {
  const club  = document.getElementById('jersey-club').value.trim();
  const name  = document.getElementById('jersey-name').value.trim();
  const cat   = document.getElementById('jersey-category').value;
  const desc  = document.getElementById('jersey-desc').value.trim();
  const price = parseInt(document.getElementById('jersey-price').value, 10);
  const badge = document.getElementById('jersey-badge').value;

  if (!club || !name || !desc || isNaN(price) || price < 0) {
    showToast('Please fill in all required fields.', 'error');
    return;
  }

  if (editingId) {
    const idx = jerseys.findIndex(j => j.id === editingId);
    if (idx > -1) {
      jerseys[idx] = { ...jerseys[idx], club, name, category: cat, desc, price, badge,
        img: imgBase64 || jerseys[idx].img };
    }
    showToast('Jersey updated successfully! ✅', 'success');
  } else {
    jerseys.unshift({ id: uid(), club, name, category: cat, desc, price, badge, img: imgBase64 || '' });
    showToast('New jersey added! 🔥', 'success');
  }

  saveJerseys();
  closeJerseyModal();
  renderAdmin();
  animateCounter('admin-stat-total', jerseys.length);
}

// ─── EDIT / DELETE ────────────────────────────────────────────
function editJersey(id) {
  const j = jerseys.find(j => j.id === id);
  if (j) openJerseyModal(j);
}

function deleteJersey(id) {
  if (!confirm('Are you sure you want to delete this jersey? This cannot be undone.')) return;
  jerseys = jerseys.filter(j => j.id !== id);
  saveJerseys();
  renderAdmin();
  showToast('Jersey removed.', 'success');
}

// ─── IMAGE UPLOAD ─────────────────────────────────────────────
function handleImgUpload(e) {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { showToast('Image too large (max 5MB)', 'error'); return; }
  const reader = new FileReader();
  reader.onload = ev => {
    imgBase64 = ev.target.result;
    updateImgPreview(imgBase64);
  };
  reader.readAsDataURL(file);
}

function updateImgPreview(src) {
  const wrap = document.getElementById('img-preview-wrap');
  if (src) {
    wrap.innerHTML = `<img src="${src}" alt="Preview" style="width:100%;height:100%;object-fit:cover;position:absolute;inset:0;border-radius:10px;" />
      <div style="position:absolute;bottom:8px;right:8px;background:rgba(0,0,0,.6);border-radius:6px;padding:4px 10px;font-size:.75rem;color:#fff;z-index:2">Click to change</div>`;
  } else {
    wrap.innerHTML = `
      <span class="upload-icon">📸</span>
      <span class="upload-hint">Click to upload jersey photo<br/><small style="opacity:.6">JPG, PNG, WebP — recommended 4:3</small></span>`;
  }
}

// ─── HELPERS ──────────────────────────────────────────────────
function formatPrice(n) {
  return Number(n).toLocaleString('en-RW');
}

function escHtml(str) {
  const d = document.createElement('div');
  d.textContent = str;
  return d.innerHTML;
}

function showToast(msg, type = 'success') {
  const t  = document.getElementById('toast');
  const ic = document.getElementById('toast-icon');
  const ms = document.getElementById('toast-msg');
  ic.textContent = type === 'success' ? '✅' : '❌';
  ms.textContent = msg;
  t.className = `toast ${type}`;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3200);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const step = Math.max(1, Math.floor(target / 30));
  const interval = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = current;
    if (current >= target) clearInterval(interval);
  }, 40);
}
