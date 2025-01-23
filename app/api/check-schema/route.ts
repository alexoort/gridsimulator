import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const result = await sql`
      SELECT column_name, data_type, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'runs'
      ORDER BY ordinal_position;
    `;

    return NextResponse.json({
      message: 'Schema retrieved successfully',
      columns: result.rows
    });
  } catch (error) {
    console.error('Failed to check schema:', error);
    return NextResponse.json(
      { error: 'Failed to check schema', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 