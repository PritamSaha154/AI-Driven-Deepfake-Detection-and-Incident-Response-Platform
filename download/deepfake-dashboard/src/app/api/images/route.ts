import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_PORT = 5001;

export async function GET() {
  try {
    const response = await fetch(`http://localhost:${ANALYZER_PORT}/list-files`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Analyzer service error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('List files error:', error);
    return NextResponse.json(
      { error: 'Failed to list files', files: [] },
      { status: 500 }
    );
  }
}
