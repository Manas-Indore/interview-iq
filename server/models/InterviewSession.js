const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  question: String,
  category: String,
  difficulty: String,
  userAnswer: { type: String, default: '' },
  answeredAt: Date
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
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
});

module.exports = mongoose.model('InterviewSession', interviewSessionSchema);