// Simple test endpoint to debug CORS and basic functionality
module.exports = async (req, res) => {
  // Set CORS headers
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
      // Simple test response without database
      res.status(200).json({ 
        message: 'API is working!',
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ 
        error: 'Server error',
        message: error.message 
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};
