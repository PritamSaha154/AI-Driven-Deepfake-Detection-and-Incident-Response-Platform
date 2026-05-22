import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const UPLOAD_FOLDER = '/home/z/my-project/upload';
const ANALYZER_PATH = '/home/z/my-project/mini-services/image-analyzer/run_analyzer.py';
const PYTHON_PATH = '/home/z/my-project/mini-services/image-analyzer/venv/bin/python3';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Save file to upload folder
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const filePath = path.join(UPLOAD_FOLDER, file.name);
    
    fs.writeFileSync(filePath, buffer);
    
    // Run Python analyzer
    const { stdout, stderr } = await execAsync(
      `${PYTHON_PATH} "${filePath}"`,
      { timeout: 30000 }
    );
    
    const result = JSON.parse(stdout);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze image', details: String(error) },
      { status: 500 }
    );
  }
}
