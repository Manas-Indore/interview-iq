const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  filename: String,
  extractedText: String,
  skills: {
    technical_skills: [String],
    soft_skills: [String],
    experience_summary: String,
    projects: [String]
  },
  questions: [{
    question: String,
    category: String,
    difficulty: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Resume', resumeSchema);