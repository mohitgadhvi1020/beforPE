import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Dynamically determine the server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // For production, try to get the URL from environment or use a default
    return process.env.API_URL || 'https://property-backend-api-q8vb.onrender.com';
  }
  return 'http://localhost:3000';
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Management API',
      version: '1.0.0',
      description: 'A comprehensive property management API with B2B and B2C support featuring 5 real estate agents and 20 diverse properties across the Bay Area.',
    },
    servers: [
      {
        url: getServerUrl(),
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
      {
        url: 'http://localhost:3000',
        description: 'Local development server',
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            role: {
              type: 'string',
              enum: ['agent', 'customer'],
              description: 'User role',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
            },
            phone: {
              type: 'string',
              description: 'Phone number',
            },
            is_active: {
              type: 'boolean',
              description: 'User active status',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'first_name', 'last_name', 'is_agent'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (minimum 6 characters)',
            },
            first_name: {
              type: 'string',
              description: 'First name',
            },
            last_name: {
              type: 'string',
              description: 'Last name',
            },
            phone: {
              type: 'string',
              description: 'Phone number (optional)',
            },
            is_agent: {
              type: 'boolean',
              description: 'Whether user is an agent or customer',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email',
            },
            password: {
              type: 'string',
              description: 'Password',
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
            },
            data: {
              type: 'object',
              properties: {
                user: {
                  $ref: '#/components/schemas/User',
                },
                token: {
                  type: 'string',
                  description: 'JWT token',
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            error: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs }; 