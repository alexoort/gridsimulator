import { sql } from '@vercel/postgres';

export async function migrateDatabase() {
  try {
    console.log('Starting database migration...');

    // First verify the table exists
    const tableCheck = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'runs'
      );
    `;

    if (!tableCheck.rows[0].exists) {
      throw new Error('Runs table does not exist');
    }

    console.log('Runs table exists, adding new columns...');

    // Add new columns one by one to better track progress
    await sql`ALTER TABLE runs ADD COLUMN IF NOT EXISTS total_generation DECIMAL;`;
    console.log('Added total_generation column');

    await sql`ALTER TABLE runs ADD COLUMN IF NOT EXISTS real_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;`;
    console.log('Added real_date column');

    await sql`ALTER TABLE runs ADD COLUMN IF NOT EXISTS end_reason VARCHAR(50);`;
    console.log('Added end_reason column');

    await sql`ALTER TABLE runs ADD COLUMN IF NOT EXISTS max_customers INTEGER;`;
    console.log('Added max_customers column');

    await sql`ALTER TABLE runs ADD COLUMN IF NOT EXISTS grid_intensity DECIMAL;`;
    console.log('Added grid_intensity column');

    // Verify columns were added
    const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_schema = 'public' 
      AND table_name = 'runs';
    `;

    console.log('Current columns in runs table:', columns.rows.map(r => r.column_name));
    
    console.log('Database migration completed successfully');
    return columns.rows;
  } catch (error) {
    console.error('Failed to migrate database:', error);
    throw error;
  }
} 