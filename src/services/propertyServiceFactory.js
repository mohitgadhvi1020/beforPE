import { PropertyService } from './propertyService.js';
import { PropertyServiceFirebase } from './propertyServiceFirebase.js';
import { PropertyServiceMock } from './propertyServiceMock.js';

// Factory function to get the appropriate property service
function createPropertyService() {
  const dbType = process.env.DB_TYPE || 'postgresql';
  
  if (dbType === 'mock') {
    return new PropertyServiceMock();
  } else if (dbType === 'firebase') {
    // Try Firebase first, fallback to mock if credentials not available
    try {
      return new PropertyServiceFirebase();
    } catch (error) {
      console.warn('Firebase not available, using mock service:', error.message);
      return new PropertyServiceMock();
    }
  } else {
    return new PropertyService();
  }
}

export { createPropertyService }; 