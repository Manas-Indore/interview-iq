const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: String,
  category: String,
  difficulty: String,
  userAnswer: { type: String, default: '' },
  answeredAt: Date
});

const evaluationItemSchema = new mongoose.Schema({
  score: Number,
  strengths: String,
  improvements: String,
  ideal_answer_summary: String
});

const interviewSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume',
    required: true
  },
  answers: [answerSchema],
  status: {
    type: String,
    enum: ['in-progress', 'completed'],
    default: 'in-progress'
  },
  evaluation: {
    evaluations: [evaluationItemSchema],
    overall_score: Number,
    overall_feedback: String
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);