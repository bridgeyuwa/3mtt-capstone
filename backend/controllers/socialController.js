const User = require('../models/user');

// Follow a user
exports.followUser = async (req, res) => {
  const user = req.user;
  const { userId } = req.params;
  if (user._id.equals(userId)) return res.status(400).json({ message: "You Cannot follow yourself" });
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
  const user = req.user;
  const { userId } = req.params;
  const target = await User.findById(userId);
  if (!target) return res.status(404).json({ message: "User not found" });
  user.following = user.following.filter(f => !f.equals(userId));
  target.followers = target.followers.filter(f => !f.equals(user._id));
  await user.save();
  await target.save();
  res.json({ following: user.following });
};

// Get a user's followers/following
exports.getFollowers = async (req, res) => {
  const target = await User.findById(req.params.userId).populate('followers', 'username avatar');
  res.json(target.followers);
};
exports.getFollowing = async (req, res) => {
  const target = await User.findById(req.params.userId).populate('following', 'username avatar');
  res.json(target.following);
};