const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.NEON_DATABASE_URL,
});

module.exports = async (req, res) => {
  // Set CORS headers - more comprehensive
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  if (req.method === 'GET') {
    try {
      const { slug } = req.query;
      
      if (!slug) {
        return res.status(400).json({ error: 'Slug is required' });
      }
      
      const { rows } = await pool.query('SELECT * FROM writings WHERE slug = $1', [slug]);
      
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
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
