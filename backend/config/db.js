const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log(`[MongoDB] Attempting to connect to Atlas...`);
    const conn = await mongoose.connect(process.env.MONGO_URI, { family: 4 });
    console.log(`[MongoDB] Successfully Connected to: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[MongoDB] Atlas Connection Error: ${error.message}`);
    console.log(`[MongoDB] TIP: Make sure your IP is whitelisted in MongoDB Atlas (Network Access tab).`);
    
    // Fallback attempt for development
    try {
      console.log(`[MongoDB] Attempting fallback to local instance...`);
      await mongoose.connect('mongodb://localhost:27017/ipl_prediction');
      console.log(`[MongoDB] Connected to LOCAL instance.`);
    } catch (localError) {
      console.warn(`[MongoDB] Both Atlas and Local connections failed. Service running in offline mode.`);
    }
  }
};

module.exports = connectDB;
