/*
PATCH PROTOCOL
How this works:
- You implement Patch 1 → Run Diagnostics → Door 2 unlocks.
- Implement Patch 2 → Run Diagnostics → Door 3 unlocks.
… until Door 5 unlocks and you escape.

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
    }
  });
}

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
