document.addEventListener('DOMContentLoaded', () => {
    // Verify admin role
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    if (!currentUser || currentUser.role !== 'admin') {
        alert('Access Denied');
        window.location.href = 'login.html';
        return;
    }

    renderPendingListings();
});

function renderPendingListings() {
    const container = document.getElementById('pending-listings-container');
    const allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const pendingListings = allListings.filter(l => l.status === 'pending');

    if (pendingListings.length === 0) {
        container.innerHTML = '<p style="text-align:center; color:#666;">No pending listings to review.</p>';
        return;
    }

    container.innerHTML = pendingListings.map(item => `
        <div class="listing-card pending">
            <div class="listing-header">
                <div>
                    <h3 class="listing-title">${item.componentType.toUpperCase()} - ${item.details['Brand'] || item.details['Type'] || 'Generic'}</h3>
                    <p class="listing-meta">
                        <strong>Log:</strong>
                       ${Object.entries(item.details).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                    </p>
                    <p class="listing-price">Price: ₱${item.price}</p>
                    <p class="listing-comments">"${item.comments || 'No comments'}"</p>
                </div>
            </div>
            <div class="admin-actions">
                <button class="btn-reject" onclick="rejectListing(${item.id})">Reject</button>
                <button class="btn-approve" onclick="approveListing(${item.id})">Approve</button>
            </div>
        </div>
    `).join('');
}

function approveListing(id) {
    let allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const index = allListings.findIndex(l => l.id === id);

    if (index !== -1) {
        allListings[index].status = 'approved';
        localStorage.setItem('listings', JSON.stringify(allListings));

        // Recalculate average (Basic implementation)
        recalculateAverage(allListings[index]);

        alert('Listing Approved!');
        renderPendingListings();
    }
}

function rejectListing(id) {
    if (!confirm('Are you sure you want to reject this listing?')) return;

    let allListings = JSON.parse(localStorage.getItem('listings') || '[]');
    const newListings = allListings.filter(l => l.id !== id);

    localStorage.setItem('listings', JSON.stringify(newListings));
    renderPendingListings();
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

    // Simple average based on component type for now
    // In a real app, you'd match by specific model ID
    if (approved.length > 0) {
        const total = approved.reduce((sum, item) => sum + Number(item.price), 0);
        const avg = Math.floor(total / approved.length);

        const averages = JSON.parse(localStorage.getItem('averagePrices') || '{}');
        if (!averages[listing.componentType]) averages[listing.componentType] = {};

        // Storing general average for the type
        averages[listing.componentType].average = avg;
        averages[listing.componentType].count = approved.length;

        localStorage.setItem('averagePrices', JSON.stringify(averages));
        console.log(`Updated average for ${listing.componentType}: ₱${avg}`);
    }
}
