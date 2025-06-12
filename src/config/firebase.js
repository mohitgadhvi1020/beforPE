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
      // For development, we'll use a simple initialization
      // This works with Firebase CLI authentication
      admin.initializeApp({
        projectId: projectId,
        // Use default credentials from Firebase CLI
        credential: admin.credential.applicationDefault()
      });
    }

    db = admin.firestore();
    initialized = true;
    console.log('Firebase initialized successfully with project:', projectId);
    return db;
  } catch (error) {
    console.error('Firebase initialization failed:', error.message);
    
    // Fallback: try without credentials for testing
    try {
      console.log('Trying fallback initialization...');
      if (!admin.apps.length) {
        admin.initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID
        });
      }
      db = admin.firestore();
      initialized = true;
      console.log('Firebase initialized with fallback method');
      return db;
    } catch (fallbackError) {
      console.error('Fallback initialization also failed:', fallbackError.message);
      throw new Error('Firebase initialization failed. Please check your Firebase setup.');
    }
  }
}

// Lazy getter for database
function getDb() {
  return initializeFirebase();
}

export { getDb, admin }; 