// AIverse — Main App Logic

// =========================================
// STATE
// =========================================
let currentCategory = 'all';
let currentSearch = '';
let currentSort = 'popular';
let displayedCount = 12;
const ITEMS_PER_PAGE = 12;

// =========================================
// UTILS
// =========================================
function showToast(msg, color = '#10b981') {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.style.background = `${color}dd`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3000);
}

function getFilteredTools() {
  let tools = [...AI_TOOLS];
  if (currentCategory !== 'all') {
    tools = tools.filter(t => t.category === currentCategory);
  }
  if (currentSearch) {
    const q = currentSearch.toLowerCase();
    tools = tools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.company.toLowerCase().includes(q) ||
      t.desc.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q)) ||
      t.category.toLowerCase().includes(q)
    );
  }
  // Sort
  if (currentSort === 'popular') {
    tools.sort((a,b) => b.votes - a.votes);
  } else if (currentSort === 'newest') {
    tools.sort((a,b) => new Date(b.date) - new Date(a.date));
  } else if (currentSort === 'name') {
    tools.sort((a,b) => a.name.localeCompare(b.name));
  } else if (currentSort === 'free') {
    const order = { free: 0, freemium: 1, paid: 2 };
    tools.sort((a,b) => (order[a.pricing]||9) - (order[b.pricing]||9));
  }
  return tools;
}

function formatVotes(n) {
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toString();
}

function getPricingBadge(pricing) {
  if (pricing === 'free') return '<span class="badge badge-free">ฟรี</span>';
  if (pricing === 'freemium') return '<span class="badge badge-freemium">Freemium</span>';
  if (pricing === 'paid') return '<span class="badge badge-paid">Paid</span>';
  return '';
}

function getStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}

// =========================================
// RENDER TOOL CARD
// =========================================
function renderToolCard(tool, isTrending = false) {
  const badges = [
    getPricingBadge(tool.pricing),
    tool.isHot ? '<span class="badge badge-hot">🔥 HOT</span>' : '',
    tool.isNew ? '<span class="badge badge-new">✨ NEW</span>' : '',
  ].filter(Boolean).join('');

  const tags = tool.tags.map(t => `<span class="tag">${t}</span>`).join('');
  const trendingRank = isTrending ? `<div class="trending-rank">🔥 Trending</div>` : '';

  return `
    <div class="tool-card${isTrending ? ' trending' : ''}" onclick="window.open('${tool.url}','_blank')" id="tool-${tool.id}">
      ${trendingRank}
      <div class="card-header">
        <div class="card-icon ${tool.iconBg}">${tool.icon}</div>
        <div class="card-meta">
          <div class="card-name">${tool.name}</div>
          <div class="card-company">${tool.company}</div>
        </div>
      </div>
      <div class="card-badges">${badges}</div>
      <p class="card-description">${tool.desc}</p>
      <div class="card-tags">${tags}</div>
      <div class="card-footer">
        <div class="card-rating">
          <span class="stars">${getStars(tool.rating)}</span>
          <span class="rating-num">${tool.rating} (${formatVotes(tool.votes)})</span>
        </div>
        <a href="${tool.url}" target="_blank" class="btn-visit" onclick="event.stopPropagation()">เยี่ยมชม →</a>
      </div>
    </div>
  `;
}

// =========================================
// RENDER TRENDING
// =========================================
function renderTrending() {
  const grid = document.getElementById('trendingGrid');
  const trendingTools = AI_TOOLS
    .filter(t => t.trending)
    .sort((a,b) => b.votes - a.votes)
    .slice(0, 6);

  grid.innerHTML = trendingTools.map(t => renderToolCard(t, true)).join('');
}

