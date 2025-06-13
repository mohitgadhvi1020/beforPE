# 🚀 Deploy to Render + Firebase (Free)

## Quick Setup (5 minutes) - Firebase Version

This version uses Firebase Firestore for persistent data storage.

### 1. **Get Firebase Service Account Key**

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project: `property-backend-12169`
3. Click gear icon ⚙️ → "Project settings"
4. Go to "Service accounts" tab
5. Click "Generate new private key"
6. Download the JSON file and copy its content

### 2. **Deploy on Render**
1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `property-backend-api`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### 3. **Environment Variables**
In Render's **Environment Variables** section, add:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random-123456789
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DB_TYPE=firebase
PORT=3000
FIREBASE_PROJECT_ID=property-backend-12169
GOOGLE_APPLICATION_CREDENTIALS_JSON={"type":"service_account","project_id":"property-backend-12169",...}
```

**Important**: 
- Set `DB_TYPE=firebase` to use Firebase
- Paste the entire Firebase service account JSON as `GOOGLE_APPLICATION_CREDENTIALS_JSON`

### 4. **Deploy**
1. Click **"Create Web Service"** - Render deploys automatically!
2. Wait for deployment (2-3 minutes)
3. Check logs for: "Firebase initialized successfully"

## 🎉 **Your API is Live!**

Your backend will be available at:
- **API**: `https://your-app-name.onrender.com`
- **Docs**: `https://your-app-name.onrender.com/api-docs`
- **Health**: `https://your-app-name.onrender.com/health`

## 📱 **Test Your API**

### 1. Health Check:
```bash
curl https://your-app-name.onrender.com/health
```

### 2. Register a new user:
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/register \
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

### 3. Login:
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "agent@example.com",
    "password": "password123"
  }'
```

### 4. Get Properties:
```bash
curl https://your-app-name.onrender.com/api/property/listings
```

## 🔧 **Firebase Features**

The Firebase service includes:
- ✅ **Persistent data storage** (survives server restarts)
- ✅ User registration and authentication
- ✅ Property listings and management
- ✅ Agent-specific property filtering
- ✅ Real-time data synchronization
- ✅ Automatic scaling

## 🐛 **Troubleshooting**

### API not responding?
- Check Render logs in dashboard
- Ensure all environment variables are set
- Verify `DB_TYPE=firebase` is set

### Firebase connection issues?
- Check that `GOOGLE_APPLICATION_CREDENTIALS_JSON` is valid JSON
- Verify `FIREBASE_PROJECT_ID=property-backend-12169`
- Ensure Firestore is enabled in Firebase Console

### Authentication issues?
- Make sure `JWT_SECRET` is set and long enough
- Check that requests include proper headers

## 📋 **Available Endpoints**

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get profile (requires auth)
- `PUT /api/auth/profile` - Update profile (requires auth)

### Properties
- `GET /api/property/listings` - Get all properties
- `GET /api/property/agent/{agentId}` - Get properties by agent
- `POST /api/property` - Create property (requires auth)

### Health
- `GET /health` - Server status

## 💡 **Benefits of Firebase**

- **Free Tier**: 1GB storage, 50K reads/day, 20K writes/day
- **Real-time**: Automatic data synchronization
- **Scalable**: Handles traffic spikes automatically
- **Reliable**: 99.95% uptime SLA
- **Secure**: Built-in authentication and security rules

## 🔄 **Fallback to Mock Service**

If Firebase credentials are not available, the app automatically falls back to a mock service, so your API will always work!

---

## 💡 **Next Steps**

1. **Test all endpoints** using the Swagger docs at `/api-docs`
2. **Set up Firestore security rules** for production
3. **Monitor usage** in Firebase Console
4. **Scale up** when you need more than the free tier

Your Firebase-powered API is now live and ready for production! 🚀 