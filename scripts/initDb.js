import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

async function initDatabase() {
  try {
    // Import after environment variables are loaded
    const { default: sql } = await import('../src/config/database.js');
    const { logger } = await import('../src/utils/logger.js');
    
    logger.info('Initializing database...');

    // Create users table
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

    // Create index on email for faster lookups
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users (email)
    `;

    // Create index on role for filtering
    await sql`
      CREATE INDEX IF NOT EXISTS idx_users_role ON users (role)
    `;

    logger.info('Database initialized successfully!');
    logger.info('Tables created:');
    logger.info('- users');

    await sql.end();
    
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

// Run the initialization
initDatabase()
  .then(() => {
    console.log('✅ Database initialization completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }); 