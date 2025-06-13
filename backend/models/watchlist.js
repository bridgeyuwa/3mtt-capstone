const mongoose = require('mongoose');

/**
 * Watchlist schema for grouping movies under a custom list per user.
 * - user: reference to the User who owns the watchlist
 * - name: name of the watchlist (should be unique per user in logic)
 * - movies: array of TMDB movie IDs
 * Automatically adds createdAt and updatedAt timestamps.
 */
const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  movies: [{ type: String }]
}, { timestamps: true });

// Export existing model if already registered, otherwise create it
module.exports = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);