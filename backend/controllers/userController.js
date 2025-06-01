const User = require('../models/user');
const jwt = require('jsonwebtoken');

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    if (await User.findOne({ $or: [{ username }, { email }] }))
      return res.status(400).json({ message: 'User exists' });
    const user = await User.create({ username, email, password });
    res.json({ token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    if (!user || !(await user.matchPassword(password)))
      return res.status(400).json({ message: 'Invalid credentials' });
    res.json({ token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.profile = async (req, res) => {
  const user = req.user;
  res.json({
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    favorites: user.favorites,
    watchlists: user.watchlists,
    following: user.following,
    followers: user.followers,
    _id: user._id
  });
};

exports.updateProfile = async (req, res) => {
  const user = req.user;
  const { bio, avatar } = req.body;
  user.bio = bio || user.bio;
  user.avatar = avatar || user.avatar;
  await user.save();
  res.json({
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar
  });
};