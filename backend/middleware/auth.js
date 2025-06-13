const jwt = require('jsonwebtoken');
const User = require('../models/user');



/**
 * Authentication middleware for Express.
 * Checks for a valid JWT in the Authorization header and attaches the user to req.user.
 */
module.exports = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  // Ensure the Authorization header is present and formatted correctly
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    // Decode and verify the token using the server secret
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Find the user associated with the token
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user; // Attach user to request for downstream use
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Token not valid' });
  }
};