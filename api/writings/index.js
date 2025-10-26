const { Pool } = require('pg');

// Initialize pool with error handling
let pool;
try {
  pool = new Pool({
    connectionString: process.env.NEON_DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });
} catch (error) {
  console.error('Failed to create database pool:', error);
}

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
      // Check if pool is initialized
      if (!pool) {
        return res.status(500).json({ 
          error: 'Database not initialized',
          message: 'Database connection pool failed to initialize'
        });
      }

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
        message: error.message,
        details: error.detail || 'No additional details'
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};