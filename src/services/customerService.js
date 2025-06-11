const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

class CustomerService {
  // Get customer profile with user details
  async getCustomerProfile(userId) {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .select(`
        *,
        users!customers_user_id_fkey (
          id, email, first_name, last_name, phone, created_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !customer) {
      throw new Error('Customer profile not found');
    }

    return customer;
  }

  // Update customer profile
  async updateCustomerProfile(userId, profileData) {
    const { data: customer, error } = await supabaseAdmin
      .from('customers')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      throw new Error(`Profile update failed: ${error.message}`);
    }

    return customer;
  }

  // Get customer's connections
  async getCustomerConnections(userId, status = null) {
    let query = supabaseAdmin
      .from('connections')
      .select(`
        *,
        agents!connections_agent_id_fkey (
          id,
          company_name,
          license_number,
          users!agents_user_id_fkey (
            id, first_name, last_name, email, phone
          )
        ),
        properties (id, title, price, location, property_type, images)
      `)
      .eq('customer_user_id', userId)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: connections, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch connections: ${error.message}`);
    }

    return connections;
  }

  // Create connection request to agent
  async createConnectionRequest(userId, connectionData) {
    const { agent_id, property_id, message, preferred_contact_method } = connectionData;

    // First get the customer ID
    const { data: customer, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (customerError || !customer) {
      throw new Error('Customer profile not found');
    }

    // Get agent's user_id
    const { data: agent, error: agentError } = await supabaseAdmin
      .from('agents')
      .select('user_id')
      .eq('id', agent_id)
      .single();

    if (agentError || !agent) {
      throw new Error('Agent not found');
    }

    // Check if connection already exists
    const { data: existingConnection } = await supabaseAdmin
      .from('connections')
      .select('id')
      .eq('customer_id', customer.id)
      .eq('agent_id', agent_id)
      .eq('property_id', property_id || null)
      .single();

    if (existingConnection) {
      throw new Error('Connection request already exists');
    }

    // Create connection
    const { data: connection, error } = await supabaseAdmin
      .from('connections')
      .insert({
        id: uuidv4(),
        customer_id: customer.id,
        customer_user_id: userId,
        agent_id: agent_id,
        agent_user_id: agent.user_id,
        property_id: property_id || null,
        message,
        preferred_contact_method,
        status: 'pending',
        created_at: new Date().toISOString()
      })
      .select(`
        *,
        agents!connections_agent_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name, email
          )
        ),
        properties (id, title, price, location, property_type)
      `)
      .single();

    if (error) {
      throw new Error(`Failed to create connection: ${error.message}`);
    }

    return connection;
  }

  // Get customer's saved properties/favorites
  async getFavoriteProperties(userId) {
    const { data: favorites, error } = await supabaseAdmin
      .from('customer_favorites')
      .select(`
        *,
        properties (
          *,
          agents!properties_agent_user_id_fkey (
            id,
            company_name,
            users!agents_user_id_fkey (
              id, first_name, last_name
            )
          )
        )
      `)
      .eq('customer_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch favorites: ${error.message}`);
    }

    return favorites;
  }

  // Add property to favorites
  async addToFavorites(userId, propertyId) {
    // Check if already favorited
    const { data: existing } = await supabaseAdmin
      .from('customer_favorites')
      .select('id')
      .eq('customer_user_id', userId)
      .eq('property_id', propertyId)
      .single();

    if (existing) {
      throw new Error('Property already in favorites');
    }

    const { data: favorite, error } = await supabaseAdmin
      .from('customer_favorites')
      .insert({
        id: uuidv4(),
        customer_user_id: userId,
        property_id: propertyId,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add to favorites: ${error.message}`);
    }

    return favorite;
  }

  // Remove property from favorites
  async removeFromFavorites(userId, propertyId) {
    const { data: favorite, error } = await supabaseAdmin
      .from('customer_favorites')
      .delete()
      .eq('customer_user_id', userId)
      .eq('property_id', propertyId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to remove from favorites: ${error.message}`);
    }

    return { message: 'Removed from favorites successfully' };
  }

  // Get recommended properties based on customer preferences
  async getRecommendedProperties(userId, limit = 10) {
    // Get customer preferences
    const { data: customer } = await supabaseAdmin
      .from('customers')
      .select('preferences')
      .eq('user_id', userId)
      .single();

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
      .limit(limit);

    // Apply preference filters if they exist
    if (customer?.preferences) {
      const { preferences } = customer;

      if (preferences.property_type && preferences.property_type.length > 0) {
        query = query.in('property_type', preferences.property_type);
      }

      if (preferences.budget_min && preferences.budget_max) {
        query = query.gte('price', preferences.budget_min)
                    .lte('price', preferences.budget_max);
      } else if (preferences.budget_max) {
        query = query.lte('price', preferences.budget_max);
      }

      if (preferences.bedrooms) {
        query = query.gte('features->bedrooms', preferences.bedrooms);
      }

      if (preferences.bathrooms) {
        query = query.gte('features->bathrooms', preferences.bathrooms);
      }
    }

    const { data: properties, error } = await query.order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch recommendations: ${error.message}`);
    }

    return properties;
  }

  // Get customer statistics
  async getCustomerStats(userId) {
    // Get total connections
    const { count: totalConnections } = await supabaseAdmin
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('customer_user_id', userId);

    // Get active connections
    const { count: activeConnections } = await supabaseAdmin
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('customer_user_id', userId)
      .eq('status', 'accepted');

    // Get favorite properties count
    const { count: favoriteProperties } = await supabaseAdmin
      .from('customer_favorites')
      .select('*', { count: 'exact', head: true })
      .eq('customer_user_id', userId);

    return {
      connections: {
        total: totalConnections || 0,
        active: activeConnections || 0
      },
      favorites: favoriteProperties || 0
    };
  }

  // Search customers by agents (for agent dashboard)
  async searchCustomers(searchTerm, agentUserId) {
    // Only return customers who have connections with this agent
    let query = supabaseAdmin
      .from('connections')
      .select(`
        customers!connections_customer_id_fkey (
          id,
          preferences,
          users!customers_user_id_fkey (
            id, first_name, last_name, email, phone
          )
        )
      `)
      .eq('agent_user_id', agentUserId);

    if (searchTerm) {
      query = query.or(`
        customers.users.first_name.ilike.%${searchTerm}%,
        customers.users.last_name.ilike.%${searchTerm}%,
        customers.users.email.ilike.%${searchTerm}%
      `);
    }

    const { data: connections, error } = await query;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    // Extract unique customers
    const uniqueCustomers = connections
      .map(conn => conn.customers)
      .filter((customer, index, self) => 
        index === self.findIndex(c => c.id === customer.id)
      );

    return uniqueCustomers;
  }
}

module.exports = new CustomerService(); 