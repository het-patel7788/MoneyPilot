const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.log(err));

// ==========================================
//  ✅ ROUTE MIDDLEWARE (The Only Way)
// ==========================================
// This tells the server: "Go look in these files for the actual logic"
app.use('/api/transaction', require('./routes/transaction'));
app.use('/api/stats', require('./routes/stats'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));