# Property Backend API

A comprehensive real estate property management API built with Node.js, Express, and Firebase Firestore, featuring SendBird integration for chat functionality.

## 🚀 Live API

**Production URL:** https://pf-chat.onrender.com  
**API Documentation:** https://pf-chat.onrender.com/api-docs/

## 📋 Features

- **User Authentication** - JWT-based auth for agents and customers
- **Property Management** - Complete CRUD operations for real estate listings
- **SendBird Integration** - Chat functionality with access tokens
- **Firebase Firestore** - Cloud database for scalable data storage
- **Role-based Access** - Different permissions for agents vs customers
- **Image Support** - Property images via Unsplash integration
- **Filtering & Pagination** - Advanced property search capabilities

## 🔧 Tech Stack

- **Backend:** Node.js, Express.js
- **Database:** Firebase Firestore
- **Authentication:** JWT (JSON Web Tokens)
- **Chat Integration:** SendBird
- **Deployment:** Render
- **Documentation:** Swagger/OpenAPI

## 📊 Database Summary

- **Total Properties:** 16 (with high-quality images)
- **Agents:** 5 confirmed working accounts
- **Customers:** 5 confirmed working accounts
- **All users have SendBird integration**

## 🔑 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Properties
- `GET /api/property/listings` - Get all properties (with pagination/filters)
- `GET /api/property/:id` - Get specific property
- `POST /api/property` - Create property (agents only)
- `PUT /api/property/:id` - Update property (agents only)
- `DELETE /api/property/:id` - Delete property (agents only)

### Health
- `GET /health` - Server status

## 🧪 Testing with Postman

### Import Collection
1. Import `Property-Backend-API.postman_collection.json` into Postman
2. The collection includes all endpoints with sample data
3. Variables are pre-configured for the production API

### Quick Test Credentials

**Agent Login:**
```json
{
  "email": "michael.johnson.new@realestate.com",
  "password": "Agent123!"
}
```

**Customer Login:**
```json
{
  "email": "emma.thompson.new@gmail.com",
  "password": "Customer123!"
}
```

### Testing Workflow
1. **Health Check** - Verify API is running
2. **Login** - Get authentication token
3. **Get Properties** - View all listings
4. **Create Property** - Test agent functionality
5. **Test Filters** - Try pagination and filtering

## 👥 User Accounts

### ✅ Confirmed Working Agents
All agents use password: `Agent123!`

1. **Michael Johnson** - `michael.johnson.new@realestate.com`
2. **David Brown** - `david.brown.new@realestate.com`
3. **Sarah Williams** - `sarah.williams.new@realestate.com`
4. **Jennifer Davis** - `jennifer.davis.new@realestate.com`
5. **Robert Miller** - `robert.miller.new@realestate.com`

### ✅ Confirmed Working Customers
All customers use password: `Customer123!`

1. **Emma Thompson** - `emma.thompson.new@gmail.com`
2. **James Rodriguez** - `james.rodriguez.new@yahoo.com`
3. **Sophia Chen** - `sophia.chen.new@outlook.com`
4. **Marcus Washington** - `marcus.washington.new@gmail.com`
5. **Isabella Garcia** - `isabella.garcia.new@hotmail.com`

## 🏠 Sample Properties

The API includes 16 diverse properties:
- **Luxury Downtown Condo** - $450,000 (NYC)
- **Spacious Family Home** - $675,000 (Austin)
- **Modern Townhouse** - $525,000 (Denver)
- **Cozy Studio Apartment** - $285,000 (Portland)
- **Executive Office Space** - $850,000 (Miami)
- And 11 more varied properties across different cities

## 🔍 API Examples

### Get All Properties
```bash
GET https://pf-chat.onrender.com/api/property/listings
```

### Get Properties with Filters
```bash
GET https://pf-chat.onrender.com/api/property/listings?min_price=300000&max_price=600000&property_type=Condo
```

### Create Property (Requires Agent Token)
```bash
POST https://pf-chat.onrender.com/api/property
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "title": "Beautiful Test Property",
  "description": "A stunning property",
  "price": 450000,
  "property_type": "House",
  "bedrooms": 3,
  "bathrooms": 2,
  "address": "123 Test Street",
  "city": "Test City",
  "state": "CA",
  "zip_code": "90210"
}
```

## 🔐 Authentication

The API uses JWT tokens for authentication. After login, include the token in requests:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 📱 SendBird Integration

All users have SendBird access tokens for chat functionality:
- Agents have original SendBird access tokens
- Customers have generated access IDs
- Properties include agent SendBird information

## 🚀 Performance

- **Startup Time:** Under 5 seconds
- **Response Time:** ~15ms average
- **Database:** Optimized Firebase Firestore queries
- **Deployment:** Auto-deploy via GitHub integration

## 📝 Files Included

- `user-credentials.txt` - All working login credentials
- `Property-Backend-API.postman_collection.json` - Complete Postman collection
- `README.md` - This documentation file

## 🛠️ Development

### Local Setup
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (Firebase credentials)
4. Run: `npm start`

### Environment Variables
- `DB_TYPE=firebase`
- `FIREBASE_PROJECT_ID=property-backend-12169`
- `GOOGLE_APPLICATION_CREDENTIALS_JSON` - Firebase service account key

## 📞 Support

For API issues or questions, refer to:
- **Swagger Documentation:** https://pf-chat.onrender.com/api-docs/
- **Health Check:** https://pf-chat.onrender.com/health
- **Postman Collection:** Import the provided JSON file

---

**Last Updated:** December 2024  
**API Version:** 1.0  
**Status:** ✅ Production Ready 