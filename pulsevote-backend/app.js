const express = require('express');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();
const authRoutes = require("./routes/authRoutes");


const cors = require('cors');


const { protect } = require("./middleware/authMiddleware");


const app = express();


app.use(express.json());



app.use("/api/auth", authRoutes);
app.use(helmet());
app.use(cors({
  origin: "https://localhost:5173",
  credentials: true
}));

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: `Welcome, user ${req.user.id}! You have accessed protected data.`,
    timestamp: new Date()
  });
});

app.get('/', (req, res) => {
res.send('PulseVote API running!');
});

app.get('/test', (req, res) => {
    res.json({
    message: 'This is a test endpoint from PulseVote API!',
    status: 'success',
    timestamp: new Date()
    });
});

module.exports = app;