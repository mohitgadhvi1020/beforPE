const express = require('express');
const asyncHandler = require('express-async-handler');
const { supabaseAdmin } = require('../config/supabase');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Initialize chat channel for connection
// @route   POST /api/chat/init/:connectionId
// @access  Private
router.post('/init/:connectionId', protect, asyncHandler(async (req, res) => {
  try {
    // Get connection details
    const { data: connection, error } = await supabaseAdmin
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
          users!agents_user_id_fkey (
            id, first_name, last_name, email
          )
        ),
        properties (id, title)
      `)
      .eq('id', req.params.connectionId)
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

    // Check if chat channel already exists
    const { data: existingChat } = await supabaseAdmin
      .from('chat_channels')
      .select('*')
      .eq('connection_id', req.params.connectionId)
      .single();

    if (existingChat) {
      return res.status(200).json({
        success: true,
        data: {
          channel_id: existingChat.sendbird_channel_id,
          channel_url: existingChat.sendbird_channel_url,
          message: 'Chat channel already exists'
        }
      });
    }

    // Here you would integrate with SendBird API to create a channel
    // For now, we'll create a mock channel ID
    const channelId = `${connection.customer_id}_${connection.agent_id}_${Date.now()}`;
    const channelUrl = `https://sendbird.com/channel/${channelId}`;

    // Store chat channel info
    const { data: chatChannel, error: chatError } = await supabaseAdmin
      .from('chat_channels')
      .insert({
        id: require('uuid').v4(),
        connection_id: req.params.connectionId,
        sendbird_channel_id: channelId,
        sendbird_channel_url: channelUrl,
        is_active: true,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (chatError) {
      throw new Error(`Failed to create chat channel: ${chatError.message}`);
    }

    // In a real implementation, you would:
    // 1. Create SendBird channel with both users
    // 2. Set channel metadata (property info, etc.)
    // 3. Send initial system message

    res.status(201).json({
      success: true,
      data: {
        channel_id: channelId,
        channel_url: channelUrl,
        connection: connection,
        message: 'Chat channel initialized successfully'
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get chat channels for user
// @route   GET /api/chat/channels
// @access  Private
router.get('/channels', protect, asyncHandler(async (req, res) => {
  try {
    let query;

    if (req.user.role === 'agent') {
      query = supabaseAdmin
        .from('chat_channels')
        .select(`
          *,
          connections!chat_channels_connection_id_fkey (
            id,
            status,
            property_id,
            customers!connections_customer_id_fkey (
              id,
              users!customers_user_id_fkey (
                id, first_name, last_name, email
              )
            ),
            properties (id, title, location, property_type)
          )
        `)
        .eq('connections.agent_user_id', req.user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
    } else {
      query = supabaseAdmin
        .from('chat_channels')
        .select(`
          *,
          connections!chat_channels_connection_id_fkey (
            id,
            status,
            property_id,
            agents!connections_agent_id_fkey (
              id,
              company_name,
              users!agents_user_id_fkey (
                id, first_name, last_name, email
              )
            ),
            properties (id, title, location, property_type)
          )
        `)
        .eq('connections.customer_user_id', req.user.id)
        .eq('is_active', true)
        .order('updated_at', { ascending: false });
    }

    const { data: channels, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch chat channels: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      data: channels
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get SendBird access token for user
// @route   GET /api/chat/token
// @access  Private
router.get('/token', protect, asyncHandler(async (req, res) => {
  try {
    // In a real implementation, you would:
    // 1. Create or get SendBird user
    // 2. Generate session token
    // 3. Return the token for client-side SDK

    const mockToken = `sb_access_token_${req.user.id}_${Date.now()}`;
    
    res.status(200).json({
      success: true,
      data: {
        user_id: req.user.id,
        access_token: mockToken,
        sendbird_app_id: process.env.SENDBIRD_APP_ID || 'your_sendbird_app_id',
        user_info: {
          nickname: `${req.user.first_name} ${req.user.last_name}`,
          profile_url: req.user.profile_image || null
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

// @desc    Update chat channel status
// @route   PUT /api/chat/channels/:channelId/status
// @access  Private
router.put('/channels/:channelId/status', protect, asyncHandler(async (req, res) => {
  try {
    const { is_active } = req.body;

    // Get channel and verify access
    const { data: channel, error: fetchError } = await supabaseAdmin
      .from('chat_channels')
      .select(`
        *,
        connections!chat_channels_connection_id_fkey (
          agent_user_id,
          customer_user_id
        )
      `)
      .eq('sendbird_channel_id', req.params.channelId)
      .single();

    if (fetchError || !channel) {
      return res.status(404).json({
        success: false,
        error: 'Chat channel not found'
      });
    }

    const hasAccess = channel.connections.agent_user_id === req.user.id || 
                     channel.connections.customer_user_id === req.user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to modify this chat channel'
      });
    }

    // Update channel status
    const { data: updatedChannel, error } = await supabaseAdmin
      .from('chat_channels')
      .update({
        is_active: is_active,
        updated_at: new Date().toISOString()
      })
      .eq('sendbird_channel_id', req.params.channelId)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update chat channel: ${error.message}`);
    }

    res.status(200).json({
      success: true,
      data: updatedChannel
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

// @desc    Get chat statistics for user
// @route   GET /api/chat/stats
// @access  Private
router.get('/stats', protect, asyncHandler(async (req, res) => {
  try {
    let activeChatsQuery;
    let totalChatsQuery;

    if (req.user.role === 'agent') {
      activeChatsQuery = supabaseAdmin
        .from('chat_channels')
        .select('*', { count: 'exact', head: true })
        .eq('connections.agent_user_id', req.user.id)
        .eq('is_active', true);

      totalChatsQuery = supabaseAdmin
        .from('chat_channels')
        .select('*', { count: 'exact', head: true })
        .eq('connections.agent_user_id', req.user.id);
    } else {
      activeChatsQuery = supabaseAdmin
        .from('chat_channels')
        .select('*', { count: 'exact', head: true })
        .eq('connections.customer_user_id', req.user.id)
        .eq('is_active', true);

      totalChatsQuery = supabaseAdmin
        .from('chat_channels')
        .select('*', { count: 'exact', head: true })
        .eq('connections.customer_user_id', req.user.id);
    }

    const [{ count: activeChats }, { count: totalChats }] = await Promise.all([
      activeChatsQuery,
      totalChatsQuery
    ]);

    res.status(200).json({
      success: true,
      data: {
        active_chats: activeChats || 0,
        total_chats: totalChats || 0
      }
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message
    });
  }
}));

module.exports = router; 