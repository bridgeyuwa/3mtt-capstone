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

// exports.profile = async (req, res) => {
//   // Always refetch user to ensure latest, and to avoid partial req.user
//   const userId = req.user.id || req.user._id;
//   const user = await User.findById(userId);
//   if (!user) return res.status(404).json({ message: "User not found" });

//   // Pull watchlists from their collection
//   const Watchlist = require('../models/watchlist');
//   const watchlists = await Watchlist.find({ user: user._id });

//   res.json({
//     username: user.username,
//     email: user.email,
//     bio: user.bio,
//     avatar: user.avatar,
//     favorites: user.favorites || [],
//     watchlists: watchlists || [],
//     following: user.following || [],
//     followers: user.followers || [],
//     _id: user._id
//   });
// };

exports.profile = async (req, res) => {
  // Always refetch user to ensure latest, and to avoid partial req.user
  const userId = req.user.id || req.user._id;
  // --- CHANGE BELOW: populate followers/following with username & avatar ---
  const user = await User.findById(userId)
    .populate('followers', 'username avatar')
    .populate('following', 'username avatar');
  if (!user) return res.status(404).json({ message: "User not found" });

  // Pull watchlists from their collection
  const Watchlist = require('../models/watchlist');
  const watchlists = await Watchlist.find({ user: user._id });



console.log("Followers:", user.followers);
console.log("Following:", user.following);

  res.json({
    username: user.username,
    email: user.email,
    bio: user.bio,
    avatar: user.avatar,
    favorites: user.favorites || [],
    watchlists: watchlists || [],
    // -- You now get full objects, not just IDs! --
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