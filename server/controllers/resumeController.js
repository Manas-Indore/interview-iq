const axios = require('axios');
const FormData = require('form-data');
const Resume = require('../models/Resume');

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Forward file to FastAPI service
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const aiResponse = await axios.post(
      'http://localhost:8000/parse-resume',
      formData,
      { headers: formData.getHeaders() }
    );

    const { extracted_text } = aiResponse.data;

    // Save to MongoDB, linked to logged-in user
    const resume = await Resume.create({
      user: req.user.id,
      filename: req.file.originalname,
      extractedText: extracted_text
    });

    res.status(201).json({
      message: 'Resume uploaded and parsed successfully',
      resume
    });
  } catch (err) {
    if (err.response) {
      // Error from FastAPI service
      return res.status(err.response.status).json({ message: err.response.data.detail });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadResume };