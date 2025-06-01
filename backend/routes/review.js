const express = require('express');
const auth = require('../middleware/auth');
const reviewCtrl = require('../controllers/reviewController');

const router = express.Router();

router.post('/', auth, reviewCtrl.addOrUpdateReview);
router.get('/movie/:movieId', reviewCtrl.getMovieReviews);
router.get('/user/:userId', reviewCtrl.getUserReviews);

module.exports = router;