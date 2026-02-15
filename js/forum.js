/**
 * Forum Page — Reads URL hash to determine which component model page
 * to render. Uses components-dropdown.json for validation and related models.
 *
 * Hash format: #<componentType>/<segment1>/<segment2>/...
 * Example:     #gpu/NVIDIA/RTX-4000/RTX-4090
 */

// --- Component icon map (matches dashboard) ---
const componentIcons = {
    ram: '../assets/images/component-images/ram.png',
    gpu: '../assets/images/component-images/graphic-card.png',
    cpu: '../assets/images/component-images/cpu.png',
    motherboard: '../assets/images/component-images/motherboard.png',
    storage: '../assets/images/component-images/hard-drive.png',
    psu: '../assets/images/component-images/power-supply.png',
    case: '../assets/images/component-images/case.png',
    cooling: '../assets/images/component-images/computer.png'
};

const componentLabels = {
    ram: 'RAM / Memory',
    gpu: 'Graphics Card (GPU)',
    cpu: 'Processor (CPU)',
    motherboard: 'Motherboard',
    storage: 'Storage (SSD/HDD)',
    psu: 'Power Supply (PSU)',
    case: 'PC Case',
    cooling: 'Cooling System'
};

// --- Slug helpers ---
function slugify(str) {
    return str.replace(/\s+/g, '-');
}

function deslugify(str) {
    return str.replace(/-/g, ' ');
}

