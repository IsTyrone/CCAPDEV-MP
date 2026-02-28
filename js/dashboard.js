// --- User Session (fetched from server) ---
let currentUserData = null;

// Fetch current user session from server
async function fetchCurrentUser() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    currentUserData = data.user || null;
    return currentUserData;
  } catch (err) {
    console.error('Failed to fetch current user:', err);
    currentUserData = null;
    return null;
  }
}

// --- Sidebar & Header Logic ---
const userIconBtn = document.getElementById('userIconBtn');
const sidebar = document.getElementById('rightSidebar');
const closeSidebar = document.getElementById('closeSidebar');
const overlay = document.getElementById('sidebarOverlay');
const sidebarContent = document.getElementById('sidebarContent');

/**
 * Handles the logout process.
 * Calls the server API to destroy the session, then reloads the page.
 */
async function handleLogout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST' });
  } catch (err) {
    console.error('Logout error:', err);
  }
  alert('Logged out');
  window.location.reload();
}

/**
 * Updates the sidebar and header content based on the user's login status.
 * If logged in: displays user name, profile actions, and logout button.
 * If guest: displays guest welcome message and login/register buttons.
 */
function updateSidebarContent() {
  if (!sidebarContent) return;

  // Path logic: use correct relative paths when on sub-pages (pages/*.html)
  const isInPages = window.location.pathname.includes('/pages/') || window.location.pathname.includes('pages/');
  const profilePath = isInPages ? 'profile.html' : 'pages/profile.html';
  const settingsPath = isInPages ? 'settings.html' : 'pages/settings.html';
  const loginPath = isInPages ? 'login.html' : 'pages/login.html';
  const registerPath = isInPages ? 'register.html' : 'pages/register.html';

  // Select the account label in the header
  const accountLabel = document.querySelector('.account-label');

  if (currentUserData) {
    // User is Logged In
    const userObj = currentUserData;

    // 1. Update Header Label
    if (accountLabel) {
      accountLabel.textContent = userObj.firstName;
    }

    // 2. Update Sidebar
    sidebarContent.innerHTML = `
            <h3 class="mb-10">${userObj.firstName} ${userObj.lastName || ''}</h3>
            <p class="verified-session">✓ Verified Session</p>
            <div class="user-menu">
               <button class="menu-btn">My Saved Builds</button>
               <button class="menu-btn">Price Alerts</button>
               <a href="${profilePath}" class="menu-btn">User Profile</a>
               <a href="${settingsPath}" class="menu-btn">Account Settings</a>
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
              <button onclick="window.location.href='${loginPath}'" class="btn-sidebar btn-sidebar-primary">Login</button>
              <button onclick="window.location.href='${registerPath}'" class="btn-sidebar btn-sidebar-outline">Register</button>
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

// Fetch user and update sidebar on load
fetchCurrentUser().then(() => {
  updateSidebarContent();
});


// --- Previously Visited Forums Logic ---
function renderRecentViews() {
  const recentList = document.getElementById('recent-forums-list');
  if (!recentList) return;

  const recentForums = JSON.parse(localStorage.getItem('recentForums') || '[]');

  if (recentForums.length > 0) {
    recentList.innerHTML = recentForums.map(item => `
        <a href="pages/forum.html${item.hash}" class="recent-item" title="${item.title}">
            <div class="recent-item-info">
                <span class="recent-item-title">${item.title}</span>
            </div>
        </a>
    `).join('');
  } else {
    recentList.innerHTML = `
        <div class="forum-card-placeholder">
            <span style="font-size:12px; color:#999; width:100%;">No recently visited forums yet.</span>
        </div>`;
  }
}

// Render on load
renderRecentViews();


// --- Old dropdown logic removed — now handled by js/dropdown-manager.js ---


// --- 3. Live Listings Feed Logic ---

let listings = [];

function buildComponentTitle(type, details) {
  const d = details || {};
  let parts;
  switch (type) {
    case 'gpu':
      parts = [d['Brand'], d['Model']];
      break;
    case 'cpu':
      parts = [d['Brand'], d['Specific Model']];
      break;
    case 'ram':
      parts = [d['Brand'], d['Generation'], d['Speed'], d['Capacity']];
      break;
    case 'motherboard':
      parts = [d['Brand'], d['Socket Type'], d['Chipset'], d['Form Factor']];
      break;
    case 'storage':
      parts = [d['Brand'], d['Type'], d['Interface'], d['Capacity']];
      break;
    case 'psu':
      parts = [d['Brand'], d['Wattage'], d['Efficiency Rating'], d['Modularity']];
      break;
    case 'case':
      parts = [d['Brand (Optional)'] || d['Brand'], d['Form Factor'], d['Side Panel']];
      break;
    case 'cooling':
      parts = [d['Brand'], d['Type'], d['Socket Compatibility']];
      break;
    default:
      parts = [d['Brand'], d['Model'] || d['Specific Model'] || type];
  }
  return parts.filter(Boolean).join(' ');
}

function slugifySegment(str) {
  return (str || '').replace(/\s+/g, '-');
}

function buildForumHash(type, details) {
  const d = details || {};
  const optionalBrand = d['Brand'] ? slugifySegment(d['Brand']) : 'all-brands';
  const requiredBrand = slugifySegment(d['Brand'] || '');
  let segments;
  switch (type) {
    case 'gpu':
      segments = [requiredBrand, slugifySegment(d['Series']), slugifySegment(d['Model'])];
      break;
    case 'cpu':
      segments = [requiredBrand, slugifySegment(d['Performance Tier']), slugifySegment(d['Generation']), slugifySegment(d['Specific Model'])];
      break;
    case 'ram':
      segments = [optionalBrand, slugifySegment(d['Generation']), slugifySegment(d['Speed']), slugifySegment(d['Capacity'])];
      break;
    case 'motherboard':
      segments = [optionalBrand, slugifySegment(d['Socket Type']), slugifySegment(d['Chipset']), slugifySegment(d['Form Factor'])];
      break;
    case 'storage':
      segments = [optionalBrand, slugifySegment(d['Type']), slugifySegment(d['Interface']), slugifySegment(d['Capacity'])];
      break;
    case 'psu':
      segments = [optionalBrand, slugifySegment(d['Wattage']), slugifySegment(d['Efficiency Rating']), slugifySegment(d['Modularity'])];
      break;
    case 'case':
      segments = [d['Brand (Optional)'] || d['Brand'] ? slugifySegment(d['Brand (Optional)'] || d['Brand']) : 'all-brands', slugifySegment(d['Form Factor']), slugifySegment(d['Side Panel'])];
      break;
    case 'cooling':
      segments = [optionalBrand, slugifySegment(d['Type']), slugifySegment(d['Socket Compatibility'])];
      break;
    default:
      segments = [requiredBrand, slugifySegment(d['Model'] || d['Specific Model'] || type)];
  }
  return `#${type}/${segments.filter(Boolean).join('/')}`;
}

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

// Price ranges per component type used for dummy listing generation (PHP pesos, no price data in JSON)
const listingPriceRanges = {
  gpu: [8000, 95000],
  cpu: [3000, 40000],
  ram: [1500, 8000],
  mobo: [3000, 25000],
  storage: [1000, 12000],
  psu: [2000, 12000],
  case: [2000, 15000],
  cooling: [500, 10000]
};

/** Returns a random element from an array. */
function randPick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Builds a dummy listing's {brand, title, details, forumType} from the
 * loaded components-dropdown.json data for a given component type.
 */
function buildDummyFromJson(type, data) {
  const jsonKey = type === 'mobo' ? 'motherboard' : type;
  const forumType = jsonKey;
  const d = data[jsonKey].dropdowns;
  let brand, title, details;

  switch (type) {
    case 'gpu': {
      brand = randPick(d.brand); // NVIDIA / AMD / Intel
      const series = randPick(d.series[brand]);
      const model = randPick(d.models[series]);
      title = `${brand} ${model}`;
      details = { Brand: brand, Series: series, Model: model };
      break;
    }
    case 'cpu': {
      brand = randPick(d.brand);
      const tierFull = randPick(d.tier[brand]); // e.g. "Core i5 (Mainstream)"
      const tierPrefix = tierFull.split(' (')[0];  // e.g. "Core i5"
      const generation = randPick(d.generation[tierPrefix]);
      const modelKey = `${tierPrefix}-${generation}`; // e.g. "Core i5-14th Gen"
      const specificModel = randPick(d.models[modelKey]);
      title = `${brand} ${specificModel}`;
      details = { Brand: brand, 'Performance Tier': tierFull, Generation: generation, 'Specific Model': specificModel };
      break;
    }
    case 'ram': {
      brand = randPick(d.brand);
      const generation = randPick(d.generation);
      const speed = randPick(d.speed[generation]);
      const capacity = randPick(d.capacity);
      title = `${brand} ${generation} ${speed} ${capacity}`;
      details = { Brand: brand, Generation: generation, Speed: speed, Capacity: capacity };
      break;
    }
    case 'mobo': {
      brand = randPick(d.brand);
      const socketType = randPick(d.socket_type);
      const chipset = randPick(d.chipset[socketType]);
      const formFactor = randPick(d.form_factor);
      title = `${brand} ${chipset} ${formFactor}`;
      details = { Brand: brand, 'Socket Type': socketType, Chipset: chipset, 'Form Factor': formFactor };
      break;
    }
    case 'storage': {
      brand = randPick(d.brand);
      const storageType = randPick(d.type);
      const iface = randPick(d.interface[storageType]);
      const capacity = randPick(d.capacity);
      title = `${brand} ${storageType} ${capacity}`;
      details = { Brand: brand, Type: storageType, Interface: iface, Capacity: capacity };
      break;
    }
    case 'psu': {
      brand = randPick(d.brand);
      const wattage = randPick(d.wattage);
      const efficiency = randPick(d.efficiency_rating);
      const modularity = randPick(d.modularity);
      title = `${brand} ${wattage} ${efficiency}`;
      details = { Brand: brand, Wattage: wattage, 'Efficiency Rating': efficiency, Modularity: modularity };
      break;
    }
    case 'case': {
      brand = randPick(d.brand);
      const formFactor = randPick(d.form_factor);
      const sidePanel = randPick(d.side_panel);
      title = `${brand} ${formFactor} Case`;
      details = { 'Brand (Optional)': brand, 'Form Factor': formFactor, 'Side Panel': sidePanel };
      break;
    }
    case 'cooling': {
      brand = randPick(d.brand);
      const coolingType = randPick(d.type);
      const socket = randPick(d.socket_compatibility);
      title = `${brand} ${coolingType}`;
      details = { Brand: brand, Type: coolingType, 'Socket Compatibility': socket };
      break;
    }
    default:
      return null;
  }

  return { brand, title, details, forumType };
}

// Map component types to their local fallback icon images
const componentIconMap = {
  gpu: 'assets/images/component-images/graphic-card.png',
  cpu: 'assets/images/component-images/cpu.png',
  ram: 'assets/images/component-images/ram.png',
  mobo: 'assets/images/component-images/motherboard.png',
  motherboard: 'assets/images/component-images/motherboard.png',
  storage: 'assets/images/component-images/hard-drive.png',
  psu: 'assets/images/component-images/power-supply.png',
  case: 'assets/images/component-images/case.png',
  cooling: 'assets/images/component-images/computer.png'
};

// Map brand names to their actual website domains for logo fetching
const brandDomainMap = {
  // GPU brands
  'asus': 'asus.com',
  'msi': 'msi.com',
  'gigabyte': 'gigabyte.com',
  'evga': 'evga.com',
  'zotac': 'zotac.com',
  'sapphire': 'sapphiretech.com',
  'powercolor': 'powercolor.com',
  // CPU brands
  'intel': 'intel.com',
  'amd': 'amd.com',
  // RAM brands
  'corsair': 'corsair.com',
  'g.skill': 'gskill.com',
  'kingston': 'kingston.com',
  'teamgroup': 'teamgroupinc.com',
  'adata': 'adata.com',
  // Motherboard brands
  'asrock': 'asrock.com',
  'biostar': 'biostar.com.tw',
  // Storage brands
  'samsung': 'samsung.com',
  'western digital': 'westerndigital.com',
  'crucial': 'crucial.com',
  'seagate': 'seagate.com',
  'sabrent': 'sabrent.com',
  // PSU brands
  'seasonic': 'seasonic.com',
  'thermaltake': 'thermaltake.com',
  'be quiet!': 'bequiet.com',
  // Case brands
  'nzxt': 'nzxt.com',
  'lian li': 'lian-li.com',
  'fractal design': 'fractal-design.com',
  'phanteks': 'phanteks.com',
  // Cooling brands
  'noctua': 'noctua.at',
  'deepcool': 'deepcool.com',
  'arctic': 'arctic.de',
  'cooler master': 'coolermaster.com',
  // GPU chip brands (from JSON)
  'nvidia': 'nvidia.com',
  // Additional storage brands (from JSON)
  'sk hynix': 'skhynix.com',
  'toshiba': 'toshiba.com',
  // Additional RAM brands (from JSON)
  'patriot': 'patriotmemory.com',
  'pny': 'pny.com'
};

/**
 * Gets a brand logo URL using Google's favicon service.
 * Reliable, free, no API key needed, no CORS issues.
 */
function getBrandLogoUrl(brand) {
  const key = brand.toLowerCase();
  const domain = brandDomainMap[key];
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  }
  // Fallback: try guessing the domain
  const guess = key.replace(/[^a-z0-9]/g, '') + '.com';
  return `https://www.google.com/s2/favicons?domain=${guess}&sz=128`;
}

