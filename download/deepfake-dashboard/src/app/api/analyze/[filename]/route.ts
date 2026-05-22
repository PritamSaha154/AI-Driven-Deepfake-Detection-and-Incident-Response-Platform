import { NextRequest, NextResponse } from 'next/server';

const ANALYZER_PORT = 5001;

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    const response = await fetch(
      `http://localhost:${ANALYZER_PORT}/analyze-existing/${encodeURIComponent(filename)}`,
      { method: 'POST' }
    );

    if (!response.ok) {
      throw new Error(`Analyzer service error: ${response.statusText}`);
    }

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image', details: String(error) },
      { status: 500 }
    );
  }
}
