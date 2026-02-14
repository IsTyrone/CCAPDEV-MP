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
              <button onclick="window.location.href='pages/login.html'" class="btn-sidebar btn-sidebar-primary">Login</button>
              <button onclick="window.location.href='pages/register.html'" class="btn-sidebar btn-sidebar-outline">Register</button>
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


// --- Old dropdown logic removed — now handled by js/dropdown-manager.js ---


// --- 3. Live Listings Feed Logic ---

let listings = [];

// Component type definitions for dummy listing generation
const componentDefs = {
  gpu: {
    brands: ['ASUS', 'MSI', 'Gigabyte', 'EVGA', 'Zotac', 'Sapphire', 'PowerColor'],
    names: ['RTX 4070 Ti', 'RTX 4060', 'RTX 3080', 'RX 7800 XT', 'RX 7600', 'RTX 4090', 'Arc A770', 'RX 9070 XT'],
    priceRange: [250, 1800]
  },
  cpu: {
    brands: ['Intel', 'AMD'],
    names: ['Core i5-14600K', 'Core i7-14700K', 'Core i9-14900K', 'Ryzen 5 7600X', 'Ryzen 7 7800X3D', 'Ryzen 9 9950X', 'Core i5-13400F'],
    priceRange: [100, 600]
  },
  ram: {
    brands: ['Corsair', 'G.Skill', 'Kingston', 'TeamGroup', 'ADATA'],
    names: ['Vengeance DDR5 32GB', 'Trident Z5 RGB 32GB', 'Fury Beast 16GB', 'T-Force Delta 32GB', 'XPG Lancer 16GB'],
    priceRange: [30, 200]
  },
  mobo: {
    brands: ['ASUS', 'MSI', 'Gigabyte', 'ASRock', 'Biostar'],
    names: ['ROG Strix Z790-E', 'MAG B650 Tomahawk', 'AORUS B550 Pro', 'X670E Taichi', 'B760M-HDV'],
    priceRange: [80, 500]
  },
  storage: {
    brands: ['Samsung', 'Western Digital', 'Crucial', 'Seagate', 'Kingston', 'Sabrent'],
    names: ['990 Pro 2TB NVMe', '980 Pro 1TB', 'WD Black SN850X', 'P5 Plus 1TB', 'Barracuda 4TB HDD', 'Rocket 4 Plus 2TB'],
    priceRange: [40, 250]
  },
  psu: {
    brands: ['Corsair', 'Seasonic', 'EVGA', 'Cooler Master', 'be quiet!', 'Thermaltake'],
    names: ['RM850x 850W Gold', 'Focus GX-750 Gold', 'SuperNOVA 1000W', 'V850 SFX Gold', 'Straight Power 12 Platinum', 'Toughpower GF3 1200W'],
    priceRange: [60, 300]
  },
  case: {
    brands: ['NZXT', 'Corsair', 'Lian Li', 'Fractal Design', 'Phanteks', 'Cooler Master'],
    names: ['H7 Flow', '4000D Airflow', 'O11 Dynamic EVO', 'North', 'Eclipse P400A', 'NR600', 'Meshify 2'],
    priceRange: [60, 250]
  },
  cooling: {
    brands: ['Noctua', 'Corsair', 'NZXT', 'be quiet!', 'DeepCool', 'Arctic', 'Cooler Master'],
    names: ['NH-D15', 'iCUE H150i Elite', 'Kraken X73', 'Dark Rock Pro 5', 'AK620', 'Liquid Freezer II 360', 'Hyper 212'],
    priceRange: [25, 200]
  }
};

const componentTypes = Object.keys(componentDefs);

// Generate dummy data
function generateDummyListings() {
  const newListings = [];
  for (let i = 0; i < 15; i++) {
    const type = componentTypes[Math.floor(Math.random() * componentTypes.length)];
    const def = componentDefs[type];
    const brand = def.brands[Math.floor(Math.random() * def.brands.length)];
    const name = def.names[Math.floor(Math.random() * def.names.length)];
    const price = Math.floor(Math.random() * (def.priceRange[1] - def.priceRange[0])) + def.priceRange[0];

    newListings.push({
      id: i,
      type: type,
      brand: brand,
      title: `${brand} ${name}`,
      price: `$${price}`,
      time: `${Math.floor(Math.random() * 59) + 1} mins ago`,
      image: `https://via.placeholder.com/80?text=${type.toUpperCase()}`
    });
  }
  return newListings;
}

// Initial Load
listings = generateDummyListings();

function renderListings(items) {
  const feedContainer = document.getElementById('listings-feed');
  if (!feedContainer) return;

  feedContainer.innerHTML = '';

  items.forEach(item => {
    const card = document.createElement('div');
    card.className = 'listing-card';
    card.innerHTML = `
      <img src="${item.image}" class="listing-img" alt="${item.title}">
      <div class="listing-details">
        <div>
          <span class="listing-tag ${item.type}">${item.type.toUpperCase()}</span>
          <h4 class="listing-title">${item.title}</h4>
          <div class="listing-meta">
            <span>${item.brand}</span>
            <span>${item.time}</span>
          </div>
        </div>
        <div class="listing-price">${item.price}</div>
      </div>
    `;
    feedContainer.appendChild(card);
  });
}

// Render on load
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('listings-feed')) {
    renderListings(listings);
  }
});

function sortListings() {
  const sortValue = document.getElementById('listing-sort').value;
  let sortedItems = [...listings];

  if (sortValue === 'low-price') {
    sortedItems.sort((a, b) => parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', '')));
  } else if (sortValue === 'high-price') {
    sortedItems.sort((a, b) => parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', '')));
  }

  filterListings(sortedItems);
}

function filterListings(itemsToRender = listings) {
  const filterValue = document.getElementById('listing-filter').value;

  let filteredItems = itemsToRender;

  if (filterValue !== 'all') {
    filteredItems = itemsToRender.filter(item => item.type === filterValue);
  } else {
    if (itemsToRender === listings && document.getElementById('listing-sort').value !== 'recent') {
      const sortValue = document.getElementById('listing-sort').value;
      if (sortValue === 'low-price') {
        filteredItems.sort((a, b) => parseInt(a.price.replace('$', '')) - parseInt(b.price.replace('$', '')));
      } else if (sortValue === 'high-price') {
        filteredItems.sort((a, b) => parseInt(b.price.replace('$', '')) - parseInt(a.price.replace('$', '')));
      }
    }
  }

  renderListings(filteredItems);
}

function refreshListings() {
  const btn = document.querySelector('.refresh-btn');
  const originalText = btn.textContent;
  btn.textContent = 'Refreshing...';

  setTimeout(() => {
    listings = generateDummyListings();
    renderListings(listings);
    btn.textContent = originalText;
  }, 800);
}

function loadMoreListings() {
  const btn = document.querySelector('.load-more-btn');
  btn.textContent = 'Loading...';

  setTimeout(() => {
    const moreListings = generateDummyListings().slice(0, 5);
    listings = [...listings, ...moreListings];
    filterListings();
    btn.textContent = 'Load More Listings';
  }, 800);
}

