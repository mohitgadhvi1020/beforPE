import { v4 as uuidv4 } from 'uuid';

// Lazy import function for database
async function getDb() {
  try {
    const { default: sql } = await import('../config/database.js');
    return sql;
  } catch (error) {
    throw new Error('Database connection failed. Please check your database configuration.');
  }
}

class PropertyService {
  // Create new property (agent only)
  async createProperty(agentUserId, propertyData) {
    const sql = await getDb();
    const propertyId = uuidv4();
    
    const properties = await sql`
      INSERT INTO properties (
        id, agent_user_id, title, description, property_type, price, 
        location, features, images, status, created_at
      )
      VALUES (
        ${propertyId}, ${agentUserId}, ${propertyData.title}, ${propertyData.description},
        ${propertyData.property_type}, ${propertyData.price}, ${JSON.stringify(propertyData.location)},
        ${JSON.stringify(propertyData.features || {})}, ${propertyData.images || []},
        ${propertyData.status || 'available'}, NOW()
      )
      RETURNING *
    `;

    if (properties.length === 0) {
      throw new Error('Failed to create property');
    }

    // Get property with agent details
    const propertyWithAgent = await sql`
      SELECT 
        p.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.send_bird_id as agent_send_bird_id
      FROM properties p
      JOIN users u ON p.agent_user_id = u.id
      WHERE p.id = ${propertyId}
    `;

    return propertyWithAgent[0];
  }

  // Get all properties with optional filters
  async getAllProperties(filters = {}, page = 1, limit = 20) {
    const sql = await getDb();
    const offset = (page - 1) * limit;
    
    let whereConditions = [];
    let params = [];
    
    // Base condition - only available properties for public listings
    if (!filters.agent_id) {
      whereConditions.push(`p.status = 'available'`);
    }
    
    // Filter by agent ID if provided
    if (filters.agent_id) {
      whereConditions.push(`p.agent_user_id = $${params.length + 1}`);
      params.push(filters.agent_id);
    }
    
    // Filter by property type if provided
    if (filters.property_type) {
      whereConditions.push(`p.property_type = $${params.length + 1}`);
      params.push(filters.property_type);
    }
    
    // Price range filters
    if (filters.price_min) {
      whereConditions.push(`p.price >= $${params.length + 1}`);
      params.push(filters.price_min);
    }
    
    if (filters.price_max) {
      whereConditions.push(`p.price <= $${params.length + 1}`);
      params.push(filters.price_max);
    }
    
    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';
    
    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) as total
      FROM properties p
      ${whereClause}
    `;
    
    const countResult = await sql.unsafe(countQuery, params);
    const totalCount = parseInt(countResult[0].total);
    
    // Get properties with agent details
    const query = `
      SELECT 
        p.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.send_bird_id as agent_send_bird_id
      FROM properties p
      JOIN users u ON p.agent_user_id = u.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const properties = await sql.unsafe(query, params);
    
