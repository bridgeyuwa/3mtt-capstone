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
  getFollowing,
  listUsers,
  getUserProfile
} = require('../controllers/userController');
const auth = require('../middleware/auth');
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
router.get('/', listUsers);

/**
 * Get an individual user's profile with followers, following, and watchlists.
 * Excludes password from the response.
 */
router.get('/:userId', getUserProfile);

// Follow another user by userId (authenticated)
router.post('/:userId/follow', auth, followUser);

// Unfollow another user by userId (authenticated)
router.post('/:userId/unfollow', auth, unfollowUser);

// Get all followers for a specific user by userId
router.get('/:userId/followers', getFollowers);

// Get all users that a specific user is following by userId
router.get('/:userId/following', getFollowing);

module.exports = router;