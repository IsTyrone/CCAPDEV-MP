const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Listing = require('./models/Listing');
const ProfileComment = require('./models/ProfileComment');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pctracker';

async function clearDatabase() {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('Connected successfully.\n');

        console.log('Deleting test data...');
        // Delete all listings
        const listingsResult = await Listing.deleteMany({});
        console.log(`- Deleted ${listingsResult.deletedCount} listings.`);

        // Delete all profile comments
        const commentsResult = await ProfileComment.deleteMany({});
        console.log(`- Deleted ${commentsResult.deletedCount} profile comments.`);

        // Delete all users EXCEPT the admin account
        const usersResult = await User.deleteMany({ email: { $ne: 'admin@pctracker.com' } });
        console.log(`- Deleted ${usersResult.deletedCount} users (kept admin@pctracker.com).`);

        // Also delete sessions (optional, but good for a full reset)
        await mongoose.connection.collection('sessions').deleteMany({});
        console.log('- Cleared all active sessions.');

        console.log('\n✅ Database successfully cleared of test inputs!');
    } catch (err) {
        console.error('Error clearing database:', err);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB.');
        process.exit(0);
    }
}

clearDatabase();
