import admin from 'firebase-admin';

let db = null;

function getDb() {
  if (db) {
    return db;
  }

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    if (!projectId) {
      throw new Error('FIREBASE_PROJECT_ID required');
    }

    // Fast initialization - no verbose logging
    if (!admin.apps.length) {
      let credential;
      
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
        const serviceAccount = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
        credential = admin.credential.cert(serviceAccount);
      }

      admin.initializeApp({
        credential,
        projectId
      });
    }

    db = admin.firestore();
    db.settings({ ignoreUndefinedProperties: true });
    
    console.log('🔥 Firebase ready');
    return db;
  } catch (error) {
    console.error('Firebase failed:', error.message);
    throw error;
  }
}

export { getDb, admin }; 