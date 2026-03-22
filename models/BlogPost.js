const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title:       { type: String, required: true },
    body:        { type: String, required: true },
    headerImage: { type: String, default: '' },
    author:      { type: String, default: 'Admin' }
}, { timestamps: true });

module.exports = mongoose.model('BlogPost', blogPostSchema);
