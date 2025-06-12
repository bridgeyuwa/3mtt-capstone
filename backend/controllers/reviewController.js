const Review = require('../models/review');

// Add or update a review for a movie
exports.addOrUpdateReview = async (req, res) => {
  try {
    // Check authentication
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const { movieId, rating, review } = req.body;
    if (!movieId || rating === undefined) {
      return res.status(400).json({ message: "movieId and rating are required" });
    }

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

// Get reviews for a movie
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

// Get reviews by a user
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