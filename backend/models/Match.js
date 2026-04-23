const mongoose = require('mongoose');

const MatchSchema = new mongoose.Schema({
  match_id: { type: String, required: true, unique: true },
  season: String,
  city: String,
  date: String,
  match_type: String,
  venue: String,
  team1: String,
  team2: String,
  toss_winner: String,
  toss_decision: String,
  winner: String,
  result: String,
  result_margin: Number,
  target_runs: Number,
  target_overs: Number
});

module.exports = mongoose.model('Match', MatchSchema);
