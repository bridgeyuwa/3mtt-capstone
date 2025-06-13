const axios = require('axios');
const User = require('../models/user');
const Review = require('../models/review');
const Watchlist = require('../models/watchlist');

const TMDB_URL = 'https://api.themoviedb.org/3';

// Axios instance for TMDB with API key
const tmdb = axios.create({
  baseURL: TMDB_URL,
  params: { api_key: process.env.TMDB_API_KEY }
});

/**
 * Search and filter movies using TMDB.
 * Supports query, genre, year, rating, and sorting.
 */
exports.searchMovies = async (req, res) => {
  const { query, genre, year, rating, sort_by, page = 1 } = req.query;
  try {
    let url, params;
    if (query) {
      url = '/search/movie';
      params = { query, year, page };
    } else {
      url = '/discover/movie';
      params = {
        with_genres: genre,
        primary_release_year: year,
        'vote_average.gte': rating,
        sort_by: sort_by || 'popularity.desc',
        page
      };
    }
    const { data } = await tmdb.get(url, { params });
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Fetch all available movie genres from TMDB.
 */
exports.getGenres = async (req, res) => {
  try {
    const { data } = await tmdb.get('/genre/movie/list');
    res.json(data.genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get detailed information for a specific movie, including videos and credits.
 */
exports.getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = await tmdb.get(`/movie/${id}`, {
      params: { append_to_response: 'videos,credits' }
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get movie recommendations for the user.
 * Recommendations are based on user's favorite genres and favorite movies.
 */
exports.getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    let genres = [];
    // Collect genres from user's favorites
    if (user.favorites.length) {
      const movies = await Promise.all(user.favorites.map(id =>
        tmdb.get(`/movie/${id}`).catch(() => null)
      ));
      movies.forEach(m => {
        if (m && m.data.genres) genres.push(...m.data.genres.map(g => g.id));
      });
      // Count and sort genres by frequency
      const genreCounts = {};
      genres.forEach(g => genreCounts[g] = (genreCounts[g] || 0) + 1);
      const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .map(entry => entry[0]);
      genres = sortedGenres.slice(0, 2); // Use top 2 genres
    }

    let results = [];
    // Get recommendations from TMDB for each favorite movie
    if (user.favorites.length) {
      const recs = await Promise.all(user.favorites.slice(0, 3).map(id =>
        tmdb.get(`/movie/${id}/recommendations`).then(r => r.data.results).catch(() => [])
      ));
      results = recs.flat();
    }

    // Fallback: discover movies by the user's top genres
    if ((!results || results.length === 0) && genres.length) {
      const params = {
        with_genres: genres.join(','),
        sort_by: 'vote_average.desc',
        page: 1,
        'vote_count.gte': 100
      };
      const { data } = await tmdb.get('/discover/movie', { params });
      results = data.results;
    }

    // Fallback: trending movies if no recommendations above
    if (!results || results.length === 0) {
      const { data } = await tmdb.get('/trending/movie/week');
      results = data.results;
    }

    // Remove duplicate movies (by movie ID) and limit to 10
    const unique = [];
    const seen = new Set();
    for (const movie of results) {
      if (!seen.has(movie.id)) {
        unique.push(movie);
        seen.add(movie.id);
      }
      if (unique.length === 10) break;
    }

    res.json(unique);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Add a movie to the current user's favorites.
 */
exports.addFavorite = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { id } = req.params;
  if (!Array.isArray(user.favorites)) user.favorites = [];
  if (!user.favorites.includes(id)) user.favorites.push(id);
  await user.save();
  res.json(user.favorites);
};

/**
 * Remove a movie from the current user's favorites.
 */
exports.removeFavorite = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
  const { id } = req.params;
  if (!Array.isArray(user.favorites)) user.favorites = [];
  user.favorites = user.favorites.filter(mid => mid !== id);
  await user.save();
  res.json(user.favorites);
};

/**
 * Get the list of movie IDs in the user's favorites.
 */
exports.getFavorites = async (req, res) => {
  const user = req.user;
  res.json(user.favorites);
};

/**
 * Create a new watchlist for the current user.
 * Watchlist names must be unique per user.
 */
exports.createWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;
    const exists = await Watchlist.findOne({ user: userId, name });
    if (exists) return res.status(400).json({ message: "Watchlist already exists" });
    const watchlist = await Watchlist.create({ user: userId, name, movies: [] });
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Delete a watchlist by its ID for the current user.
 */
exports.deleteWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlistId = req.params.id;
    const result = await Watchlist.deleteOne({ user: userId, _id: watchlistId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }
    res.json({ message: 'Watchlist deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete watchlist', details: err.message });
  }
};

/**
 * Add a movie to a specific watchlist.
 */
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { watchlistId, movieId } = req.body;
    const watchlist = await Watchlist.findOne({ user: userId, _id: watchlistId });
    if (!watchlist) return res.status(404).json({ message: "Watchlist not found" });
    if (!watchlist.movies.includes(movieId)) watchlist.movies.push(movieId);
    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Remove a movie from a specific watchlist.
 */
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { watchlistId, movieId } = req.body;
    const watchlist = await Watchlist.findOne({ user: userId, _id: watchlistId });
    if (!watchlist) return res.status(404).json({ message: "Watchlist not found" });
    watchlist.movies = watchlist.movies.filter(m => m !== movieId);
    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Rename an existing watchlist (watchlist names must be unique per user).
 */
exports.renameWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlistId = req.params.id;
    const { name } = req.body;
    // Prevent duplicate watchlist names for the user
    const existing = await Watchlist.findOne({ user: userId, name });
    if (existing) {
      return res.status(400).json({ message: "You already have a watchlist with that name." });
    }
    const updated = await Watchlist.findOneAndUpdate(
      { user: userId, _id: watchlistId },
      { name },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Watchlist not found" });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Retrieve all watchlists for the current user.
 */
exports.getWatchlists = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    const userId = req.user.id || req.user._id;
    if (!Watchlist) {
      return res.status(500).json({ message: "Watchlist model not defined" });
    }
    let watchlists;
    try {
      watchlists = await Watchlist.find({ user: userId });
    } catch (qerr) {
      return res.status(500).json({ message: `Query error: ${qerr.message}` });
    }
    res.json(watchlists);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Unknown error in getWatchlists' });
  }
};

/**
 * Get details for a single watchlist by its ID.
 */
exports.getWatchlistDetails = async (req, res) => {
  try {
    const watchlist = await Watchlist.findById(req.params.id);
    if (!watchlist) {
      return res.status(404).json({ message: "Watchlist not found" });
    }
    res.json(watchlist);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get currently trending movies from TMDB.
 */
exports.getTrending = async (req, res) => {
  try {
    const { data } = await tmdb.get('/trending/movie/week');
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get all watchlists for a specific user by user ID.
 * Useful for viewing another user's profile.
 */
exports.getUserWatchlists = async (req, res) => {
  try {
    const { userId } = req.params;
    const watchlists = await Watchlist.find({ user: userId });
    res.json(watchlists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};