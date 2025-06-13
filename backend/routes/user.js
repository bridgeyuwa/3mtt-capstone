const express = require('express');
const {
  register,
  login,
  profile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing
} = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

// Auth endpoints
router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, profile);
router.put('/me', auth, updateProfile);

// --- List all users (for Users Directory page) ---
router.get('/', async (req, res) => {
  const User = require('../models/user');
  // You may want to add 'avatar' and other public fields
  const users = await User.find({}, 'username _id avatar');
  res.json(users);
});

// --- Individual user profile, with followers/following info ---
router.get('/:userId', async (req, res) => {
  const User = require('../models/user');
  const user = await User.findById(req.params.userId)
    .select('-password') // never return password
    .populate('followers', '_id username avatar')
    .populate('following', '_id username avatar')
    .populate('watchlists') // if you want watchlists
    .lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// --- Social Features ---
router.post('/:userId/follow', auth, followUser);
router.post('/:userId/unfollow', auth, unfollowUser);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

module.exports = router;