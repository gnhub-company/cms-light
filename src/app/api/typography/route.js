import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sections.json");

// GET - Return typography from sections.json
export async function GET() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    // Return null if no typography is set, so ThemeLoader knows to use Tailwind defaults
    return NextResponse.json({
      typography: data.typography || null
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    console.error("GET TYPOGRAPHY ERROR:", err);
    return NextResponse.json({
      typography: null
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// POST - Update typography in sections.json ONLY (ThemeLoader applies changes via JavaScript)
export async function POST(request) {
  try {
    const { typography, action } = await request.json();
    
    // Handle delete action
    if (action === 'delete') {
      // Read existing data
      const jsonData = fs.readFileSync(filePath, "utf8");
      const data = JSON.parse(jsonData);
      
      // Remove typography while keeping pages and colors
      delete data.typography;
      
      // Write back to sections.json
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      
      return NextResponse.json({ success: true }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
    }
    
    // Read existing data
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    // Update typography while keeping pages and colors
    data.typography = typography;
    
    // Write back to sections.json
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    return NextResponse.json({ success: true }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    console.error("POST TYPOGRAPHY ERROR:", err);
    return NextResponse.json({ success: false, error: err.message }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}
