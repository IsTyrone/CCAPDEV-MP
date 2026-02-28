const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');

// Middleware: require login
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    next();
}

// Middleware: require admin
function requireAdmin(req, res, next) {
    if (!req.session.userId || req.session.userRole !== 'admin') {
        return res.status(403).json({ error: 'Admin access required.' });
    }
    next();
}

// GET /api/listings?status=pending&ownerEmail=...
router.get('/', async (req, res) => {
    try {
        const filter = {};
        if (req.query.status) filter.status = req.query.status;
        if (req.query.ownerEmail) filter.ownerEmail = req.query.ownerEmail.toLowerCase();

        const listings = await Listing.find(filter).sort({ date: -1 });
        res.json({ listings });
    } catch (err) {
        console.error('Get listings error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/listings/approved
router.get('/approved', async (req, res) => {
    try {
        const filter = { status: 'approved' };
        if (req.query.componentType) filter.componentType = req.query.componentType;

        const listings = await Listing.find(filter).sort({ date: -1 });
        res.json({ listings });
    } catch (err) {
        console.error('Get approved listings error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/listings
router.post('/', requireAuth, async (req, res) => {
    try {
        const { componentType, details, transactionType, price, images, comments, user, ownerEmail } = req.body;

        const listing = new Listing({
            componentType,
            details: details || {},
            transactionType: transactionType || '',
            price: Number(price) || 0,
            images: images || [],
            comments: comments || '',
            status: 'pending',
            user: user || 'Anonymous',
            ownerEmail: (ownerEmail || req.session.userEmail || '').toLowerCase(),
            date: new Date()
        });

        await listing.save();
        res.status(201).json({ message: 'Listing submitted!', listing });
    } catch (err) {
        console.error('Create listing error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/listings/:id/approve
router.put('/:id/approve', requireAdmin, async (req, res) => {
    try {
        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            { status: 'approved' },
            { new: true }
        );
        if (!listing) return res.status(404).json({ error: 'Listing not found.' });
        res.json({ message: 'Listing approved!', listing });
    } catch (err) {
        console.error('Approve listing error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/listings/:id/reject
router.put('/:id/reject', requireAdmin, async (req, res) => {
    try {
        const listing = await Listing.findByIdAndUpdate(
            req.params.id,
            { status: 'rejected' },
            { new: true }
        );
        if (!listing) return res.status(404).json({ error: 'Listing not found.' });
        res.json({ message: 'Listing rejected!', listing });
    } catch (err) {
        console.error('Reject listing error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/listings/:id
router.put('/:id', requireAdmin, async (req, res) => {
    try {
        const { price, comments } = req.body;
        const update = {};
        if (price !== undefined) update.price = Number(price);
        if (comments !== undefined) update.comments = comments;

        const listing = await Listing.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!listing) return res.status(404).json({ error: 'Listing not found.' });
        res.json({ message: 'Listing updated!', listing });
    } catch (err) {
        console.error('Edit listing error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/listings/reset
router.delete('/reset', requireAdmin, async (req, res) => {
    try {
        await Listing.deleteMany({});
        res.json({ message: 'All listings reset.' });
    } catch (err) {
        console.error('Reset listings error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
