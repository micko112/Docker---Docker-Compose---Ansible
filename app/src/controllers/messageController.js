const pool = require('../config/db');

async function getHealth(req, res) {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', db: 'up' });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'down', error: err.message });
  }
}

async function getMessages(req, res) {
  try {
    const result = await pool.query('SELECT id, body, created_at FROM messages ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createMessage(req, res) {
  const body = req.body.body;

  if (!body) {
    res.status(400).json({ error: 'Polje "body" je obavezno.' });
    return;
  }

  try {
    const result = await pool.query(
      'INSERT INTO messages (body) VALUES ($1) RETURNING id, body, created_at',
      [body]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getHealth,
  getMessages,
  createMessage,
};
