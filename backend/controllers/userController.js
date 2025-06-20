const User = require('../models/user');
const Watchlist = require('../models/watchlist');
const jwt = require('jsonwebtoken');

/**
 * Helper function to generate a JWT for a user.
 * Token expires in 7 days.
 */
const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

/**
 * Register a new user with username, email, and password.
 * Returns a JWT on success.
 */
exports.register = async (req, res) => {
  const { username, email, password } = req.body;
  try {
    // Prevent duplicate username or email
    if (await User.findOne({ $or: [{ username }, { email }] })) {
      return res.status(400).json({ message: 'User exists' });
    }
    const user = await User.create({ username, email, password });
    res.json({ token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Login user by username or email and password.
 * Returns a JWT if credentials are valid.
 */
exports.login = async (req, res) => {
  const { usernameOrEmail, password } = req.body;
  try {
    // Determine if usernameOrEmail is an email or username
    const user = await User.findOne(
      usernameOrEmail.includes('@')
        ? { email: usernameOrEmail }
        : { username: usernameOrEmail }
    );
    // Check user existence and password
    if (!user || !(await user.matchPassword(password))) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    res.json({ token: generateToken(user._id) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get the current user's profile, including watchlists and social info.
 */
exports.profile = async (req, res) => {
  const userId = req.user.id || req.user._id;
  // Populate followers and following with user info
  const user = await User.findById(userId)
    .populate('followers', 'username avatar')
    .populate('following', 'username avatar');
  if (!user) return res.status(404).json({ message: "User not found" });

  // Fetch all watchlists for the user
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

/**
 * Update the current user's bio and avatar.
 */
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

// --- Social Features ---

/**
 * Follow another user by user ID.
 * Cannot follow self. Updates both users' follower/following lists.
 */
exports.followUser = async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id); // always refetch for latest
  const { userId } = req.params;
  if (user._id.equals(userId)) {
    return res.status(400).json({ message: "You cannot follow yourself" });
  }
  const target = await User.findById(userId);
  if (!target) return res.status(404).json({ message: "User not found" });
  if (!user.following.includes(userId)) user.following.push(userId);
  if (!target.followers.includes(user._id)) target.followers.push(user._id);
  await user.save();
  await target.save();
  res.json({ following: user.following });
};

/**
 * Unfollow another user by user ID.
 * Updates both users' follower/following lists.
 */
exports.unfollowUser = async (req, res) => {
  const user = await User.findById(req.user.id || req.user._id);
  const { userId } = req.params;
  const target = await User.findById(userId);
  if (!target) return res.status(404).json({ message: "User not found" });
  user.following = user.following.filter(f => !f.equals(userId));
  target.followers = target.followers.filter(f => !f.equals(user._id));
  await user.save();
  await target.save();
  res.json({ following: user.following });
};

/**
 * Get the list of followers for a user by user ID.
 */
exports.getFollowers = async (req, res) => {
  const target = await User.findById(req.params.userId).populate('followers', 'username avatar');
  if (!target) return res.status(404).json({ message: "User not found" });
  res.json(target.followers);
};

/**
 * Get the list of users a user is following by user ID.
 */
exports.getFollowing = async (req, res) => {
  const target = await User.findById(req.params.userId).populate('following', 'username avatar');
  if (!target) return res.status(404).json({ message: "User not found" });
  res.json(target.following);
};

/**
 * List all users for Users Directory page. Returns minimal public info.
 */
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find({}, 'username _id avatar');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/**
 * Get an individual user's profile with followers, following, and watchlists. Excludes password from the response.
 */
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('followers', '_id username avatar')
      .populate('following', '_id username avatar')
      .populate('watchlists')
      .lean();
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};