const express = require('express');
const router = express.Router();
const axios = require('axios');

const FLASK_URL = process.env.FLASK_URL || 'http://localhost:5001';

// GET /api/meta/teams
router.get('/teams', async (req, res) => {
  try {
    const r = await axios.get(`${FLASK_URL}/teams`);
    res.json(r.data);
  } catch {
    res.json({ teams: [] });
  }
});

// GET /api/meta/venues
router.get('/venues', async (req, res) => {
  try {
    const r = await axios.get(`${FLASK_URL}/venues`);
    res.json(r.data);
  } catch {
    res.json({ venues: [] });
  }
});

// GET /api/meta/model-accuracies
router.get('/model-accuracies', async (req, res) => {
  try {
    const r = await axios.get(`${FLASK_URL}/model-accuracies`);
    res.json(r.data);
  } catch {
    res.json({});
  }
});

// POST /api/meta/commentary
router.post('/commentary', async (req, res) => {
  try {
    const r = await axios.post(`${FLASK_URL}/commentary`, req.body);
    res.json(r.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
