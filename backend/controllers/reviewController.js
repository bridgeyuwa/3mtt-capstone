const Review = require('../models/review');

/**
 * Add a new review or update an existing review for a movie.
 * Requires user authentication.
 */
exports.addOrUpdateReview = async (req, res) => {
  try {
    // User must be authenticated
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { movieId, rating, review } = req.body;
    if (!movieId || rating === undefined) {
      return res.status(400).json({ message: "movieId and rating are required" });
    }

    // Find existing review by this user for the movie, or create new one
    let r = await Review.findOne({ user: req.user._id, movieId });
    if (r) {
      r.rating = rating;
      r.review = review;
      await r.save();
    } else {
      r = await Review.create({ user: req.user._id, movieId, rating, review });
    }
    res.json(r);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to add/update review" });
  }
};

/**
 * Get all reviews for a specific movie.
 * Returns an array of reviews, each populated with user info.
 */
exports.getMovieReviews = async (req, res) => {
  try {
    const { movieId } = req.params;
    if (!movieId) return res.status(400).json({ message: "movieId required" });
    const reviews = await Review.find({ movieId }).populate('user', 'username avatar');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch reviews" });
  }
};

/**
 * Get all reviews written by a specific user.
 * Returns an array of reviews, each populated with user info.
 */
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return res.status(400).json({ message: "userId required" });
    const reviews = await Review.find({ user: userId }).populate('user', 'username avatar');
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message || "Failed to fetch user reviews" });
  }
};