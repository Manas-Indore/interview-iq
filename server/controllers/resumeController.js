const axios = require('axios');
const FormData = require('form-data');
const Resume = require('../models/Resume');
const crypto = require('crypto');
const redis = require('../config/redis');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

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

    // Create a cache key based on the resume content
    const textHash = crypto.createHash('md5').update(extractedText).digest('hex');
    const cacheKey = `resume-analysis:${textHash}`;

    let skills, questions;

    // Check cache first
    const cached = await redis.get(cacheKey);

    if (cached) {
      console.log('Cache HIT — using cached AI analysis');
      skills = cached.skills;
      questions = cached.questions;
    } else {
      console.log('Cache MISS — calling AI service');

      // Step 2: Extract structured skills from that text
      const skillsResponse = await axios.post(`${AI_SERVICE_URL}/extract-skills`, {
        resume_text: extractedText
      });
      skills = skillsResponse.data;

      // Step 3: Generate interview questions based on those skills
      const questionsResponse = await axios.post(`${AI_SERVICE_URL}/generate-questions`, {
        skills: skills,
        num_questions: 5
      });
      questions = questionsResponse.data.questions;

      // Cache for 24 hours (86400 seconds)
      await redis.set(cacheKey, { skills, questions }, { ex: 86400 });
    }

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