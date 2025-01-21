import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

interface RunData {
  userId: number;
  startTime: string;
  endTime: string;
  moneyMade: number;
  frequencyAverage: number;
  maxRenewablePercentage: number;
  totalEmissions: number;
  realDate?: string; // Optional since it has a default value
}

export async function POST(request: Request) {
  try {
    const data: RunData = await request.json();
    
    // Check if any required fields are undefined or null
    if (
      data.userId === undefined || data.userId === null ||
      data.moneyMade === undefined || data.moneyMade === null ||
      data.frequencyAverage === undefined || data.frequencyAverage === null ||
      data.maxRenewablePercentage === undefined || data.maxRenewablePercentage === null ||
      data.totalEmissions === undefined || data.totalEmissions === null
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

    const result = await sql`
      INSERT INTO runs (
        user_id,
        start_time,
        end_time,
        money_made,
        frequency_average,
        max_renewable_percentage,
        total_emissions,
        real_date
      ) VALUES (
        ${data.userId},
        ${startTime}::timestamp with time zone,
        ${endTime}::timestamp with time zone,
        ${data.moneyMade}::decimal,
        ${data.frequencyAverage}::decimal,
        ${data.maxRenewablePercentage}::decimal,
        ${data.totalEmissions}::decimal,
        ${realDate}::timestamp with time zone
      )
      RETURNING 
        id,
        start_time as "startTime",
        end_time as "endTime",
        money_made as "moneyMade",
        frequency_average as "frequencyAverage",
        max_renewable_percentage as "maxRenewablePercentage",
        total_emissions as "totalEmissions",
        real_date as "realDate"
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
        r.real_date as "realDate",
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
      totalEmissions: row.totalEmissions ? parseFloat(row.totalEmissions) : 0
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