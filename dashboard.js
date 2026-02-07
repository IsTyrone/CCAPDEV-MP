// --- User Session ---
const currentUser = localStorage.getItem('currentUser');

// --- Sidebar & Header Logic ---
const userIconBtn = document.getElementById('userIconBtn');
const sidebar = document.getElementById('rightSidebar');
const closeSidebar = document.getElementById('closeSidebar');
const overlay = document.getElementById('sidebarOverlay');
const sidebarContent = document.getElementById('sidebarContent');

/**
 * Handles the logout process.
 * Removes the current user from localStorage and reloads the page to reset the UI.
 */
function handleLogout() {
  localStorage.removeItem('currentUser');
  alert('Logged out');
  window.location.reload(); // Refresh to update UI
}

/**
 * Updates the sidebar and header content based on the user's login status.
 * If logged in: displays user name, profile actions, and logout button.
 * If guest: displays guest welcome message and login/register buttons.
 */
function updateSidebarContent() {
  if (!sidebarContent) return;

  // Select the account label in the header
  const accountLabel = document.querySelector('.account-label');
  // const userIcon = document.querySelector('.user-icon-btn'); // Optional

  if (currentUser) {
    // User is Logged In
    const userObj = JSON.parse(currentUser);

    // 1. Update Header Label
    if (accountLabel) {
      // Use First Name
      accountLabel.textContent = userObj.firstName;
    }

    // 2. Update Sidebar
    sidebarContent.innerHTML = `
            <h3 class="mb-10">${userObj.firstName} ${userObj.lastName || ''}</h3>
            <p class="verified-session">✓ Verified Session</p>
            <div class="user-menu">
               <div class="menu-item">My Saved Builds</div>
               <div class="menu-item">Price Alerts</div>
               <div class="menu-item">Account Settings</div>
               <button id="logoutBtn" class="logout-btn">Logout</button>
            </div>
        `;

    // Attach Logout Listener dynamically
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  } else {
    // User is Guest

    // 1. Reset Header Label
    if (accountLabel) {
      accountLabel.textContent = 'Account';
    }

    // 2. Update Sidebar
    sidebarContent.innerHTML = `
            <h3 class="mb-10">Welcome, Guest</h3>
            <p class="sidebar-subtitle">Log in to track prices and manage your builds.</p>
            
            <div class="sidebar-actions">
              <button onclick="window.location.href='login.html'" class="btn-sidebar btn-sidebar-primary">Login</button>
              <button onclick="window.location.href='register.html'" class="btn-sidebar btn-sidebar-outline">Register</button>
            </div>
        `;
  }
}

// Only run sidebar logic if elements exist (i.e., we are on the dashboard)
if (userIconBtn && sidebar && overlay) {

  /**
   * Opens the right sidebar by adding the 'open' class.
   * Also updates the sidebar content to ensure it reflects the latest state.
   */
  function openSidebar() {
    updateSidebarContent(); // Update content based on login status
    sidebar.classList.add('open');
    overlay.classList.add('active');
  }

  /**
   * Closes the right sidebar by removing the 'open' class.
   */
  function closeSidebarFunc() {
    sidebar.classList.remove('open');
    overlay.classList.remove('active');
  }

  userIconBtn.addEventListener('click', openSidebar);
  if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarFunc);
  overlay.addEventListener('click', closeSidebarFunc);
}

// Call immediately to set state on page load
updateSidebarContent();


// --- Search Functionality ---
const searchBar = document.querySelector('.search-bar');
const searchBtn = document.querySelector('.search-btn');
const productCards = document.querySelectorAll('.product-card');

/**
 * Filters the product cards based on the search input.
 * Hides cards that do not match the search query (case-insensitive).
 */
function filterProducts() {
  const query = searchBar.value.toLowerCase();
  productCards.forEach(card => {
    const title = card.querySelector('.product-title').textContent.toLowerCase();
    if (title.includes(query)) {
      card.style.display = 'flex';
    } else {
      card.style.display = 'none';
    }
  });
}

if (searchBar) {
  searchBar.addEventListener('input', filterProducts);
  // Optional: Search on button click (though input covers it)
  if (searchBtn) searchBtn.addEventListener('click', filterProducts);
}


// --- Recent Views Logic ---
// Load recent views from localStorage
const distinctRecentViews = JSON.parse(localStorage.getItem('recentViews') || '[]');

// Function to render recent views in sidebar
/**
 * Renders the list of recently viewed products in the sidebar.
 * reads from the 'distinctRecentViews' array and populates the UL element.
 */
function renderRecentViews() {
  const recentList = document.querySelector('.recent-list');
  if (recentList && distinctRecentViews.length > 0) {
    recentList.innerHTML = distinctRecentViews.map(item => `<li>${item}</li>`).join('');
  }
}

// Render initially
renderRecentViews();

// Add click event to products to "view" them
productCards.forEach(card => {
  card.style.cursor = 'pointer'; // Make it look clickable
  card.addEventListener('click', () => {
    const title = card.querySelector('.product-title').textContent;

    // Add to array if not already present (or move to top)
    const index = distinctRecentViews.indexOf(title);
    if (index > -1) {
      distinctRecentViews.splice(index, 1);
    }
    distinctRecentViews.unshift(title);

    // Keep only top 5
    if (distinctRecentViews.length > 5) distinctRecentViews.pop();

    // Save and re-render
    localStorage.setItem('recentViews', JSON.stringify(distinctRecentViews));
    renderRecentViews();

    // Open sidebar to show it was added (optional UX improvement)
    if (userIconBtn) userIconBtn.click();
  });
});
