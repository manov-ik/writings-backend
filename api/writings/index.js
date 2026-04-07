const { Pool } = require('pg');

// Reuse pool across Vercel invocations
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
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Let the frontend (sessionStorage) handle caching — don't cache at CDN level
  res.setHeader('Cache-Control', 'private, no-store');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get total count for pagination metadata
    const countResult = await pool.query('SELECT COUNT(*) FROM writings WHERE published = true');
    const total = parseInt(countResult.rows[0].count);

    const { rows } = await pool.query(`
      SELECT 
        id,
        title, 
        excerpt, 
        slug,
        read_time, 
        category, 
        order_index, 
        created_at 
      FROM writings 
      WHERE published = true 
      ORDER BY order_index DESC, created_at DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);

    res.status(200).json({
      writings: rows,
      total,
      page,
      limit
    });

  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      error: "Database connection failed",
      message: error.message
    });
  }
};
