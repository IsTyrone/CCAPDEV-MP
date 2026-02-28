let currentTab = 'pending';

document.addEventListener('DOMContentLoaded', async () => {
    // Verify admin role via server session
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (!data.user || data.user.role !== 'admin') {
            alert('Access Denied');
            window.location.href = 'login.html';
            return;
        }
    } catch (err) {
        console.error('Auth check error:', err);
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

async function renderListings() {
    const container = document.getElementById('listings-container');

    try {
        const res = await fetch(`/api/listings?status=${currentTab}`);
        const data = await res.json();
        const filteredListings = data.listings || [];

        if (filteredListings.length === 0) {
            container.innerHTML = `<p style="text-align:center; color:#666;">No ${currentTab} listings found.</p>`;
            return;
        }

        container.innerHTML = filteredListings.map(item => {
            // Generate action buttons based on status
            let actionButtons = '';
            const editBtn = `<button class="btn-edit" onclick="editListing('${item._id}')">Edit</button>`;

            if (currentTab === 'pending') {
                actionButtons = `
                    ${editBtn}
                    <button class="btn-reject" onclick="rejectListing('${item._id}')">Reject</button>
                    <button class="btn-approve" onclick="approveListing('${item._id}')">Approve</button>
                `;
            } else if (currentTab === 'approved') {
                actionButtons = `
                    ${editBtn}
                    <button class="btn-reject" onclick="rejectListing('${item._id}')">Reject</button>
                `;
            } else if (currentTab === 'rejected') {
                actionButtons = `
                    ${editBtn}
                    <button class="btn-approve" onclick="approveListing('${item._id}')">Approve</button>
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
    } catch (err) {
        console.error('Render listings error:', err);
        container.innerHTML = `<p style="text-align:center; color:#666;">Error loading listings.</p>`;
    }
}

async function approveListing(id) {
    try {
        const res = await fetch(`/api/listings/${id}/approve`, { method: 'PUT' });
        const data = await res.json();

        if (res.ok) {
            alert('Listing Approved!');
            renderListings();
        } else {
            alert(data.error || 'Failed to approve listing.');
        }
    } catch (err) {
        console.error('Approve error:', err);
        alert('An error occurred.');
    }
}

async function rejectListing(id) {
    if (!confirm('Are you sure you want to reject this listing?')) return;

    try {
        const res = await fetch(`/api/listings/${id}/reject`, { method: 'PUT' });
        const data = await res.json();

        if (res.ok) {
            renderListings();
        } else {
            alert(data.error || 'Failed to reject listing.');
        }
    } catch (err) {
        console.error('Reject error:', err);
        alert('An error occurred.');
    }
}

// --- Edit Functionality ---

let editingId = null;

function editListing(id) {
    editingId = id;

    // Find the listing from the rendered DOM (we need price and comments)
    // Alternative: fetch from server. For simplicity, let's use a quick fetch.
    fetch(`/api/listings?status=${currentTab}`)
        .then(res => res.json())
        .then(data => {
            const listing = (data.listings || []).find(l => l._id === id);
            if (!listing) return;

            document.getElementById('edit-id').value = listing._id;
            document.getElementById('edit-price').value = listing.price;
            document.getElementById('edit-comments').value = listing.comments || '';

            document.getElementById('edit-modal').style.display = 'block';
        })
        .catch(err => console.error('Edit listing fetch error:', err));
}

function closeEditModal() {
    document.getElementById('edit-modal').style.display = 'none';
}

async function saveCorrection(event) {
    event.preventDefault();

    const id = document.getElementById('edit-id').value;
    const newPrice = document.getElementById('edit-price').value;
    const newComments = document.getElementById('edit-comments').value;

    try {
        const res = await fetch(`/api/listings/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ price: newPrice, comments: newComments })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Listing updated successfully!');
            closeEditModal();
            renderListings();
        } else {
            alert(data.error || 'Failed to update listing.');
        }
    } catch (err) {
        console.error('Save correction error:', err);
        alert('An error occurred.');
    }
}

// Close modal if clicking outside
window.onclick = function (event) {
    const modal = document.getElementById('edit-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

async function resetData() {
    if (confirm("Are you sure you want to reset all data? This cannot be undone.")) {
        try {
            const res = await fetch('/api/listings/reset', { method: 'DELETE' });
            if (res.ok) {
                location.reload();
            } else {
                alert('Failed to reset data.');
            }
        } catch (err) {
            console.error('Reset error:', err);
            alert('An error occurred.');
        }
    }
}
