const Review = require('../models/review');

// Add or update a review for a movie
exports.addOrUpdateReview = async (req, res) => {
  const user = req.user;
  const { movieId, rating, review } = req.body;
  let r = await Review.findOne({ user: user._id, movieId });
  if (r) {
    r.rating = rating;
    r.review = review;
    await r.save();
  } else {
    r = await Review.create({ user: user._id, movieId, rating, review });
  }
  res.json(r);
};

// Get reviews for a movie
exports.getMovieReviews = async (req, res) => {
  const { movieId } = req.params;
  const reviews = await Review.find({ movieId }).populate('user', 'username avatar');
  res.json(reviews);
};

// Get reviews by a user
exports.getUserReviews = async (req, res) => {
  const { userId } = req.params;
  const reviews = await Review.find({ user: userId }).populate('user', 'username avatar');
  res.json(reviews);
};