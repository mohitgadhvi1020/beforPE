# 🚀 Deploy to Render + Supabase (Free)

## Quick Setup (5 minutes)

### 1. **Set up Supabase Database**
1. Go to [supabase.com](https://supabase.com) and sign up (free)
2. Click **"New Project"**
3. Fill details:
   - **Name**: `property-management`
   - **Database Password**: Create strong password (save it!)
   - **Region**: Choose closest to you
   - **Plan**: **Free**
4. Wait for setup (2-3 minutes)
5. Go to **Settings** → **Database** → **Connection string**
6. Copy the **URI**: `postgresql://postgres:[YOUR-PASSWORD]@db.xyz.supabase.co:5432/postgres`
7. Replace `[YOUR-PASSWORD]` with your actual password

### 2. **Deploy on Render**
1. Go to [render.com](https://render.com) and sign up (free)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `mohitgadhvi1020/beforPE`
4. Use these settings:
   - **Name**: `property-backend`
   - **Branch**: `main`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### 3. **Add Environment Variables**
In Render's **Environment Variables** section, add:

```
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-here-make-it-long-and-random
JWT_EXPIRES_IN=7d
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xyz.supabase.co:5432/postgres
```

### 4. **Deploy**
1. Click **"Create Web Service"** - Render deploys automatically!
2. Database tables are created automatically on first startup! ✨

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

## 💡 **Benefits**

### **Supabase Free Tier:**
- **500 MB database storage**
- **Up to 50,000 monthly active users**
- **500,000 read operations/month**
- **50,000 write operations/month**

### **Render Free Tier:**
- **750 hours/month** (enough for 24/7)
- **512 MB RAM**
- **1 GB disk space**
- **100 GB network**

Perfect for **10 users**! 🎯

## 🔧 **Auto-Deploy**
Every time you push to GitHub, Render automatically redeploys your app!

## 📚 **Next Steps**
1. Update frontend API URLs to use your Render URL
2. Test all endpoints
3. Monitor usage in Render dashboard 