// --- Parse hash ---
function parseForumHash() {
    const hash = location.hash.replace(/^#\/?/, '');
    if (!hash) return null;

    const parts = hash.split('/');
    const componentType = parts[0];
    const segments = parts.slice(1).map(deslugify);

    return { componentType, segments };
}

// --- State ---
let dropdownData = null;
let submissions = [];
let currentSort = 'recent';

// --- Random data helpers for dummy submissions ---
const dummyUsers = [
    'techguy_ph', 'build_master', 'pcmart_deals', 'silicon_sam',
    'overclocked99', 'budgetpc_mnl', 'rig_builder', 'component_hunter',
    'upgrade_king', 'bargain_chip', 'gpu_flipper', 'ram_dealer'
];

const dummyComments = [
    'Barely used, like new condition. No issues at all.',
    'Upgraded to a newer model. This one still runs great.',
    'Bought last year, selling because I switched platforms.',
    'Brand new sealed in box, receipt available.',
    'Used for about 6 months. Still under warranty until 2026.',
    'Great condition, never overclocked. Comes with original box.',
    'Price is firm. Meet-up in Makati or GH.',
    'Selling to fund a new build. Works perfectly.',
    'RFS: Upgraded. No defects. Can test before buying.',
    'Price is slightly negotiable for serious buyers.'
];

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomPrice(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Component price ranges (in PHP pesos)
const priceRanges = {
    ram: [1500, 8000],
    gpu: [8000, 95000],
    cpu: [3000, 40000],
    motherboard: [3000, 25000],
    storage: [1000, 12000],
    psu: [2000, 12000],
    case: [2000, 15000],
    cooling: [500, 10000]
};

// --- Generate dummy submissions ---
function generateDummySubmissions(componentType, modelName, count = 8) {
    const range = priceRanges[componentType] || [1000, 20000];
    const subs = [];

    for (let i = 0; i < count; i++) {
        const price = randomPrice(range[0], range[1]);
        const txnType = Math.random() > 0.5 ? 'sold' : 'bought';
        const mins = randomPrice(5, 1440 * 7); // up to a week ago
        let timeStr;
        if (mins < 60) timeStr = `${mins} mins ago`;
        else if (mins < 1440) timeStr = `${Math.floor(mins / 60)} hours ago`;
        else timeStr = `${Math.floor(mins / 1440)} days ago`;

        const imgCount = Math.floor(Math.random() * 4); // 0 to 3 images
        const images = [];
        for (let j = 0; j < imgCount; j++) {
            images.push(`https://via.placeholder.com/240x180?text=${slugify(modelName)}+${j + 1}`);
        }

        subs.push({
            id: i,
            user: randomFrom(dummyUsers),
            txnType,
            price,
            images,
            comment: randomFrom(dummyComments),
            timeStr,
            minsAgo: mins
        });
    }

    // Sort by most recent by default
    subs.sort((a, b) => a.minsAgo - b.minsAgo);
    return subs;
}

// --- Render submissions ---
function renderSubmissions(subs) {
    const feed = document.getElementById('submissions-feed');
    if (!feed) return;
    feed.innerHTML = '';

    if (!subs.length) {
        feed.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📭</div>
        <h3>No listings yet</h3>
        <p>Be the first to submit a listing for this component!</p>
      </div>
    `;
        return;
    }

    subs.forEach(sub => {
        const initials = sub.user.substring(0, 2).toUpperCase();
        const priceFormatted = '₱' + sub.price.toLocaleString();

        const imagesHTML = sub.images.length
            ? `<div class="submission-images">${sub.images.map(src => `<img src="${src}" alt="Listing image">`).join('')}</div>`
            : '<div class="no-images">No images provided</div>';

        const card = document.createElement('div');
        card.className = 'submission-card';
        card.innerHTML = `
      <div class="submission-header">
        <div class="user-avatar">${initials}</div>
        <div class="user-info">
          <div class="user-name">${sub.user}</div>
          <div class="submission-time">${sub.timeStr}</div>
        </div>
        <span class="txn-badge ${sub.txnType}">${sub.txnType}</span>
      </div>
      <div class="submission-price">${priceFormatted}</div>
      ${imagesHTML}
      <div class="submission-comment">${sub.comment}</div>
    `;
        feed.appendChild(card);
    });
}

// --- Sort ---
function sortSubmissions(sortType) {
    currentSort = sortType;

    // Update active button
    document.querySelectorAll('.sort-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.sort === sortType);
    });

    let sorted = [...submissions];
    switch (sortType) {
        case 'recent':
            sorted.sort((a, b) => a.minsAgo - b.minsAgo);
            break;
        case 'low-price':
            sorted.sort((a, b) => a.price - b.price);
            break;
        case 'high-price':
            sorted.sort((a, b) => b.price - a.price);
            break;
    }

    renderSubmissions(sorted);
}

// --- Update sidebar stats ---
function updateSidebarStats(subs) {
    if (!subs.length) return;

    const prices = subs.map(s => s.price);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const low = Math.min(...prices);
    const high = Math.max(...prices);

    document.getElementById('stat-avg-price').textContent = '₱' + avg.toLocaleString();
    document.getElementById('stat-low-price').textContent = '₱' + low.toLocaleString();
    document.getElementById('stat-high-price').textContent = '₱' + high.toLocaleString();
    document.getElementById('stat-total').textContent = subs.length;
}

// --- Render related models ---
function renderRelatedModels(componentType, segments) {
    const list = document.getElementById('related-list');
    if (!list || !dropdownData) return;

    const d = dropdownData[componentType]?.dropdowns;
    if (!d) return;

    let relatedItems = [];
    let currentModel = segments[segments.length - 1];

    // Try to find sibling models based on the component type
    switch (componentType) {
        case 'gpu': {
            // segments: [brand, series, model]
            const series = segments[1]; // e.g. "RTX 4000"
            relatedItems = d.models?.[series] || [];
            break;
        }
        case 'cpu': {
            // segments: [brand, tier, gen, model]
            const base = segments[1]?.replace(/\s*\(.*\)/, '');
            const gen = segments[2];
            const key = `${base}-${gen}`;
            relatedItems = d.models?.[key] || [];
            break;
        }
        case 'ram': {
            // segments: [brand, generation, speed, capacity] — show other speeds
            if (segments[0] === 'all brands') {
                // Show brand list when no specific brand selected
                relatedItems = d.brand || [];
                currentModel = '';
            } else {
                const gen = segments[1];
                relatedItems = d.speed?.[gen] || [];
                currentModel = segments[2];
            }
            break;
        }
        case 'motherboard': {
            // segments: [brand, socket, chipset, formfactor] — show other chipsets
            if (segments[0] === 'all brands') {
                relatedItems = d.brand || [];
                currentModel = '';
            } else {
                const socket = segments[1];
                relatedItems = d.chipset?.[socket] || [];
                currentModel = segments[2];
            }
            break;
        }
        case 'storage': {
            // segments: [brand, type, interface, capacity] — show other interfaces
            if (segments[0] === 'all brands') {
                relatedItems = d.brand || [];
                currentModel = '';
            } else {
                const type = segments[1];
                relatedItems = d.interface?.[type] || [];
                currentModel = segments[2];
            }
            break;
        }
        case 'psu': {
            // segments: [brand, wattage, efficiency, modularity] — show other brands
            relatedItems = d.brand || [];
            currentModel = segments[0] === 'all brands' ? '' : segments[0];
            break;
        }
        case 'cooling': {
            // segments: [brand, type, compatibility] — show other brands
            relatedItems = d.brand || [];
            currentModel = segments[0] === 'all brands' ? '' : segments[0];
            break;
        }
        default:
            // For case — no brand yet, just show top-level options
            const firstKey = Object.keys(d)[0];
            if (Array.isArray(d[firstKey])) {
                relatedItems = d[firstKey];
                currentModel = segments[0];
            }
    }

    list.innerHTML = '';
    relatedItems.forEach(item => {
        const a = document.createElement('a');
        a.className = 'related-link' + (item === currentModel ? ' current' : '');
        a.textContent = item;

        // Build the hash link for the related model
        const newSegments = [...segments];
        const isAllBrands = segments[0] === 'all brands';
        // Replace the segment that corresponds to this level
        if (componentType === 'gpu' && segments.length >= 3) {
            newSegments[2] = item;
        } else if (componentType === 'cpu' && segments.length >= 4) {
            newSegments[3] = item;
        } else if ((componentType === 'ram' || componentType === 'motherboard' || componentType === 'storage') && isAllBrands) {
            newSegments[0] = item; // replace 'all brands' with specific brand
        } else if (componentType === 'ram' && segments.length >= 3) {
            newSegments[2] = item; // replace speed segment
        } else if (componentType === 'motherboard' && segments.length >= 3) {
            newSegments[2] = item; // replace chipset segment
        } else if (componentType === 'storage' && segments.length >= 3) {
            newSegments[2] = item; // replace interface segment
        } else if (componentType === 'psu' || componentType === 'cooling') {
            newSegments[0] = item; // replace brand segment
        } else if (segments.length >= 2) {
            newSegments[newSegments.length - 1] = item;
        } else {
            newSegments[0] = item;
        }
        a.href = `#${componentType}/${newSegments.map(slugify).join('/')}`;

        list.appendChild(a);
    });
}

// --- Render breadcrumb ---
function renderBreadcrumb(componentType, segments) {
    const bar = document.getElementById('breadcrumb-bar');
    if (!bar) return;

    bar.innerHTML = '<a href="../index.html">Home</a>';

    const label = componentLabels[componentType] || componentType;

    // Component type breadcrumb
    const sep1 = document.createElement('span');
    sep1.className = 'breadcrumb-sep';
    sep1.textContent = '›';
    bar.appendChild(sep1);

    const typeLink = document.createElement('a');
    typeLink.href = '../index.html';
    typeLink.textContent = label;
    bar.appendChild(typeLink);

    // Each segment
    segments.forEach((seg, i) => {
        const sep = document.createElement('span');
        sep.className = 'breadcrumb-sep';
        sep.textContent = '›';
        bar.appendChild(sep);

        const displaySeg = seg === 'all brands' ? 'All Brands' : seg;

        if (i === segments.length - 1) {
            // Last segment — not a link
            const span = document.createElement('span');
            span.className = 'breadcrumb-current';
            span.textContent = displaySeg;
            bar.appendChild(span);
        } else {
            // Intermediate segments — links to partial hash
            const partialHash = `#${componentType}/${segments.slice(0, i + 1).map(slugify).join('/')}`;
            const a = document.createElement('a');
            a.href = partialHash;
            a.textContent = displaySeg;
            bar.appendChild(a);
        }
    });
}

// --- Main: Load the forum page ---
function loadForumPage() {
    const parsed = parseForumHash();
    if (!parsed || !parsed.segments.length) {
        showErrorState();
        return;
    }

    const { componentType, segments } = parsed;
    const modelName = segments[segments.length - 1]; // last segment is the model
    const isAllBrands = segments[0] === 'all brands';

    // Set page title
    document.title = `${modelName} - PC Tracker`;

    // Render breadcrumb
    renderBreadcrumb(componentType, segments);

    // Set forum icon
    const iconEl = document.getElementById('forum-icon');
    if (iconEl && componentIcons[componentType]) {
        iconEl.innerHTML = `<img src="${componentIcons[componentType]}" alt="${componentType}">`;
    }

    // Set forum title
    document.getElementById('forum-title').textContent = modelName;

    // Build subtitle from the path — replace 'all brands' with 'All Brands' for display
    const subtitleParts = [componentLabels[componentType] || componentType, ...segments.slice(0, -1)];
    const displayParts = subtitleParts.map(p => p === 'all brands' ? 'All Brands' : p);
    document.getElementById('forum-subtitle').textContent = displayParts.join(' › ');

    // Generate and render submissions
    submissions = generateDummySubmissions(componentType, modelName);
    renderSubmissions(submissions);
    updateSidebarStats(submissions);

    // Render related models (needs JSON data)
    if (dropdownData) {
        renderRelatedModels(componentType, segments);
    }
}

function showErrorState() {
    const feed = document.getElementById('submissions-feed');
    if (feed) {
        feed.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <h3>Invalid component URL</h3>
        <p>Please navigate here from the <a href="../index.html">dashboard</a> by selecting a component and clicking "Find Prices".</p>
      </div>
    `;
    }
    document.getElementById('forum-title').textContent = 'Page Not Found';
}

// --- Load JSON and init ---
function loadDropdownJSON() {
    return new Promise((resolve) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', '../data/components-dropdown.json', true);
        xhr.responseType = 'json';
        xhr.onload = () => {
            if (xhr.status === 200 || xhr.status === 0) {
                dropdownData = xhr.response ?? JSON.parse(xhr.responseText);
                resolve(dropdownData);
            } else {
                resolve(null);
            }
        };
        xhr.onerror = () => resolve(null);
        xhr.send();
    });
}

// --- Bootstrap ---
document.addEventListener('DOMContentLoaded', async () => {
    await loadDropdownJSON();
    loadForumPage();
});

// Re-render on hash change (for related model clicks)
window.addEventListener('hashchange', () => {
    loadForumPage();
    window.scrollTo(0, 0);
});
