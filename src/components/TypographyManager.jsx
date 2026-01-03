'use client';

import { useState, useEffect } from 'react';
import { Type, Save, RotateCcw, Loader2 } from 'lucide-react';
import { showDemoMessage, DEMO_MODE } from '../utils/demoMode';

export default function TypographyManager() {
  const [typography, setTypography] = useState({
    heading: {
      family: 'Arial, sans-serif',
      size: '32px',
      weight: '700'
    },
    subheading: {
      family: 'Arial, sans-serif',
      size: '24px',
      weight: '600'
    },
    text: {
      family: 'Arial, sans-serif',
      size: '16px',
      weight: '400'
    }
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Standard font families - Most popular first
  const fontFamilies = [
    'Arial, sans-serif',
    'Helvetica, sans-serif',
    'Roboto, sans-serif',
    'Open Sans, sans-serif',
    'Lato, sans-serif',
    'Montserrat, sans-serif',
    'Poppins, sans-serif',
    'Inter, sans-serif',
    'Raleway, sans-serif',
    'Nunito, sans-serif',
    'Georgia, serif',
    'Times New Roman, serif',
    'Playfair Display, serif',
    'Merriweather, serif',
    'Lora, serif',
    'Courier New, monospace',
    'Consolas, monospace',
    'Monaco, monospace',
    'Source Code Pro, monospace',
    'Verdana, sans-serif',
    'Tahoma, sans-serif',
    'Trebuchet MS, sans-serif',
    'Impact, sans-serif',
    'Comic Sans MS, cursive',
    'Brush Script MT, cursive',
    'Lucida Console, monospace',
    'Palatino, serif',
    'Garamond, serif',
    'Bookman, serif',
    'system-ui',
    'ui-sans-serif',
    'ui-serif',
    'ui-monospace'
  ];

  // Standard font sizes
  const fontSizes = [
    '12px', '14px', '16px', '18px', '20px', '22px', '24px', 
    '26px', '28px', '30px', '32px', '36px', '40px', '48px', '56px', '64px'
  ];

  // Standard font weights
  const fontWeights = [
    { value: '100', label: '100 - Thin' },
    { value: '200', label: '200 - Extra Light' },
    { value: '300', label: '300 - Light' },
    { value: '400', label: '400 - Normal' },
    { value: '500', label: '500 - Medium' },
    { value: '600', label: '600 - Semi Bold' },
    { value: '700', label: '700 - Bold' },
    { value: '800', label: '800 - Extra Bold' },
    { value: '900', label: '900 - Black' }
  ];

  useEffect(() => {
    loadTypography();
  }, []);

  useEffect(() => {
    // Apply typography in real-time as preview
    applyTypography(typography);
  }, [typography]);

  const loadTypography = async () => {
    try {
      const res = await fetch('/api/typography');
      const data = await res.json();
      if (data.typography) {
        setTypography(data.typography);
      }
    } catch (error) {
      console.error('Error loading typography:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyTypography = (typographySet) => {
    if (!typographySet) return;
    
    const root = document.documentElement;
    
    // Apply heading styles
    if (typographySet.heading?.family) {
      root.style.setProperty('--font-heading-family', typographySet.heading.family);
    }
    if (typographySet.heading?.size) {
      root.style.setProperty('--font-heading-size', typographySet.heading.size);
    }
    if (typographySet.heading?.weight) {
      root.style.setProperty('--font-heading-weight', typographySet.heading.weight);
    }
    
    // Apply subheading styles
    if (typographySet.subheading?.family) {
      root.style.setProperty('--font-subheading-family', typographySet.subheading.family);
    }
    if (typographySet.subheading?.size) {
      root.style.setProperty('--font-subheading-size', typographySet.subheading.size);
    }
    if (typographySet.subheading?.weight) {
      root.style.setProperty('--font-subheading-weight', typographySet.subheading.weight);
    }
    
    // Apply text styles
    if (typographySet.text?.family) {
      root.style.setProperty('--font-text-family', typographySet.text.family);
    }
    if (typographySet.text?.size) {
      root.style.setProperty('--font-text-size', typographySet.text.size);
    }
    if (typographySet.text?.weight) {
      root.style.setProperty('--font-text-weight', typographySet.text.weight);
    }
  };

  const handleTypographyChange = (type, property, value) => {
    setTypography(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [property]: value
      }
    }));
  };

  const handleSave = async () => {
    // Validate that at least one typography value is set
    const hasHeading = typography.heading.family || typography.heading.size || typography.heading.weight;
    const hasSubheading = typography.subheading.family || typography.subheading.size || typography.subheading.weight;
    const hasText = typography.text.family || typography.text.size || typography.text.weight;
    
    if (!hasHeading && !hasSubheading && !hasText) {
      alert('Please select at least one typography value before saving.');
      return;
    }
    
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/typography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typography }),
      });

      const result = await response.json();
      
      if (result.success) {
        alert('Typography saved successfully! Changes will appear on your website within 30 seconds.');
        setSaving(false);
      } else {
        alert('Failed to save typography: ' + (result.error || 'Unknown error'));
        setSaving(false);
      }
    } catch (error) {
      console.error('Error saving typography:', error);
      alert('Error saving typography: ' + error.message);
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('Reset typography to default values? This will apply Arial font with standard sizes.')) return;

    const defaultTypography = {
      heading: {
        family: 'Arial, sans-serif',
        size: '32px',
        weight: '700'
      },
      subheading: {
        family: 'Arial, sans-serif',
        size: '24px',
        weight: '600'
      },
      text: {
        family: 'Arial, sans-serif',
        size: '16px',
        weight: '400'
      }
    };

    // Update the preview immediately
    setTypography(defaultTypography);
    
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    setSaving(true);
    try {
      // Save default typography to JSON
      const response = await fetch('/api/typography', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ typography: defaultTypography }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Typography reset to defaults! Changes will appear on your website within 30 seconds.');
        setSaving(false);
      } else {
        alert('Failed to reset typography: ' + (result.error || 'Unknown error'));
        setSaving(false);
      }
    } catch (error) {
      console.error('Error resetting:', error);
      alert('Error resetting typography: ' + error.message);
      setSaving(false);
    }
  };

  const TypographyControl = ({ label, description, type, values, previewText }) => {
    const [localValues, setLocalValues] = useState(values || { family: '', size: '', weight: '' });

    // Update local state when props change
    useEffect(() => {
      setLocalValues(values || { family: '', size: '', weight: '' });
    }, [values]);

    const handleChange = (property, value) => {
      setLocalValues(prev => ({
        ...prev,
        [property]: value
      }));
      handleTypographyChange(type, property, value);
    };

    return (
      <div className="bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all overflow-hidden">
        {/* Title Bar - Compact */}
        <div className="px-3 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-900">{label}</h3>
          <p className="text-xs text-gray-600">{description}</p>
        </div>

        <div className="p-3">
          {/* Preview Box - Compact */}
          <div className="mb-3 p-3 bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-300 rounded-lg">
            <p 
              className="text-gray-900 text-center"
              style={{
                fontFamily: localValues.family || 'inherit',
                fontSize: localValues.size || 'inherit',
                fontWeight: localValues.weight || 'inherit'
              }}
            >
              {previewText || 'The quick brown fox'}
            </p>
          </div>

          {/* Controls - Horizontal Layout - Compact */}
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Font Family</label>
              <select
                value={localValues.family}
                onChange={(e) => handleChange('family', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer hover:border-indigo-300"
              >
                {fontFamilies.map(font => (
                  <option key={font} value={font}>
                    {font.split(',')[0]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Font Size</label>
              <select
                value={localValues.size}
                onChange={(e) => handleChange('size', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer hover:border-indigo-300"
              >
                {fontSizes.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Font Weight</label>
              <select
                value={localValues.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white cursor-pointer hover:border-indigo-300"
              >
                {fontWeights.map(weight => (
                  <option key={weight.value} value={weight.value}>
                    {weight.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="animate-spin text-indigo-600" size={32} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl">
      {/* Header - Compact */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg mb-3 shadow-lg">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
                <Type className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Website Typography</h1>
                <p className="text-purple-100 text-xs mt-0.5">
                  Customize fonts - Changes apply instantly
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-1.5 px-3 py-2 text-sm bg-white/20 backdrop-blur text-white border-2 border-white/30 rounded-lg hover:bg-white/30 transition-all font-semibold disabled:opacity-50"
              >
                <RotateCcw size={16} />
                Reset
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-2 text-sm bg-white text-purple-600 rounded-lg hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl font-bold disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Typography Controls - Vertical Stack - Compact */}
      <div className="space-y-2">
        {/* Heading */}
        <TypographyControl
          label="Heading"
          description="Main headings (h1, h2)"
          type="heading"
          values={typography.heading}
          previewText="Main Heading Text"
        />
        
        {/* Subheading */}
        <TypographyControl
          label="Subheading"
          description="Subheadings (h3, h4)"
          type="subheading"
          values={typography.subheading}
          previewText="Subheading Text"
        />
        
        {/* Body Text */}
        <TypographyControl
          label="Body Text"
          description="Paragraphs & content"
          type="text"
          values={typography.text}
          previewText="Body text content"
        />
      </div>

      {/* Preview Info - Compact */}
      <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg">
        <div className="flex items-start gap-2">
          <div className="p-1.5 bg-purple-600 rounded-lg mt-0.5">
            <Type className="text-white" size={16} />
          </div>
          <div>
            <p className="text-xs font-bold text-purple-900">
              Live Preview Active
            </p>
            <p className="text-xs text-purple-700 mt-0.5">
              Changes apply in real-time. Click "Save" to apply permanently.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
