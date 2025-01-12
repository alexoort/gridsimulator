import { NextResponse } from 'next/server';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { sql } from '@vercel/postgres';


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hour = parseInt(searchParams.get('hour') || '0');
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const range = parseInt(searchParams.get('range') || '24'); // Default to 24 hours

  try {
    // Validate inputs
    if (isNaN(hour) || hour < 0 || hour > 23) {
      return NextResponse.json(
        { error: 'Hour must be between 0 and 23' },
        { status: 400 }
      );
    }

    if (isNaN(range) || range < 1 || range > 168) { // Max 1 week of data
      return NextResponse.json(
        { error: 'Range must be between 1 and 168 hours' },
        { status: 400 }
      );
    }

    // Fetch load curve data for the specified range
    const loadQuery = await sql`
      WITH hours AS (
        SELECT generate_series(
          ${date}::timestamp + ${hour}::int * interval '1 hour',
          ${date}::timestamp + (${hour + range - 1})::int * interval '1 hour',
          interval '1 hour'
        ) as datetime
      )
      SELECT 
        h.datetime::date as date,
        EXTRACT(HOUR FROM h.datetime)::int as hour,
        COALESCE(l.load_mw, 0) as load_mw
      FROM hours h
      LEFT JOIN load_curves l ON 
        l.date = h.datetime::date AND 
        l.hour = EXTRACT(HOUR FROM h.datetime)::int
      ORDER BY h.datetime
    `;

    // Fetch solar generation data
    const solarQuery = await sql`
      WITH hours AS (
        SELECT generate_series(
          ${date}::timestamp + ${hour}::int * interval '1 hour',
          ${date}::timestamp + (${hour + range - 1})::int * interval '1 hour',
          interval '1 hour'
        ) as datetime
      )
      SELECT 
        h.datetime::date as date,
        EXTRACT(HOUR FROM h.datetime)::int as hour,
        COALESCE(s.generation_factor, 0) as generation_factor
      FROM hours h
      LEFT JOIN solar_generation s ON 
        s.date = h.datetime::date AND 
        s.hour = EXTRACT(HOUR FROM h.datetime)::int
      ORDER BY h.datetime
    `;

    // Fetch wind generation data
    const windQuery = await sql`
      WITH hours AS (
        SELECT generate_series(
          ${date}::timestamp + ${hour}::int * interval '1 hour',
          ${date}::timestamp + (${hour + range - 1})::int * interval '1 hour',
          interval '1 hour'
        ) as datetime
      )
      SELECT 
        h.datetime::date as date,
        EXTRACT(HOUR FROM h.datetime)::int as hour,
        COALESCE(w.generation_factor, 0) as generation_factor
      FROM hours h
      LEFT JOIN wind_generation w ON 
        w.date = h.datetime::date AND 
        w.hour = EXTRACT(HOUR FROM h.datetime)::int
      ORDER BY h.datetime
    `;

    // Process and combine the data
    const marketData = Array.from({ length: range }, (_, i) => {
      const index = i;
      return {
        date: loadQuery.rows[index]?.date || null,
        hour: loadQuery.rows[index]?.hour || null,
        load_mw: loadQuery.rows[index]?.load_mw || 0,
        solar_factor: solarQuery.rows[index]?.generation_factor || 0,
        wind_factor: windQuery.rows[index]?.generation_factor || 0,
      };
    });

    // Calculate summary statistics
    const summary = {
      total_load: marketData.reduce((sum, data) => sum + Number(data.load_mw), 0),
      avg_load: marketData.reduce((sum, data) => sum + Number(data.load_mw), 0) / range,
      avg_solar: marketData.reduce((sum, data) => sum + Number(data.solar_factor), 0) / range,
      avg_wind: marketData.reduce((sum, data) => sum + Number(data.wind_factor), 0) / range,
    };

    return NextResponse.json({
      success: true,
      data: marketData,
      summary,
      metadata: {
        start_date: date,
        start_hour: hour,
        range,
        total_records: marketData.length,
      }
    });

  } catch (error: unknown) {
    console.error('Database error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch market data',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
} 