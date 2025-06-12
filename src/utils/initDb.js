// Database initialization utility
async function initDatabase() {
  try {
    // Import after environment variables are loaded
    const { default: sql } = await import('../config/database.js');
    const { logger } = await import('./logger.js');
    
    logger.info('Checking database tables...');

    // Create users table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('agent', 'customer')),
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(20),
        send_bird_id VARCHAR(255),
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      )
    `;

    // Add send_bird_id column if it doesn't exist (for existing tables)
    try {
      await sql`
        ALTER TABLE users ADD COLUMN IF NOT EXISTS send_bird_id VARCHAR(255)
      `;
      logger.info('Added send_bird_id column to existing users table');
    } catch (error) {
      // Column might already exist, which is fine
      if (!error.message.includes('already exists')) {
        logger.warn('Could not add send_bird_id column:', error.message);
      }
    }

    // Create indexes if they don't exist (after ensuring columns exist)
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_sendbird ON users (send_bird_id)
    `;

    // Create properties table if it doesn't exist
    await sql`
      CREATE TABLE IF NOT EXISTS properties (
        id UUID PRIMARY KEY,
        agent_user_id UUID NOT NULL REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        property_type VARCHAR(50) NOT NULL CHECK (property_type IN ('apartment', 'house', 'condo', 'commercial')),
        price DECIMAL(12, 2) NOT NULL,
        location JSONB NOT NULL,
        features JSONB,
        images TEXT[],
        status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'pending', 'sold', 'rented')),
        is_featured BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Create index on agent_user_id for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_properties_agent ON properties (agent_user_id)
    `;

    // Create index on property_type for filtering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_properties_type ON properties (property_type)
    `;

    // Create index on status for filtering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_properties_status ON properties (status)
    `;

    logger.info('Database tables verified/created successfully');
    
  } catch (error) {
    const { logger } = await import('./logger.js');
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export { initDatabase }; 