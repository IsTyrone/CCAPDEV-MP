const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');

// Middleware: require admin
function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}

// GET /api/blogs?page=1
// Public — returns paginated blog posts (5 per page), newest first
router.get('/', async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = 5;
        const skip = (page - 1) * limit;

        const total = await BlogPost.countDocuments();
        const totalPages = Math.max(1, Math.ceil(total / limit));

        const posts = await BlogPost.find()
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        res.json({ posts, page, totalPages, total });
    } catch (err) {
        console.error('Get blog posts error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/blogs/:id
// Public — get a single blog post
router.get('/:id', async (req, res) => {
    try {
        const post = await BlogPost.findById(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Blog post not found.' });
        }
        res.json({ post });
    } catch (err) {
        console.error('Get single blog post error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/blogs
// Admin only — create a new blog post
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { title, body, headerImage } = req.body;

        if (!title || !body) {
            return res.status(400).json({ error: 'Title and body are required.' });
        }

        const post = new BlogPost({
            title,
            body,
            headerImage: headerImage || '',
            author: req.session.userEmail || 'Admin'
        });

        await post.save();
        res.status(201).json({ message: 'Blog post created!', post });
    } catch (err) {
        console.error('Create blog post error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/blogs/:id
// Admin only — delete a blog post
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const post = await BlogPost.findByIdAndDelete(req.params.id);
        if (!post) return res.status(404).json({ error: 'Blog post not found.' });
        res.json({ message: 'Blog post deleted.' });
    } catch (err) {
        console.error('Delete blog post error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
