const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * User schema for storing authentication, profile, and social info.
 * - username/email: unique identifiers
 * - password: hashed before save
 * - bio, avatar: profile fields
 * - favorites: list of TMDB movie IDs
 * - following/followers: social graph (user references)
 * - watchlists: references to the user's watchlists
 * Automatically adds createdAt and updatedAt timestamps.
 */
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, min: 3, max: 30 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  bio: { type: String, default: "" },
  avatar: { type: String, default: "" },
  favorites: { type: [String], default: [] },
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  watchlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Watchlist' }]
}, { timestamps: true });

/**
 * Hash the password before saving if it was modified. 
 */
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

/**
 * Compare a plain password with the hashed password.
 */
userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);