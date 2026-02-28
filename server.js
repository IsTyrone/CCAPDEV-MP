require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const path = require('path');
const bcrypt = require('bcrypt');

const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/pctracker';

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static Files ---
// Serve all static files (HTML, CSS, JS, assets, data) from project root
app.use(express.static(path.join(__dirname)));

// --- Session ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'pctracker-default-secret',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// --- API Routes ---
const authRoutes = require('./routes/auth');
const listingsRoutes = require('./routes/listings');
const usersRoutes = require('./routes/users');

app.use('/api/auth', authRoutes);
app.use('/api/listings', listingsRoutes);
app.use('/api', usersRoutes);

// --- Fallback: serve index.html for root ---
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- Seed Admin Account ---
async function seedAdmin() {
    try {
        const adminEmail = 'admin@pctracker.com';
        const existing = await User.findOne({ email: adminEmail });
        if (!existing) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            const admin = new User({
                firstName: 'System',
                lastName: 'Admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin'
            });
            await admin.save();
            console.log('Admin account seeded: admin@pctracker.com / admin123');
        }
    } catch (err) {
        console.error('Error seeding admin:', err);
    }
}

// --- Connect to MongoDB & Start Server ---
mongoose.connect(MONGODB_URI)
    .then(async () => {
        console.log('Connected to MongoDB');
        await seedAdmin();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });
