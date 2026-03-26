document.addEventListener('DOMContentLoaded', () => {
    const singlePostWrapper = document.getElementById('single-post-wrapper');
    const params = new URLSearchParams(window.location.search);
    const postId = params.get('id');

    if (!postId) {
        singlePostWrapper.innerHTML = '<p class="error-text">No article specified. <a href="blogsandarticles.html">Return to blogs</a>.</p>';
        return;
    }

    async function loadPost() {
        try {
            const res = await fetch(`/api/blogs/${postId}`);
            const data = await res.json();

            if (!res.ok) {
                singlePostWrapper.innerHTML = `<p class="error-text">${escapeHtml(data.error || 'Failed to load the article.')}</p>`;
                return;
            }

            renderPost(data.post);
        } catch (err) {
            console.error('Error fetching blog post:', err);
            singlePostWrapper.innerHTML = '<p class="error-text">An error occurred while loading the article.</p>';
        }
    }

    function renderPost(post) {
        document.title = `${post.title} - PC Tracker`;

        const date = new Date(post.createdAt).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });

        const imageHtml = post.headerImage
            ? `<div class="single-blog-image-wrapper">
                 <img src="${post.headerImage}" alt="${escapeHtml(post.title)}" class="single-blog-header-img">
               </div>`
            : '';

        // Safely escape the body and preserve line breaks
        const formattedBody = escapeHtml(post.body).replace(/\n/g, '<br>');

        singlePostWrapper.innerHTML = `
            <article class="single-blog">
                <h1 class="single-blog-title">${escapeHtml(post.title)}</h1>
                <div class="single-blog-meta">
                    <span class="single-author">By <strong>${escapeHtml(post.author)}</strong></span>
                    <span class="single-date">| Published on ${date}</span>
                </div>
                ${imageHtml}
                <div class="single-blog-body">
                    ${formattedBody}
                </div>
            </article>
        `;
    }

    // Helper: Escape HTML to prevent XSS
    function escapeHtml(unsafe) {
        if (!unsafe) return '';
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    loadPost();
});
