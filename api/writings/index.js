const { Pool } = require('pg');

// Reuse pool across invocations (Vercel optimization)
let pool = global.pgPool;

if (!pool) {
  pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });
  global.pgPool = pool;
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Preflight
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { rows } = await pool.query(`
      SELECT title, excerpt, read_time, category, slug, published, order_index, created_at
      FROM writings
      WHERE published = true
      ORDER BY order_index ASC, created_at DESC
      LIMIT 100
    `);

    // Cache for 1 min (CDN), 30 sec stale (very safe)
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=30");

    res.status(200).json({
      writings: rows,
      total: rows.length,
      page: 1,
      limit: 100
    });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database connection failed",
      message: error.message,
      details: error.detail || null
    });
  }
};
