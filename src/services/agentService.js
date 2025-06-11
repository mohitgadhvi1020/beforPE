const { v4: uuidv4 } = require('uuid');
const { supabaseAdmin } = require('../config/supabase');

class AgentService {
  // Get agent profile with user details
  async getAgentProfile(userId) {
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select(`
        *,
        users!agents_user_id_fkey (
          id, email, first_name, last_name, phone, created_at
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error || !agent) {
      throw new Error('Agent profile not found');
    }

    return agent;
  }

  // Update agent profile
  async updateAgentProfile(userId, profileData) {
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
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

    return agent;
  }

  // Get all agents (for customers to browse)
  async getAllAgents(filters = {}) {
    let query = supabaseAdmin
      .from('agents')
      .select(`
        *,
        users!agents_user_id_fkey (
          id, first_name, last_name, email
        )
      `)
      .eq('is_verified', true);

    // Apply filters
    if (filters.city) {
      query = query.ilike('location->city', `%${filters.city}%`);
    }
    if (filters.specialization) {
      query = query.contains('specializations', [filters.specialization]);
    }
    if (filters.experience_min) {
      query = query.gte('experience_years', filters.experience_min);
    }

    const { data: agents, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }

    return agents;
  }

  // Get agent by ID (for public view)
  async getAgentById(agentId) {
    const { data: agent, error } = await supabaseAdmin
      .from('agents')
      .select(`
        *,
        users!agents_user_id_fkey (
          id, first_name, last_name, email
        )
      `)
      .eq('id', agentId)
      .eq('is_verified', true)
      .single();

    if (error || !agent) {
      throw new Error('Agent not found');
    }

    return agent;
  }

  // Get agent's properties
  async getAgentProperties(userId) {
    const { data: properties, error } = await supabaseAdmin
      .from('properties')
      .select('*')
      .eq('agent_user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch properties: ${error.message}`);
    }

    return properties;
  }

  // Get agent's connections/leads
  async getAgentConnections(userId, status = null) {
    let query = supabaseAdmin
      .from('connections')
      .select(`
        *,
        customers!connections_customer_id_fkey (
          id,
          users!customers_user_id_fkey (
            id, first_name, last_name, email, phone
          )
        ),
        properties (id, title, price, location, property_type)
      `)
      .eq('agent_user_id', userId)
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

  // Update connection status
  async updateConnectionStatus(connectionId, agentUserId, status, notes = null) {
    // Verify the connection belongs to this agent
    const { data: connection, error: fetchError } = await supabaseAdmin
      .from('connections')
      .select('*')
      .eq('id', connectionId)
      .eq('agent_user_id', agentUserId)
      .single();

    if (fetchError || !connection) {
      throw new Error('Connection not found or unauthorized');
    }

    const { data: updatedConnection, error } = await supabaseAdmin
      .from('connections')
      .update({
        status,
        notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', connectionId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update connection: ${error.message}`);
    }

    return updatedConnection;
  }

  // Get agent statistics
  async getAgentStats(userId) {
    // Get total connections
    const { count: totalConnections } = await supabaseAdmin
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', userId);

    // Get active connections
    const { count: activeConnections } = await supabaseAdmin
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', userId)
      .eq('status', 'accepted');

    // Get completed connections
    const { count: completedConnections } = await supabaseAdmin
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', userId)
      .eq('status', 'completed');

    // Get total properties
    const { count: totalProperties } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', userId);

    // Get available properties
    const { count: availableProperties } = await supabaseAdmin
      .from('properties')
      .select('*', { count: 'exact', head: true })
      .eq('agent_user_id', userId)
      .eq('status', 'available');

    return {
      connections: {
        total: totalConnections || 0,
        active: activeConnections || 0,
        completed: completedConnections || 0
      },
      properties: {
        total: totalProperties || 0,
        available: availableProperties || 0
      }
    };
  }

  // Search agents
  async searchAgents(searchTerm, filters = {}) {
    let query = supabaseAdmin
      .from('agents')
      .select(`
        *,
        users!agents_user_id_fkey (
          id, first_name, last_name, email
        )
      `)
      .eq('is_verified', true);

    // Add search term filtering
    if (searchTerm) {
      query = query.or(`
        company_name.ilike.%${searchTerm}%,
        bio.ilike.%${searchTerm}%,
        users.first_name.ilike.%${searchTerm}%,
        users.last_name.ilike.%${searchTerm}%
      `);
    }

    // Apply additional filters
    if (filters.city) {
      query = query.ilike('location->city', `%${filters.city}%`);
    }
    if (filters.specialization) {
      query = query.contains('specializations', [filters.specialization]);
    }

    const { data: agents, error } = await query;

    if (error) {
      throw new Error(`Search failed: ${error.message}`);
    }

    return agents;
  }
}

module.exports = new AgentService(); 