// =========================================
// RENDER TOOLS GRID
// =========================================
function renderTools() {
  const grid = document.getElementById('toolsGrid');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');
  const loadMoreWrapper = document.getElementById('loadMoreWrapper');

  const filtered = getFilteredTools();
  const toShow = filtered.slice(0, displayedCount);

  resultsCount.innerHTML = `แสดง <strong>${toShow.length}</strong> จาก <strong>${filtered.length}</strong> รายการ`;

  if (filtered.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    loadMoreWrapper.style.display = 'none';
    return;
  }

  noResults.style.display = 'none';
  grid.innerHTML = toShow.map((t, i) => {
    // Add stagger animation delay
    const delay = (i % ITEMS_PER_PAGE) * 50;
    const card = renderToolCard(t);
    return card.replace('<div class="tool-card', `<div class="tool-card" style="animation-delay:${delay}ms"`);
  }).join('');

  if (filtered.length > displayedCount) {
    loadMoreWrapper.style.display = 'block';
  } else {
    loadMoreWrapper.style.display = 'none';
  }
}

// =========================================
// RENDER MODELS
// =========================================
function renderModels() {
  const grid = document.getElementById('modelsGrid');

  grid.innerHTML = AI_MODELS.map((model, i) => {
    const specs = model.specs.map(s =>
      `<div class="spec-chip"><span>${s.icon}</span><span>${s.label}</span></div>`
    ).join('');
    const badges = [
      model.badges.includes('free') ? '<span class="badge badge-free">ฟรี</span>' : '',
      model.badges.includes('freemium') ? '<span class="badge badge-freemium">Freemium</span>' : '',
      model.badges.includes('paid') ? '<span class="badge badge-paid">Paid</span>' : '',
      model.badges.includes('open') ? '<span class="badge badge-open">Open Source</span>' : '',
      model.badges.includes('new') ? '<span class="badge badge-new">✨ NEW</span>' : '',
      model.badges.includes('hot') ? '<span class="badge badge-hot">🔥 HOT</span>' : '',
    ].filter(Boolean).join('');

    const delay = i * 60;
    return `
      <div class="model-card" style="animation-delay:${delay}ms">
        <div class="model-header">
          <div class="model-icon ${model.iconBg}">${model.icon}</div>
          <div class="model-info">
            <div class="model-name">${model.name}</div>
            <div class="model-creator">${model.creator} · ${model.type}</div>
          </div>
        </div>
        <div class="card-badges" style="margin-bottom:12px">${badges}</div>
        <p class="model-description">${model.desc}</p>
        <div class="model-specs">${specs}</div>
        <div class="model-links">
          <a href="${model.link}" target="_blank" class="btn-model btn-model-primary">เยี่ยมชม →</a>
          <a href="${model.docsLink}" target="_blank" class="btn-model btn-model-secondary">📚 Docs</a>
        </div>
      </div>
    `;
  }).join('');
}

// =========================================
// RENDER RESOURCES
// =========================================
function renderResources() {
  const grid = document.getElementById('resourcesGrid');
  grid.innerHTML = RESOURCES.map((r, i) => `
    <a href="${r.url}" target="_blank" class="resource-card" style="animation-delay:${i*60}ms">
      <div class="resource-icon">${r.icon}</div>
      <div class="resource-type">${r.type}</div>
      <div class="resource-title">${r.title}</div>
      <p class="resource-desc">${r.desc}</p>
    </a>
  `).join('');
}

// =========================================
// ANIMATE COUNTERS
// =========================================
function animateCounters() {
  const counters = document.querySelectorAll('[data-target]');
  counters.forEach(counter => {
    const target = parseInt(counter.getAttribute('data-target'));
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      counter.textContent = Math.floor(current) + (counter.getAttribute('data-target') === '98' ? '' : '+');
      if (current >= target) {
        clearInterval(timer);
        counter.textContent = target + (counter.getAttribute('data-target') === '98' ? '%' : '+');
      }
    }, 25);
  });
}

