import { NextResponse } from 'next/server';
import { sql } from "@vercel/postgres";

export async function GET(request: Request) {
  try {
    // Get ID from URL
    const id = request.url.split('/').pop();
    
    // Validate ID
    const numericId = parseInt(id as string, 10);
    if (isNaN(numericId)) {
      return NextResponse.json(
        { error: 'Invalid ID format' },
        { status: 400 }
      );
    }

    const result = await sql`
      SELECT 
        r.id,
        r.user_id as "userId",
        r.start_time as "startTime",
        r.end_time as "endTime",
        r.money_made::numeric as "moneyMade",
        r.frequency_average::numeric as "frequencyAverage",
        r.max_renewable_percentage::numeric as "maxRenewablePercentage",
        r.total_emissions::numeric as "totalEmissions",
        r.total_generation::numeric as "totalGeneration",
        r.real_date as "realDate",
        r.end_reason as "endReason",
        r.max_customers as "maxCustomers",
        r.grid_intensity::numeric as "gridIntensity",
        u.username
      FROM runs r
      JOIN users u ON r.user_id = u.id
      WHERE r.id = ${numericId}
    `;

    if (result.rows.length === 0) {
      return NextResponse.json(
        { message: "Run not found" },
        { status: 404 }
      );
    }

    const run = result.rows[0];
    
    // Convert numeric strings to numbers
    const processed = {
      ...run,
      moneyMade: parseFloat(run.moneyMade),
      frequencyAverage: parseFloat(run.frequencyAverage),
      maxRenewablePercentage: parseFloat(run.maxRenewablePercentage),
      totalEmissions: parseFloat(run.totalEmissions),
      totalGeneration: parseFloat(run.totalGeneration),
      gridIntensity: parseFloat(run.gridIntensity),
      maxCustomers: parseInt(run.maxCustomers)
    };

    return NextResponse.json(processed);
  } catch (error) {
    console.error('Failed to fetch run:', error);
    return NextResponse.json(
      { message: "Failed to fetch run", error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 