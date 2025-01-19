import { NextResponse } from "next/server";

// In-memory storage for runs (replace with database in production)
declare global {
  var runs: Record<string, any>;
}

if (!global.runs) {
  global.runs = {};
}

let nextId = 1;

export async function POST(request: Request) {
  try {
    const stats = await request.json();
    const id = `run-${nextId++}`;
    
    // Store in global runs object
    global.runs[id] = {
      id,
      ...stats,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({ id, success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to save run" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  // Return all runs if no ID is provided
  return NextResponse.json(Object.values(global.runs));
} 