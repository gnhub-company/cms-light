import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sections.json");

// GET - Check if dark mode is enabled
export async function GET() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    const enableDarkMode = data.settings?.enableDarkMode || false;
    
    return NextResponse.json({ enabled: enableDarkMode });
  } catch (err) {
    console.error("GET DARK MODE ERROR:", err);
    return NextResponse.json({ enabled: false });
  }
}
