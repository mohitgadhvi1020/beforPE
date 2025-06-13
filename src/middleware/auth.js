import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import authService from '../services/authService.js';

// Lazy import function for database
async function getDb() {
  try {
    const { default: sql } = await import('../config/database.js');
    return sql;
  } catch (error) {
    throw new Error('Database connection failed. Please check your database configuration.');
  }
}

// Check if we should use mock service
function shouldUseMock() {
  return process.env.DB_TYPE === 'mock' || process.env.NODE_ENV === 'production';
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
    
    // Get user profile using auth service
    const user = await authService.getProfile(decoded.id);
    req.user = user;
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

// Agent only middleware
const agentOnly = (req, res, next) => {
  if (req.user.role !== 'agent') {
    return res.status(403).json({
      success: false,
      error: 'Only agents can access this route'
    });
  }
  next();
};

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