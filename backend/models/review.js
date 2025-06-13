const mongoose = require('mongoose');

/**
 * Review schema for storing user ratings and comments on movies.
 * - user: reference to the User who wrote the review
 * - movieId: TMDB movie identifier
 * - rating: number from 0 to 10
 * - review: optional text
 * Automatically adds createdAt and updatedAt timestamps.
 */
const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movieId: { type: String, required: true }, // TMDB movie ID
  rating: { type: Number, min: 0, max: 10, required: true },
  review: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);