// Entry point for the Movie Recommendation App API server

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movie');
const reviewRoutes = require('./routes/review');

const app = express();

// Enable CORS for the frontend URL set in environment variables
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));

// Parse incoming JSON requests
app.use(express.json());

// User-related routes (authentication, profiles, social features)
app.use('/api/users', userRoutes);

// Movie-related routes (favorites, watchlists, search, recommendations)
app.use('/api/movies', movieRoutes);

// Review-related routes (add/update/retrieve reviews)
app.use('/api/reviews', reviewRoutes);

// Health check endpoint, remove in production
app.get('/', (req, res) => {
  res.json({ status: '3MTT Movie Recommendation App API running' });
});

/**
 * Start the server and connect to MongoDB.
 * Terminates the process if unable to connect.
 */
const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    app.listen(5000, () => console.log('Server running on port 5000'));
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();