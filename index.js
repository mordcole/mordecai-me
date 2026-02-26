const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const mongoose = require('mongoose');

// Load environment variables from .env into process.env.
// Without this call, dotenv has no effect — which is why credentials
// were previously hardcoded. Now all sensitive values live in .env,
// which should never be committed to version control.
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- 1. POSTGRES CONNECTION ---
// Falls back to an in-memory counter if Postgres is unavailable.
let pgAvailable = true;
let memoryCounter = 0;

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});

pool.query('SELECT 1')
  .then(() => console.log('Connected to PostgreSQL'))
  .catch(() => {
    pgAvailable = false;
    console.warn('PostgreSQL unavailable — using in-memory counter');
  });

// --- 2. MONGO ATLAS CONNECTION ---
const MONGO_URL = process.env.MONGO_URL;

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
    let countValue;
    if (pgAvailable) {
      const pgResult = await pool.query('SELECT value FROM counts WHERE id = 1');
      countValue = pgResult.rows[0].value;
    } else {
      countValue = memoryCounter;
    }
    const recentLogs = await Log.find().sort({ timestamp: -1 }).limit(5);
    res.json({ value: countValue, logs: recentLogs });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

app.post('/increment', async (req, res) => {
  try {
    let newValue;
    if (pgAvailable) {
      const pgResult = await pool.query('UPDATE counts SET value = value + 1 WHERE id = 1 RETURNING value');
      newValue = pgResult.rows[0].value;
    } else {
      newValue = ++memoryCounter;
    }
    const newLog = new Log({ action: 'Incremented Counter via Atlas' });
    await newLog.save();
    res.json({ value: newValue });
  } catch (err) {
    console.error(err);
    res.status(500).send('Database Error');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
