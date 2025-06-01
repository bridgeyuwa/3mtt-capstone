const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: String, required: true }, // TMDB movie ID
  rating: { type: Number, min: 0, max: 10, required: true },
  review: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);