import admin from 'firebase-admin';

// Initialize Firebase Admin SDK lazily
let db;
let initialized = false;

function initializeFirebase() {
  if (initialized) {
    return db;
  }

  try {
    // Check if Firebase project ID is set
    const projectId = process.env.FIREBASE_PROJECT_ID;
    
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID environment variable is required');
    }

    console.log('Initializing Firebase with project ID:', projectId);
    
    if (!admin.apps.length) {
      let credential;
      
      // Check if we have service account credentials (for production)
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        try {
          const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
          credential = admin.credential.cert(serviceAccount);
          console.log('Using service account credentials');
        } catch (error) {
          console.error('Failed to parse service account JSON:', error.message);
          throw new Error('Invalid service account credentials');
        }
      } else if (process.env.NODE_ENV === 'production') {
        // In production without credentials, we can't proceed
        throw new Error('Firebase service account credentials required in production');
      } else {
        // For development, try application default credentials
        try {
          credential = admin.credential.applicationDefault();
          console.log('Using application default credentials');
        } catch (error) {
          console.log('Application default credentials not available, trying without credentials');
          credential = undefined;
        }
      }

      admin.initializeApp({
        credential: credential,
        projectId: projectId
      });
    }

    db = admin.firestore();
    initialized = true;
    console.log('Firebase initialized successfully with project:', projectId);
    return db;
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    throw new Error(`Firebase initialization failed: ${error.message}`);
  }
}

// Lazy getter for database
function getDb() {
  return initializeFirebase();
}

export { getDb, admin }; 