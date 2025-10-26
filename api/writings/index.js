const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      const { rows } = await pool.query(`
        SELECT * FROM writings 
        WHERE published = true 
        ORDER BY order_index ASC, created_at DESC
      `);
      
      res.status(200).json({ 
        writings: rows, 
        total: rows.length, 
        page: 1, 
        limit: 100 
      });
    } catch (error) {
      console.error('Database error:', error);
      res.status(500).json({ 
        error: 'Database connection failed',
        message: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};