/**
 * Profile Page - User profile with listings, reputation, and comments.
 * Data fetched from server API.
 */

// --- Resolve target user ---
async function getTargetUser() {
  const params = new URLSearchParams(location.search);
  const emailParam = params.get('email');

  if (emailParam) {
    try {
      const res = await fetch(`/api/users/${encodeURIComponent(emailParam)}`);
      const data = await res.json();
      return data.user || null;
    } catch (err) {
      console.error('Failed to fetch target user:', err);
      return null;
    }
  }

  // No email param — get current logged-in user
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    return data.user || null;
  } catch (err) {
    console.error('Failed to fetch current user:', err);
    return null;
  }
}

// --- State ---
let targetUser = null;

// --- Reputation ---
function renderRep() {
  const repCount = document.getElementById('rep-count');
  if (repCount && targetUser) repCount.textContent = targetUser.rep || 0;
}

async function changeRep(delta) {
  if (!targetUser || !targetUser.email) return;
  try {
    const res = await fetch(`/api/users/${encodeURIComponent(targetUser.email)}/rep`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ delta })
    });
    const data = await res.json();
    if (res.ok) {
      targetUser.rep = data.rep;
      renderRep();
    }
  } catch (err) {
    console.error('Rep update error:', err);
  }
}

// --- Listings (filter by ownerEmail from server) ---
async function getProfileListings() {
  if (!targetUser || !targetUser.email) return [];
  try {
    const res = await fetch(`/api/listings?ownerEmail=${encodeURIComponent(targetUser.email)}`);
    const data = await res.json();
    return data.listings || [];
  } catch (err) {
    console.error('Failed to fetch profile listings:', err);
    return [];
  }
}

// --- Comments ---
async function getProfileComments() {
  if (!targetUser || !targetUser.email) return [];
  try {
    const res = await fetch(`/api/profile-comments/${encodeURIComponent(targetUser.email)}`);
    const data = await res.json();
    return data.comments || [];
  } catch (err) {
    console.error('Failed to fetch profile comments:', err);
    return [];
  }
}

async function addProfileComment(comment) {
  if (!targetUser || !targetUser.email) return;
  try {
    await fetch(`/api/profile-comments/${encodeURIComponent(targetUser.email)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment)
    });
  } catch (err) {
    console.error('Failed to add profile comment:', err);
  }
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

async function renderListings() {
  const container = document.getElementById('profile-listings');
  const emptyEl = document.getElementById('listings-empty');
  if (!container) return;

  const listings = await getProfileListings();
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

async function renderComments() {
  const container = document.getElementById('profile-comments');
  const emptyEl = document.getElementById('comments-empty');
  if (!container) return;

  const comments = await getProfileComments();
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
  if (repUp) repUp.addEventListener('click', () => changeRep(1));
  if (repDown) repDown.addEventListener('click', () => changeRep(-1));
}

// --- Post comment ---
function initCommentForm() {
  const input = document.getElementById('comment-input');
  const btn = document.getElementById('post-comment-btn');
  if (!btn || !input) return;

  btn.addEventListener('click', async () => {
    const body = input.value.trim();
    if (!body) return;
    if (!targetUser) {
      alert('Please log in to post a comment.');
      return;
    }

    // Get the current logged-in user for the author name
    let authorName = 'Anonymous';
    try {
      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();
      if (meData.user) {
        authorName = [meData.user.firstName, meData.user.lastName].filter(Boolean).join(' ') || meData.user.username || 'Anonymous';
      }
    } catch (err) {
      console.error('Failed to get current user for comment:', err);
    }

    await addProfileComment({
      author: authorName,
      body
    });
    input.value = '';
    renderComments();
  });
}

// --- Init ---
document.addEventListener('DOMContentLoaded', async () => {
  targetUser = await getTargetUser();

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
