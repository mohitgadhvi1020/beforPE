import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// Lazy import function for database
async function getDb() {
  const { default: sql } = await import('../config/database.js');
  return sql;
}

// Protect routes - verify JWT token
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const sql = await getDb();
    const users = await sql`
      SELECT id, email, role, first_name, last_name, phone, send_bird_id, is_active
      FROM users WHERE id = ${decoded.id} AND is_active = true
    `;

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route'
      });
    }

    req.user = users[0];
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized to access this route'
    });
  }
});

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Agent-specific middleware
const agentOnly = authorize('agent');

// Customer-specific middleware
const customerOnly = authorize('customer');

// Admin-specific middleware
const adminOnly = authorize('admin');

export {
  protect,
  authorize,
  agentOnly,
  customerOnly,
  adminOnly
}; 