/*
PATCH PROTOCOL
How this works:
- You implement Patch 1 → Run Diagnostics → Door 2 unlocks.
- Implement Patch 2 → Run Diagnostics → Door 3 unlocks.
… until Door 5 unlocks and you escape.

<<<<<<< HEAD:script.js
Just fill TODO sections.
*/

function qs(sel) { return document.querySelector(sel); }

const logEl = qs("#log");
const doorsHud = qs("#doorsHud");
const runBtn = qs("#runBtn");
const hintBtn = qs("#hintBtn");

const checklist = {
  c1: qs("#c1"),
  c2: qs("#c2"),
  c3: qs("#c3"),
  c4: qs("#c4"),
  c5: qs("#c5")
};

const state = {
  doors: 0,
  hints: 3,

  // Door 2 state
  count: 0,

  // Door 4 state
  unsorted: ["Delta", "Alpha", "Echo", "Bravo", "Charlie"],
  sorted: []
};

function setLog(msg) {
  logEl.textContent = `System log: ${msg}`;
}

function setDoors(n) {
  state.doors = n;
  doorsHud.textContent = `${n} / 5`;
}

function unlockDoor(n) {
  // unlock door section #doorn
  const el = qs(`#door${n}`);
  if (!el) return;
  el.classList.remove("locked");
}

function markDone(key, text) {
  checklist[key].classList.add("done");
  checklist[key].textContent = `✅ ${text}`;
}

/* =========================
   PATCH 1 — Boot Message
   Goal: change #bootStatus text to "ONLINE ✅"
   and set its color to look "good" (optional).
   ========================= */
function patch1_bootMessage() {
  const bootStatus = qs("#bootStatus");
  bootStatus.textContent = "ONLINE ✅";
  bootStatus.style.color = "#0f0";
}

/* =========================
   PATCH 2 — Click Counter
   Goal:
   - Clicking #countBtn increments state.count and updates #countValue.
   - Clicking #resetBtn sets state.count to 0 and updates #countValue.
   ========================= */
function patch2_counter() {
  const countBtn = qs("#countBtn");
  const resetBtn = qs("#resetBtn");
  const countValue = qs("#countValue");

  countBtn.addEventListener("click", () => {
    state.count++;
    countValue.textContent = state.count;
  });

  resetBtn.addEventListener("click", () => {
    state.count = 0;
    countValue.textContent = 0;
  });
}

/* =========================
   PATCH 3 — Passphrase Gate
   Goal:
   - When #verifyBtn is clicked, read #phraseInput
   - Normalize: trim + lowercase
   - If correct passphrase: show success in #phraseMsg (must include "✅")
   - Else show error in #phraseMsg (must include "❌")
   Passphrase is: "i love ccapdev"
   ========================= */
function patch3_passphrase() {
  const verifyBtn = qs("#verifyBtn");
  const phraseInput = qs("#phraseInput");
  const phraseMsg = qs("#phraseMsg");

  verifyBtn.addEventListener("click", () => {
    const val = phraseInput.value.trim().toLowerCase();
    if (val === "i love ccapdev") {
      phraseMsg.textContent = "Passphrase Accepted ✅";
      phraseMsg.style.color = "#0f0";
    } else {
      phraseMsg.textContent = "Access Denied ❌";
      phraseMsg.style.color = "red";
=======
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
>>>>>>> 5b380c6 (Forget password added, fixed logic, added country phone numbers, added javadoc level documentation in the js files):dashboard.js
    }
  });
}

<<<<<<< HEAD:script.js
/* =========================
   PATCH 4 — Archive Sort
   Goal:
   - Render state.unsorted into #unsortedList as <li> items
   - Clicking an unsorted item moves it into state.sorted
   - Render state.sorted into #sortedList
   - Clicking a sorted item moves it back to unsorted (optional but nice)
   - #checkSortBtn checks if sorted list is exactly A→Z:
     Alpha, Bravo, Charlie, Delta, Echo
     If correct: #sortMsg must include "✅"
     If wrong: #sortMsg must include "❌"
   - #resetSortBtn resets lists to original
   ========================= */
function patch4_sorting() {
  const unsortedList = qs("#unsortedList");
  const sortedList = qs("#sortedList");
  const checkSortBtn = qs("#checkSortBtn");
  const resetSortBtn = qs("#resetSortBtn");
  const sortMsg = qs("#sortMsg");

  function render() {
    unsortedList.innerHTML = "";
    sortedList.innerHTML = "";

    state.unsorted.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.addEventListener("click", () => {
        state.unsorted = state.unsorted.filter(x => x !== item);
        state.sorted.push(item);
        render();
      });
      unsortedList.appendChild(li);
=======
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
>>>>>>> 5b380c6 (Forget password added, fixed logic, added country phone numbers, added javadoc level documentation in the js files):dashboard.js
    });

    state.sorted.forEach(item => {
      const li = document.createElement("li");
      li.textContent = item;
      li.addEventListener("click", () => {
        state.sorted = state.sorted.filter(x => x !== item);
        state.unsorted.push(item);
        render();
      });
      sortedList.appendChild(li);
    });
  }

  checkSortBtn.addEventListener("click", () => {
    const correct = ["Alpha", "Bravo", "Charlie", "Delta", "Echo"];
    const isCorrect = JSON.stringify(state.sorted) === JSON.stringify(correct);
    if (isCorrect) {
      sortMsg.textContent = "Sort Key Correct ✅";
      sortMsg.style.color = "#0f0";
    } else {
      sortMsg.textContent = "Sequence Mismatch ❌";
    }
  });

  resetSortBtn.addEventListener("click", () => {
    state.unsorted = ["Delta", "Alpha", "Echo", "Bravo", "Charlie"];
    state.sorted = [];
    render();
    sortMsg.textContent = "Move all items into Sorted in correct order.";
    sortMsg.style.color = "";
  });

  render(); // Initial render
}

