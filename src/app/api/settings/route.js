import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sections.json");

// GET - Return settings
export async function GET() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    return NextResponse.json(data.settings || {});
  } catch (err) {
    console.error("GET SETTINGS ERROR:", err);
    return NextResponse.json({});
  }
}

// POST - Update settings
export async function POST(request) {
  try {
    const newSettings = await request.json();
    
    console.log('Saving settings:', JSON.stringify(newSettings, null, 2));
    
    // Read existing data
    const jsonData = fs.readFileSync(filePath, "utf8");
    const existingData = JSON.parse(jsonData);
    
    console.log('Existing settings before merge:', JSON.stringify(existingData.settings, null, 2));
    
    // Merge new settings with existing settings to preserve footer and other configurations
    const mergedSettings = {
      ...existingData.settings,
      ...newSettings
    };
    
    console.log('Merged settings:', JSON.stringify(mergedSettings, null, 2));
    
    // Update settings while keeping other data
    const dataToSave = {
      ...existingData,
      settings: mergedSettings
    };
    
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST SETTINGS ERROR:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
