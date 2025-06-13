// Express router for user-related endpoints: authentication, profile management, listing users, individual user profiles, and social features.
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
const User = require('../models/user'); // <-- moved to top
const router = express.Router();

// Register a new user
router.post('/register', register);

// User login
router.post('/login', login);

// Get the authenticated user's profile
router.get('/me', auth, profile);

// Update the authenticated user's profile
router.put('/me', auth, updateProfile);

/**
 * List all users for Users Directory page.
 * Returns minimal public info: username, _id, avatar.
 */
router.get('/', async (req, res) => {
  const users = await User.find({}, 'username _id avatar');
  res.json(users);
});

/**
 * Get an individual user's profile with followers, following, and watchlists.
 * Excludes password from the response.
 */
router.get('/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
    .select('-password')
    .populate('followers', '_id username avatar')
    .populate('following', '_id username avatar')
    .populate('watchlists')
    .lean();
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// Follow another user by userId (authenticated)
router.post('/:userId/follow', auth, followUser);

// Unfollow another user by userId (authenticated)
router.post('/:userId/unfollow', auth, unfollowUser);

// Get all followers for a specific user by userId
router.get('/:userId/followers', getFollowers);

// Get all users that a specific user is following by userId
router.get('/:userId/following', getFollowing);

module.exports = router;