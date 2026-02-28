const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
    componentType: { type: String, required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    transactionType: { type: String, default: '' },
    price: { type: Number, default: 0 },
    images: { type: [String], default: [] },
    comments: { type: String, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    user: { type: String, default: 'Anonymous' },
    ownerEmail: { type: String, default: '' },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);