// Populated by loadListingDropdownData() once components-dropdown.json is fetched
let listingDropdownData = null;

// Cached approved listings from server
let cachedApprovedListings = [];

// Generate dummy data — uses components-dropdown.json when loaded, falls back to componentDefs
function generateDummyListings() {
  const newListings = [];
  for (let i = 0; i < 15; i++) {
    const type = componentTypes[Math.floor(Math.random() * componentTypes.length)];
    const range = listingPriceRanges[type];
    const price = Math.round((Math.random() * (range[1] - range[0]) + range[0]) / 100) * 100;

    let brand, title, forumHash;

    if (listingDropdownData) {
      const result = buildDummyFromJson(type, listingDropdownData);
      if (result) {
        brand = result.brand;
        title = result.title;
        forumHash = buildForumHash(result.forumType, result.details);
      }
    }

    // Fallback to hardcoded componentDefs if JSON not yet loaded or build failed
    if (!brand) {
      const def = componentDefs[type];
      brand = def.brands[Math.floor(Math.random() * def.brands.length)];
      const name = def.names[Math.floor(Math.random() * def.names.length)];
      title = `${brand} ${name}`;
      const forumType = type === 'mobo' ? 'motherboard' : type;
      forumHash = `#${forumType}/${slugifySegment(brand)}/${slugifySegment(name)}`;
    }

    newListings.push({
      id: i,
      type: type,
      brand: brand,
      title: title,
      price: `₱${price}`,
      time: `${Math.floor(Math.random() * 59) + 1} mins ago`,
      image: getBrandLogoUrl(brand),
      fallbackImage: componentIconMap[type] || 'assets/images/component-images/graphic-card.png',
      forumHash: forumHash
    });
  }

  // --- MERGE WITH SERVER-FETCHED APPROVED LISTINGS ---
  cachedApprovedListings.forEach(l => {
    newListings.unshift({
      id: l._id,
      type: l.componentType,
      brand: l.details['Brand'] || l.details['Type'] || 'Generic',
      title: buildComponentTitle(l.componentType, l.details),
      price: `₱${l.price}`,
      time: 'Just now',
      image: getBrandLogoUrl(l.details['Brand'] || l.details['Type'] || 'Generic'),
      fallbackImage: componentIconMap[l.componentType] || 'assets/images/component-images/graphic-card.png',
      forumHash: buildForumHash(l.componentType, l.details)
    });
  });

  return newListings;
}

