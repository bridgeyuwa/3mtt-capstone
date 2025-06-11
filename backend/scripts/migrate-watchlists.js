const mongoose = require('mongoose');
const User = require('../models/user');
const Watchlist = require('../models/watchlist');

async function migrate() {
  await mongoose.connect('mongodb+srv://3mtt:6789998212@cluster0.guguq4e.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  const users = await User.find({});
  for (const user of users) {
    for (const wl of user.watchlists) {
      await Watchlist.create({
        user: user._id,
        name: wl.name,
        movies: wl.movies
      });
    }
  }
  console.log('Migration complete!');
  mongoose.disconnect();
}

migrate();