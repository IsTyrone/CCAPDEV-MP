/**
 * DropdownManager — loads components-dropdown.json and wires up every
 * dropdown in the component-cards section, including cascading
 * parent→child relationships (GPU brand→series→model, CPU brand→tier→gen→model, etc.)
 */
class DropdownManager {
    constructor() {
        this.data = null;
    }

    /* ─── helpers ───────────────────────────────────────────────── */

    /** Fill a <select> with an array of string options. */
    populate(selectId, options, placeholder = 'Select...') {
        const select = document.getElementById(selectId);
        if (!select) { console.warn(`#${selectId} not found`); return; }

        select.innerHTML = '';
        const ph = document.createElement('option');
        ph.value = '';
        ph.textContent = placeholder;
        ph.disabled = true;
        ph.selected = true;
        select.appendChild(ph);

        options.forEach(v => {
            const o = document.createElement('option');
            o.value = v;
            o.textContent = v;
            select.appendChild(o);
        });

        select.disabled = false;
    }

    /** Disable a <select> and show a placeholder message. */
    resetDropdown(selectId, msg = 'Select previous option first...') {
        const select = document.getElementById(selectId);
        if (!select) return;
        select.innerHTML = `<option value="" disabled selected>${msg}</option>`;
        select.disabled = true;
        select.value = '';
        select.dispatchEvent(new Event('change'));   // cascade-reset children
    }

    /**
     * Wire parent → child: when parent changes, call getOptions(parentValue)
     * and populate the child.  Also accepts an array of grandchild IDs to reset.
     */
    setupCascading(parentId, childId, getOptions, grandchildren = []) {
        const parent = document.getElementById(parentId);
        if (!parent) return;

        parent.addEventListener('change', () => {
            const val = parent.value;
            // reset all downstream first
            grandchildren.forEach(id => this.resetDropdown(id));

            if (!val) { this.resetDropdown(childId); return; }
            const opts = getOptions(val);
            if (opts && opts.length) {
                this.populate(childId, opts, 'Select...');
            } else {
                this.resetDropdown(childId);
            }
        });
    }

    /* ─── data loading helpers ─────────────────────────────────── */

    /**
     * Resolve the JSON path relative to the HTML page.
     * Works whether the page is at the root or in a subdirectory.
     */
    _jsonPath() {
        // Determine base path from the current script tag location
        const scripts = document.querySelectorAll('script[src*="dropdown-manager"]');
        if (scripts.length) {
            const src = scripts[0].getAttribute('src');          // e.g. "js/dropdown-manager.js" or "../js/dropdown-manager.js"
            const base = src.substring(0, src.lastIndexOf('/'));  // "js" or "../js"
            // Go one level up from the js/ folder to reach the project root
            return base.replace(/\/?js\/?$/, '') + (base.includes('/') ? '/' : '') + 'data/components-dropdown.json';
        }
        return 'data/components-dropdown.json';
    }