// Fetch approved listings from server
async function fetchApprovedListings() {
  try {
    const res = await fetch('/api/listings/approved');
    const data = await res.json();
    cachedApprovedListings = data.listings || [];
  } catch (err) {
    console.error('Failed to fetch approved listings:', err);
    cachedApprovedListings = [];
  }
}

// Initial Load
fetchApprovedListings().then(() => {
  listings = generateDummyListings();
  if (document.getElementById('listings-feed')) {
    renderListings(listings);
  }
});

function renderListings(items) {
  const feedContainer = document.getElementById('listings-feed');
  if (!feedContainer) return;

  feedContainer.innerHTML = '';

  items.forEach(item => {
    const fallback = item.fallbackImage || componentIconMap[item.type] || 'assets/images/component-images/graphic-card.png';
    const card = document.createElement('div');
    card.className = 'listing-card';
    if (item.forumHash) {
      card.style.cursor = 'pointer';
      card.addEventListener('click', () => {
        window.location.href = `pages/forum.html${item.forumHash}`;
      });
    }
    card.innerHTML = `
      <img src="${item.image}" class="listing-img" alt="${item.title}"
           onerror="this.onerror=null; this.src='${fallback}'; this.classList.add('listing-img-fallback');">
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
  const loader = document.querySelector('.loader');
  loader.classList.add('loading');

  fetchApprovedListings().then(() => {
    listings = generateDummyListings();
    renderListings(listings);
    loader.classList.remove('loading');
  });
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


// =========================================
// 4. Add Listing Modal Logic
// =========================================

let modalCurrentStep = 1;
let modalSelectedType = null;
let modalUploadedFiles = [];

// --- Load the JSON (same approach as dropdown-manager.js) ---
(function loadListingDropdownData() {
  document.addEventListener('DOMContentLoaded', () => {
    // Resolve path relative to this script
    const scripts = document.querySelectorAll('script[src*="dashboard"]');
    let basePath = 'data/components-dropdown.json';
    if (scripts.length) {
      const src = scripts[0].getAttribute('src');
      const base = src.substring(0, src.lastIndexOf('/'));
      basePath = base.replace(/\/?js\/?$/, '') + (base.includes('/') ? '/' : '') + 'data/components-dropdown.json';
    }

    const xhr = new XMLHttpRequest();
    xhr.open('GET', basePath, true);
    xhr.responseType = 'json';
    xhr.onload = () => {
      if (xhr.status === 200 || xhr.status === 0) {
        listingDropdownData = xhr.response ?? JSON.parse(xhr.responseText);
        console.log('Listing modal: dropdown data loaded');
        // Re-generate the listings feed now that JSON data is available
        fetchApprovedListings().then(() => {
          listings = generateDummyListings();
          if (document.getElementById('listings-feed')) renderListings(listings);
        });
      }
    };
    xhr.onerror = () => console.error('Listing modal: failed to load dropdown data');

    // --- Listing-modal-scoped dropdown helpers ---
    function lPopulate(selectEl, options, placeholder = 'Select...') {
      selectEl.innerHTML = '';
      const ph = document.createElement('option');
      ph.value = ''; ph.textContent = placeholder;
      ph.disabled = true; ph.selected = true;
      selectEl.appendChild(ph);

      options.forEach(v => {
        const o = document.createElement('option');
        o.value = v; o.textContent = v;
        selectEl.appendChild(o);
      });
      selectEl.disabled = false;
    }

    function lResetDropdown(selectEl, msg = 'Select previous option first...') {
      selectEl.innerHTML = `<option value="" disabled selected>${msg}</option>`;
      selectEl.disabled = true;
      selectEl.value = '';
    }

    function lCreateGroup(label, id, disabled = false, placeholder = 'Select...') {
      const group = document.createElement('div');
      group.className = 'listing-form-group';

      const lbl = document.createElement('label');
      lbl.textContent = label;
      lbl.setAttribute('for', id);

      const sel = document.createElement('select');
      sel.className = 'form-control';
      sel.id = id;

      if (disabled) {
        lResetDropdown(sel, `Select previous option first...`);
      } else {
        const ph = document.createElement('option');
        ph.value = ''; ph.textContent = placeholder;
        ph.disabled = true; ph.selected = true;
        sel.appendChild(ph);
      }

      group.appendChild(lbl);
      group.appendChild(sel);
      return { group, select: sel };
    }

    // --- Open / Close ---
    function openListingModal() {
      if (!currentUserData) {
        openAuthModal();
        return;
      }

      const overlay = document.getElementById('listingModalOverlay');
      if (overlay) {
        overlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        goToStep(1);
      }
    }

    // --- Auth Modal Logic ---
    function openAuthModal() {
      const overlay = document.getElementById('authModalOverlay');
      if (overlay) {
        overlay.classList.add('open');
      }
    }

    function closeAuthModal() {
      const overlay = document.getElementById('authModalOverlay');
      if (overlay) {
        overlay.classList.remove('open');
      }
    }

    // Close Auth Modal on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'authModalOverlay') {
        closeAuthModal();
      }
    });

    function closeListingModal() {
      const overlay = document.getElementById('listingModalOverlay');
      if (overlay) {
        overlay.classList.remove('open');
        document.body.style.overflow = '';
        resetListingModal();
      }
    }

    // Close on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target && e.target.id === 'listingModalOverlay') {
        closeListingModal();
      }
    });

    // --- Step Navigation ---
    function goToStep(step) {
      modalCurrentStep = step;

      // Update step containers
      document.querySelectorAll('.modal-step').forEach(el => el.classList.remove('active'));
      const stepEl = document.getElementById(`modal-step-${step}`);
      if (stepEl) stepEl.classList.add('active');

      // Update step dots
      document.querySelectorAll('.step-dot').forEach(dot => {
        const dotStep = parseInt(dot.dataset.step);
        dot.classList.remove('active', 'completed');
        if (dotStep === step) dot.classList.add('active');
        else if (dotStep < step) dot.classList.add('completed');
      });

      // Update footer buttons
      const backBtn = document.getElementById('modal-back-btn');
      const nextBtn = document.getElementById('modal-next-btn');
      const submitBtn = document.getElementById('modal-submit-btn');

      backBtn.style.display = step > 1 ? 'inline-block' : 'none';
      nextBtn.style.display = step === 2 ? 'inline-block' : 'none';
      submitBtn.style.display = step === 3 ? 'inline-block' : 'none';
    }

    function modalGoNext() {
      if (modalCurrentStep < 3) goToStep(modalCurrentStep + 1);
    }

    function modalGoBack() {
      if (modalCurrentStep > 1) goToStep(modalCurrentStep - 1);
    }

    // --- Step 1: Component Type Selection ---
    function selectComponentType(type) {
      modalSelectedType = type;

      // Highlight selected tile
      document.querySelectorAll('.type-tile').forEach(tile => tile.classList.remove('selected'));
      const selected = document.querySelector(`.type-tile[data-type="${type}"]`);
      if (selected) selected.classList.add('selected');

      // Populate Step 2 dropdowns from JSON data
      populateListingDropdowns(type);

      // Advance to Step 2
      goToStep(2);
    }

    // --- Step 2: Dynamic Dropdown Population from JSON ---
    function populateListingDropdowns(type) {
      const container = document.getElementById('listing-dropdowns');
      if (!container) return;
      container.innerHTML = '';

      if (!listingDropdownData || !listingDropdownData[type]) {
        container.innerHTML = '<p style="color:#999">Dropdown data not available.</p>';
        return;
      }

      const d = listingDropdownData[type].dropdowns;

      switch (type) {
        case 'ram': initListingRAM(container, d); break;
        case 'gpu': initListingGPU(container, d); break;
        case 'cpu': initListingCPU(container, d); break;
        case 'motherboard': initListingMotherboard(container, d); break;
        case 'storage': initListingStorage(container, d); break;
        case 'psu': initListingPSU(container, d); break;
        case 'case': initListingCase(container, d); break;
        case 'cooling': initListingCooling(container, d); break;
      }
    }

    // --- Per-component init functions (mirrors dropdown-manager.js) ---

    function initListingRAM(container, d) {
      const brand = lCreateGroup('Brand', 'listing-ram-brand');
      lPopulate(brand.select, d.brand, 'Select Brand...');
      container.appendChild(brand.group);
      const gen = lCreateGroup('Generation', 'listing-ram-gen');
      lPopulate(gen.select, d.generation, 'Select Generation...');
      container.appendChild(gen.group);
      const speed = lCreateGroup('Speed', 'listing-ram-speed', true);
      container.appendChild(speed.group);
      const cap = lCreateGroup('Capacity', 'listing-ram-cap');
      lPopulate(cap.select, d.capacity, 'Select Capacity...');
      container.appendChild(cap.group);
      gen.select.addEventListener('change', () => {
        const val = gen.select.value;
        if (val && d.speed[val]) {
          lPopulate(speed.select, d.speed[val], 'Select Speed...');
        } else {
          lResetDropdown(speed.select);
        }
      });
    }

    function initListingGPU(container, d) {
      const brand = lCreateGroup('Brand', 'listing-gpu-brand');
      lPopulate(brand.select, d.brand, 'Select Brand...');
      container.appendChild(brand.group);
      const series = lCreateGroup('Series', 'listing-gpu-series', true);
      container.appendChild(series.group);
      const model = lCreateGroup('Model', 'listing-gpu-model', true);
      container.appendChild(model.group);
      brand.select.addEventListener('change', () => {
        lResetDropdown(model.select);
        const val = brand.select.value;
        if (val && d.series[val]) {
          lPopulate(series.select, d.series[val], 'Select Series...');
        } else {
          lResetDropdown(series.select);
        }
      });
      series.select.addEventListener('change', () => {
        const val = series.select.value;
        if (val && d.models[val]) {
          lPopulate(model.select, d.models[val], 'Select Model...');
        } else {
          lResetDropdown(model.select);
        }
      });
    }

    function initListingCPU(container, d) {
      const brand = lCreateGroup('Brand', 'listing-cpu-brand');
      lPopulate(brand.select, d.brand, 'Select Brand...');
      container.appendChild(brand.group);
      const tier = lCreateGroup('Performance Tier', 'listing-cpu-tier', true);
      container.appendChild(tier.group);
      const gen = lCreateGroup('Generation', 'listing-cpu-gen', true);
      container.appendChild(gen.group);
      const model = lCreateGroup('Specific Model', 'listing-cpu-model', true);
      container.appendChild(model.group);
      brand.select.addEventListener('change', () => {
        lResetDropdown(gen.select);
        lResetDropdown(model.select);
        const val = brand.select.value;
        if (val && d.tier[val]) {
          lPopulate(tier.select, d.tier[val], 'Select Tier...');
        } else {
          lResetDropdown(tier.select);
        }
      });
      tier.select.addEventListener('change', () => {
        lResetDropdown(model.select);
        const tierVal = tier.select.value;
        const base = tierVal.replace(/\s*\(.*\)/, '');
        if (base && d.generation[base]) {
          lPopulate(gen.select, d.generation[base], 'Select Generation...');
        } else {
          lResetDropdown(gen.select);
        }
      });
      gen.select.addEventListener('change', () => {
        const tierVal = tier.select.value;
        const base = tierVal.replace(/\s*\(.*\)/, '');
        const genVal = gen.select.value;
        const key = `${base}-${genVal}`;
        if (key && d.models[key]) {
          lPopulate(model.select, d.models[key], 'Select Model...');
        } else {
          lResetDropdown(model.select);
        }
      });
    }

    function initListingMotherboard(container, d) {
      const brand = lCreateGroup('Brand', 'listing-mobo-brand');
      lPopulate(brand.select, d.brand, 'Select Brand...');
      container.appendChild(brand.group);
      const socket = lCreateGroup('Socket Type', 'listing-mobo-socket');
      lPopulate(socket.select, d.socket_type, 'Select Socket...');
      container.appendChild(socket.group);
      const chipset = lCreateGroup('Chipset', 'listing-mobo-chipset', true);
      container.appendChild(chipset.group);
      const ff = lCreateGroup('Form Factor', 'listing-mobo-ff');
      lPopulate(ff.select, d.form_factor, 'Select Form Factor...');
      container.appendChild(ff.group);
      socket.select.addEventListener('change', () => {
        const val = socket.select.value;
        if (val && d.chipset[val]) {
          lPopulate(chipset.select, d.chipset[val], 'Select Chipset...');
        } else {
          lResetDropdown(chipset.select);
        }
      });
    }

    function initListingStorage(container, d) {
      const brand = lCreateGroup('Brand', 'listing-stor-brand');
      lPopulate(brand.select, d.brand, 'Select Brand...');
      container.appendChild(brand.group);
      const type = lCreateGroup('Type', 'listing-stor-type');
      lPopulate(type.select, d.type, 'Select Type...');
      container.appendChild(type.group);
      const iface = lCreateGroup('Interface', 'listing-stor-iface', true);
      container.appendChild(iface.group);
      const cap = lCreateGroup('Capacity', 'listing-stor-cap');
      lPopulate(cap.select, d.capacity, 'Select Capacity...');
      container.appendChild(cap.group);
      type.select.addEventListener('change', () => {
        const val = type.select.value;
        if (val && d.interface[val]) {
          lPopulate(iface.select, d.interface[val], 'Select Interface...');
        } else {
          lResetDropdown(iface.select);
        }
      });
    }

    function initListingPSU(container, d) {
      const brand = lCreateGroup('Brand', 'listing-psu-brand');
      lPopulate(brand.select, d.brand, 'Select Brand...');
      container.appendChild(brand.group);
      const watt = lCreateGroup('Wattage', 'listing-psu-watt');
      lPopulate(watt.select, d.wattage, 'Select Wattage...');
      container.appendChild(watt.group);
      const eff = lCreateGroup('Efficiency Rating', 'listing-psu-eff');
      lPopulate(eff.select, d.efficiency_rating, 'Select Efficiency...');
      container.appendChild(eff.group);
      const mod = lCreateGroup('Modularity', 'listing-psu-mod');
      lPopulate(mod.select, d.modularity, 'Select Modularity...');
      container.appendChild(mod.group);
    }

    function initListingCase(container, d) {
      const brand = lCreateGroup('Brand (Optional)', 'listing-case-brand');
      lPopulate(brand.select, d.brand, 'All Brands (Optional)');
      container.appendChild(brand.group);
      const ff = lCreateGroup('Form Factor', 'listing-case-ff');
      lPopulate(ff.select, d.form_factor, 'Select Form Factor...');
      container.appendChild(ff.group);
      const panel = lCreateGroup('Side Panel', 'listing-case-panel');
      lPopulate(panel.select, d.side_panel, 'Select Side Panel...');
      container.appendChild(panel.group);
    }

    function initListingCooling(container, d) {
      const brand = lCreateGroup('Brand', 'listing-cool-brand');
      lPopulate(brand.select, d.brand, 'Select Brand...');
      container.appendChild(brand.group);
      const type = lCreateGroup('Type', 'listing-cool-type');
      lPopulate(type.select, d.type, 'Select Type...');
      container.appendChild(type.group);
      const compat = lCreateGroup('Socket Compatibility', 'listing-cool-socket');
      lPopulate(compat.select, d.socket_compatibility, 'Select Compatibility...');
      container.appendChild(compat.group);
    }

    // --- Step 3: Image Upload ---
    (function initImageUpload() {
      document.addEventListener('DOMContentLoaded', () => {
        const zone = document.getElementById('imageUploadZone');
        const input = document.getElementById('listing-images');
        if (!zone || !input) return;

        // Drag events
        zone.addEventListener('dragover', (e) => {
          e.preventDefault();
          zone.classList.add('drag-over');
        });
        zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
        zone.addEventListener('drop', (e) => {
          e.preventDefault();
          zone.classList.remove('drag-over');
          handleImageFiles(e.dataTransfer.files);
        });

        // File input change
        input.addEventListener('change', () => {
          handleImageFiles(input.files);
          input.value = ''; // Reset so same file can be re-selected
        });
      });
    })();

    function handleImageFiles(fileList) {
      const maxImages = 5;
      const files = Array.from(fileList).filter(f => f.type.startsWith('image/'));

      files.forEach(file => {
        if (modalUploadedFiles.length >= maxImages) return;
        modalUploadedFiles.push(file);
      });

      renderImagePreviews();
    }

    function renderImagePreviews() {
      const row = document.getElementById('imagePreviewRow');
      if (!row) return;
      row.innerHTML = '';

      modalUploadedFiles.forEach((file, index) => {
        const thumb = document.createElement('div');
        thumb.className = 'image-preview-thumb';

        const img = document.createElement('img');
        const reader = new FileReader();
        reader.onload = (e) => { img.src = e.target.result; };
        reader.readAsDataURL(file);

        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-img';
        removeBtn.textContent = '×';
        removeBtn.onclick = () => {
          modalUploadedFiles.splice(index, 1);
          renderImagePreviews();
        };

        thumb.appendChild(img);
        thumb.appendChild(removeBtn);
        row.appendChild(thumb);
      });
    }

    // --- Submit Listing ---
    async function submitListing() {
      // Gather all form data
      const formData = {
        componentType: modalSelectedType,
        details: {},
        transactionType: document.getElementById('listing-txn-type')?.value || '',
        price: document.getElementById('listing-price')?.value || '',
        images: modalUploadedFiles.map(f => f.name),
        comments: document.getElementById('listing-comments')?.value || ''
      };

      // Gather all dropdown values from the listing-dropdowns container
      const dropdownContainer = document.getElementById('listing-dropdowns');
      if (dropdownContainer) {
        dropdownContainer.querySelectorAll('select').forEach(sel => {
          const label = sel.closest('.listing-form-group')?.querySelector('label')?.textContent;
          if (label && sel.value) formData.details[label] = sel.value;
        });
      }

      // Add metadata from session
      const userName = currentUserData ? `${currentUserData.firstName} ${currentUserData.lastName || ''}`.trim() : 'Guest';

      formData.user = userName;
      formData.ownerEmail = currentUserData ? currentUserData.email : '';

      try {
        const res = await fetch('/api/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const data = await res.json();

        if (res.ok) {
          console.log('📋 New Listing Submitted (Pending Approval):', data.listing);
          closeListingModal();
          showListingToast('✅ Listing submitted successfully!');
        } else {
          alert(data.error || 'Failed to submit listing.');
        }
      } catch (err) {
        console.error('Submit listing error:', err);
        alert('An error occurred while submitting the listing.');
      }
    }

    // --- Toast ---
    function showListingToast(message) {
      let toast = document.querySelector('.listing-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.className = 'listing-toast';
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.classList.remove('show');
      void toast.offsetWidth;
      toast.classList.add('show');

      setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // --- Reset Modal ---
    function resetListingModal() {
      modalCurrentStep = 1;
      modalSelectedType = null;
      modalUploadedFiles = [];

      document.querySelectorAll('.type-tile').forEach(tile => tile.classList.remove('selected'));

      const ddContainer = document.getElementById('listing-dropdowns');
      if (ddContainer) ddContainer.innerHTML = '';

      const txnType = document.getElementById('listing-txn-type');
      if (txnType) txnType.selectedIndex = 0;

      const price = document.getElementById('listing-price');
      if (price) price.value = '';

      const comments = document.getElementById('listing-comments');
      if (comments) comments.value = '';

      const previewRow = document.getElementById('imagePreviewRow');
      if (previewRow) previewRow.innerHTML = '';

      goToStep(1);
    }

    // Expose modal functions to global scope for onclick handlers
    window.openListingModal = openListingModal;
    window.closeListingModal = closeListingModal;
    window.selectComponentType = selectComponentType;
    window.modalGoBack = modalGoBack;
    window.modalGoNext = modalGoNext;
    window.submitListing = submitListing;
    window.closeAuthModal = closeAuthModal;

    xhr.send();
  });
})();

// =========================================
// Component Tab Switching Logic
// =========================================
function setupComponentTabs() {
  const navItems = document.querySelectorAll('.nav-item');
  const componentCards = document.querySelectorAll('.component-card');

  if (navItems.length === 0) {
    console.warn('No .nav-item elements found.');
    return;
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');
      const target = item.getAttribute('data-target');
      if (!target) {
        console.warn('Nav item has no data-target:', item);
        return;
      }
      componentCards.forEach(card => card.classList.remove('active'));
      const targetCard = document.querySelector(`.component-card[data-component="${target}"]`);
      if (targetCard) {
        targetCard.classList.add('active');
      } else {
        console.warn(`No component card found for target: ${target}`);
      }
    });
  });

  console.log('Component tabs initialized successfully.');
}

// Ensure it runs when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupComponentTabs);
} else {
  setupComponentTabs();
}

// =========================================
// Hero Carousel Logic (Seamless Loop)
// =========================================
document.addEventListener('DOMContentLoaded', () => {
  const track = document.querySelector('.carousel-track');
  if (!track) return;

  const originalSlides = Array.from(track.children);
  const nextButton = document.querySelector('.next-btn');
  const prevButton = document.querySelector('.prev-btn');
  const dotsNav = document.querySelector('.carousel-nav');
  const dots = Array.from(dotsNav?.children ?? []);

  const firstClone = originalSlides[0].cloneNode(true);
  const lastClone = originalSlides[originalSlides.length - 1].cloneNode(true);

  track.appendChild(firstClone);
  track.insertBefore(lastClone, originalSlides[0]);

  const allSlides = Array.from(track.children);
  let currentIndex = 1;
  let isTransitioning = false;

  track.style.transform = `translateX(${-100 * currentIndex}%)`;

  const updateDots = (index) => {
    let dotIndex = index - 1;
    if (dotIndex < 0) dotIndex = dots.length - 1;
    if (dotIndex >= dots.length) dotIndex = 0;
    dots.forEach(dot => dot.classList.remove('current-slide'));
    if (dots[dotIndex]) dots[dotIndex].classList.add('current-slide');
  };

  const moveToSlide = (index) => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex = index;
    track.style.transition = 'transform 0.4s ease-in-out';
    track.style.transform = `translateX(${-100 * currentIndex}%)`;
    updateDots(currentIndex);
  };

  track.addEventListener('transitionend', () => {
    isTransitioning = false;
    if (allSlides[currentIndex] === firstClone) {
      track.style.transition = 'none';
      currentIndex = 1;
      track.style.transform = `translateX(${-100 * currentIndex}%)`;
    }
    if (allSlides[currentIndex] === lastClone) {
      track.style.transition = 'none';
      currentIndex = allSlides.length - 2;
      track.style.transform = `translateX(${-100 * currentIndex}%)`;
    }
  });

  nextButton?.addEventListener('click', () => {
    if (currentIndex >= allSlides.length - 1) return;
    moveToSlide(currentIndex + 1);
  });

  prevButton?.addEventListener('click', () => {
    if (currentIndex <= 0) return;
    moveToSlide(currentIndex - 1);
  });

  dotsNav?.addEventListener('click', (e) => {
    const targetDot = e.target.closest('button');
    if (!targetDot) return;
    const targetDotIndex = dots.findIndex(dot => dot === targetDot);
    if (targetDotIndex !== -1) moveToSlide(targetDotIndex + 1);
  });
});

// --- Ticker card click: navigate to forum page ---
document.getElementById('market-ticker')?.addEventListener('click', (e) => {
  const card = e.target.closest('.ticker-card');
  if (card?.dataset.href) {
    window.location.href = card.dataset.href;
  }
});
