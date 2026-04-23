require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Match = require('../models/Match');

const CSV_PATH = path.join(__dirname, '../../matches.csv');

async function seed() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) throw new Error("MONGO_URI not found in .env");

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas");

    // Clear existing
    await Match.deleteMany({});
    console.log("Cleared existing matches");

    const data = fs.readFileSync(CSV_PATH, 'utf8');
    const lines = data.split('\n');
    const headers = lines[0].split(',');

    const matches = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      
      // Simple CSV parsing (doesn't handle commas in quotes perfectly, but matches.csv is simple)
      // Actually, matches.csv HAS commas in quotes (venues). Let's use a regex.
      const cols = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
      
      const matchObj = {
        match_id: cols[0],
        season: cols[1],
        city: cols[2],
        date: cols[3],
        match_type: cols[4],
        venue: cols[6]?.replace(/"/g, ''),
        team1: cols[7],
        team2: cols[8],
        toss_winner: cols[9],
        toss_decision: cols[10],
        winner: cols[11],
        result: cols[12],
        result_margin: parseInt(cols[13]) || 0,
        target_runs: parseInt(cols[14]) || 0,
        target_overs: parseInt(cols[15]) || 0
      };
      
      matches.push(matchObj);
    }

    await Match.insertMany(matches);
    console.log(`Successfully seeded ${matches.length} matches from matches.csv`);
    
    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
