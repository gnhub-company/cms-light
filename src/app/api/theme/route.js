import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "src", "data", "sections.json");

// GET - Return colors from sections.json
export async function GET() {
  try {
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    return NextResponse.json({
      colors: data.colors || {
        heading: '#1A1A1A',
        subheading: '#424242',
        body: '#FFFFFF',
        background: '#F5F5F5',
        text: '#212121',
        button: '#2196F3',
        primary: '#2196F3',
        accent: '#42A5F5'
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (err) {
    console.error("GET COLORS ERROR:", err);
    return NextResponse.json({
      colors: {
        heading: '#1A1A1A',
        subheading: '#424242',
        body: '#FFFFFF',
        background: '#F5F5F5',
        text: '#212121',
        button: '#2196F3',
        primary: '#2196F3',
        accent: '#42A5F5'
      }
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  }
}

// POST - Update colors in sections.json and globals.css
export async function POST(request) {
  try {
    const { colors } = await request.json();
    
    console.log('Saving colors:', JSON.stringify(colors, null, 2));
    
    // Read existing data
    const jsonData = fs.readFileSync(filePath, "utf8");
    const data = JSON.parse(jsonData);
    
    // Update colors while keeping pages
    data.colors = colors;
    
    // Write back to sections.json
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    
    // Update globals.css with new colors
    const cssPath = path.join(process.cwd(), "src", "app", "globals.css");
    
    // Get typography from data to preserve it
    const typography = data.typography || {
      heading: { family: 'Arial, sans-serif', size: '32px', weight: '700' },
      subheading: { family: 'Arial, sans-serif', size: '24px', weight: '600' },
      text: { family: 'Arial, sans-serif', size: '16px', weight: '400' }
    };
    
    const cssContent = `@import "tailwindcss";

:root {
  --color-heading: ${colors.heading};
  --color-subheading: ${colors.subheading};
  --color-body: ${colors.body};
  --color-background: ${colors.background};
  --color-text: ${colors.text};
  --color-button: ${colors.button};
  --color-primary: ${colors.primary};
  --color-accent: ${colors.accent};
  
  /* Typography Variables */
  --font-heading-family: ${typography.heading.family};
  --font-heading-size: ${typography.heading.size};
  --font-heading-weight: ${typography.heading.weight};
  
  --font-subheading-family: ${typography.subheading.family};
  --font-subheading-size: ${typography.subheading.size};
  --font-subheading-weight: ${typography.subheading.weight};
  
  --font-text-family: ${typography.text.family};
  --font-text-size: ${typography.text.size};
  --font-text-weight: ${typography.text.weight};
}

/* Apply theme colors only to website pages, NOT dashboard */
body:not(.dashboard-page) {
  background-color: var(--color-body);
  color: var(--color-text);
  font-family: var(--font-text-family);
  font-size: var(--font-text-size);
  font-weight: var(--font-text-weight);
}

body:not(.dashboard-page) h1,
body:not(.dashboard-page) h2 {
  color: var(--color-heading);
  font-family: var(--font-heading-family);
  font-size: var(--font-heading-size);
  font-weight: var(--font-heading-weight);
}

body:not(.dashboard-page) h3,
body:not(.dashboard-page) h4 {
  color: var(--color-subheading);
  font-family: var(--font-subheading-family);
  font-size: var(--font-subheading-size);
  font-weight: var(--font-subheading-weight);
}

body:not(.dashboard-page) p {
  color: var(--color-text);
  font-family: var(--font-text-family);
  font-size: var(--font-text-size);
  font-weight: var(--font-text-weight);
}

/* Theme utility classes - only apply on website pages */
.text-heading {
  color: var(--color-heading);
}

.text-subheading {
  color: var(--color-subheading);
}

.text-text {
  color: var(--color-text);
}

.bg-body {
  background-color: var(--color-body);
}

.bg-background {
  background-color: var(--color-background);
}

.bg-button {
  background-color: var(--color-button);
}

.bg-primary {
  background-color: var(--color-primary);
}

.bg-accent {
  background-color: var(--color-accent);
}

.text-primary {
  color: var(--color-primary);
}

.text-accent {
  color: var(--color-accent);
}

.border-primary {
  border-color: var(--color-primary);
}

.border-accent {
  border-color: var(--color-accent);
}

/* Rich Text Content Styles */
.rich-text-content ul {
  list-style-type: disc !important;
  list-style-position: inside !important;
  padding-left: 1.5rem !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

.rich-text-content ol {
  list-style-type: decimal !important;
  list-style-position: inside !important;
  padding-left: 1.5rem !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

.rich-text-content li {
  display: list-item !important;
  margin-bottom: 0.25rem !important;
}

/* Rich Text Editor Styles - for the editor itself */
[contenteditable] ul {
  list-style-type: disc !important;
  list-style-position: inside !important;
  padding-left: 1.5rem !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

[contenteditable] ol {
  list-style-type: decimal !important;
  list-style-position: inside !important;
  padding-left: 1.5rem !important;
  margin-top: 0.5rem !important;
  margin-bottom: 0.5rem !important;
}

[contenteditable] li {
  display: list-item !important;
  margin-bottom: 0.25rem !important;
}`;

    fs.writeFileSync(cssPath, cssContent);
    
    console.log('Colors saved successfully to sections.json and globals.css');
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST COLORS ERROR:", err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
