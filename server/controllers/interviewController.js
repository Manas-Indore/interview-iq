const axios = require('axios');
const InterviewSession = require('../models/InterviewSession');
const Resume = require('../models/Resume');

// Start a new interview session from a resume's questions
const startInterview = async (req, res) => {
  try {
    const { resumeId } = req.body;

    const resume = await Resume.findOne({ _id: resumeId, user: req.user.id });
    if (!resume) {
      return res.status(404).json({ message: 'Resume not found' });
    }

    const answers = resume.questions.map(q => ({
      question: q.question,
      category: q.category,
      difficulty: q.difficulty,
      userAnswer: ''
    }));

    const session = await InterviewSession.create({
      user: req.user.id,
      resume: resumeId,
      answers
    });

    res.status(201).json({ message: 'Interview started', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Submit an answer for a specific question in a session
const submitAnswer = async (req, res) => {
  try {
    const { sessionId, questionIndex, answer } = req.body;

    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    if (questionIndex < 0 || questionIndex >= session.answers.length) {
      return res.status(400).json({ message: 'Invalid question index' });
    }

    session.answers[questionIndex].userAnswer = answer;
    session.answers[questionIndex].answeredAt = new Date();

    await session.save();

    res.status(200).json({ message: 'Answer saved', session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Mark session as completed
const completeInterview = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await InterviewSession.findOne({ _id: sessionId, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Call AI service to evaluate all answers
    const qa_pairs = session.answers.map(a => ({
      question: a.question,
      category: a.category,
      difficulty: a.difficulty,
      userAnswer: a.userAnswer
    }));
    const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    const evalResponse = await axios.post(`${AI_SERVICE_URL}/evaluate-answers`, { 
      qa_pairs
    });

    session.evaluation = evalResponse.data;
    session.status = 'completed';
    session.completedAt = new Date();
    await session.save();

    res.status(200).json({ message: 'Interview completed and evaluated', session });
  } catch (err) {
    if (err.response) {
      return res.status(err.response.status).json({ message: err.response.data.detail });
    }
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// Get a single session (for resuming/viewing)
const getSession = async (req, res) => {
  try {
    const session = await InterviewSession.findOne({ _id: req.params.id, user: req.user.id });
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }
    res.status(200).json({ session });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = { startInterview, submitAnswer, completeInterview, getSession };