require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const userRoutes = require('./routes/user');
const movieRoutes = require('./routes/movie');
const reviewRoutes = require('./routes/review');

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL, credentials: true }));
app.use(express.json());

app.use('/api/users', userRoutes);
app.use('/api/movies', movieRoutes);
app.use('/api/reviews', reviewRoutes);


app.get('/', (req, res) => {
  res.json({ status: 'Movie Recommendation App API running' });
});

app.get('/test-log', (req, res) => {
  console.log('Test log route hit!');
  res.send('ok');
});

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