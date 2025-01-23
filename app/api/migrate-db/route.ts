import { NextResponse } from 'next/server';
import { migrateDatabase } from '../auth/migrate-db';

export const dynamic = 'force-dynamic';

export async function GET() {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Migration endpoint only available in development' },
      { status: 403 }
    );
  }

  try {
    await migrateDatabase();
    return NextResponse.json({ message: 'Database migration completed successfully' });
  } catch (error) {
    console.error('Failed to migrate database:', error);
    return NextResponse.json(
      { error: 'Failed to migrate database', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 