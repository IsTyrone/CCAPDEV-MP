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


// =========================================
// 4. Add Listing Modal Logic
// =========================================

let modalCurrentStep = 1;
let modalSelectedType = null;
let modalUploadedFiles = [];

// Dropdown data loaded from components-dropdown.json
let listingDropdownData = null;

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
      }
    };
    xhr.onerror = () => console.error('Listing modal: failed to load dropdown data');
    xhr.send();
  });
})();

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
  const overlay = document.getElementById('listingModalOverlay');
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    goToStep(1);
  }
}

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
  // Generation (independent)
  const gen = lCreateGroup('Generation', 'listing-ram-gen');
  lPopulate(gen.select, d.generation, 'Select Generation...');
  container.appendChild(gen.group);

  // Speed (cascading: depends on Generation)
  const speed = lCreateGroup('Speed', 'listing-ram-speed', true);
  container.appendChild(speed.group);

  // Capacity (independent)
  const cap = lCreateGroup('Capacity', 'listing-ram-cap');
  lPopulate(cap.select, d.capacity, 'Select Capacity...');
  container.appendChild(cap.group);

  // Cascade: Generation → Speed
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

  // Brand → Series
  brand.select.addEventListener('change', () => {
    lResetDropdown(model.select);
    const val = brand.select.value;
    if (val && d.series[val]) {
      lPopulate(series.select, d.series[val], 'Select Series...');
    } else {
      lResetDropdown(series.select);
    }
  });

  // Series → Model
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

  // Brand → Tier
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

  // Tier → Generation  (key = base name before parenthetical, e.g. "Core i5")
  tier.select.addEventListener('change', () => {
    lResetDropdown(model.select);
    const tierVal = tier.select.value;
    const base = tierVal.replace(/\s*\(.*\)/, '');  // "Core i5 (Mainstream)" → "Core i5"
    if (base && d.generation[base]) {
      lPopulate(gen.select, d.generation[base], 'Select Generation...');
    } else {
      lResetDropdown(gen.select);
    }
  });

  // Generation → Model  (key = "baseTier-generation", e.g. "Core i5-12th Gen")
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
  const socket = lCreateGroup('Socket Type', 'listing-mobo-socket');
  lPopulate(socket.select, d.socket_type, 'Select Socket...');
  container.appendChild(socket.group);

  const chipset = lCreateGroup('Chipset', 'listing-mobo-chipset', true);
  container.appendChild(chipset.group);

  const ff = lCreateGroup('Form Factor', 'listing-mobo-ff');
  lPopulate(ff.select, d.form_factor, 'Select Form Factor...');
  container.appendChild(ff.group);

  // Socket → Chipset
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
  const type = lCreateGroup('Type', 'listing-stor-type');
  lPopulate(type.select, d.type, 'Select Type...');
  container.appendChild(type.group);

  const iface = lCreateGroup('Interface', 'listing-stor-iface', true);
  container.appendChild(iface.group);

  const cap = lCreateGroup('Capacity', 'listing-stor-cap');
  lPopulate(cap.select, d.capacity, 'Select Capacity...');
  container.appendChild(cap.group);

  // Type → Interface
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
  const ff = lCreateGroup('Form Factor', 'listing-case-ff');
  lPopulate(ff.select, d.form_factor, 'Select Form Factor...');
  container.appendChild(ff.group);

  const panel = lCreateGroup('Side Panel', 'listing-case-panel');
  lPopulate(panel.select, d.side_panel, 'Select Side Panel...');
  container.appendChild(panel.group);
}

function initListingCooling(container, d) {
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
function submitListing() {
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

  console.log('📋 New Listing Submitted:', formData);

  // Close modal & show toast
  closeListingModal();
  showListingToast('✅ Listing submitted successfully!');
}

// --- Toast ---
function showListingToast(message) {
  // Create toast if it doesn't exist
  let toast = document.querySelector('.listing-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'listing-toast';
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  // Trigger reflow for animation restart
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

  // Reset tile selection
  document.querySelectorAll('.type-tile').forEach(tile => tile.classList.remove('selected'));

  // Clear dynamic dropdowns
  const ddContainer = document.getElementById('listing-dropdowns');
  if (ddContainer) ddContainer.innerHTML = '';

  // Reset fixed form fields
  const txnType = document.getElementById('listing-txn-type');
  if (txnType) txnType.selectedIndex = 0;

  const price = document.getElementById('listing-price');
  if (price) price.value = '';

  const comments = document.getElementById('listing-comments');
  if (comments) comments.value = '';

  // Clear image previews
  const previewRow = document.getElementById('imagePreviewRow');
  if (previewRow) previewRow.innerHTML = '';

  // Reset step UI
  goToStep(1);
}
