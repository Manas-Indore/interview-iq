const express = require('express');
const router = express.Router();
const { signup, login } = require('../controllers/authController');
const protect = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login', login);

router.get('/me', protect, (req, res) => {
  res.status(200).json({ message: 'You are authorized', userId: req.user.id });
});

module.exports = router;