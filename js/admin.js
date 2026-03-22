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
        if (btn.textContent.toLowerCase() === tab || (tab === 'blogs' && btn.textContent === 'Blog Posts')) {
            btn.classList.add('active');
        }
    });

    // Toggle between listings and blogs sections
    const listingsContainer = document.getElementById('listings-container');
    const blogsContainer = document.getElementById('blogs-container');

    if (tab === 'blogs') {
        listingsContainer.style.display = 'none';
        blogsContainer.style.display = 'block';
        renderBlogPosts();
    } else {
        listingsContainer.style.display = 'block';
        blogsContainer.style.display = 'none';
        renderListings();
    }
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

            // Render image if available
            const imageHtml = (item.images && item.images.length > 0)
                ? `<img src="${item.images[0]}" alt="Listing Image" style="max-width: 150px; border-radius: 8px; margin-right: 15px; cursor: pointer;" onclick="openImageModal('${item.images[0]}')">`
                : '';

            return `
            <div class="listing-card ${currentTab}" style="display: flex; align-items: flex-start;">
                ${imageHtml}
                <div class="listing-header" style="flex-grow: 1;">
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
    const editModal = document.getElementById('edit-modal');
    if (event.target == editModal) {
        editModal.style.display = "none";
    }
    
    const imageModal = document.getElementById('image-modal');
    if (event.target == imageModal) {
        imageModal.style.display = "none";
    }

    const blogModal = document.getElementById('blog-modal');
    if (event.target == blogModal) {
        blogModal.style.display = "none";
    }
}

// Lightbox functions
function openImageModal(imgSrc) {
    const modal = document.getElementById('image-modal');
    const img = document.getElementById('expanded-image');
    if (modal && img) {
        img.src = imgSrc;
        modal.style.display = 'block';
    }
}

function closeImageModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.style.display = 'none';
        document.getElementById('expanded-image').src = '';
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

// =============================================
// Blog Post Management
// =============================================

async function renderBlogPosts() {
    const container = document.getElementById('blog-list');

    try {
        const res = await fetch('/api/blogs?page=1');
        const data = await res.json();
        const posts = data.posts || [];

        if (posts.length === 0) {
            container.innerHTML = '<p style="text-align:center; color:#666;">No blog posts yet. Click "+ New Blog Post" to create one.</p>';
            return;
        }

        // Fetch all pages to list them all in admin
        let allPosts = posts;
        if (data.totalPages > 1) {
            for (let p = 2; p <= data.totalPages; p++) {
                const moreRes = await fetch(`/api/blogs?page=${p}`);
                const moreData = await moreRes.json();
                allPosts = allPosts.concat(moreData.posts || []);
            }
        }

        container.innerHTML = allPosts.map(post => {
            const date = new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            const imgPreview = post.headerImage
                ? `<img src="${post.headerImage}" alt="Header" style="max-width: 100px; border-radius: 6px; margin-right: 12px;">`
                : '';

            const bodyPreview = post.body.length > 100
                ? post.body.substring(0, 100) + '...'
                : post.body;

            return `
                <div class="listing-card" style="display: flex; align-items: flex-start; margin-bottom: 12px;">
                    ${imgPreview}
                    <div style="flex-grow: 1;">
                        <h3 class="listing-title" style="margin: 0 0 4px 0;">${escapeHtmlAdmin(post.title)}</h3>
                        <p class="listing-meta" style="margin: 0 0 4px 0; font-size: 12px; color: #70757a;">${date} · ${post.author}</p>
                        <p class="listing-comments" style="margin: 0;">${escapeHtmlAdmin(bodyPreview)}</p>
                    </div>
                    <div class="admin-actions">
                        <button class="btn-reject" onclick="deleteBlogPost('${post._id}')">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error('Render blog posts error:', err);
        container.innerHTML = '<p style="text-align:center; color:#666;">Error loading blog posts.</p>';
    }
}

function openCreateBlogModal() {
    document.getElementById('blog-form').reset();
    document.getElementById('blog-image-preview').style.display = 'none';
    document.getElementById('blog-modal').style.display = 'block';
}

function closeBlogModal() {
    document.getElementById('blog-modal').style.display = 'none';
}

// Image preview for blog header
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('blog-image');
    if (imageInput) {
        imageInput.addEventListener('change', function () {
            const file = this.files[0];
            const preview = document.getElementById('blog-image-preview');
            if (file) {
                const reader = new FileReader();
                reader.onload = function (e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                };
                reader.readAsDataURL(file);
            } else {
                preview.style.display = 'none';
            }
        });
    }
});

async function submitBlogPost(event) {
    event.preventDefault();

    const title = document.getElementById('blog-title').value.trim();
    const body = document.getElementById('blog-body').value.trim();
    const imageInput = document.getElementById('blog-image');

    if (!title || !body) {
        alert('Title and body are required.');
        return;
    }

    let headerImage = '';

    // Convert image to base64 if provided
    if (imageInput.files && imageInput.files[0]) {
        headerImage = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageInput.files[0]);
        });
    }

    try {
        const res = await fetch('/api/blogs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title, body, headerImage })
        });

        const data = await res.json();

        if (res.ok) {
            alert('Blog post published!');
            closeBlogModal();
            renderBlogPosts();
        } else {
            alert(data.error || 'Failed to create blog post.');
        }
    } catch (err) {
        console.error('Submit blog post error:', err);
        alert('An error occurred.');
    }
}

async function deleteBlogPost(id) {
    if (!confirm('Are you sure you want to delete this blog post?')) return;

    try {
        const res = await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
        const data = await res.json();

        if (res.ok) {
            alert('Blog post deleted.');
            renderBlogPosts();
        } else {
            alert(data.error || 'Failed to delete blog post.');
        }
    } catch (err) {
        console.error('Delete blog post error:', err);
        alert('An error occurred.');
    }
}

function escapeHtmlAdmin(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
