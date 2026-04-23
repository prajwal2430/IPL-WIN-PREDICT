const express = require('express');
const router = express.Router();
const Match = require('../models/Match');

// GET /api/matches - Get all matches (paginated or recent)
router.get('/', async (req, res) => {
  try {
    const matches = await Match.find().sort({ date: -1 }).limit(10);
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/matches/stats - Get some quick stats
router.get('/stats', async (req, res) => {
  try {
    const totalMatches = await Match.countDocuments();
    const teams = await Match.distinct('team1');
    res.json({ totalMatches, totalTeams: teams.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
