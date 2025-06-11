const express = require('express');
const asyncHandler = require('express-async-handler');
const agentService = require('../services/agentService');
const { agentProfileSchema, updateConnectionSchema } = require('../utils/validation');
const { protect, agentOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get agent profile
// @route   GET /api/agents/profile
// @access  Private (Agent only)
router.get('/profile', protect, agentOnly, asyncHandler(async (req, res) => {
  try {
    const profile = await agentService.getAgentProfile(req.user.id);
    
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

// @desc    Update agent profile
// @route   PUT /api/agents/profile
// @access  Private (Agent only)
router.put('/profile', protect, agentOnly, asyncHandler(async (req, res) => {
  const { error } = agentProfileSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  try {
    const profile = await agentService.updateAgentProfile(req.user.id, req.body);
    
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

// @desc    Get agent's properties
// @route   GET /api/agents/properties
// @access  Private (Agent only)
router.get('/properties', protect, agentOnly, asyncHandler(async (req, res) => {
  try {
    const properties = await agentService.getAgentProperties(req.user.id);
    
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

// @desc    Get agent's connections/leads
// @route   GET /api/agents/connections
// @access  Private (Agent only)
router.get('/connections', protect, agentOnly, asyncHandler(async (req, res) => {
  try {
    const { status } = req.query;
    const connections = await agentService.getAgentConnections(req.user.id, status);
    
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

// @desc    Update connection status
// @route   PUT /api/agents/connections/:id
// @access  Private (Agent only)
router.put('/connections/:id', protect, agentOnly, asyncHandler(async (req, res) => {
  const { error } = updateConnectionSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  try {
    const { status, notes } = req.body;
    const connection = await agentService.updateConnectionStatus(
      req.params.id,
      req.user.id,
      status,
      notes
    );
    
    res.status(200).json({
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

// @desc    Get agent statistics
// @route   GET /api/agents/stats
// @access  Private (Agent only)
router.get('/stats', protect, agentOnly, asyncHandler(async (req, res) => {
  try {
    const stats = await agentService.getAgentStats(req.user.id);
    
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

// @desc    Get all agents (public view for customers)
// @route   GET /api/agents
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  try {
    const { city, specialization, experience_min } = req.query;
    const filters = {};
    
    if (city) filters.city = city;
    if (specialization) filters.specialization = specialization;
    if (experience_min) filters.experience_min = parseInt(experience_min);

    const agents = await agentService.getAllAgents(filters);
    
    res.status(200).json({
      success: true,
      data: agents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Search agents
// @route   GET /api/agents/search
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  try {
    const { q: searchTerm, city, specialization } = req.query;
    const filters = {};
    
    if (city) filters.city = city;
    if (specialization) filters.specialization = specialization;

    const agents = await agentService.searchAgents(searchTerm, filters);
    
    res.status(200).json({
      success: true,
      data: agents
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get agent by ID (public view)
// @route   GET /api/agents/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const agent = await agentService.getAgentById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: agent
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
}));

module.exports = router; 