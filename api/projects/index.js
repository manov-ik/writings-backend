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

  // Cache 5 min, serve stale for 10 min while revalidating
  res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { rows } = await pool.query(`
      SELECT
        id,
        slug,
        title,
        short_description,
        long_description,
        tech_stack,
        tags,
        year,
        github_link,
        project_link,
        image_url,
        order_index,
        created_at
      FROM projects
      WHERE published = true
      ORDER BY order_index ASC, created_at DESC
      LIMIT 50
    `);

    res.status(200).json({
      projects: rows,
      total: rows.length
    });

  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      error: 'Database connection failed',
      message: error.message
    });
  }
};