// =========================================
// BACKGROUND PARTICLES
// =========================================
function createParticles() {
  const container = document.getElementById('bgParticles');
  const colors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#ec4899', '#10b981'];

  for (let i = 0; i < 30; i++) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    const size = Math.random() * 4 + 1;
    particle.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      animation-duration: ${Math.random() * 20 + 15}s;
      animation-delay: ${Math.random() * 10}s;
      box-shadow: 0 0 ${size * 3}px currentColor;
    `;
    container.appendChild(particle);
  }
}

// =========================================
// EVENT LISTENERS
// =========================================
function initEvents() {
  // Navbar scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  }, { passive: true });

  // Search
  const heroSearch = document.getElementById('heroSearch');
  const searchClear = document.getElementById('searchClear');

  heroSearch.addEventListener('input', (e) => {
    currentSearch = e.target.value.trim();
    displayedCount = ITEMS_PER_PAGE;
    if (currentSearch) {
      searchClear.classList.add('visible');
      // Scroll to tools
      document.getElementById('tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      searchClear.classList.remove('visible');
    }
    renderTools();
  });

  searchClear.addEventListener('click', () => {
    heroSearch.value = '';
    currentSearch = '';
    searchClear.classList.remove('visible');
    displayedCount = ITEMS_PER_PAGE;
    renderTools();
  });

  // Category buttons
  document.querySelectorAll('.cat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.getAttribute('data-cat');
      displayedCount = ITEMS_PER_PAGE;
      renderTools();
      // Scroll to tools section
      document.getElementById('tools').scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // Sort
  document.getElementById('sortSelect').addEventListener('change', (e) => {
    currentSort = e.target.value;
    displayedCount = ITEMS_PER_PAGE;
    renderTools();
  });

  // Load more
  document.getElementById('loadMoreBtn').addEventListener('click', () => {
    displayedCount += ITEMS_PER_PAGE;
    renderTools();
  });

  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
  });

  document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
  });

  // Submit modal
  const submitBtn = document.getElementById('submitBtn');
  const modalOverlay = document.getElementById('modalOverlay');
  const modalClose = document.getElementById('modalClose');

  submitBtn.addEventListener('click', () => modalOverlay.classList.add('open'));
  modalClose.addEventListener('click', () => modalOverlay.classList.remove('open'));
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) modalOverlay.classList.remove('open');
  });

  document.querySelector('.btn-submit-form').addEventListener('click', () => {
    modalOverlay.classList.remove('open');
    showToast('✅ ส่งข้อมูลเรียบร้อย! ทีมงานจะตรวจสอบและเพิ่มให้เร็วๆ นี้', '#8b5cf6');
  });

  // Newsletter
  document.getElementById('subscribeBtn').addEventListener('click', () => {
    const email = document.getElementById('emailInput').value.trim();
    if (!email || !email.includes('@')) {
      showToast('⚠️ กรุณากรอก Email ที่ถูกต้อง', '#f59e0b');
      return;
    }
    document.getElementById('emailInput').value = '';
    showToast('🎉 สมัครรับข่าวสารเรียบร้อย! ขอบคุณ', '#10b981');
  });

  // Keyboard shortcut (Ctrl+K or Cmd+K to focus search)
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const heroSearch = document.getElementById('heroSearch');
      heroSearch.focus();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (e.key === 'Escape') {
      modalOverlay.classList.remove('open');
    }
  });
}

// =========================================
// INTERSECTION OBSERVER (lazy animation)
// =========================================
function initObserver() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  }, { threshold: 0.1 });

  // Observe section headers
  document.querySelectorAll('.section-header').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
  });
}

// =========================================
// COUNTER OBSERVER
// =========================================
function initCounterObserver() {
  const heroStats = document.querySelector('.hero-stats');
  let counted = false;
  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !counted) {
      counted = true;
      animateCounters();
    }
  }, { threshold: 0.5 });
  if (heroStats) observer.observe(heroStats);
}

// =========================================
// INIT
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  createParticles();
  renderTrending();
  renderTools();
  renderModels();
  renderResources();
  initEvents();
  initObserver();
  initCounterObserver();

  console.log('%c⬡ AIverse — ยินดีต้อนรับ! 🚀', 'color:#8b5cf6;font-size:16px;font-weight:bold');
  console.log('%c🛠️ ศูนย์รวม AI Tools & Models ที่ดีที่สุดสำหรับคนไทย', 'color:#06b6d4;font-size:12px');
});
