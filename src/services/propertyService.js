const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

class PropertyService {
  // Create new property (agent only)
  async createProperty(agentUserId, propertyData) {
    const propertyId = uuidv4();
    
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .insert({
        id: propertyId,
        agent_user_id: agentUserId,
        ...propertyData,
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        agents!properties_agent_user_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name, email
          )
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create property: ${error.message}`);
    }

    return property;
  }

  // Update property (agent only)
  async updateProperty(propertyId, agentUserId, updateData) {
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', propertyId)
      .eq('agent_user_id', agentUserId)
      .select(`
        *,
        agents!properties_agent_user_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name, email
          )
        )
      `)
      .single();

    if (error) {
      throw new Error(`Failed to update property: ${error.message}`);
    }

    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    return property;
  }

  // Delete property (agent only)
  async deleteProperty(propertyId, agentUserId) {
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .delete()
      .eq('id', propertyId)
      .eq('agent_user_id', agentUserId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to delete property: ${error.message}`);
    }

    if (!property) {
      throw new Error('Property not found or unauthorized');
    }

    return { message: 'Property deleted successfully' };
  }

  // Get all properties (public)
  async getAllProperties(filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('properties')
      .select(`
        *,
        agents!properties_agent_user_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name
          )
        )
      `, { count: 'exact' })
      .eq('status', 'available')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Apply filters
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }

    if (filters.price_min && filters.price_max) {
      query = query.gte('price', filters.price_min).lte('price', filters.price_max);
    } else if (filters.price_min) {
      query = query.gte('price', filters.price_min);
    } else if (filters.price_max) {
      query = query.lte('price', filters.price_max);
    }

    if (filters.bedrooms) {
      query = query.gte('features->bedrooms', filters.bedrooms);
    }

    if (filters.bathrooms) {
      query = query.gte('features->bathrooms', filters.bathrooms);
    }

    if (filters.city) {
      query = query.ilike('location->city', `%${filters.city}%`);
    }

    if (filters.state) {
      query = query.ilike('location->state', `%${filters.state}%`);
    }

    const { data: properties, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    return {
      properties,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit),
        total_count: count,
        per_page: limit
      }
    };
  }

  // Get property by ID (public)
  async getPropertyById(propertyId) {
    const { data: property, error } = await supabaseAdmin
      .from('properties')
      .select(`
        *,
        agents!properties_agent_user_id_fkey (
          id,
          company_name,
          license_number,
          bio,
          experience_years,
          users!agents_user_id_fkey (
            id, first_name, last_name, email, phone
          )
        )
      `)
      .eq('id', propertyId)
      .single();

    if (error || !property) {
      throw new Error('Property not found');
    }

    return property;
  }

  // Search properties
  async searchProperties(searchTerm, filters = {}, page = 1, limit = 20) {
    const offset = (page - 1) * limit;
    
    let query = supabaseAdmin
      .from('properties')
      .select(`
        *,
        agents!properties_agent_user_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name
          )
        )
      `, { count: 'exact' })
      .eq('status', 'available')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    // Add search term filtering
    if (searchTerm) {
      query = query.or(`
        title.ilike.%${searchTerm}%,
        description.ilike.%${searchTerm}%,
        location->address.ilike.%${searchTerm}%,
        location->city.ilike.%${searchTerm}%,
        location->state.ilike.%${searchTerm}%
      `);
    }

    // Apply additional filters
    if (filters.property_type) {
      query = query.eq('property_type', filters.property_type);
    }

    if (filters.price_min && filters.price_max) {
      query = query.gte('price', filters.price_min).lte('price', filters.price_max);
    }

    if (filters.bedrooms) {
      query = query.gte('features->bedrooms', filters.bedrooms);
    }

    if (filters.bathrooms) {
      query = query.gte('features->bathrooms', filters.bathrooms);
    }

    const { data: properties, error, count } = await query;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return {
      properties,
      pagination: {
        current_page: page,
        total_pages: Math.ceil(count / limit),
        total_count: count,
        per_page: limit
      }
    };
  }

  // Get similar properties
  async getSimilarProperties(propertyId, limit = 5) {
    // First get the original property
    const { data: originalProperty, error: origError } = await supabaseAdmin
      .from('properties')
      .select('property_type, price, location, features')
      .eq('id', propertyId)
      .single();

    if (origError || !originalProperty) {
      throw new Error('Original property not found');
    }

    // Search for similar properties
    let query = supabaseAdmin
      .from('properties')
      .select(`
        *,
        agents!properties_agent_user_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name
          )
        )
      `)
      .eq('status', 'available')
      .neq('id', propertyId)
      .limit(limit);

    // Match property type
    if (originalProperty.property_type) {
      query = query.eq('property_type', originalProperty.property_type);
    }

    // Match price range (±20%)
    if (originalProperty.price) {
      const priceRange = originalProperty.price * 0.2;
      query = query
        .gte('price', originalProperty.price - priceRange)
        .lte('price', originalProperty.price + priceRange);
    }

    // Match location (same city)
    if (originalProperty.location?.city) {
      query = query.eq('location->city', originalProperty.location.city);
    }

    const { data: properties, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch similar properties: ${error.message}`);
    }

    return properties;
  }

  // Get property statistics for agent
  async getPropertyStats(agentUserId) {
    // Total properties
    const { count: totalProperties } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', agentUserId);

    // Available properties
    const { count: availableProperties } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', agentUserId)
      .eq('status', 'available');

    // Sold properties
    const { count: soldProperties } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', agentUserId)
      .eq('status', 'sold');

    // Properties with connections
    const { count: propertiesWithConnections } = await supabaseAdmin
      .from('connections')
      .select('property_id', { count: 'exact', head: true })
      .eq('agent_user_id', agentUserId)
      .not('property_id', 'is', null);

    return {
      total: totalProperties || 0,
      available: availableProperties || 0,
      sold: soldProperties || 0,
      with_connections: propertiesWithConnections || 0
    };
  }

  // Get trending/featured properties
  async getFeaturedProperties(limit = 10) {
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select(`
        *,
        agents!properties_agent_user_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name
          )
        )
      `)
      .eq('status', 'available')
      .eq('is_featured', true)
      .limit(limit)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch featured properties: ${error.message}`);
    }

    return properties;
  }
}

module.exports = new PropertyService(); 