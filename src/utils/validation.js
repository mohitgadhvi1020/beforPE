import Joi from 'joi';

// User validation schemas
const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  first_name: Joi.string().required(),
  last_name: Joi.string().required(),
  phone: Joi.string().optional(),
  send_bird_id: Joi.string().max(255).optional(),
  send_bird_accessId: Joi.string().max(255).optional(),
  is_agent: Joi.boolean().required()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

// Agent validation schemas
const agentProfileSchema = Joi.object({
  company_name: Joi.string().required(),
  license_number: Joi.string().required(),
  specializations: Joi.array().items(Joi.string()).optional(),
  experience_years: Joi.number().min(0).optional(),
  bio: Joi.string().optional(),
  profile_image: Joi.string().uri().optional(),
  location: Joi.object({
    city: Joi.string().required(),
    state: Joi.string().required(),
    country: Joi.string().required()
  }).optional()
});

// Customer validation schemas
const customerProfileSchema = Joi.object({
  preferences: Joi.object({
    property_type: Joi.array().items(Joi.string().valid('apartment', 'house', 'condo', 'commercial')).optional(),
    budget_min: Joi.number().min(0).optional(),
    budget_max: Joi.number().min(0).optional(),
    location_preferences: Joi.array().items(Joi.string()).optional(),
    bedrooms: Joi.number().min(0).optional(),
    bathrooms: Joi.number().min(0).optional()
  }).optional(),
  profile_image: Joi.string().uri().optional()
});

// Property validation schemas - Simplified with minimal required fields
const propertySchema = Joi.object({
  title: Joi.string().required(),
  description: Joi.string().optional(),
  property_type: Joi.string().valid('apartment', 'house', 'condo', 'townhouse', 'commercial').optional(),
  price: Joi.number().min(0).optional(),
  location: Joi.object({
    address: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),
    country: Joi.string().optional(),
    postal_code: Joi.string().optional(),
    zip_code: Joi.string().optional(),
    latitude: Joi.number().optional(),
    longitude: Joi.number().optional(),
    coordinates: Joi.object({
      lat: Joi.number().optional(),
      lng: Joi.number().optional()
    }).optional()
  }).optional(),
  features: Joi.object({
    bedrooms: Joi.number().min(0).optional(),
    bathrooms: Joi.number().min(0).optional(),
    square_feet: Joi.number().min(0).optional(),
    lot_size: Joi.number().min(0).optional(),
    year_built: Joi.number().min(1800).max(new Date().getFullYear()).optional(),
    parking_spaces: Joi.number().min(0).optional(),
    parking: Joi.boolean().optional(),
    garden: Joi.boolean().optional(),
    garage: Joi.boolean().optional(),
    balcony: Joi.boolean().optional(),
    amenities: Joi.array().items(Joi.string()).optional()
  }).optional(),
  images: Joi.array().items(Joi.string()).optional(),
  status: Joi.string().valid('available', 'pending', 'sold', 'rented', 'withdrawn').default('available')
});

// Connection validation schemas
const connectionRequestSchema = Joi.object({
  agent_id: Joi.string().uuid().required(),
  property_id: Joi.string().uuid().optional(),
  message: Joi.string().optional(),
  preferred_contact_method: Joi.string().valid('chat', 'phone', 'email').default('chat')
});

const updateConnectionSchema = Joi.object({
  status: Joi.string().valid('pending', 'accepted', 'rejected', 'completed').required(),
  notes: Joi.string().optional()
});

export {
  registerSchema,
  loginSchema,
  agentProfileSchema,
  customerProfileSchema,
  propertySchema,
  connectionRequestSchema,
  updateConnectionSchema
}; 