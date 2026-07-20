const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

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