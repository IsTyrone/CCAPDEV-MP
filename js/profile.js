/**
 * Profile Page - User profile with listings, reputation, and comments.
 * Data persisted in localStorage (simulation-style).
 */

// --- Resolve target user ---
function getTargetUser() {
  const params = new URLSearchParams(location.search);
  const emailParam = params.get('email');
  if (emailParam) {
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    return registeredUsers.find(u => u.email === emailParam) || null;
  }
  const currentUser = localStorage.getItem('currentUser');
  return currentUser ? JSON.parse(currentUser) : null;
}

// --- State ---
let targetUser = null;

// --- Reputation (stored in registeredUsers) ---
function getRep() {
  if (!targetUser || !targetUser.email) return 0;
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const user = registeredUsers.find(u => u.email === targetUser.email);
  return (user && user.rep) || 0;
}

function setRep(value) {
  if (!targetUser || !targetUser.email) return;
  const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
  const idx = registeredUsers.findIndex(u => u.email === targetUser.email);
  if (idx === -1) return;
  registeredUsers[idx].rep = value;
  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
  targetUser.rep = value;
  renderRep();
}

// --- Listings (filter by ownerEmail) ---
function getProfileListings() {
  const listings = JSON.parse(localStorage.getItem('listings') || '[]');
  if (!targetUser || !targetUser.email) return [];
  return listings.filter(l => l.ownerEmail === targetUser.email);
}

// --- Comments (localStorage['profileComments']) ---
const PROFILE_COMMENTS_KEY = 'profileComments';

function getProfileComments() {
  const all = JSON.parse(localStorage.getItem(PROFILE_COMMENTS_KEY) || '{}');
  const key = targetUser && targetUser.email ? targetUser.email : '_guest';
  return all[key] || [];
}

function addProfileComment(comment) {
  const all = JSON.parse(localStorage.getItem(PROFILE_COMMENTS_KEY) || '{}');
  const key = targetUser && targetUser.email ? targetUser.email : '_guest';
  const list = all[key] || [];
  list.unshift(comment);
  all[key] = list;
  localStorage.setItem(PROFILE_COMMENTS_KEY, JSON.stringify(all));
}

// --- Render ---
function renderProfileHeader() {
  const displayName = document.getElementById('profile-display-name');
  const username = document.getElementById('profile-username');
  const repCount = document.getElementById('rep-count');
  const repUp = document.getElementById('rep-up');
  const repDown = document.getElementById('rep-down');

  if (!targetUser) {
    if (displayName) displayName.textContent = 'Not logged in';
    if (username) username.textContent = 'Log in to view your profile';
    if (repCount) repCount.textContent = '—';
    if (repUp) repUp.disabled = true;
    if (repDown) repDown.disabled = true;
    return;
  }

  const name = [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') || 'User';
  const uname = targetUser.username ? `@${targetUser.username}` : `@${(targetUser.email || '').split('@')[0]}`;

  if (displayName) displayName.textContent = name;
  if (username) username.textContent = uname;
  renderRep();
}

function renderRep() {
  const repCount = document.getElementById('rep-count');
  if (repCount) repCount.textContent = getRep();
}

function renderListings() {
  const container = document.getElementById('profile-listings');
  const emptyEl = document.getElementById('listings-empty');
  if (!container) return;

  const listings = getProfileListings();
  container.innerHTML = '';

  if (listings.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  const componentLabels = {
    gpu: 'GPU', cpu: 'CPU', ram: 'RAM', motherboard: 'Motherboard',
    storage: 'Storage', psu: 'PSU', case: 'Case', cooling: 'Cooling'
  };

  listings.forEach(l => {
    const card = document.createElement('div');
    card.className = 'profile-listing-card';
    const type = l.componentType || 'gpu';
    const title = l.details && (l.details['Model'] || l.details['Specific Model'] || l.details['Brand'])
      ? `${l.details['Brand'] || ''} ${l.details['Model'] || l.details['Specific Model'] || type}`.trim()
      : `${componentLabels[type] || type} Listing`;
    const price = l.price ? `₱${l.price}` : '—';
    const status = l.status || 'pending';
    card.innerHTML = `
      <div class="listing-info">
        <span class="listing-tag">${(componentLabels[type] || type).toUpperCase()}</span>
        <h4>${title}</h4>
        <div class="listing-meta">${status} · ${l.date ? new Date(l.date).toLocaleDateString() : ''}</div>
      </div>
      <div class="listing-price">${price}</div>
    `;
    container.appendChild(card);
  });
}

function renderComments() {
  const container = document.getElementById('profile-comments');
  const emptyEl = document.getElementById('comments-empty');
  if (!container) return;

  const comments = getProfileComments();
  container.innerHTML = '';

  if (comments.length === 0) {
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  comments.forEach(c => {
    const card = document.createElement('div');
    card.className = 'profile-comment-card';
    const time = c.time ? new Date(c.time).toLocaleString() : '';
    card.innerHTML = `
      <div class="comment-header">
        <span class="comment-author">${escapeHtml(c.author)}</span>
        <span class="comment-time">${time}</span>
      </div>
      <div class="comment-body">${escapeHtml(c.body)}</div>
    `;
    container.appendChild(card);
  });
}

function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// --- Tab switching ---
function initTabs() {
  document.querySelectorAll('.profile-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      const content = document.getElementById(`tab-${target}`);
      if (content) content.classList.add('active');
      if (target === 'listings') renderListings();
      if (target === 'comments') renderComments();
    });
  });
}

// --- Rep buttons ---
function initRepButtons() {
  const repUp = document.getElementById('rep-up');
  const repDown = document.getElementById('rep-down');
  if (repUp) repUp.addEventListener('click', () => setRep(getRep() + 1));
  if (repDown) repDown.addEventListener('click', () => setRep(getRep() - 1));
}

// --- Post comment ---
function initCommentForm() {
  const input = document.getElementById('comment-input');
  const btn = document.getElementById('post-comment-btn');
  if (!btn || !input) return;

  btn.addEventListener('click', () => {
    const body = input.value.trim();
    if (!body) return;
    if (!targetUser) {
      alert('Please log in to post a comment.');
      return;
    }
    const author = [targetUser.firstName, targetUser.lastName].filter(Boolean).join(' ') || targetUser.username || 'Anonymous';
    addProfileComment({
      author,
      body,
      time: new Date().toISOString()
    });
    input.value = '';
    renderComments();
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  targetUser = getTargetUser();

  if (!targetUser) {
    const main = document.querySelector('.profile-main');
    if (main) {
      main.innerHTML = `
        <div class="empty-state" style="padding: 60px 20px;">
          <h2 style="margin-bottom: 12px;">Not logged in</h2>
          <p style="margin-bottom: 20px;">Please <a href="login.html">log in</a> to view your profile.</p>
          <a href="../index.html" class="back-to-dash">← Back to Dashboard</a>
        </div>
      `;
    }
    return;
  }

  renderProfileHeader();
  renderListings();
  renderComments();
  initTabs();
  initRepButtons();
  initCommentForm();
});
