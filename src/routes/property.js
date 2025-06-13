import express from 'express';
import asyncHandler from 'express-async-handler';
import { createPropertyService } from '../services/propertyServiceFactory.js';
import { propertySchema } from '../utils/validation.js';
import { protect, agentOnly } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Property:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           description: Property ID
 *         agent_user_id:
 *           type: string
 *           description: Agent user ID
 *         title:
 *           type: string
 *           description: Property title
 *         description:
 *           type: string
 *           description: Property description
 *         property_type:
 *           type: string
 *           enum: [apartment, house, condo, townhouse, commercial]
 *           description: Type of property
 *         price:
 *           type: number
 *           description: Property price
 *         location:
 *           type: object
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zip_code:
 *               type: string
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         features:
 *           type: object
 *           description: Property features (bedrooms, bathrooms, etc.)
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         status:
 *           type: string
 *           enum: [available, sold, pending, withdrawn]
 *           description: Property status
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         agent_first_name:
 *           type: string
 *           description: Agent first name
 *         agent_last_name:
 *           type: string
 *           description: Agent last name
 *         agent_email:
 *           type: string
 *           description: Agent email
 *         agent_phone:
 *           type: string
 *           description: Agent phone
 *         agent_send_bird_id:
 *           type: string
 *           description: Agent SendBird ID
 *         send_bird_accessId_agent:
 *           type: string
 *           description: Agent SendBird Access ID
 *     PropertyRequest:
 *       type: object
 *       required: [title, description, property_type, price, location]
 *       properties:
 *         title:
 *           type: string
 *           description: Property title
 *         description:
 *           type: string
 *           description: Property description
 *         property_type:
 *           type: string
 *           enum: [apartment, house, condo, townhouse, commercial]
 *           description: Type of property
 *         price:
 *           type: number
 *           description: Property price
 *         location:
 *           type: object
 *           required: [address, city, state, zip_code]
 *           properties:
 *             address:
 *               type: string
 *             city:
 *               type: string
 *             state:
 *               type: string
 *             zip_code:
 *               type: string
 *             latitude:
 *               type: number
 *             longitude:
 *               type: number
 *         features:
 *           type: object
 *           description: Property features (bedrooms, bathrooms, etc.)
 *         images:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of image URLs
 *         status:
 *           type: string
 *           enum: [available, sold, pending, withdrawn]
 *           description: Property status
 *     PropertyListResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           type: object
 *           properties:
 *             properties:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Property'
 *             pagination:
 *               type: object
 *               properties:
 *                 current_page:
 *                   type: number
 *                 total_pages:
 *                   type: number
 *                 total_count:
 *                   type: number
 *                 per_page:
 *                   type: number
 *     PropertyResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         data:
 *           $ref: '#/components/schemas/Property'
 */

/**
 * @swagger
 * /api/property/listings:
 *   get:
 *     summary: Get all property listings
 *     description: Retrieve all available property listings with pagination
 *     tags: [Properties]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of properties per page
 *     responses:
 *       200:
 *         description: Successfully retrieved property listings
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyListResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @desc    Get all property listings
// @route   GET /api/property/listings
// @access  Public
router.get('/listings', asyncHandler(async (req, res) => {
  try {
    const propertyService = createPropertyService();
    const { page = 1, limit = 20 } = req.query;
    
    const result = await propertyService.getAllProperties(
      {},
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

/**
 * @swagger
 * /api/property/agent/{agentId}:
 *   get:
 *     summary: Get properties by agent ID
 *     description: Retrieve all properties listed by a specific agent
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: agentId
 *         required: true
 *         schema:
 *           type: string
 *         description: Agent user ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of properties per page
 *     responses:
 *       200:
 *         description: Successfully retrieved agent's properties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyListResponse'
 *       400:
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @desc    Get properties by agent ID
// @route   GET /api/property/agent/:agentId
// @access  Public
router.get('/agent/:agentId', asyncHandler(async (req, res) => {
  try {
    const propertyService = createPropertyService();
    const { page = 1, limit = 20 } = req.query;
    
    const result = await propertyService.getAllProperties(
      { agent_id: req.params.agentId },
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

/**
 * @swagger
 * /api/property:
 *   post:
 *     summary: Create new property
 *     description: Create a new property listing (agent only)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyRequest'
 *           example:
 *             title: "Beautiful 3BR House"
 *             description: "A stunning 3-bedroom house with modern amenities"
 *             property_type: "house"
 *             price: 450000
 *             location:
 *               address: "123 Main St"
 *               city: "San Francisco"
 *               state: "CA"
 *               zip_code: "94102"
 *               latitude: 37.7749
 *               longitude: -122.4194
 *             features:
 *               bedrooms: 3
 *               bathrooms: 2
 *               square_feet: 1800
 *               parking: true
 *               garden: true
 *             images: ["image1.jpg", "image2.jpg"]
 *             status: "available"
 *     responses:
 *       201:
 *         description: Property created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyResponse'
 *       400:
 *         description: Bad request or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - only agents can create properties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @desc    Create new property
// @route   POST /api/property
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
    const propertyService = createPropertyService();
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

/**
 * @swagger
 * /api/property/{id}:
 *   get:
 *     summary: Get property by ID
 *     description: Retrieve a specific property by its ID
 *     tags: [Properties]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Successfully retrieved property
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyResponse'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @desc    Get property by ID
// @route   GET /api/property/:id
// @access  Public
router.get('/:id', asyncHandler(async (req, res) => {
  try {
    const propertyService = createPropertyService();
    const property = await propertyService.getPropertyById(req.params.id);
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}));

/**
 * @swagger
 * /api/property/{id}:
 *   put:
 *     summary: Update property
 *     description: Update a property listing (agent only - can only update own properties)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PropertyRequest'
 *     responses:
 *       200:
 *         description: Property updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PropertyResponse'
 *       400:
 *         description: Bad request or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - only agents can update properties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @desc    Update property
// @route   PUT /api/property/:id
// @access  Private (Agent only - own properties)
router.put('/:id', protect, agentOnly, asyncHandler(async (req, res) => {
  const { error } = propertySchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      success: false,
      error: error.details[0].message
    });
  }

  try {
    const propertyService = createPropertyService();
    const property = await propertyService.updateProperty(req.params.id, req.user.id, req.body);
    
    res.status(200).json({
      success: true,
      data: property
    });
  } catch (error) {
    let statusCode = 400;
    if (error.message.includes('not found')) statusCode = 404;
    if (error.message.includes('Unauthorized')) statusCode = 403;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}));

/**
 * @swagger
 * /api/property/{id}:
 *   delete:
 *     summary: Delete property
 *     description: Delete a property listing (agent only - can only delete own properties)
 *     tags: [Properties]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Property ID
 *     responses:
 *       200:
 *         description: Property deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Unauthorized - invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - only agents can delete properties
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Property not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// @desc    Delete property
// @route   DELETE /api/property/:id
// @access  Private (Agent only - own properties)
router.delete('/:id', protect, agentOnly, asyncHandler(async (req, res) => {
  try {
    const propertyService = createPropertyService();
    await propertyService.deleteProperty(req.params.id, req.user.id);
    
    res.status(200).json({
      success: true,
      message: 'Property deleted successfully'
    });
  } catch (error) {
    let statusCode = 400;
    if (error.message.includes('not found')) statusCode = 404;
    if (error.message.includes('Unauthorized')) statusCode = 403;
    
    res.status(statusCode).json({
      success: false,
      error: error.message
    });
  }
}));

export default router; 