const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. POSTGRES CONNECTION ---
const pool = new Pool({
  user: 'counter_user',
  host: 'localhost',
  database: 'counter_db',
  password: '***REMOVED***',
  port: 5432,
});

// --- 2. MONGO ATLAS CONNECTION ---
// REPLACE 'YOUR_REAL_PASSWORD' BELOW!
const MONGO_URL = '***REMOVED***';

mongoose.connect(MONGO_URL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('Mongo Error:', err));

// Mongo Schema
const LogSchema = new mongoose.Schema({
  action: String,
  timestamp: { type: Date, default: Date.now }
});
const Log = mongoose.model('Log', LogSchema);

// --- ROUTES ---

app.get('/count', async (req, res) => {
  try {
    const pgResult = await pool.query('SELECT value FROM counts WHERE id = 1');
    const countValue = pgResult.rows[0].value;
    const recentLogs = await Log.find().sort({ timestamp: -1 }).limit(5);
    res.json({ value: countValue, logs: recentLogs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

app.post('/increment', async (req, res) => {
  try {
    const pgResult = await pool.query('UPDATE counts SET value = value + 1 WHERE id = 1 RETURNING value');
    const newLog = new Log({ action: 'Incremented Counter via Atlas' });
    await newLog.save();
    res.json({ value: pgResult.rows[0].value });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

app.listen(3001, () => {
  console.log('Server running on port 3001');
});
