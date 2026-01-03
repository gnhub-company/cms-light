import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'src', 'data', 'sections.json');

export async function GET() {
  try {
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    return NextResponse.json({
      logo: data.logo || { url: '', width: '150', height: 'auto' }
    });
  } catch (error) {
    console.error('Error reading logo:', error);
    return NextResponse.json(
      { error: 'Failed to read logo settings' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const { logo } = await request.json();
    
    console.log('Attempting to save logo:', logo);
    
    // Check if file exists
    if (!fs.existsSync(dataFilePath)) {
      console.error('Data file does not exist:', dataFilePath);
      return NextResponse.json(
        { error: 'Data file not found', success: false },
        { status: 500 }
      );
    }
    
    // Read existing data
    const fileContents = fs.readFileSync(dataFilePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Update logo
    data.logo = logo;
    
    // Write back to file
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('Logo saved successfully');
    
    return NextResponse.json({ success: true, logo: data.logo });
  } catch (error) {
    console.error('Error saving logo:', error.message, error.stack);
    return NextResponse.json(
      { error: 'Failed to save logo settings', details: error.message, success: false },
      { status: 500 }
    );
  }
}
