import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

interface RunData {
  userId: number;
  startTime: string;
  endTime: string;
  moneyMade: number;
  averageFrequencyDeviation: number;
  maxRenewablePercentage: number;
  totalEmissions: number;
  totalGeneration: number;
  realDate: string;
  endReason: string;
  maxCustomers: number;
  gridIntensity: number;
}

export async function POST(request: Request) {
  try {
    const data: RunData = await request.json();
    
    // Check if any required fields are undefined or null
    if (
      data.userId === undefined || data.userId === null ||
      data.moneyMade === undefined || data.moneyMade === null ||
      data.averageFrequencyDeviation === undefined || data.averageFrequencyDeviation === null ||
      data.maxRenewablePercentage === undefined || data.maxRenewablePercentage === null ||
      data.totalEmissions === undefined || data.totalEmissions === null ||
      data.totalGeneration === undefined || data.totalGeneration === null ||
      data.maxCustomers === undefined || data.maxCustomers === null ||
      data.gridIntensity === undefined || data.gridIntensity === null
    ) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Set timestamps if not provided
    const now = new Date().toISOString();
    const startTime = data.startTime || now;
    const endTime = data.endTime || now;
    const realDate = data.realDate || now;
    const endReason = data.endReason || 'manual';

    const result = await sql`
      INSERT INTO runs (
        user_id,
        start_time,
        end_time,
        money_made,
        frequency_average,
        max_renewable_percentage,
        total_emissions,
        total_generation,
        real_date,
        end_reason,
        max_customers,
        grid_intensity
      ) VALUES (
        ${data.userId},
        ${startTime}::timestamp with time zone,
        ${endTime}::timestamp with time zone,
        ${data.moneyMade}::decimal,
        ${data.averageFrequencyDeviation}::decimal,
        ${data.maxRenewablePercentage}::decimal,
        ${data.totalEmissions}::decimal,
        ${data.totalGeneration}::decimal,
        ${realDate}::timestamp with time zone,
        ${endReason},
        ${data.maxCustomers},
        ${data.gridIntensity}::decimal
      )
      RETURNING 
        id,
        start_time as "startTime",
        end_time as "endTime",
        money_made::numeric as "moneyMade",
        frequency_average::numeric as "frequencyAverage",
        max_renewable_percentage::numeric as "maxRenewablePercentage",
        total_emissions::numeric as "totalEmissions",
        total_generation::numeric as "totalGeneration",
        real_date as "realDate",
        end_reason as "endReason",
        max_customers as "maxCustomers",
        grid_intensity::numeric as "gridIntensity"
    `;

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error("Error saving run:", error);
    return NextResponse.json(
      { message: "Failed to save run" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Get userId from URL query parameter
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { message: "User ID is required" },
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
      WHERE r.user_id = ${userId}
      ORDER BY r.real_date DESC
    `;
    
    const validatedRows = result.rows.map(row => ({
      ...row,
      moneyMade: row.moneyMade ? parseFloat(row.moneyMade) : 0,
      frequencyAverage: row.frequencyAverage ? parseFloat(row.frequencyAverage) : 50,
      maxRenewablePercentage: row.maxRenewablePercentage ? parseFloat(row.maxRenewablePercentage) : 0,
      totalEmissions: row.totalEmissions ? parseFloat(row.totalEmissions) : 0,
      totalGeneration: row.totalGeneration ? parseFloat(row.totalGeneration) : 0,
      gridIntensity: row.gridIntensity ? parseFloat(row.gridIntensity) : 0,
      maxCustomers: row.maxCustomers ? parseInt(row.maxCustomers) : 0
    }));
    
    return NextResponse.json(validatedRows);
  } catch (error) {
    console.error("Error fetching runs:", error);
    return NextResponse.json(
      { message: "Failed to fetch runs" },
      { status: 500 }
    );
  }
} 