const mongoose = require('mongoose');

const predictionSchema = new mongoose.Schema({
  batting_team: { type: String, required: true },
  bowling_team: { type: String, required: true },
  venue: { type: String, required: true },
  toss_winner: String,
  toss_decision: String,
  current_score: Number,
  wickets: Number,
  overs: Number,
  runs_left: Number,
  balls_left: Number,
  crr: Number,
  rrr: Number,
  model_used: String,
  batting_win_prob: Number,
  bowling_win_prob: Number,
  predicted_winner: String,
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Prediction', predictionSchema);
