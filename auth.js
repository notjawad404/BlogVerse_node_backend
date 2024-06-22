// auth.js

const jwt = require('jsonwebtoken');

// Secret key for JWT
const JWT_SECRET = 'your_secret_key';

// Generate a JWT token
const generateToken = (user) => {
  const payload = {
    id: user._id,
    username: user.username,
    email: user.email,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.header('Authorization');

  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(400).json({ message: 'Invalid token.' });
  }
};

module.exports = { generateToken, verifyToken };
