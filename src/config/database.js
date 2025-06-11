import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

const sql = postgres(connectionString, {
  // Connection pool configuration
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
});

export default sql; 