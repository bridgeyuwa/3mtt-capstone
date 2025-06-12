const express = require('express');
const auth = require('../middleware/auth');
const movieCtrl = require('../controllers/movieController');

const router = express.Router();

// Movie endpoints
router.post('/favorite/:id', auth, movieCtrl.addFavorite);
router.delete('/favorite/:id', auth, movieCtrl.removeFavorite);
router.get('/favorites', auth, movieCtrl.getFavorites);

router.get('/watchlists', auth, movieCtrl.getWatchlists);         // Get all watchlists for user
router.post('/watchlists', auth, movieCtrl.createWatchlist);      // Create a new watchlist
router.put('/watchlists/add', auth, movieCtrl.addToWatchlist);     // Add movie to a watchlist (expects { listName, movieId })
router.put('/watchlists/remove', auth, movieCtrl.removeFromWatchlist); // Remove movie from a watchlist (expects { listName, movieId })
router.get('/watchlists/:id', movieCtrl.getWatchlistDetails); 
router.put('/watchlists/:id', auth, movieCtrl.renameWatchlist);
router.delete('/watchlists/:id', auth, movieCtrl.deleteWatchlist);   // Delete a watchlist by name

router.get('/search', movieCtrl.searchMovies);
router.get('/genres', movieCtrl.getGenres);
router.get('/trending', movieCtrl.getTrending);
router.get('/recommendations', auth, movieCtrl.getRecommendations);
router.get('/:id', movieCtrl.getMovieDetails);

module.exports = router;