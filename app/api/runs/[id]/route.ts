import { NextResponse } from "next/server";

// Access the in-memory storage (in production, this would be a database)
declare global {
  var runs: Record<string, any>;
}

if (!global.runs) {
  global.runs = {};
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;
  const run = global.runs[id];

  if (!run) {
    return NextResponse.json(
      { error: "Run not found" },
      { status: 404 }
    );
  }

  return NextResponse.json(run);
} 