const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
  startInterview,
  submitAnswer,
  completeInterview,
  getSession
} = require('../controllers/interviewController');

router.post('/start', protect, startInterview);
router.post('/answer', protect, submitAnswer);
router.post('/complete', protect, completeInterview);
router.get('/:id', protect, getSession);

module.exports = router;