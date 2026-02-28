const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');

const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post('/register', async (req, res) => {
    try {
        const { firstName, lastName, middleName, username, email, password } = req.body;

        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ error: 'Missing required fields.' });
        }

        // Check if email already exists
        const existing = await User.findOne({ email: email.toLowerCase() });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists.' });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        const newUser = new User({
            firstName,
            lastName,
            middleName: middleName || '',
            username: username || '',
            email: email.toLowerCase(),
            password: hashedPassword,
            role: 'user'
        });

        await newUser.save();

        // Auto-login: set session
        req.session.userId = newUser._id;
        req.session.userEmail = newUser.email;
        req.session.userRole = newUser.role;

        res.status(201).json({
            message: 'Registration successful!',
            user: {
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                middleName: newUser.middleName,
                username: newUser.username,
                email: newUser.email,
                role: newUser.role,
                rep: newUser.rep
            }
        });
    } catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error during registration.' });
    }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ error: 'Invalid email or password.' });
        }

        // Set session
        req.session.userId = user._id;
        req.session.userEmail = user.email;
        req.session.userRole = user.role;

        res.json({
            message: 'Login successful!',
            user: {
                firstName: user.firstName,
                lastName: user.lastName,
                middleName: user.middleName,
                username: user.username,
                email: user.email,
                role: user.role,
                rep: user.rep
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ error: 'Failed to logout.' });
        }
        res.clearCookie('connect.sid');
        res.json({ message: 'Logged out successfully.' });
    });
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
    try {
        if (!req.session.userId) {
            return res.json({ user: null });
        }

        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.json({ user: null });
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
        console.error('Auth/me error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Email and new password are required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ error: 'Email not found.' });
        }

        user.password = await bcrypt.hash(newPassword, SALT_ROUNDS);
        await user.save();

        res.json({ message: 'Password reset successful!' });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Server error.' });
    }
});

module.exports = router;
