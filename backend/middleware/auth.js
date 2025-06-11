const jwt = require('jsonwebtoken');
const User = require('../models/user');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.log('No auth header');
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('auth decoded:', decoded); // <--- ADD THIS
    req.user = decoded;
    next();
  } catch (err) {
    console.log('Auth error:', err);
    return res.status(401).json({ message: 'Token not valid' });
  }
};