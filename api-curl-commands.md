# API Test Commands - Render Deployment

## Base URL
Replace `https://property-backend-api-q8vb.onrender.com` with your actual Render URL.

## 1. Health Check
```bash
curl https://property-backend-api-q8vb.onrender.com/health
```

## 2. Register a New User (Agent)
```bash
curl -X POST https://property-backend-api-q8vb.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "+1234567890",
    "is_agent": true,
    "send_bird_id": "agent_sendbird_123"
  }'
```

## 3. Register a Customer
```bash
curl -X POST https://property-backend-api-q8vb.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@example.com",
    "password": "password123",
    "first_name": "Jane",
    "last_name": "Smith",
    "phone": "+1987654321",
    "is_agent": false,
    "send_bird_id": "customer_sendbird_456"
  }'
```

## 4. Login (Agent)
```bash
curl -X POST https://property-backend-api-q8vb.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'
```

## 5. Get All Properties
```bash
curl https://property-backend-api-q8vb.onrender.com/api/property/listings
```

## 6. Get Properties by Agent ID
```bash
curl https://property-backend-api-q8vb.onrender.com/api/property/agent/agent-1
```

## 7. Create New Property (Requires Authentication)
First login to get token, then:
```bash
curl -X POST https://property-backend-api-q8vb.onrender.com/api/property \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "title": "Beautiful Downtown Apartment",
    "description": "A stunning 2-bedroom apartment in the heart of downtown",
    "property_type": "apartment",
    "price": 2500,
    "location": {
      "address": "123 Main St",
      "city": "New York",
      "state": "NY",
      "country": "USA",
      "postal_code": "10001"
    },
    "features": {
      "bedrooms": 2,
      "bathrooms": 2,
      "square_feet": 1200,
      "amenities": ["gym", "pool", "parking"]
    },
    "images": ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
  }'
```

## 8. Get User Profile (Requires Authentication)
```bash
curl https://property-backend-api-q8vb.onrender.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## 9. Update User Profile (Requires Authentication)
```bash
curl -X PUT https://property-backend-api-q8vb.onrender.com/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -d '{
    "first_name": "John Updated",
    "last_name": "Doe Updated",
    "phone": "+1111111111"
  }'
```

## 10. API Documentation
Visit in browser:
```
https://property-backend-api-q8vb.onrender.com/api-docs
```

## Notes:
- Replace `YOUR_JWT_TOKEN_HERE` with the actual token from login response
- The mock service includes sample properties and agents
- Data resets when server restarts (every ~15 minutes on Render free tier)
- All endpoints should work without database connection issues 