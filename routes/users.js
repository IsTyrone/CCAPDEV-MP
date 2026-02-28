const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const ProfileComment = require('../models/ProfileComment');

const SALT_ROUNDS = 10;

// Middleware: require login
function requireAuth(req, res, next) {
    if (!req.session.userId) {
        return res.status(401).json({ error: 'Authentication required.' });
    }
    next();
}

// GET /api/users/:email — get user profile data
router.get('/users/:email', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.params.email.toLowerCase() }).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }
        res.json({
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                username: user.username,
                email: user.email,
                role: user.role,
                rep: user.rep,
                displayName: user.displayName,
                bio: user.bio
            }
        });
    } catch (err) {
        console.error('Get user error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/users/:email/rep — update reputation (+1 or -1)
router.put('/users/:email/rep', async (req, res) => {
    try {
        const { delta } = req.body; // +1 or -1
        const user = await User.findOne({ email: req.params.email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'User not found.' });
        }

        user.rep = (user.rep || 0) + (delta || 0);
        await user.save();

        res.json({ rep: user.rep });
    } catch (err) {
        console.error('Update rep error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// GET /api/profile-comments/:email
router.get('/profile-comments/:email', async (req, res) => {
    try {
        const comments = await ProfileComment.find({
            targetEmail: req.params.email.toLowerCase()
        }).sort({ time: -1 });
        res.json({ comments });
    } catch (err) {
        console.error('Get comments error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/profile-comments/:email
router.post('/profile-comments/:email', requireAuth, async (req, res) => {
    try {
        const { author, body } = req.body;
        if (!body) {
            return res.status(400).json({ error: 'Comment body is required.' });
        }

        const comment = new ProfileComment({
            targetEmail: req.params.email.toLowerCase(),
            author: author || 'Anonymous',
            body,
            time: new Date()
        });

        await comment.save();
        res.status(201).json({ message: 'Comment posted!', comment });
    } catch (err) {
        console.error('Post comment error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/settings/profile — update profile info
router.put('/settings/profile', requireAuth, async (req, res) => {
    try {
        const { displayName, username, bio } = req.body;
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (displayName !== undefined) user.displayName = displayName;
        if (username !== undefined) user.username = username;
        if (bio !== undefined) user.bio = bio;

        await user.save();
        res.json({ message: 'Profile updated!', user: { displayName: user.displayName, username: user.username, bio: user.bio } });
    } catch (err) {
        console.error('Update profile error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// PUT /api/settings/security — change password
router.put('/settings/security', requireAuth, async (req, res) => {
    try {
        const { email, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.session.userId);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Verify current password
        if (currentPassword) {
            const match = await bcrypt.compare(currentPassword, user.password);
            if (!match) {
                return res.status(401).json({ error: 'Current password is incorrect.' });
            }
        }

        if (email) user.email = email.toLowerCase();
        if (newPassword) {
            user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        }

        await user.save();

        // Update session email if changed
        if (email) req.session.userEmail = user.email;

        res.json({ message: 'Security settings updated!' });
    } catch (err) {
        console.error('Update security error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// DELETE /api/settings/account — delete account
router.delete('/settings/account', requireAuth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.session.userId);
        // Also delete their profile comments (authored by them) — optional
        // await ProfileComment.deleteMany({ authorEmail: req.session.userEmail });

        req.session.destroy(err => {
            if (err) return res.status(500).json({ error: 'Failed to destroy session.' });
            res.clearCookie('connect.sid');
            res.json({ message: 'Account deleted.' });
        });
    } catch (err) {
        console.error('Delete account error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
