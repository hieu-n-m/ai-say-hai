const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.get('/protected', auth, (req, res) => {
    res.json({ msg: `Welcome, user ${req.user.id}` });
});

module.exports = router;
