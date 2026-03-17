const mongoose = require('mongoose');

const profileCommentSchema = new mongoose.Schema({
    targetEmail: { type: String, required: true, lowercase: true },
    author: { type: String, required: true },
    body: { type: String, required: true },
    time: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('ProfileComment', profileCommentSchema);
