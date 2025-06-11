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
exports.addFavorite = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  if (!user.favorites.includes(id)) user.favorites.push(id);
  await user.save();
  res.json(user.favorites);
};
exports.removeFavorite = async (req, res) => {
  const user = req.user;
  const { id } = req.params;
  user.favorites = user.favorites.filter(mid => mid !== id);
  await user.save();
  res.json(user.favorites);
};
exports.getFavorites = async (req, res) => {
  const user = req.user;
  res.json(user.favorites);
};

// Watchlists
// Create a new watchlist
exports.createWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name } = req.body;

    // Check for duplicates
    const exists = await Watchlist.findOne({ user: userId, name });
    if (exists) return res.status(400).json({ message: "Watchlist already exists" });

    const watchlist = await Watchlist.create({ user: userId, name, movies: [] });
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a watchlist
exports.deleteWatchlist = async (req, res) => {
  try {
    const userId = req.user.id; // <-- Define userId here!
    const name = req.params.name;
    console.log('Delete attempt:', { userId, name }); // Now userId is defined
    const result = await Watchlist.deleteOne({ user: userId, name });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Watchlist not found' });
    }
    res.json({ message: 'Watchlist deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete watchlist', details: err.message });
  }
};

// Add movie to a watchlist
exports.addToWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listName, movieId } = req.body;
    const watchlist = await Watchlist.findOne({ user: userId, name: listName });
    if (!watchlist) return res.status(404).json({ message: "Watchlist not found" });
    if (!watchlist.movies.includes(movieId)) watchlist.movies.push(movieId);
    await watchlist.save();
    res.json(watchlist);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Remove movie from a watchlist
exports.removeFromWatchlist = async (req, res) => {
  try {
    const userId = req.user.id;
    const { listName, movieId } = req.body;
    const watchlist = await Watchlist.findOne({ user: userId, name: listName });
    if (!watchlist) return res.status(404).json({ message: "Watchlist not found" });
    watchlist.movies = watchlist.movies.filter(m => m !== movieId);
    await watchlist.save();
    res.json(watchlist);
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



// Popular, trending, etc.
exports.getTrending = async (req, res) => {
  try {
    const { data } = await tmdb.get('/trending/movie/week');
    res.json(data.results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};