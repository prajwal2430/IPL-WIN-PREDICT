require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const dns = require('node:dns');

// Fix for querySrv ECONNREFUSED with MongoDB Atlas
dns.setDefaultResultOrder('ipv4first');

const connectDB = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Database (non-blocking)
connectDB();

// Routes
app.use('/api/predict', require('./routes/predict'));
app.use('/api/meta', require('./routes/meta'));
app.use('/api/matches', require('./routes/matches'));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'IPL Prediction Backend' }));

// 404
app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

// Start server only if not in Vercel/Serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[Server] Running on http://localhost:${PORT}`);
  });
}

module.exports = app;
