const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    // Get token from Authorization header or cookies
    let token = null;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Check cookies if no header token
    if (!token && req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    
    // If no token found
    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'Access denied. No token provided.',
        error: 'Unauthorized'
      });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Add user info to request
    req.user = { id: decoded.id };
    
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid token',
        error: 'Unauthorized'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'error',
        message: 'Token expired',
        error: 'Unauthorized'
      });
    }
    
    return res.status(500).json({
      status: 'error',
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = { verifyToken };
