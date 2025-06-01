const axios = require('axios');
const User = require('../models/user');
const Review = require('../models/review');

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
exports.createWatchlist = async (req, res) => {
  const user = req.user;
  const { name } = req.body;
  if (user.watchlists.find(wl => wl.name === name))
    return res.status(400).json({ message: "Watchlist already exists" });
  user.watchlists.push({ name, movies: [] });
  await user.save();
  res.json(user.watchlists);
};
exports.addToWatchlist = async (req, res) => {
  const user = req.user;
  const { listName, movieId } = req.body;
  const list = user.watchlists.find(wl => wl.name === listName);
  if (!list) return res.status(404).json({ message: "Watchlist not found" });
  if (!list.movies.includes(movieId)) list.movies.push(movieId);
  await user.save();
  res.json(list);
};
exports.removeFromWatchlist = async (req, res) => {
  const user = req.user;
  const { listName, movieId } = req.body;
  const list = user.watchlists.find(wl => wl.name === listName);
  if (!list) return res.status(404).json({ message: "Watchlist not found" });
  list.movies = list.movies.filter(m => m !== movieId);
  await user.save();
  res.json(list);
};
exports.getWatchlists = async (req, res) => {
  const user = req.user;
  res.json(user.watchlists);
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