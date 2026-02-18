let currentTab = 'pending';

document.addEventListener('DOMContentLoaded', () => {
    // Verify admin role
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied');
        window.location.href = 'login.html';
        return;
    }

    renderListings();
});

function switchTab(tab) {
    currentTab = tab;

    // Update active tab styling
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.textContent.toLowerCase() === tab) {
            btn.classList.add('active');
        }
    });

    renderListings();
}

function renderListings() {
    const container = document.getElementById('listings-container');
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]');

    // Filter based on current tab
    const filteredListings = allListings.filter(l => l.status === currentTab);

    if (filteredListings.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#666;">No ${currentTab} listings found.</p>`;
        return;
    }

    container.innerHTML = filteredListings.map(item => {
        // Generate action buttons based on status
        let actionButtons = '';
        const editBtn = `<button class="btn-edit" onclick="editListing(${item.id})">Edit</button>`;

        if (currentTab === 'pending') {
            actionButtons = `
                ${editBtn}
                <button class="btn-reject" onclick="rejectListing(${item.id})">Reject</button>
                <button class="btn-approve" onclick="approveListing(${item.id})">Approve</button>
            `;
        } else if (currentTab === 'approved') {
            actionButtons = `
                ${editBtn}
                <button class="btn-reject" onclick="rejectListing(${item.id})">Reject</button>
            `;
        } else if (currentTab === 'rejected') {
            actionButtons = `
                ${editBtn}
                <button class="btn-approve" onclick="approveListing(${item.id})">Approve</button>
            `;
        }

        return `
        <div class="listing-card ${currentTab}">
            <div class="listing-header">
                <div>
                    <h3 class="listing-title">${item.componentType.toUpperCase()} - ${item.details['Brand'] || item.details['Type'] || 'Generic'}</h3>
                    <p class="listing-meta">
                        <strong>Details:</strong>
                       ${Object.entries(item.details).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </p>
                    <p class="listing-price">Price: ₱${item.price}</p>
                    <p class="listing-comments">"${item.comments || 'No comments'}"</p>
                    <p class="listing-meta" style="margin-top:5px; font-size:12px;">Submitted by: ${item.user || 'Unknown'}</p>
                </div>
            </div>
            <div class="admin-actions">
                ${actionButtons}
            </div>
        </div>
    `}).join('');
}

function approveListing(id) {
    let allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const index = allListings.findIndex(l => l.id == id);

    if (index !== -1) {
        allListings[index].status = 'approved';
        localStorage.setItem('listings', JSON.stringify(allListings));

        // Recalculate average
        recalculateAverage(allListings[index]);

        alert('Listing Approved!');
        renderListings();
    }
}

function rejectListing(id) {
    if (!confirm('Are you sure you want to reject this listing?')) return;

    let allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const index = allListings.findIndex(l => l.id == id);

    if (index !== -1) {
        // Instead of deleting, just change status
        allListings[index].status = 'rejected';
        localStorage.setItem('listings', JSON.stringify(allListings));

        // Note: We might want to re-calc average if we reject a previously approved listing,
        // but for now, recalculateAverage only looks at 'approved' listings, so it effectively removes it from the calc.
        // Ideally we should re-run the calculation or decrement the count, but re-running is safer.
        recalculateAverage(allListings[index]);

        renderListings();
    }
}

// --- Edit Functionality ---

function editListing(id) {
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const listing = allListings.find(l => l.id == id);
    if (!listing) return;

    // Populate Modal
    document.getElementById('edit-id').value = listing.id;
    document.getElementById('edit-price').value = listing.price;
    document.getElementById('edit-comments').value = listing.comments || '';

    // Show Modal
    document.getElementById('edit-modal').style.display = 'block';
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

function saveCorrection(event) {
    event.preventDefault();

    const id = parseInt(document.getElementById('edit-id').value);
    const newPrice = document.getElementById('edit-price').value;
    const newComments = document.getElementById('edit-comments').value;

    let allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const index = allListings.findIndex(l => l.id == id);

    if (index !== -1) {
        allListings[index].price = newPrice;
        allListings[index].comments = newComments;

        localStorage.setItem('listings', JSON.stringify(allListings));

        // If it was already approved, update averages
        if (allListings[index].status === 'approved') {
            recalculateAverage(allListings[index]);
        }

        alert('Listing updated successfully!');
        closeEditModal();
        renderListings();
    }
}

// Close modal if clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('edit-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}


/**
 * Recalculates the average price for the specific component type/model.
 * Stores result in 'averagePrices' in localStorage.
 */
function recalculateAverage(listing) {
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const approved = allListings.filter(l =>
        l.status === 'approved' &&
        l.componentType === listing.componentType
    );

    const averages = JSON.parse(localStorage.getItem('averagePrices') || '{}');
    if (!averages[listing.componentType]) averages[listing.componentType] = {};

    if (approved.length > 0) {
        const total = approved.reduce((sum, item) => sum + Number(item.price), 0);
        const avg = Math.floor(total / approved.length);

        // Storing general average for the type
        averages[listing.componentType].average = avg;
        averages[listing.componentType].count = approved.length;
        console.log(`Updated average for ${listing.componentType}: ₱${avg}`);
    } else {
        // Likely no more approved listings for this type
        averages[listing.componentType].average = 0;
        averages[listing.componentType].count = 0;
    }

    localStorage.setItem('averagePrices', JSON.stringify(averages));
}

function resetData() {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
        localStorage.removeItem('listings');
        localStorage.removeItem('averagePrices');
        location.reload();
    }
}
