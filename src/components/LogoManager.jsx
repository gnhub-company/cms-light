'use client';

import { useState, useEffect } from 'react';
import { Image as ImageIcon, Save, Upload, X, Palette, Eye, EyeOff } from 'lucide-react';
import MediaLibrary from './MediaLibrary';
import { showDemoMessage, DEMO_MODE } from '../utils/demoMode';

export default function LogoManager() {
  const [logo, setLogo] = useState({
    url: '',
    width: '150',
    height: 'auto',
    hidden: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  useEffect(() => {
    // Load logo settings
    fetch('/api/logo')
      .then(res => res.json())
      .then(data => {
        if (data.logo) {
          setLogo(data.logo);
        }
      })
      .catch(err => console.error('Error loading logo:', err));
  }, []);

  const handleSave = async () => {
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    setIsSaving(true);
    try {
      const response = await fetch('/api/logo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ logo }),
      });
      
      const result = await response.json();
      
      console.log('Save response:', result);
      
      if (response.ok && result.success) {
        alert('Logo settings saved successfully!');
      } else {
        console.error('Save failed:', result);
        alert(`Failed to save logo settings: ${result.error || result.details || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving logo:', error);
      alert(`Error saving logo settings: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLogo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectImageFromMedia = (url) => {
    setLogo(prev => ({
      ...prev,
      url: url
    }));
    setShowMediaLibrary(false);
  };

  const extractColorsFromImage = async (imageUrl) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        
        // Helper function to calculate color brightness
        const getBrightness = (r, g, b) => {
          return (r * 299 + g * 587 + b * 114) / 1000;
        };
        
        // Helper function to calculate color saturation
        const getSaturation = (r, g, b) => {
          const max = Math.max(r, g, b);
          const min = Math.min(r, g, b);
          if (max === 0) return 0;
          return ((max - min) / max) * 100;
        };
        
        // Helper function to quantize colors (group similar colors)
        const quantizeColor = (r, g, b) => {
          const factor = 32; // Group colors into buckets
          return {
            r: Math.round(r / factor) * factor,
            g: Math.round(g / factor) * factor,
            b: Math.round(b / factor) * factor
          };
        };
        
        // Sample colors from the image with better filtering
        const colorMap = {};
        for (let i = 0; i < pixels.length; i += 4 * 5) { // Sample every 5th pixel for better accuracy
          const r = pixels[i];
          const g = pixels[i + 1];
          const b = pixels[i + 2];
          const a = pixels[i + 3];
          
          // Skip transparent pixels
          if (a < 200) continue;
          
          const brightness = getBrightness(r, g, b);
          const saturation = getSaturation(r, g, b);
          
          // Skip very light colors (near white)
          if (brightness > 240) continue;
          
          // Skip very dark colors (near black)
          if (brightness < 20) continue;
          
          // Skip very desaturated colors (grays) unless they're the only option
          if (saturation < 15 && brightness > 200) continue;
          
          // Quantize the color to group similar shades
          const quantized = quantizeColor(r, g, b);
          const hex = `#${((1 << 24) + (quantized.r << 16) + (quantized.g << 8) + quantized.b).toString(16).slice(1)}`;
          
          if (!colorMap[hex]) {
            colorMap[hex] = {
              count: 0,
              brightness: brightness,
              saturation: saturation,
              r: quantized.r,
              g: quantized.g,
              b: quantized.b
            };
          }
          colorMap[hex].count++;
        }

        // Sort colors by a combination of frequency and saturation
        // Prefer saturated colors that appear frequently
        const sortedColors = Object.entries(colorMap)
          .sort((a, b) => {
            const scoreA = a[1].count * (1 + a[1].saturation / 100);
            const scoreB = b[1].count * (1 + b[1].saturation / 100);
            return scoreB - scoreA;
          })
          .map(([color]) => color);

        if (sortedColors.length === 0) {
          reject(new Error('No suitable colors found in the image'));
          return;
        }

        resolve(sortedColors.slice(0, 8)); // Get top 8 colors for better selection
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  };

  const generateThemeFromLogo = async () => {
    if (!logo.url) {
      alert('Please add a logo first');
      return;
    }

    setIsSaving(true);
    try {
      const colors = await extractColorsFromImage(logo.url);
      
      if (colors.length < 1) {
        alert('Could not extract colors from the logo. Please make sure the logo image is accessible.');
        setIsSaving(false);
        return;
      }

      // Helper function to determine if a color is light or dark
      const isLightColor = (hex) => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness > 155;
      };

      // Select primary color (most prominent)
      const primary = colors[0];
      
      // Select accent color (second most prominent, or a variation of primary)
      let accent = colors[1] || primary;
      
      // If we have more colors, try to find a contrasting one for accent
      if (colors.length > 2) {
        // Look for a color that's different enough from primary
        for (let i = 1; i < Math.min(colors.length, 5); i++) {
          if (colors[i] !== primary) {
            accent = colors[i];
            break;
          }
        }
      }

      // Determine button text color based on primary color brightness
      const buttonText = isLightColor(primary) ? '#000000' : '#FFFFFF';

      // Create theme palette with intelligent color selection
      const themeColors = {
        primary: primary,
        accent: accent,
        button: primary,
        buttonText: buttonText,
        heading: primary,
        subheading: accent,
        text: '#212121',
        background: '#F5F5F5',
        body: '#FFFFFF'
      };

      console.log('Generated theme colors:', themeColors);
      console.log('Extracted colors from logo:', colors);

      // Save theme colors
      if (DEMO_MODE) {
        showDemoMessage();
        return;
      }
      
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: themeColors }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert(`Theme colors generated successfully!\n\nPrimary: ${primary}\nAccent: ${accent}\n\nCheck the Theme tab to see and customize the colors.`);
      } else {
        alert('Failed to save theme colors');
      }
    } catch (error) {
      console.error('Error generating theme:', error);
      alert(`Error generating theme from logo: ${error.message}\n\nTip: If using an external URL, make sure it allows cross-origin requests (CORS).`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ width: '875px', height: '791px', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Header - 60px */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg px-4 py-2" style={{ height: '60px', flexShrink: 0 }}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 backdrop-blur rounded-lg">
              <ImageIcon className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Logo Settings</h1>
              <p className="text-white/90 text-xs leading-tight">Manage your website logo</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Fills remaining space (731px) */}
      <div className="bg-white border border-gray-200 flex flex-col" style={{ flex: 1, overflow: 'hidden' }}>
        {/* Top Section - Settings Spread Vertically */}
        <div className="p-5 space-y-4">
          {/* Logo URL */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-2">Logo URL</label>
            <div className="flex gap-2">
              <input
                type="text"
                name="url"
                value={logo.url}
                onChange={handleInputChange}
                placeholder="https://example.com/logo.png"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <button
                onClick={() => setShowMediaLibrary(true)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 text-sm shrink-0"
              >
                <Upload size={16} />
                Browse
              </button>
            </div>
          </div>

          {/* Logo Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Width</label>
              <input
                type="text"
                name="width"
                value={logo.width}
                onChange={handleInputChange}
                placeholder="150"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">px or 'auto'</p>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-800 mb-2">Height</label>
              <input
                type="text"
                name="height"
                value={logo.height}
                onChange={handleInputChange}
                placeholder="auto"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">px or 'auto'</p>
            </div>
          </div>

          {/* Generate Theme Section */}
          {logo.url && (
            <div className="border border-purple-200 rounded-lg p-4 bg-purple-50">
              <div className="flex items-start gap-3">
                <Palette className="text-purple-600 shrink-0" size={20} />
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-gray-900 mb-1">Auto-Generate Theme</h3>
                  <p className="text-xs text-gray-700 mb-3">
                    Extract colors from your logo to create a matching theme
                  </p>
                  <button
                    onClick={generateThemeFromLogo}
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-semibold disabled:opacity-50 text-sm"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        <span>Generating...</span>
                      </>
                    ) : (
                      <>
                        <Palette size={16} />
                        Generate Theme Colors
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all shadow-md hover:shadow-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Logo Settings</span>
                </>
              )}
            </button>
            {logo.url && (
              <button
                onClick={() => setLogo({ url: '', width: '150', height: 'auto' })}
                className="flex items-center gap-2 px-6 py-2.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all font-semibold text-sm"
              >
                <X size={16} />
                <span>Clear Logo</span>
              </button>
            )}
          </div>
        </div>

        {/* Bottom Section - Full Width Preview */}
        <div className="flex-1 px-5 pb-5">
          {logo.url ? (
            <div className="border border-gray-300 rounded-lg bg-gray-50 h-full flex flex-col">
              <div className="px-4 py-2 border-b border-gray-300 bg-gray-100">
                <p className="text-sm font-semibold text-gray-800">Preview</p>
              </div>
              <div className="flex-1 flex items-center justify-center bg-white p-6">
                <img
                  src={logo.url}
                  alt="Logo Preview"
                  style={{
                    width: logo.width === 'auto' ? 'auto' : `${logo.width}px`,
                    height: logo.height === 'auto' ? 'auto' : `${logo.height}px`,
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain'
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 h-full flex items-center justify-center">
              <div className="text-center text-gray-400">
                <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">No logo uploaded</p>
                <p className="text-xs mt-1">Add a logo URL or browse from media library</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMediaLibrary(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Select Logo from Media Library</h3>
              <button
                onClick={() => setShowMediaLibrary(false)}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
              <MediaLibrary onSelect={handleSelectImageFromMedia} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
