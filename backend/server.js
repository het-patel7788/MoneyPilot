const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const uploadRoutes = require('./routes/uploadRoutes'); // Kept your original import

dotenv.config();

const app = express();

// ==========================================
// 1. MIDDLEWARE (Security Fixes Added)
// ==========================================

// FIX #15: Limit Body Size to 10MB (Prevents server crashes from huge payloads)
app.use(express.json({ limit: '10mb' })); 
app.use(cors());

// ==========================================
// 2. DATABASE CONNECTION (Retry Logic Added)
// ==========================================

// FIX #14: Robust Connection Logic
// If internet blinks, this tries 5 times before giving up.
const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB Connected");
      return; // Success!
    } catch (err) {
      retries++;
      console.error(`❌ Connection attempt ${retries} failed. Retrying in 5s...`);
      // Wait 5 seconds before retrying
      await new Promise(res => setTimeout(res, 5000));
    }
  }

  console.error("🔥 Could not connect to MongoDB after 5 attempts. Exiting.");
  process.exit(1);
};

// Start Database Connection
connectDB();

// ==========================================
// 3. ROUTE MIDDLEWARE
// ==========================================
// This tells the server: "Go look in these files for the actual logic"
app.use('/api/transaction', require('./routes/transaction'));
app.use('/api/stats', require('./routes/stats'));
app.use('/api/upload', uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));