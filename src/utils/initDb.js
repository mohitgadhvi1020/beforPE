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
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        last_login TIMESTAMP WITH TIME ZONE
      )
    `;

    // Create indexes if they don't exist
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)
    `;

    logger.info('Database tables verified/created successfully');
    
  } catch (error) {
    const { logger } = await import('./logger.js');
    logger.error('Database initialization failed:', error);
    throw error;
  }
}

export { initDatabase }; 