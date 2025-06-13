import { v4 as uuidv4 } from 'uuid';
import { getDb } from '../config/firebase.js';

class PropertyServiceFirebase {
  constructor() {
    this.collection = 'properties';
    this.usersCollection = 'users';
  }

  // Create new property (agent only)
  async createProperty(agentUserId, propertyData) {
    try {
      const db = getDb();
      const propertyId = uuidv4();
      
      const property = {
        id: propertyId,
        agent_user_id: agentUserId,
        title: propertyData.title,
        description: propertyData.description || '',
        property_type: propertyData.property_type || 'house',
        price: propertyData.price || 0,
        location: propertyData.location || {},
        features: propertyData.features || {},
        images: propertyData.images || [],
        status: propertyData.status || 'available',
        created_at: new Date(),
        updated_at: new Date()
      };

      await db.collection(this.collection).doc(propertyId).set(property);

      // Get agent details
      const agentDoc = await db.collection(this.usersCollection).doc(agentUserId).get();
      const agentData = agentDoc.exists ? agentDoc.data() : null;

      return {
        ...property,
        agent_first_name: agentData?.first_name,
        agent_last_name: agentData?.last_name,
        agent_email: agentData?.email,
        agent_phone: agentData?.phone,
        agent_send_bird_id: agentData?.send_bird_id,
        send_bird_accessId_agent: agentData?.send_bird_accessId
      };
    } catch (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }
  }

  // Get all properties with optional filters
  async getAllProperties(filters = {}, page = 1, limit = 20) {
    try {
      const db = getDb();
      let query = db.collection(this.collection);

      // Apply filters
      if (!filters.agent_id) {
        query = query.where('status', '==', 'available');
      }

      if (filters.agent_id) {
        query = query.where('agent_user_id', '==', filters.agent_id);
      }

      if (filters.property_type) {
        query = query.where('property_type', '==', filters.property_type);
      }

      if (filters.price_min) {
        query = query.where('price', '>=', filters.price_min);
      }

      if (filters.price_max) {
        query = query.where('price', '<=', filters.price_max);
      }

      // Order by created_at
      query = query.orderBy('created_at', 'desc');

      // Apply pagination
      const offset = (page - 1) * limit;
      if (offset > 0) {
        const offsetSnapshot = await query.limit(offset).get();
        if (!offsetSnapshot.empty) {
          const lastDoc = offsetSnapshot.docs[offsetSnapshot.docs.length - 1];
          query = query.startAfter(lastDoc);
        }
      }

      query = query.limit(limit);

      const snapshot = await query.get();
      const properties = [];

      // Get properties with agent details already included
      for (const doc of snapshot.docs) {
        const propertyData = doc.data();
        properties.push(propertyData);
      }

      // Get total count (approximate for pagination)
      const totalSnapshot = await db.collection(this.collection).get();
      const totalCount = totalSnapshot.size;

      return {
        properties,
        pagination: {
          current_page: page,
          total_pages: Math.ceil(totalCount / limit),
          total_count: totalCount,
          per_page: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }
  }

  // Get property by ID
  async getPropertyById(propertyId) {
    try {
      const db = getDb();
      const doc = await db.collection(this.collection).doc(propertyId).get();
      
      if (!doc.exists) {
        throw new Error('Property not found');
      }

      const propertyData = doc.data();
      
      // Return the property data with agent information already included
      // (agent info was stored directly in the property document during creation)
      return propertyData;
    } catch (error) {
      throw new Error(`Failed to fetch property: ${error.message}`);
    }
  }

  // Update property (agent only)
  async updateProperty(propertyId, agentUserId, updateData) {
    try {
      const db = getDb();
      const doc = await db.collection(this.collection).doc(propertyId).get();
      
      if (!doc.exists) {
        throw new Error('Property not found');
      }

      const propertyData = doc.data();
      
      if (propertyData.agent_user_id !== agentUserId) {
        throw new Error('Unauthorized to update this property');
      }

      const updatedData = {
        ...updateData,
        updated_at: new Date()
      };

      await db.collection(this.collection).doc(propertyId).update(updatedData);

      return {
        ...propertyData,
        ...updatedData
      };
    } catch (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }
  }

  // Delete property (agent only)
  async deleteProperty(propertyId, agentUserId) {
    try {
      const db = getDb();
      const doc = await db.collection(this.collection).doc(propertyId).get();
      
      if (!doc.exists) {
        throw new Error('Property not found');
      }

      const propertyData = doc.data();
      
      if (propertyData.agent_user_id !== agentUserId) {
        throw new Error('Unauthorized to delete this property');
      }

      await db.collection(this.collection).doc(propertyId).delete();

      return { message: 'Property deleted successfully' };
    } catch (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }
  }
}

export { PropertyServiceFirebase }; 