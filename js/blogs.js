let currentPage = 1;

document.addEventListener('DOMContentLoaded', () => {
    loadPosts(1);

    document.getElementById('prevBtn').addEventListener('click', () => {
        if (currentPage > 1) loadPosts(currentPage - 1);
    });

    document.getElementById('nextBtn').addEventListener('click', () => {
        loadPosts(currentPage + 1);
    });
});

async function loadPosts(page) {
    const wrapper = document.getElementById('blog-posts-wrapper');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const pageIndicator = document.getElementById('pageIndicator');

    wrapper.innerHTML = '<p class="loading-text">Loading latest articles...</p>';

    try {
        const res = await fetch(`/api/blogs?page=${page}`);
        const data = await res.json();

        if (!res.ok) {
            wrapper.innerHTML = '<p class="loading-text">Failed to load articles.</p>';
            return;
        }

        const { posts, totalPages } = data;
        currentPage = page;

        if (posts.length === 0) {
            wrapper.innerHTML = '<p class="loading-text">No articles yet. Check back soon!</p>';
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            pageIndicator.textContent = 'Page 1';
            return;
        }

        wrapper.innerHTML = posts.map(post => {
            const date = new Date(post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });

            const imageHtml = post.headerImage
                ? `<img src="${post.headerImage}" alt="${post.title}" class="blog-header-img">`
                : '';

            // Truncate body for excerpt (first 250 chars)
            const excerpt = post.body.length > 250
                ? post.body.substring(0, 250) + '...'
                : post.body;

            return `
                <a href="blog.html?id=${post._id}" class="blog-link" style="text-decoration: none; color: inherit; display: block;">
                    <article class="blog-card">
                        ${imageHtml}
                        <p class="blog-meta">Posted on ${date} by ${post.author}</p>
                        <h2 class="blog-title">${escapeHtml(post.title)}</h2>
                        <p class="blog-excerpt">${escapeHtml(excerpt)}</p>
                    </article>
                </a>
            `;
        }).join('');

        // Update pagination controls
        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= totalPages;
        pageIndicator.textContent = `Page ${currentPage} of ${totalPages}`;

    } catch (err) {
        console.error('Load blog posts error:', err);
        wrapper.innerHTML = '<p class="loading-text">Error loading articles.</p>';
    }
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
