import { sql } from '@vercel/postgres';

export async function initializeDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE,
        high_score INTEGER DEFAULT 0
      );
    `;
    await sql`
      CREATE TABLE IF NOT EXISTS runs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        start_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        money_made DECIMAL,
        frequency_average DECIMAL,
        max_renewable_percentage DECIMAL,
        total_emissions DECIMAL,
        total_generation DECIMAL,
        real_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        end_reason VARCHAR(50),
        max_customers INTEGER,
        grid_intensity DECIMAL,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
} 