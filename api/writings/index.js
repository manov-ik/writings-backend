const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(`
        SELECT * FROM writings 
        WHERE published = true 
        ORDER BY order_index ASC, created_at DESC
      `);
      res.json({ writings: rows, total: rows.length, page: 1, limit: 100 });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};