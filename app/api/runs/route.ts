import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({ message: 'Hello from the API' })
}

export async function POST(request: Request) {
  return NextResponse.json({ message: 'POST request received' })
} 