import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hour = searchParams.get('hour');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];

  try {
    // Fetch load curve data
    const loadQuery = await sql`
      SELECT load_mw
      FROM load_curves
      WHERE date = ${date}
      AND hour = ${hour}
    `;

    // Fetch solar generation data
    const solarQuery = await sql`
      SELECT generation_factor
      FROM solar_generation
      WHERE date = ${date}
      AND hour = ${hour}
    `;

    // Fetch wind generation data
    const windQuery = await sql`
      SELECT generation_factor
      FROM wind_generation
      WHERE date = ${date}
      AND hour = ${hour}
    `;

    return NextResponse.json({
      loadFactor: loadQuery.rows[0]?.load_mw || null,
      solarFactor: solarQuery.rows[0]?.generation_factor || null,
      windFactor: windQuery.rows[0]?.generation_factor || null,
    });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    );
  }
} 