/* =========================
   PATCH 5 — Exit Protocol
   Goal:
   - The protocol is:
     "online-<count>-iloveccapdev-alpha-bravo-charlie-delta-echo"
     where <count> is the current counter value.
   - When #unlockBtn is clicked:
     - If input matches exactly (case-insensitive, trimmed): show win panel
     - Else show error message in #exitMsg
   ========================= */
function patch5_exit() {
  const unlockBtn = qs("#unlockBtn");
  const protocolInput = qs("#protocolInput");
  const winPanel = qs("#winPanel");
  const exitMsg = qs("#exitMsg");

  unlockBtn.addEventListener("click", () => {
    const val = protocolInput.value.trim().toLowerCase();
    const target = `online-${state.count}-iloveccapdev-alpha-bravo-charlie-delta-echo`;

    if (val === target) {
      winPanel.classList.remove("locked");
      exitMsg.textContent = "PROTOCOL MATCH. EXIT UNPRISMED. ✅";
      exitMsg.style.color = "#0f0";
    } else {
      exitMsg.textContent = "PROTOCOL MISMATCH ❌";
      exitMsg.style.color = "red";
    }
  });
}

function initHints() {
  hintBtn.textContent = `Use Hint`;
  hintBtn.addEventListener("click", () => {
    hintBtn.textContent = `Use Hint`;

    const hints = [
      "Patch 1: Use document.querySelector('#bootStatus') and textContent.",
      "Patch 2: You need addEventListener('click', ...) on the two buttons.",
      "Patch 3: normalize with .trim().toLowerCase(); compare to 'i love ccapdev'.",
      "Patch 4: Render arrays to <li>. Clicking moves items between arrays.",
      "Patch 5: Build the protocol string using state.count, compare normalized input."
    ];

    setLog(`HINT: ${hints[Math.min(state.doors, 4)]}`);
  });
}

/* =========================
   DO NOT EDIT PAST THIS LINE
   ========================= */
function runDiagnostics() {
  let passed = 0;
  const boot = qs("#bootStatus");
  if (boot && boot.textContent === "ONLINE ✅") {
    passed = Math.max(passed, 1);
  }
  const countBtn = qs("#countBtn");
  const countValue = qs("#countValue");
  if (countBtn && countValue) {
    const before = Number(countValue.textContent);
    countBtn.click();
    const after = Number(countValue.textContent);
    const resetBtn = qs("#resetBtn");
    if (resetBtn) resetBtn.click();
    if (!Number.isNaN(before) && after === before + 1) {
      passed = Math.max(passed, 2);
    }
  }
  const phraseInput = qs("#phraseInput");
  const verifyBtn = qs("#verifyBtn");
  const phraseMsg = qs("#phraseMsg");
  if (phraseInput && verifyBtn && phraseMsg) {
    phraseInput.value = "i love CCAPDEV";
    verifyBtn.click();
    if (phraseMsg.textContent.includes("✅")) {
      passed = Math.max(passed, 3);
    }
  }
  const checkSortBtn = qs("#checkSortBtn");
  const sortMsg = qs("#sortMsg");
  const unsortedList = qs("#unsortedList");
  const sortedList = qs("#sortedList");
  if (checkSortBtn && sortMsg && unsortedList && sortedList) {
    const desired = ["Alpha", "Bravo", "Charlie", "Delta", "Echo"];
    desired.forEach(name => {
      const li = Array.from(unsortedList.querySelectorAll("li")).find(x => x.textContent === name);
      if (li) li.click();
    });
    checkSortBtn.click();
    if (sortMsg.textContent.includes("✅")) {
      passed = Math.max(passed, 4);
    }
  }
  const protocolInput = qs("#protocolInput");
  const unlockBtn = qs("#unlockBtn");
  const winPanel = qs("#winPanel");
  if (protocolInput && unlockBtn && winPanel) {
    protocolInput.value = `online-${state.count}-iloveccapdev-alpha-bravo-charlie-delta-echo`;
    unlockBtn.click();
    if (!winPanel.classList.contains("locked")) {
      passed = Math.max(passed, 5);
    }
  }
  setDoors(passed);
  if (passed >= 1) { markDone("c1", "Patch 1: Boot Message"); unlockDoor(2); }
  if (passed >= 2) { markDone("c2", "Patch 2: Click Counter"); unlockDoor(3); }
  if (passed >= 3) { markDone("c3", "Patch 3: Passphrase Gate"); unlockDoor(4); }
  if (passed >= 4) { markDone("c4", "Patch 4: Archive Sort"); unlockDoor(5); }
  if (passed >= 5) { markDone("c5", "Patch 5: Exit Protocol"); setLog("ESCAPED ✅ Screenshot your win panel."); }
  if (passed === 0) setLog("No patches detected yet. Start with Patch 1.");
  else if (passed < 5) setLog(`Diagnostics passed: ${passed}/5. Continue patching.`);
}
function init() {
  setDoors(0);
  setLog("Portal offline. Implement Patch 1 then Run Diagnostics.");
  initHints();
  patch1_bootMessage();
  patch2_counter();
  patch3_passphrase();
  patch4_sorting();
  patch5_exit();
  runBtn.addEventListener("click", runDiagnostics);
  unlockDoor(1);
}
init();
