const express = require('express');
const router = express.Router();
const multer = require('multer');
const protect = require('../middleware/auth');
const { uploadResume } = require('../controllers/resumeController');

const upload = multer({ storage: multer.memoryStorage() });

router.post('/upload', protect, upload.single('file'), uploadResume);

module.exports = router;