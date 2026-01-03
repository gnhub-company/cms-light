import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sections.json");

// GET - Return full data structure for debugging
export async function GET() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    return NextResponse.json({
      hasSettings: !!data.settings,
      hasFooter: !!(data.settings && data.settings.footer),
      footerEnabled: data.settings?.footer?.enabled || false,
      settingsKeys: data.settings ? Object.keys(data.settings) : [],
      fullSettings: data.settings || {}
    });
  } catch (err) {
    console.error("DEBUG SETTINGS ERROR:", err);
    return NextResponse.json({ error: err.message });
  }
}