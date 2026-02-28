const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  firstName:   { type: String, required: true },
  lastName:    { type: String, required: true },
  middleName:  { type: String, default: '' },
  username:    { type: String, default: '' },
  email:       { type: String, required: true, unique: true, lowercase: true },
  password:    { type: String, required: true },
  role:        { type: String, enum: ['user', 'admin'], default: 'user' },
  rep:         { type: Number, default: 0 },
  displayName: { type: String, default: '' },
  bio:         { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
