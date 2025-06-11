# Property Management Backend

A Node.js backend API for property management with B2B (agents) and B2C (customers) support.

## Features

- User authentication (JWT)
- Role-based access (Agent/Customer)
- User registration and login
- Profile management
- Password change functionality
- Swagger API documentation
- PostgreSQL database
- Input validation
- Error handling and logging

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (via Supabase)
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Joi
- **Documentation**: Swagger/OpenAPI
- **Logging**: Winston

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL database (Supabase account recommended)

## Setup Instructions

### 1. Clone and Install

```bash
git clone <repository-url>
cd property-backend
npm install
```

### 2. Environment Configuration

Copy the example environment file and update with your values:

```bash
cp env.example .env
```

Update the `.env` file with your database credentials:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=postgresql://postgres:pfweb@123@db.hpqhhbbyzcuwmhssipuk.supabase.co:5432/postgres

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

### 3. Database Setup

Initialize the database tables:

```bash
npm run db:init
```

This will create the `users` table in your PostgreSQL database.

### 4. Start the Server

For development:
```bash
npm run dev
```

For production:
```bash
npm start
```

The server will start on `http://localhost:3000`

## API Documentation

Once the server is running, you can access the Swagger documentation at:

**http://localhost:3000/api-docs**

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (requires auth)
- `PUT /api/auth/profile` - Update user profile (requires auth)
- `PUT /api/auth/change-password` - Change password (requires auth)
- `POST /api/auth/logout` - Logout user (requires auth)

### Health Check

- `GET /health` - Server health status

## User Registration

When registering a user, include the `is_agent` field to specify the user type:

```json
{
  "email": "user@example.com",
  "password": "password123",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+1234567890",
  "is_agent": true
}
```

- `is_agent: true` - Creates an agent user
- `is_agent: false` - Creates a customer user

## Authentication

The API uses JWT tokens for authentication. After login, include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'customer')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE
);
```

## Testing the API

### 1. Health Check
```bash
curl http://localhost:3000/health
```

### 2. Register a new user
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "is_agent": true
  }'
```

### 3. Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'
```

### 4. Get Profile (use token from login response)
```bash
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

## Logging

Logs are written to:
- `logs/error.log` - Error logs only
- `logs/combined.log` - All logs
- Console output (in development)

## Security Features

- Rate limiting (100 requests per 15 minutes by default)
- Helmet.js for security headers
- CORS enabled
- Password hashing with bcrypt
- JWT token expiration
- Input validation
- SQL injection protection

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm run db:init` - Initialize database tables
- `npm test` - Run tests (if configured)

## License

MIT 