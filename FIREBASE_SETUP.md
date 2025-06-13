# Firebase Setup for Render Deployment

## Step 1: Get Firebase Service Account Key

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com](https://console.firebase.google.com)
   - Select your project: `property-backend-12169`

2. **Navigate to Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

3. **Go to Service Accounts Tab**
   - Click on "Service accounts" tab
   - You'll see "Firebase Admin SDK" section

4. **Generate New Private Key**
   - Click "Generate new private key"
   - Click "Generate key" in the popup
   - A JSON file will be downloaded to your computer

5. **Copy the JSON Content**
   - Open the downloaded JSON file
   - Copy the entire content (it should look like this):
   ```json
   {
     "type": "service_account",
     "project_id": "property-backend-12169",
     "private_key_id": "...",
     "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
     "client_email": "firebase-adminsdk-...@property-backend-12169.iam.gserviceaccount.com",
     "client_id": "...",
     "auth_uri": "https://accounts.google.com/o/oauth2/auth",
     "token_uri": "https://oauth2.googleapis.com/token",
     "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
     "client_x509_cert_url": "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-...%40property-backend-12169.iam.gserviceaccount.com"
   }
   ```

## Step 2: Add to Render Environment Variables

1. **Go to Render Dashboard**
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Find your `property-backend` service

2. **Go to Environment Variables**
   - Click on your service
   - Go to "Environment" tab

3. **Add the Service Account Key**
   - Click "Add Environment Variable"
   - **Key**: `GOOGLE_APPLICATION_CREDENTIALS_JSON`
   - **Value**: Paste the entire JSON content from step 1
   - Click "Save Changes"

4. **Verify Other Variables**
   Make sure these are also set:
   ```
   DB_TYPE=firebase
   FIREBASE_PROJECT_ID=property-backend-12169
   JWT_SECRET=your-secret-key
   NODE_ENV=production
   ```

## Step 3: Deploy

1. **Trigger Redeploy**
   - In Render dashboard, click "Manual Deploy" → "Deploy latest commit"
   - Or push a new commit to trigger auto-deploy

2. **Check Logs**
   - Go to "Logs" tab in Render
   - Look for: "Firebase initialized successfully with project: property-backend-12169"

## Step 4: Test Your API

Once deployed, test the endpoints:

```bash
# Health check
curl https://your-app-name.onrender.com/health

# Register user
curl -X POST https://your-app-name.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "first_name": "Test",
    "last_name": "User",
    "is_agent": true
  }'
```

## Troubleshooting

### "Firebase initialization failed"
- Check that `GOOGLE_APPLICATION_CREDENTIALS_JSON` is set correctly
- Verify the JSON is valid (no extra spaces or characters)
- Make sure `FIREBASE_PROJECT_ID` matches your project

### "Invalid service account credentials"
- Re-download the service account key from Firebase Console
- Make sure you copied the entire JSON content

### "Permission denied"
- Verify your Firebase project has Firestore enabled
- Check that the service account has proper permissions

## Security Note

⚠️ **Important**: The service account key gives full access to your Firebase project. Keep it secure and never commit it to version control. 