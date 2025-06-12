const axios = require('axios');
const User = require('../models/user');
const Review = require('../models/review');
const Watchlist = require('../models/watchlist');


const TMDB_URL = 'https://api.themoviedb.org/3';

const tmdb = axios.create({
  baseURL: TMDB_URL,
  params: { api_key: process.env.TMDB_API_KEY }
});

// Search and filter movies
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

exports.getGenres = async (req, res) => {
  try {
    const { data } = await tmdb.get('/genre/movie/list');
    res.json(data.genres);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

exports.getRecommendations = async (req, res) => {
  try {
    const user = req.user;
    // Simple logic: recommend based on favorite genres or movies
    let genres = [];
    if (user.favorites.length) {
      const movies = await Promise.all(user.favorites.map(id =>
        tmdb.get(`/movie/${id}`)
      ));
      movies.forEach(m => {
        if (m.data.genres) genres.push(...m.data.genres.map(g => g.id));
      });
      genres = [...new Set(genres)];
    }
    let params = {};
    if (genres.length)
      params.with_genres = genres.join(',');
    params.sort_by = 'vote_average.desc';
    params.page = 1;
    const { data } = await tmdb.get('/discover/movie', { params });
    res.json(data.results.slice(0, 10));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Favorites
// exports.addFavorite = async (req, res) => {
//   const user = req.user;
//   const { id } = req.params;
//   if (!user.favorites.includes(id)) user.favorites.push(id);
//   await user.save();
//   res.json(user.favorites);
// };

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


// exports.removeFavorite = async (req, res) => {
//   const user = req.user;
//   const { id } = req.params;
//   user.favorites = user.favorites.filter(mid => mid !== id);
//   await user.save();
//   res.json(user.favorites);
// };

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


exports.getFavorites = async (req, res) => {
  const user = req.user;
  res.json(user.favorites);
};

// Watchlists
// Create a new watchlist (no change needed)
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

// FIXED: Delete a watchlist by _id
exports.deleteWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlistId = req.params.id; // <-- use id not name!
    console.log('Delete attempt:', { userId, watchlistId });
    const result = await Watchlist.deleteOne({ user: userId, _id: watchlistId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }
    res.json({ message: 'Watchlist deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete watchlist', details: err.message });
  }
};

// FIXED: Add movie to watchlist by _id
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

// FIXED: Remove movie from watchlist by _id
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

// Rename a watchlist by _id
exports.renameWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const watchlistId = req.params.id;
    const { name } = req.body;
    // Check for duplicate name for this user
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

// Get all watchlists for user
exports.getWatchlists = async (req, res) => {
  try {
    console.log('==== getWatchlists called ====');
    console.log('req.user:', req.user);

    if (!req.user) {
      console.error('No user on request!');
      return res.status(401).json({ message: 'Not authenticated' });
    }

    const userId = req.user.id || req.user._id;
    console.log('userId:', userId);

    if (!Watchlist) {
      console.error("Watchlist model is undefined!");
      return res.status(500).json({ message: "Watchlist model not defined" });
    }

    let watchlists;
    try {
      watchlists = await Watchlist.find({ user: userId });
      console.log('Watchlists query result:', watchlists);
    } catch (qerr) {
      console.error('Watchlist.find error:', qerr);
      return res.status(500).json({ message: `Query error: ${qerr.message}` });
    }

    res.json(watchlists);
  } catch (err) {
    console.error('getWatchlists (outer) error:', err);
    res.status(500).json({ message: err.message || 'Unknown error in getWatchlists' });
  }
};


// Get details for a single watchlist by ID

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



// Popular, trending, etc.
exports.getTrending = async (req, res) => {
  try {
    const { data } = await tmdb.get('/trending/movie/week');
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};