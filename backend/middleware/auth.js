const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header');
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('auth decoded:', decoded);
    // The payload might be { id: user._id, ... }
    // So, fetch the user from the database:
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user; // <-- Now req.user._id exists!
    next();
  } catch (err) {
    console.log('Auth error:', err);
    return res.status(401).json({ message: 'Token not valid' });
  }
};