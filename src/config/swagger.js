import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

// Dynamically determine the server URL based on environment
const getServerUrl = () => {
  if (process.env.NODE_ENV === 'production') {
    // Use the correct production URL for your deployment
    return process.env.API_URL || 'https://pf-chat.onrender.com';
  }
  return 'http://localhost:3000';
};

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Property Management API',
      version: '1.0.0',
      description: 'A comprehensive property management API with Firebase integration featuring real estate agents and properties with SendBird chat support.',
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
              description: 'User email address',
              example: 'jane.smith@example.com',
            },
            password: {
              type: 'string',
              minLength: 6,
              description: 'Password (minimum 6 characters)',
              example: 'securepass123',
            },
            first_name: {
              type: 'string',
              description: 'User first name',
              example: 'Jane',
            },
            last_name: {
              type: 'string',
              description: 'User last name',
              example: 'Smith',
            },
            phone: {
              type: 'string',
              description: 'Phone number (optional)',
              example: '+1234567890',
            },
            is_agent: {
              type: 'boolean',
              description: 'Whether user is an agent (true) or customer (false)',
              example: true,
            },
            send_bird_id: {
              type: 'string',
              description: 'SendBird user ID (optional)',
              example: 'sendbird_user_123',
            },
            send_bird_accessId: {
              type: 'string',
              description: 'SendBird access ID (optional)',
              example: 'access_id_123',
            },
          },
          example: {
            email: 'jane.smith@example.com',
            password: 'securepass123',
            first_name: 'Jane',
            last_name: 'Smith',
            phone: '+1234567890',
            is_agent: true,
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              description: 'User email address',
              example: 'john.doe@example.com',
            },
            password: {
              type: 'string',
              description: 'User password',
              example: 'password123',
              minLength: 1,
            },
          },
          example: {
            email: 'john.doe@example.com',
            password: 'password123',
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