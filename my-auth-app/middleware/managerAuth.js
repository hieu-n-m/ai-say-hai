const jwt = require('jsonwebtoken');
const User = require('../models/User');

module.exports = async function(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(401).json({ msg: 'User not found' });
    }
    if (user.role !== 'manager') {
      return res.status(403).json({ msg: 'Access denied. Manager role required.' });
    }
    next();
  } catch (err) {
    console.error('Error in manager authentication:', err.message);
    res.status(500).send('Server Error');
  }
};
