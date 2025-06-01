const express = require('express');
const auth = require('../middleware/auth');
const socialCtrl = require('../controllers/socialController');

const router = express.Router();

router.post('/follow/:userId', auth, socialCtrl.followUser);
router.post('/unfollow/:userId', auth, socialCtrl.unfollowUser);

router.get('/followers/:userId', socialCtrl.getFollowers);
router.get('/following/:userId', socialCtrl.getFollowing);

module.exports = router;