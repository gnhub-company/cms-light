import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sections.json");

// GET - Return all sections from all pages (for backward compatibility)
export async function GET() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    // Flatten all sections from all pages
    const allSections = [];
    if (data.pages) {
      data.pages.forEach(page => {
        if (page.sections) {
          page.sections.forEach(section => {
            allSections.push({ ...section, pageId: page.id });
          });
        }
      });
    }
    
    console.log('Returning sections:', allSections.length);
    return NextResponse.json(allSections);
  } catch (err) {
    console.error("GET ERROR:", err);
    return NextResponse.json([]);
  }
}

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

// POST - Update sections (not used with new structure)
export async function POST(request) {
  try {
    const sections = await request.json();
    
    console.log('Received sections to save:', JSON.stringify(sections, null, 2));
    
    // Read existing data
    let existingData = { pages: [] };
    try {
      const jsonData = fs.readFileSync(filePath, "utf8");
      existingData = JSON.parse(jsonData);
    } catch (e) {
      // File doesn't exist or is invalid
    }
    
    // Group sections by pageId and update pages
    const sectionsByPage = {};
    sections.forEach(section => {
      const pageId = section.pageId || 'home';
      if (!sectionsByPage[pageId]) {
        sectionsByPage[pageId] = [];
      }
      const { pageId: _, ...sectionWithoutPageId } = section;
      // Clean the section before saving
      const cleanedSection = cleanSection(sectionWithoutPageId);
      sectionsByPage[pageId].push(cleanedSection);
    });
    
    console.log('Sections grouped by page:', JSON.stringify(sectionsByPage, null, 2));
    
    // Update each page's sections, preserving pages that don't have sections
    existingData.pages = existingData.pages.map(page => ({
      ...page,
      sections: sectionsByPage[page.id] || page.sections || []
    }));
    
    // Preserve other data (colors, typography, menus, settings)
    const dataToSave = {
      logo: existingData.logo || {},
      colors: existingData.colors || {},
      typography: existingData.typography || {},
      menus: existingData.menus || [],
      settings: existingData.settings || {},
      pages: existingData.pages
    };
    
    console.log('Saving data:', JSON.stringify(dataToSave, null, 2));
    
    fs.writeFileSync(filePath, JSON.stringify(dataToSave, null, 2));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST ERROR:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
