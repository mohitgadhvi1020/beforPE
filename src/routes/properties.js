const express = require('express');
const asyncHandler = require('express-async-handler');
const propertyService = require('../services/propertyService');
const { propertySchema } = require('../utils/validation');
const { protect, agentOnly } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all properties (public)
// @route   GET /api/properties
// @access  Public
router.get('/', asyncHandler(async (req, res) => {
  try {
    const {
      property_type,
      price_min,
      price_max,
      bedrooms,
      bathrooms,
      city,
      state,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {};
    if (property_type) filters.property_type = property_type;
    if (price_min) filters.price_min = parseFloat(price_min);
    if (price_max) filters.price_max = parseFloat(price_max);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);
    if (city) filters.city = city;
    if (state) filters.state = state;

    const result = await propertyService.getAllProperties(
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
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

// @desc    Search properties
// @route   GET /api/properties/search
// @access  Public
router.get('/search', asyncHandler(async (req, res) => {
  try {
    const {
      q: searchTerm,
      property_type,
      price_min,
      price_max,
      bedrooms,
      bathrooms,
      page = 1,
      limit = 20
    } = req.query;

    const filters = {};
    if (property_type) filters.property_type = property_type;
    if (price_min) filters.price_min = parseFloat(price_min);
    if (price_max) filters.price_max = parseFloat(price_max);
    if (bedrooms) filters.bedrooms = parseInt(bedrooms);
    if (bathrooms) filters.bathrooms = parseInt(bathrooms);

    const result = await propertyService.searchProperties(
      searchTerm,
      filters,
      parseInt(page),
      parseInt(limit)
    );
    
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

// @desc    Get featured properties
// @route   GET /api/properties/featured
// @access  Public
router.get('/featured', asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const properties = await propertyService.getFeaturedProperties(parseInt(limit));
    
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

// @desc    Create new property
// @route   POST /api/properties
// @access  Private (Agent only)
router.post('/', protect, agentOnly, asyncHandler(async (req, res) => {
  const { error } = propertySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  try {
    const property = await propertyService.createProperty(req.user.id, req.body);
    
    res.status(201).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get property by ID
// @route   GET /api/properties/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const property = await propertyService.getPropertyById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Update property
// @route   PUT /api/properties/:id
// @access  Private (Agent only)
router.put('/:id', protect, agentOnly, asyncHandler(async (req, res) => {
  try {
    const property = await propertyService.updateProperty(
      req.params.id,
      req.user.id,
      req.body
    );
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Delete property
// @route   DELETE /api/properties/:id
// @access  Private (Agent only)
router.delete('/:id', protect, agentOnly, asyncHandler(async (req, res) => {
  try {
    const result = await propertyService.deleteProperty(req.params.id, req.user.id);
    
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

// @desc    Get similar properties
// @route   GET /api/properties/:id/similar
// @access  Public
router.get('/:id/similar', asyncHandler(async (req, res) => {
  try {
    const { limit = 5 } = req.query;
    const properties = await propertyService.getSimilarProperties(
      req.params.id,
      parseInt(limit)
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

module.exports = router; 