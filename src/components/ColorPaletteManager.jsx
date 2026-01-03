'use client';

import React, { useState, useEffect } from 'react';
import { Palette, RotateCcw, Copy, Check } from 'lucide-react';

const ColorPaletteManager = () => {
  const defaultColors = {
    colorPalette: {
      primary: {
        name: 'Primary CSS',
        description: 'Brand-building favorite. Background accents and body colors – update: accent link also like this one.',
        light: '#E3F2FD',
        main: '#2196F3',
        dark: '#1976D2'
      },
      text: {
        name: 'Text',
        description: 'Subheadings, hard titles, subtitles',
        light: '#757575',
        main: '#212121',
        dark: '#000000'
      },
      heading: {
        name: 'Heading',
        description: 'Titles, sidebar and CTAs headings',
        light: '#424242',
        main: '#1A1A1A',
        dark: '#000000'
      },
      accent: {
        name: 'Accent',
        description: 'Paragraphs, descriptions, body text',
        light: '#90CAF9',
        main: '#42A5F5',
        dark: '#1E88E5'
      },
      primary2: {
        name: 'Primary',
        description: 'Buttons, links inside paragraphs mainly',
        light: '#64B5F6',
        main: '#2196F3',
        dark: '#1976D2'
      },
      background: {
        name: 'Background',
        description: 'Page and bar & content surfaces',
        light: '#FFFFFF',
        main: '#FAFAFA',
        dark: '#F5F5F5'
      },
      accent2: {
        name: 'Accent',
        description: 'Highlights, badges & micro-interactions',
        light: '#FFE082',
        main: '#FFC107',
        dark: '#FFA000'
      }
    },
    extendedColors: [
      { name: 'Success', value: '#4CAF50' },
      { name: 'Warning', value: '#FF9800' },
      { name: 'Error', value: '#F44336' },
      { name: 'Info', value: '#2196F3' }
    ]
  };

  const [colors, setColors] = useState(defaultColors);
  const [copied, setCopied] = useState(false);
  const [syncMode, setSyncMode] = useState(false);

  useEffect(() => {
    // Load saved colors from localStorage
    const savedColors = localStorage.getItem('websiteColors');
    if (savedColors) {
      try {
        setColors(JSON.parse(savedColors));
      } catch (e) {
        console.error('Error loading saved colors:', e);
      }
    }
  }, []);

  useEffect(() => {
    applyColors(colors);
    // Save to localStorage
    localStorage.setItem('websiteColors', JSON.stringify(colors));
  }, [colors]);

  const applyColors = (colorConfig) => {
    const root = document.documentElement;
    Object.entries(colorConfig.colorPalette).forEach(([key, colorSet]) => {
      if (colorSet.light) root.style.setProperty(`--color-${key}-light`, colorSet.light);
      if (colorSet.main) root.style.setProperty(`--color-${key}-main`, colorSet.main);
      if (colorSet.dark) root.style.setProperty(`--color-${key}-dark`, colorSet.dark);
    });
    
    colorConfig.extendedColors.forEach((color) => {
      root.style.setProperty(`--color-${color.name.toLowerCase()}`, color.value);
    });
  };

  const updatePaletteColor = (paletteKey, variant, value) => {
    setColors(prev => ({
      ...prev,
      colorPalette: {
        ...prev.colorPalette,
        [paletteKey]: {
          ...prev.colorPalette[paletteKey],
          [variant]: value
        }
      }
    }));
  };

  const updateExtendedColor = (index, value) => {
    setColors(prev => ({
      ...prev,
      extendedColors: prev.extendedColors.map((color, i) =>
        i === index ? { ...color, value } : color
      )
    }));
  };

  const resetColors = () => {
    if (window.confirm('Reset all colors to default?')) {
      setColors(defaultColors);
      localStorage.removeItem('websiteColors');
    }
  };

  const copyToClipboard = () => {
    let css = `:root {\n`;
    Object.entries(colors.colorPalette).forEach(([key, colorSet]) => {
      css += `  --color-${key}-light: ${colorSet.light};\n`;
      css += `  --color-${key}-main: ${colorSet.main};\n`;
      css += `  --color-${key}-dark: ${colorSet.dark};\n`;
    });
    colors.extendedColors.forEach((color) => {
      css += `  --color-${color.name.toLowerCase()}: ${color.value};\n`;
    });
    css += `}`;
    
    navigator.clipboard.writeText(css);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const ColorInput = ({ label, value, onChange }) => (
    <div className="flex items-center gap-3">
      <div className="relative">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 bg-transparent"
          style={{ backgroundColor: value }}
        />
      </div>
      <div className="flex-1">
        <div className="text-xs text-gray-500 mb-1">{label}</div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-24 px-2 py-1 text-sm font-mono border border-gray-300 rounded"
            placeholder="#000000"
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-7xl">
      {/* Header */}
      <div className="bg-white border border-gray-200 rounded-lg mb-6 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette className="text-indigo-600" size={28} />
              <div>
                <h1 className="text-2xl font-bold text-indigo-600">Color Palette</h1>
                <p className="text-sm text-gray-500">Manage your website's color scheme</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetColors}
                className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-2 px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700 transition-colors"
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Export CSS'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Color Palette Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">COLOR PALETTE</h2>
          </div>
          <div className="p-6">
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Design-ready palette controls</h3>
              <p className="text-sm text-gray-500">Theme building favorite. Background accents and body colors – update: accent links also like this one.</p>
            </div>

            <div className="mb-6">
              <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wider">Primary Preview</h4>
              <div className="flex gap-3 mb-6">
                <button
                  className="px-6 py-2.5 rounded-md font-medium text-white transition-colors"
                  style={{ backgroundColor: colors.colorPalette.primary.main }}
                >
                  Primary CSS
                </button>
                <button
                  className="px-6 py-2.5 rounded-md font-medium text-white transition-colors"
                  style={{ backgroundColor: colors.colorPalette.accent.main }}
                >
                  Accent CSS
                </button>
              </div>
            </div>

            {/* Color Palette Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(colors.colorPalette).map(([key, palette]) => (
                <div key={key} className="border border-gray-200 rounded-lg p-5">
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        {palette.name}
                      </h4>
                      <span className="text-xs text-gray-400 font-mono">#{key.toUpperCase()}</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{palette.description}</p>
                  </div>

                  <div className="space-y-3">
                    <ColorInput
                      label="Light"
                      value={palette.light}
                      onChange={(val) => updatePaletteColor(key, 'light', val)}
                    />
                    <ColorInput
                      label="Main"
                      value={palette.main}
                      onChange={(val) => updatePaletteColor(key, 'main', val)}
                    />
                    <ColorInput
                      label="Dark"
                      value={palette.dark}
                      onChange={(val) => updatePaletteColor(key, 'dark', val)}
                    />
                  </div>

                  {/* Color Preview Bar */}
                  <div className="mt-4 h-8 flex rounded overflow-hidden shadow-sm">
                    <div className="flex-1" style={{ backgroundColor: palette.light }} />
                    <div className="flex-1" style={{ backgroundColor: palette.main }} />
                    <div className="flex-1" style={{ backgroundColor: palette.dark }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Extended Colors Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Extended colors</h2>
            <p className="text-sm text-gray-500 mt-1">Optional overrides – ideal for utility class Primary colors</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {colors.extendedColors.map((color, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="color"
                      value={color.value}
                      onChange={(e) => updateExtendedColor(index, e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border-2 border-gray-200"
                      style={{ backgroundColor: color.value }}
                    />
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-gray-900">{color.name}</div>
                      <div className="text-xs font-mono text-gray-500">{color.value}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ColorPaletteManager;
