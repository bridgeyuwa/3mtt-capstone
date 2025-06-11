const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  movies: [{ type: String }]
}, { timestamps: true });

module.exports = mongoose.models.Watchlist || mongoose.model('Watchlist', watchlistSchema);