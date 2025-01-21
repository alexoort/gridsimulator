import { sql } from "@vercel/postgres";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { rows } = await sql`
      SELECT 
        r.user_id,
        u.username,
        COUNT(*) as "totalRuns",
        MAX(r.money_made)::DECIMAL as "bestProfit",
        MIN(ABS(r.frequency_average - 50))::DECIMAL as "bestFrequency",
        MAX(r.max_renewable_percentage)::DECIMAL as "bestRenewable"
      FROM runs r
      JOIN users u ON r.user_id = u.id
      GROUP BY r.user_id, u.username
      ORDER BY MAX(r.money_made) DESC
      LIMIT 5
    `;

    // Convert string numbers to actual numbers
    const processedRows = rows.map(row => ({
      ...row,
      bestProfit: Number(row.bestProfit),
      bestFrequency: Number(row.bestFrequency),
      bestRenewable: Number(row.bestRenewable),
      totalRuns: Number(row.totalRuns)
    }));

    return NextResponse.json(processedRows);
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
  }
} 