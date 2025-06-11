# 🚀 Deploy to Render (Free)

## Quick Setup (5 minutes)

### 1. **Push to GitHub**
```bash
# Initialize git (if not done)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/yourusername/property-backend.git
git push -u origin main
```

### 2. **Deploy on Render**

1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Use these settings:
   - **Name**: `property-backend`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### 3. **Add Environment Variables**
In Render dashboard, go to **Environment** tab and add:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. **Add PostgreSQL Database**
1. In Render dashboard, click **"New +"** → **"PostgreSQL"**
2. Name: `property-db`
3. Plan: **Free**
4. After creation, copy the **External Database URL**
5. Add it to your web service as: `DATABASE_URL=postgresql://...`

### 5. **Initialize Database**
After deployment, run this once in Render's shell:
```bash
npm run db:init
```

## 🎉 **Your API is Live!**

Your backend will be available at:
- **API**: `https://your-app-name.onrender.com`
- **Docs**: `https://your-app-name.onrender.com/api-docs`
- **Health**: `https://your-app-name.onrender.com/health`

## 📱 **Test Your API**

### Register a new user:
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe",
    "is_agent": true
  }'
```

### Login:
```bash
curl -X POST https://your-app-name.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

## 💡 **Free Tier Limits**
- **750 hours/month** (enough for 24/7)
- **512 MB RAM**
- **1 GB disk space**
- **100 GB network**
- Perfect for **10 users**!

## 🔧 **Auto-Deploy**
Every time you push to GitHub, Render automatically redeploys your app!

## 📚 **Next Steps**
1. Update frontend API URLs to use your Render URL
2. Test all endpoints
3. Monitor usage in Render dashboard 