const axios = require('axios');
const FormData = require('form-data');
const Resume = require('../models/Resume');

const AI_SERVICE_URL = 'http://localhost:8000';

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Step 1: Parse resume (extract text)
    const formData = new FormData();
    formData.append('file', req.file.buffer, req.file.originalname);

    const parseResponse = await axios.post(
      `${AI_SERVICE_URL}/parse-resume`,
      formData,
      { headers: formData.getHeaders() }
    );

    const extractedText = parseResponse.data.extracted_text;

    // Step 2: Extract structured skills from that text
    const skillsResponse = await axios.post(`${AI_SERVICE_URL}/extract-skills`, {
      resume_text: extractedText
    });

    const skills = skillsResponse.data;

    // Step 3: Generate interview questions based on those skills
    const questionsResponse = await axios.post(`${AI_SERVICE_URL}/generate-questions`, {
      skills: skills,
      num_questions: 5
    });

    const questions = questionsResponse.data.questions;

    // Step 4: Save everything to MongoDB
    const resume = await Resume.create({
      user: req.user.id,
      filename: req.file.originalname,
      extractedText,
      skills,
      questions
    });

    res.status(201).json({
      message: 'Resume processed successfully',
      resume
    });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ message: err.response.data.detail });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { uploadResume };