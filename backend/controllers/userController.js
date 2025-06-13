const User = require('../models/user');
const Watchlist = require('../models/watchlist');
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
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId)
    .populate('followers', 'username avatar')
    .populate('following', 'username avatar');
  if (!user) return res.status(404).json({ message: "User not found" });

  const Watchlist = require('../models/watchlist');
  const watchlists = await Watchlist.find({ user: user._id });

  res.json({
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    favorites: user.favorites || [],
    watchlists: watchlists || [],
    following: user.following || [],
    followers: user.followers || [],
    _id: user._id
  });
};

exports.updateProfile = async (req, res) => {
  const userId = req.user.id || req.user._id;
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });
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

// --- Social Feature Controllers (merged from socialController.js) ---

// Follow a user
exports.followUser = async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id); // always refetch for latest
  const { userId } = req.params;
  if (user._id.equals(userId)) return res.status(400).json({ message: "You cannot follow yourself" });
  const target = await User.findById(userId);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (!user.following.includes(userId)) user.following.push(userId);
  if (!target.followers.includes(user._id)) target.followers.push(user._id);
  await user.save();
  await target.save();
  res.json({ following: user.following });
};

// Unfollow a user
exports.unfollowUser = async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id); // always refetch
  const { userId } = req.params;
  const target = await User.findById(userId);
  if (!target) return res.status(404).json({ message: "User not found" });
  user.following = user.following.filter(f => !f.equals(userId));
  target.followers = target.followers.filter(f => !f.equals(user._id));
  await user.save();
  await target.save();
  res.json({ following: user.following });
};

// Get a user's followers
exports.getFollowers = async (req, res) => {
  const target = await User.findById(req.params.userId).populate('followers', 'username avatar');
  if (!target) return res.status(404).json({ message: "User not found" });
  res.json(target.followers);
};

// Get a user's following
exports.getFollowing = async (req, res) => {
  const target = await User.findById(req.params.userId).populate('following', 'username avatar');
  if (!target) return res.status(404).json({ message: "User not found" });
  res.json(target.following);
};