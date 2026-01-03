import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sections.json");

// Helper function to clean section data
function cleanSection(section) {
  const cleaned = {};
  Object.keys(section).forEach(key => {
    const value = section[key];
    // Skip empty values (empty strings, null, undefined)
    if (value === '' || value === null || value === undefined) {
      return;
    }
    // Skip default hidden value (false means visible, which is the default)
    if (key === 'hidden' && value === false) {
      return;
    }
    // Skip default bgType
    if (key === 'bgType' && (value === 'none' || value === 'default')) {
      return;
    }
    // Skip background fields if bgType is none or default
    if ((section.bgType === 'none' || section.bgType === 'default' || !section.bgType) && 
        (key === 'bgImage' || key === 'bgImageUrl' || key === 'bgColor' || key === 'bgThemeColor')) {
      return;
    }
    // Skip unused background fields based on bgType
    if (section.bgType === 'image' && (key === 'bgColor' || key === 'bgThemeColor')) {
      return;
    }
    if (section.bgType === 'customColor' && (key === 'bgImage' || key === 'bgImageUrl' || key === 'bgThemeColor')) {
      return;
    }
    if (section.bgType === 'themeColor' && (key === 'bgImage' || key === 'bgImageUrl' || key === 'bgColor')) {
      return;
    }
    // Skip default align value
    if (key === 'align' && value === 'left' && section.img) {
      return;
    }
    // Skip default textAlign value
    if (key === 'textAlign' && value === 'left' && !section.img) {
      return;
    }
    // Skip align if there's no image
    if (key === 'align' && !section.img) {
      return;
    }
    // Skip textAlign if there's an image
    if (key === 'textAlign' && section.img) {
      return;
    }
    // Skip default buttonTarget
    if (key === 'buttonTarget' && value === '_self') {
      return;
    }
    // Skip default paddingY
    if (key === 'paddingY' && value === 'comfortable') {
      return;
    }
    cleaned[key] = value;
  });
  return cleaned;
}

// GET - Return pages array
export async function GET() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    return NextResponse.json(data.pages || []);
  } catch (err) {
    console.error("GET PAGES ERROR:", err);
    return NextResponse.json([]);
  }
}

// POST - Update pages
export async function POST(request) {
  try {
    const pages = await request.json();
    
    console.log('Received pages to save:', JSON.stringify(pages, null, 2));
    
    // Read existing data to preserve colors, typography, menus, and settings
    const jsonData = fs.readFileSync(filePath, "utf8");
    const existingData = JSON.parse(jsonData);
    
    // Clean sections in each page
    const cleanedPages = pages.map(page => ({
      ...page,
      sections: (page.sections || []).map(section => cleanSection(section))
    }));
    
    // Update only pages while keeping colors, typography, menus, and settings
    const dataToSave = {
      logo: existingData.logo || {},
      colors: existingData.colors || {},
      typography: existingData.typography || {},
      menus: existingData.menus || [],
      settings: existingData.settings || {},
      pages: cleanedPages
    };
    
    console.log('Writing to file:', filePath);
    console.log('Data to save:', JSON.stringify(dataToSave, null, 2));
    
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    
    console.log('File written successfully');
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST PAGES ERROR:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
