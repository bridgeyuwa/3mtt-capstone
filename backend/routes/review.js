// Express router for review-related endpoints.
const express = require('express');
const auth = require('../middleware/auth');
const reviewCtrl = require('../controllers/reviewController');

const router = express.Router();


// Add or update a review for a movie by the authenticated user.
 
router.post('/', auth, reviewCtrl.addOrUpdateReview);

// Get all reviews for a specific movie by TMDB movieId.

router.get('/movie/:movieId', reviewCtrl.getMovieReviews);

// Get all reviews written by a specific user by userId.
 
router.get('/user/:userId', reviewCtrl.getUserReviews);

module.exports = router;