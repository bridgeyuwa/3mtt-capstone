const express = require('express');
const auth = require('../middleware/auth');
const movieCtrl = require('../controllers/movieController');

const router = express.Router();

router.get('/search', movieCtrl.searchMovies);
router.get('/genres', movieCtrl.getGenres);
router.get('/trending', movieCtrl.getTrending);
router.get('/recommendations', auth, movieCtrl.getRecommendations);
router.get('/:id', movieCtrl.getMovieDetails);

router.post('/favorite/:id', auth, movieCtrl.addFavorite);
router.delete('/favorite/:id', auth, movieCtrl.removeFavorite);
router.get('/favorites', auth, movieCtrl.getFavorites);

router.get('/watchlists', auth, movieCtrl.getWatchlists);
router.post('/watchlists', auth, movieCtrl.createWatchlist);
router.put('/watchlists/add', auth, movieCtrl.addToWatchlist);
router.put('/watchlists/remove', auth, movieCtrl.removeFromWatchlist);

module.exports = router;