    /**
     * Load JSON using XMLHttpRequest (works with file:// protocol).
     */
    _loadViaXHR(url) {
        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'json';
            xhr.onload = () => {
                if (xhr.status === 200 || xhr.status === 0) {   // status 0 is normal for file://
                    resolve(xhr.response ?? JSON.parse(xhr.responseText));
                } else {
                    reject(new Error(`XHR failed: HTTP ${xhr.status}`));
                }
            };
            xhr.onerror = () => reject(new Error('XHR network error'));
            xhr.send();
        });
    }

    /* ─── main entry ────────────────────────────────────────────── */

    async initialize() {
        const jsonUrl = this._jsonPath();

        try {
            // Try fetch first (works on http:// / https://)
            if (window.location.protocol !== 'file:' && typeof fetch === 'function') {
                const res = await fetch(jsonUrl);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                this.data = await res.json();
            } else {
                // Fallback for file:// protocol — use XMLHttpRequest
                this.data = await this._loadViaXHR(jsonUrl);
            }

            this.initRAM();
            this.initGPU();
            this.initCPU();
            this.initMotherboard();
            this.initStorage();
            this.initPSU();
            this.initCase();
            this.initCooling();

            console.log('DropdownManager: all dropdowns initialised');
        } catch (err) {
            console.error('DropdownManager init failed:', err);
            const sec = document.querySelector('.components-section');
            if (sec) sec.insertAdjacentHTML('afterbegin',
                '<div style="background:#f8d7da;color:#721c24;padding:12px 20px;border-radius:4px;margin-bottom:16px;border:1px solid #f5c6cb"><strong>Error:</strong> Failed to load component data. Please refresh.</div>');
        }
    }

    /* ─── per-component init ────────────────────────────────────── */

    initRAM() {
        const d = this.data.ram.dropdowns;
        this.populate('ram-generation', d.generation, 'Select Generation...');
        this.populate('ram-capacity', d.capacity, 'Select Capacity...');

        // Generation → Speed (cascading)
        this.setupCascading('ram-generation', 'ram-speed', gen => d.speed[gen] || []);
    }

    initGPU() {
        const d = this.data.gpu.dropdowns;
        this.populate('gpu-brand', d.brand, 'Select Brand...');

        // Brand → Series
        this.setupCascading('gpu-brand', 'gpu-series', brand => d.series[brand] || [], ['gpu-model']);
        // Series → Model
        this.setupCascading('gpu-series', 'gpu-model', series => d.models[series] || []);
    }

    initCPU() {
        const d = this.data.cpu.dropdowns;
        this.populate('cpu-brand', d.brand, 'Select Brand...');

        // Brand → Tier
        this.setupCascading('cpu-brand', 'cpu-tier', brand => d.tier[brand] || [], ['cpu-generation', 'cpu-model']);

        // Tier → Generation  (key = base name before parenthetical, e.g. "Core i5")
        this.setupCascading('cpu-tier', 'cpu-generation', tier => {
            const base = tier.replace(/\s*\(.*\)/, '');   // "Core i5 (Mainstream)" → "Core i5"
            return d.generation[base] || [];
        }, ['cpu-model']);

        // Generation → Model  (key = "baseTier-generation", e.g. "Core i5-12th Gen")
        const tierSelect = document.getElementById('cpu-tier');
        this.setupCascading('cpu-generation', 'cpu-model', gen => {
            const tier = tierSelect ? tierSelect.value : '';
            const base = tier.replace(/\s*\(.*\)/, '');
            const key = `${base}-${gen}`;
            return d.models[key] || [];
        });
    }

    initMotherboard() {
        const d = this.data.motherboard.dropdowns;
        this.populate('mobo-socket', d.socket_type, 'Select Socket...');
        this.populate('mobo-formfactor', d.form_factor, 'Select Form Factor...');

        // Socket → Chipset
        this.setupCascading('mobo-socket', 'mobo-chipset', socket => d.chipset[socket] || []);
    }

    initStorage() {
        const d = this.data.storage.dropdowns;
        this.populate('storage-type', d.type, 'Select Type...');
        this.populate('storage-capacity', d.capacity, 'Select Capacity...');

        // Type → Interface
        this.setupCascading('storage-type', 'storage-interface', type => d.interface[type] || []);
    }

    initPSU() {
        const d = this.data.psu.dropdowns;
        this.populate('psu-wattage', d.wattage, 'Select Wattage...');
        this.populate('psu-efficiency', d.efficiency_rating, 'Select Efficiency...');
        this.populate('psu-modularity', d.modularity, 'Select Modularity...');
    }

    initCase() {
        const d = this.data.case.dropdowns;
        this.populate('case-formfactor', d.form_factor, 'Select Form Factor...');
        this.populate('case-panel', d.side_panel, 'Select Side Panel...');
    }

    initCooling() {
        const d = this.data.cooling.dropdowns;
        this.populate('cooling-type', d.type, 'Select Type...');
        this.populate('cooling-compatibility', d.socket_compatibility, 'Select Compatibility...');
    }
}

/* ─── Bootstrap on DOMContentLoaded ──────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
    const manager = new DropdownManager();
    manager.initialize();

    // Attach search button handlers — navigate to forum page
    // Define the ordered select IDs for each component to build the URL path
    const selectOrder = {
        ram: ['ram-generation', 'ram-speed', 'ram-capacity'],
        gpu: ['gpu-brand', 'gpu-series', 'gpu-model'],
        cpu: ['cpu-brand', 'cpu-tier', 'cpu-generation', 'cpu-model'],
        motherboard: ['mobo-socket', 'mobo-chipset', 'mobo-formfactor'],
        storage: ['storage-type', 'storage-interface', 'storage-capacity'],
        psu: ['psu-wattage', 'psu-efficiency', 'psu-modularity'],
        case: ['case-formfactor', 'case-panel'],
        cooling: ['cooling-type', 'cooling-compatibility']
    };

    document.querySelectorAll('.btn-find[data-component]').forEach(btn => {
        btn.addEventListener('click', () => {
            const comp = btn.dataset.component;
            const card = btn.closest('.component-card');
            const selects = card.querySelectorAll('select:not([disabled])');
            let allFilled = true;
            selects.forEach(s => {
                if (!s.value) allFilled = false;
            });

            if (!allFilled) {
                alert('Please fill in all required fields.');
                return;
            }

            // Build the hash path from select values in the defined order
            const ids = selectOrder[comp] || [];
            const segments = ids.map(id => {
                const el = document.getElementById(id);
                return el && el.value ? el.value.replace(/\s+/g, '-') : '';
            }).filter(Boolean);

            const hash = `#${comp}/${segments.join('/')}`;
            window.location.href = `pages/forum.html${hash}`;
        });
    });
});
