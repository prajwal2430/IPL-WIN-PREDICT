const express = require('express');
const router = express.Router();
const axios = require('axios');
const Prediction = require('../models/Prediction');

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5001';

// POST /api/predict
router.post('/', async (req, res) => {
  try {
    const inputData = req.body;

    // Validate essential fields
    const required = ['batting_team', 'bowling_team', 'venue', 'toss_winner',
                      'toss_decision', 'runs_left', 'balls_left', 'wickets_left', 'crr', 'rrr'];
    for (const field of required) {
      if (inputData[field] === undefined || inputData[field] === null) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    // Forward to Flask
    const flaskResp = await axios.post(`${FLASK_URL}/predict`, inputData, {
      timeout: 10000,
    });
    const prediction = flaskResp.data;

    // Persist to MongoDB (non-blocking)
    try {
      await Prediction.create({
        ...inputData,
        model_used: prediction.model_used,
        batting_win_prob: prediction.batting_win_prob,
        bowling_win_prob: prediction.bowling_win_prob,
        predicted_winner: prediction.predicted_winner,
      });
    } catch (_e) { /* ignore DB errors */ }

    return res.json(prediction);
  } catch (err) {
    const flaskError = err.response?.data?.error || err.message;
    return res.status(500).json({ error: flaskError });
  }
});

// GET /api/predict/history
router.get('/history', async (req, res) => {
  try {
    const history = await Prediction.find()
      .sort({ created_at: -1 })
      .limit(20);
    return res.json(history);
  } catch (_e) {
    return res.json([]);
  }
});

module.exports = router;