    return {
      properties,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        per_page: limit
      }
    };
  }

  // Get property by ID
  async getPropertyById(propertyId) {
    const sql = await getDb();
    
    const properties = await sql`
      SELECT 
        p.*,
        u.first_name as agent_first_name,
        u.last_name as agent_last_name,
        u.email as agent_email,
        u.phone as agent_phone,
        u.send_bird_id as agent_send_bird_id
      FROM properties p
      JOIN users u ON p.agent_user_id = u.id
      WHERE p.id = ${propertyId}
    `;

    if (properties.length === 0) {
      throw new Error('Property not found');
    }

    return properties[0];
  }

  // Update property (agent only)
  async updateProperty(propertyId, agentUserId, updateData) {
    const sql = await getDb();
    
    const properties = await sql`
      UPDATE properties SET 
        title = ${updateData.title || sql`title`},
        description = ${updateData.description || sql`description`},
        property_type = ${updateData.property_type || sql`property_type`},
        price = ${updateData.price || sql`price`},
        location = ${updateData.location ? JSON.stringify(updateData.location) : sql`location`},
        features = ${updateData.features ? JSON.stringify(updateData.features) : sql`features`},
        images = ${updateData.images || sql`images`},
        status = ${updateData.status || sql`status`},
        updated_at = NOW()
      WHERE id = ${propertyId} AND agent_user_id = ${agentUserId}
      RETURNING *
    `;

    if (properties.length === 0) {
      throw new Error('Property not found or unauthorized');
    }

    return properties[0];
  }

  // Delete property (agent only)
  async deleteProperty(propertyId, agentUserId) {
    const sql = await getDb();
    
    const properties = await sql`
      DELETE FROM properties 
      WHERE id = ${propertyId} AND agent_user_id = ${agentUserId}
      RETURNING *
    `;

    if (properties.length === 0) {
      throw new Error('Property not found or unauthorized');
    }

    return { message: 'Property deleted successfully' };
  }

  // Search properties
  async searchProperties(searchTerm, filters = {}, page = 1, limit = 20) {
    const sql = await getDb();
    const offset = (page - 1) * limit;
    
    let query = sql`
      SELECT p.*, 
             u.id as agent_id, 
             u.first_name as agent_first_name, 
             u.last_name as agent_last_name
      FROM properties p
      JOIN users u ON p.agent_user_id = u.id
      WHERE 1=1
    `;

    // Add search term filtering
    if (searchTerm) {
      query = sql`${query} AND (
        p.title ILIKE '%${searchTerm}%' OR
        p.description ILIKE '%${searchTerm}%' OR
        p.location->address ILIKE '%${searchTerm}%' OR
        p.location->city ILIKE '%${searchTerm}%' OR
        p.location->state ILIKE '%${searchTerm}%'
      )`;
    }

    // Apply additional filters
    if (filters.property_type) {
      query = sql`${query} AND p.property_type = ${filters.property_type}`;
    }

    if (filters.price_min && filters.price_max) {
      query = sql`${query} AND p.price >= ${filters.price_min} AND p.price <= ${filters.price_max}`;
    } else if (filters.price_min) {
      query = sql`${query} AND p.price >= ${filters.price_min}`;
    } else if (filters.price_max) {
      query = sql`${query} AND p.price <= ${filters.price_max}`;
    }

    if (filters.bedrooms) {
      query = sql`${query} AND p.features->'bedrooms' >= ${filters.bedrooms}`;
    }

    if (filters.bathrooms) {
      query = sql`${query} AND p.features->'bathrooms' >= ${filters.bathrooms}`;
    }

    if (filters.city) {
      query = sql`${query} AND p.location->city ILIKE '%${filters.city}%'`;
    }

    if (filters.state) {
      query = sql`${query} AND p.location->state ILIKE '%${filters.state}%'`;
    }

    // Count total matching records
    const countQuery = sql`
      SELECT COUNT(*) FROM (${query}) AS count_query
    `;
    
    // Apply pagination to main query
    query = sql`
      ${query}
      ORDER BY p.created_at DESC
      LIMIT ${limit} OFFSET ${offset}
    `;
    
    // Execute both queries
    const [properties, countResult] = await Promise.all([
      query,
      countQuery
    ]);
    
    // Format the results
    const formattedProperties = properties.map(p => {
      // Format agent data
      const agent = {
        id: p.agent_id,
        first_name: p.agent_first_name,
        last_name: p.agent_last_name,
        send_bird_id: p.agent_send_bird_id
      };
      
      // Remove agent fields from property
      const {
        agent_id,
        agent_first_name,
        agent_last_name,
        agent_send_bird_id,
        ...property
      } = p;
      
      // Parse JSON fields
      if (property.location && typeof property.location === 'string') {
        property.location = JSON.parse(property.location);
      }
      
      if (property.features && typeof property.features === 'string') {
        property.features = JSON.parse(property.features);
      }
      
      return {
        ...property,
        agent
      };
    });
    
    // Get total count
    const totalCount = parseInt(countResult[0]?.count || '0');
    
    return {
      properties: formattedProperties,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(totalCount / limit),
        total_count: totalCount,
        per_page: limit
      }
    };
  }

  // Get similar properties
  async getSimilarProperties(propertyId, limit = 5) {
    const sql = await getDb();
    // First get the original property
    const originalProperty = await sql`
      SELECT p.*, 
             u.id as agent_id, 
             u.first_name as agent_first_name, 
             u.last_name as agent_last_name
      FROM properties p
      JOIN users u ON p.agent_user_id = u.id
      WHERE p.id = ${propertyId}
    `;

    if (originalProperty.length === 0) {
      throw new Error('Original property not found');
    }

    const original = originalProperty[0];

    // Search for similar properties
    let query = sql`
      SELECT p.*, 
             u.id as agent_id, 
             u.first_name as agent_first_name, 
             u.last_name as agent_last_name
      FROM properties p
      JOIN users u ON p.agent_user_id = u.id
      WHERE p.id != ${propertyId}
      AND p.property_type = ${original.property_type}
      AND p.price >= ${original.price * 0.8}
      AND p.price <= ${original.price * 1.2}
      AND p.location->city = ${original.location.city}
      LIMIT ${limit}
    `;

    const { data: similarProperties, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch similar properties: ${error.message}`);
    }

    return similarProperties.map(p => {
      // Format agent data
      const agent = {
        id: p.agent_id,
        first_name: p.agent_first_name,
        last_name: p.agent_last_name,
        send_bird_id: p.agent_send_bird_id
      };
      
      // Remove agent fields from property
      const {
        agent_id,
        agent_first_name,
        agent_last_name,
        agent_send_bird_id,
        ...property
      } = p;
      
      // Parse JSON fields
      if (property.location && typeof property.location === 'string') {
        property.location = JSON.parse(property.location);
      }
      
      if (property.features && typeof property.features === 'string') {
        property.features = JSON.parse(property.features);
      }
      
      return {
        ...property,
        agent
      };
    });
  }

  // Get property statistics for agent
  async getPropertyStats(agentUserId) {
    const sql = await getDb();
    // Total properties
    const totalProperties = await sql`
      SELECT COUNT(*) FROM properties WHERE agent_user_id = ${agentUserId}
    `;

    // Available properties
    const availableProperties = await sql`
      SELECT COUNT(*) FROM properties WHERE agent_user_id = ${agentUserId} AND status = 'available'
    `;

    // Sold properties
    const soldProperties = await sql`
      SELECT COUNT(*) FROM properties WHERE agent_user_id = ${agentUserId} AND status = 'sold'
    `;

    // Properties with connections
    const propertiesWithConnections = await sql`
      SELECT COUNT(*) FROM connections WHERE agent_user_id = ${agentUserId} AND property_id IS NOT NULL
    `;

    return {
      total: totalProperties[0]?.count || 0,
      available: availableProperties[0]?.count || 0,
      sold: soldProperties[0]?.count || 0,
      with_connections: propertiesWithConnections[0]?.count || 0
    };
  }

  // Get trending/featured properties
  async getFeaturedProperties(limit = 10) {
    const sql = await getDb();
    const properties = await sql`
      SELECT p.*, 
             u.id as agent_id, 
             u.first_name as agent_first_name, 
             u.last_name as agent_last_name
      FROM properties p
      JOIN users u ON p.agent_user_id = u.id
      WHERE p.status = 'available'
      AND p.is_featured = true
      LIMIT ${limit}
    `;

    if (properties.length === 0) {
      throw new Error('No featured properties found');
    }

    return properties.map(p => {
      // Format agent data
      const agent = {
        id: p.agent_id,
        first_name: p.agent_first_name,
        last_name: p.agent_last_name,
        send_bird_id: p.agent_send_bird_id
      };
      
      // Remove agent fields from property
      const {
        agent_id,
        agent_first_name,
        agent_last_name,
        agent_send_bird_id,
        ...property
      } = p;
      
      // Parse JSON fields
      if (property.location && typeof property.location === 'string') {
        property.location = JSON.parse(property.location);
      }
      
      if (property.features && typeof property.features === 'string') {
        property.features = JSON.parse(property.features);
      }
      
      return {
        ...property,
        agent
      };
    });
  }
}

export { PropertyService }; 