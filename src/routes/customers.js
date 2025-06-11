const express = require('express');
const asyncHandler = require('express-async-handler');
const customerService = require('../services/customerService');
const { customerProfileSchema, connectionRequestSchema } = require('../utils/validation');
const { protect, customerOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get customer profile
// @route   GET /api/customers/profile
// @access  Private (Customer only)
router.get('/profile', protect, customerOnly, asyncHandler(async (req, res) => {
  try {
    const profile = await customerService.getCustomerProfile(req.user.id);
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Update customer profile
// @route   PUT /api/customers/profile
// @access  Private (Customer only)
router.put('/profile', protect, customerOnly, asyncHandler(async (req, res) => {
  const { error } = customerProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  try {
    const profile = await customerService.updateCustomerProfile(req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get customer's connections
// @route   GET /api/customers/connections
// @access  Private (Customer only)
router.get('/connections', protect, customerOnly, asyncHandler(async (req, res) => {
  try {
    const { status } = req.query;
    const connections = await customerService.getCustomerConnections(req.user.id, status);
    
    res.status(200).json({
      success: true,
      data: connections
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Create connection request to agent
// @route   POST /api/customers/connections
// @access  Private (Customer only)
router.post('/connections', protect, customerOnly, asyncHandler(async (req, res) => {
  const { error } = connectionRequestSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  try {
    const connection = await customerService.createConnectionRequest(req.user.id, req.body);
    
    res.status(201).json({
      success: true,
      data: connection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get customer's favorite properties
// @route   GET /api/customers/favorites
// @access  Private (Customer only)
router.get('/favorites', protect, customerOnly, asyncHandler(async (req, res) => {
  try {
    const favorites = await customerService.getFavoriteProperties(req.user.id);
    
    res.status(200).json({
      success: true,
      data: favorites
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Add property to favorites
// @route   POST /api/customers/favorites/:propertyId
// @access  Private (Customer only)
router.post('/favorites/:propertyId', protect, customerOnly, asyncHandler(async (req, res) => {
  try {
    const favorite = await customerService.addToFavorites(req.user.id, req.params.propertyId);
    
    res.status(201).json({
      success: true,
      data: favorite
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Remove property from favorites
// @route   DELETE /api/customers/favorites/:propertyId
// @access  Private (Customer only)
router.delete('/favorites/:propertyId', protect, customerOnly, asyncHandler(async (req, res) => {
  try {
    const result = await customerService.removeFromFavorites(req.user.id, req.params.propertyId);
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get recommended properties
// @route   GET /api/customers/recommendations
// @access  Private (Customer only)
router.get('/recommendations', protect, customerOnly, asyncHandler(async (req, res) => {
  try {
    const { limit } = req.query;
    const properties = await customerService.getRecommendedProperties(
      req.user.id, 
      limit ? parseInt(limit) : 10
    );
    
    res.status(200).json({
      success: true,
      data: properties
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get customer statistics
// @route   GET /api/customers/stats
// @access  Private (Customer only)
router.get('/stats', protect, customerOnly, asyncHandler(async (req, res) => {
  try {
    const stats = await customerService.getCustomerStats(req.user.id);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

module.exports = router; 