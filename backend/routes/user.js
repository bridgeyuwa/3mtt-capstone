const express = require('express');
const { register, login, profile, updateProfile } = require('../controllers/userController');
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, profile);
router.put('/me', auth, updateProfile);

// (Optional social: list all users, for frontend Social.js)
router.get('/all', async (req, res) => {
  const User = require('../models/user');
  const users = await User.find({}, 'username _id');
  res.json(users);
});


router.get('/:userId', async (req, res) => {
  const User = require('../models/user');
  const user = await User.findById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

module.exports = router;