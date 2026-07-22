// 1. Load environment variables FIRST!
require('dotenv').config();

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const fs = require('fs');
const https = require('https');
const mongoose = require('mongoose');
const app = require('./app');

const PORT = process.env.PORT || 5000;

const options = {
  key: fs.readFileSync('ssl/key.pem'),
  cert: fs.readFileSync('ssl/cert.pem'),
};

// 2. Connect to database
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected successfully!');
    // 3. Start server ONLY after successful DB connection
    https.createServer(options, app).listen(PORT, () => {
      console.log('Server running at https://localhost:' + PORT);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });