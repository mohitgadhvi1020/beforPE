const express = require('express');
const asyncHandler = require('express-async-handler');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get connection by ID (for both agents and customers)
// @route   GET /api/connections/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  try {
    const { data: connection, error } = await supabaseAdmin
      .from('connections')
      .select(`
        *,
        customers!connections_customer_id_fkey (
          id,
          preferences,
          users!customers_user_id_fkey (
            id, first_name, last_name, email, phone
          )
        ),
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
      .eq('id', req.params.id)
      .single();

    if (error || !connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
    }

    // Check if user has access to this connection
    const hasAccess = connection.agent_user_id === req.user.id || 
                     connection.customer_user_id === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this connection'
      });
    }

    res.status(200).json({
      success: true,
      data: connection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get all connections (admin only - for analytics)
// @route   GET /api/connections/admin/all
// @access  Private (Admin only)
router.get('/admin/all', protect, asyncHandler(async (req, res) => {
  // This would typically require admin role check
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    let query = supabaseAdmin
      .from('connections')
      .select(`
        *,
        customers!connections_customer_id_fkey (
          id,
          users!customers_user_id_fkey (
            id, first_name, last_name, email
          )
        ),
        agents!connections_agent_id_fkey (
          id,
          company_name,
          users!agents_user_id_fkey (
            id, first_name, last_name, email
          )
        ),
        properties (id, title, price, location, property_type)
      `, { count: 'exact' })
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    const { data: connections, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch connections: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      data: {
        connections,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / limit),
          total_count: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get connection statistics (admin only)
// @route   GET /api/connections/admin/stats
// @access  Private (Admin only)
router.get('/admin/stats', protect, asyncHandler(async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Access denied'
    });
  }

  try {
    // Total connections
    const { count: totalConnections } = await supabaseAdmin
      .from('connections')
      .select('*', { count: 'exact', head: true });

    // Connections by status
    const { data: statusStats } = await supabaseAdmin
      .from('connections')
      .select('status')
      .then(({ data }) => {
        const stats = data.reduce((acc, conn) => {
          acc[conn.status] = (acc[conn.status] || 0) + 1;
          return acc;
        }, {});
        return { data: stats };
      });

    // Connections in last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { count: recentConnections } = await supabaseAdmin
      .from('connections')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', thirtyDaysAgo.toISOString());

    res.status(200).json({
      success: true,
      data: {
        total: totalConnections || 0,
        recent: recentConnections || 0,
        by_status: statusStats || {}
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Add notes to connection (both agents and customers)
// @route   POST /api/connections/:id/notes
// @access  Private
router.post('/:id/notes', protect, asyncHandler(async (req, res) => {
  try {
    const { note } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Note content is required'
      });
    }

    // First check if user has access to this connection
    const { data: connection, error: fetchError } = await supabaseAdmin
      .from('connections')
      .select('agent_user_id, customer_user_id, notes')
      .eq('id', req.params.id)
      .single();

    if (fetchError || !connection) {
      return res.status(404).json({
        success: false,
        error: 'Connection not found'
      });
    }

    const hasAccess = connection.agent_user_id === req.user.id || 
                     connection.customer_user_id === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to access this connection'
      });
    }

    // Add note to existing notes
    const existingNotes = connection.notes || '';
    const timestamp = new Date().toISOString();
    const userName = `${req.user.first_name} ${req.user.last_name}`;
    const newNote = `[${timestamp}] ${userName}: ${note.trim()}`;
    const updatedNotes = existingNotes ? `${existingNotes}\n${newNote}` : newNote;

    const { data: updatedConnection, error } = await supabaseAdmin
      .from('connections')
      .update({
        notes: updatedNotes,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to add note: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      data: updatedConnection
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

module.exports = router; 