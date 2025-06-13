// Express router for movie-related endpoints: favorites, watchlists, search, genres, trending, recommendations, and movie details.
const express = require('express');
const auth = require('../middleware/auth');
const movieCtrl = require('../controllers/movieController');

const router = express.Router();

// Add a movie to the user's favorites
router.post('/favorite/:id', auth, movieCtrl.addFavorite);

// Remove a movie from the user's favorites
router.delete('/favorite/:id', auth, movieCtrl.removeFavorite);

// Get the user's favorite movies
router.get('/favorites', auth, movieCtrl.getFavorites);

// Get all watchlists for the current user
router.get('/watchlists', auth, movieCtrl.getWatchlists);

// Create a new watchlist for the current user
router.post('/watchlists', auth, movieCtrl.createWatchlist);

// Add a movie to a specific watchlist (expects { watchlistId, movieId } in the body)
router.put('/watchlists/add', auth, movieCtrl.addToWatchlist);

// Remove a movie from a specific watchlist (expects { watchlistId, movieId } in the body)
router.put('/watchlists/remove', auth, movieCtrl.removeFromWatchlist);

// Get details of a specific watchlist by ID
router.get('/watchlists/:id', movieCtrl.getWatchlistDetails);

// Rename a specific watchlist by ID
router.put('/watchlists/:id', auth, movieCtrl.renameWatchlist);

// Delete a specific watchlist by ID
router.delete('/watchlists/:id', auth, movieCtrl.deleteWatchlist);

// Get all watchlists for a specific user (for public profiles)
router.get('/users/:userId/watchlists', movieCtrl.getUserWatchlists);

// Search for movies with filters and queries
router.get('/search', movieCtrl.searchMovies);

// Get all available genres from TMDB
router.get('/genres', movieCtrl.getGenres);

// Get trending movies from TMDB
router.get('/trending', movieCtrl.getTrending);

// Get personalized movie recommendations for the current user
router.get('/recommendations', auth, movieCtrl.getRecommendations);

// Get details for a specific movie by TMDB ID
router.get('/:id', movieCtrl.getMovieDetails);

module.exports = router;