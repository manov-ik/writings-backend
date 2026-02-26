const { Pool } = require('pg');

// Reuse pool across Vercel invocations (same pattern as index.js)
let pool = global.pgPool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  global.pgPool = pool;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  const { slug } = req.query;

  if (!slug) {
    return res.status(400).json({ error: 'Slug is required' });
  }

  try {
    const { rows } = await pool.query(
      'SELECT * FROM writings WHERE slug = $1 AND published = true',
      [slug]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Writing not found' });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message
    });
  }
};
