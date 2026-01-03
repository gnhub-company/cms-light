'use client';

import { useState, useEffect } from 'react';
import { Palette, Save, RotateCcw, Loader2 } from 'lucide-react';
import { showDemoMessage, DEMO_MODE } from '../utils/demoMode';

export default function ThemeManager() {
  const [colors, setColors] = useState({
    heading: '#1A1A1A',
    subheading: '#424242',
    body: '#FFFFFF',
    background: '#F5F5F5',
    text: '#212121',
    button: '#2196F3',
    buttonText: '#FFFFFF',
    primary: '#2196F3',
    accent: '#42A5F5'
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadColors();
  }, []);

  useEffect(() => {
    // Apply colors in real-time as preview
    applyColors(colors);
  }, [colors]);



  const loadColors = async () => {
    try {
      const res = await fetch('/api/theme');
      const data = await res.json();
      if (data.colors) {
        setColors(data.colors);
      }
    } catch (error) {
      console.error('Error loading colors:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyColors = (colorSet) => {
    const root = document.documentElement;
    Object.entries(colorSet).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const handleColorChange = (colorKey, value) => {
    setColors(prev => ({
      ...prev,
      [colorKey]: value
    }));
  };

  const handleSave = async () => {
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    setSaving(true);
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Wait a bit to ensure file is written
        await new Promise(resolve => setTimeout(resolve, 100));
        alert('Theme colors saved successfully! Refreshing to apply changes...');
        // Force a hard reload to clear CSS cache
        window.location.href = window.location.href;
      } else {
        alert('Failed to save theme colors: ' + (result.error || 'Unknown error'));
        setSaving(false);
      }
    } catch (error) {
      console.error('Error saving colors:', error);
      alert('Error saving theme: ' + error.message);
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    if (!window.confirm('Reset all colors to default? This will refresh the page.')) return;

    const defaultColors = {
      heading: '#1A1A1A',
      subheading: '#424242',
      body: '#FFFFFF',
      background: '#F5F5F5',
      text: '#212121',
      button: '#2196F3',
      buttonText: '#FFFFFF',
      primary: '#2196F3',
      accent: '#42A5F5'
    };

    setColors(defaultColors);
    
    setSaving(true);
    try {
      const response = await fetch('/api/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ colors: defaultColors }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Wait a bit to ensure file is written
        await new Promise(resolve => setTimeout(resolve, 800));
        alert('Colors reset to default! Refreshing to apply changes...');
        // Force a hard reload to clear CSS cache
        window.location.href = window.location.href;
      } else {
        alert('Failed to reset colors: ' + (result.error || 'Unknown error'));
        setSaving(false);
      }
    } catch (error) {
      console.error('Error resetting:', error);
      alert('Error resetting colors: ' + error.message);
      setSaving(false);
    }
  };

  const ColorPicker = ({ label, description, colorKey, value }) => {
    const [textValue, setTextValue] = useState(value || '#000000');

    useEffect(() => {
      setTextValue(value || '#000000');
    }, [value]);

    const handleTextChange = (e) => {
      const newValue = e.target.value;
      setTextValue(newValue);
      
      // Validate hex color format
      if (/^#[0-9A-Fa-f]{6}$/.test(newValue)) {
        handleColorChange(colorKey, newValue);
      }
    };

    const handleTextBlur = () => {
      // If invalid, reset to current value
      if (!/^#[0-9A-Fa-f]{6}$/.test(textValue)) {
        setTextValue(value);
      }
    };

    return (
      <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg hover:border-indigo-400 hover:shadow-md transition-all">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm overflow-hidden shrink-0">
            <input
              type="color"
              value={value}
              onChange={(e) => {
                handleColorChange(colorKey, e.target.value);
                setTextValue(e.target.value);
              }}
              style={{
                width: '100%',
                height: '100%',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
                margin: 0
              }}
              title="Click to choose a color"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-900 truncate">{label}</h3>
            <p className="text-xs text-gray-600 truncate">{description}</p>
          </div>
        </div>
        <input
          type="text"
          value={textValue}
          onChange={handleTextChange}
          onBlur={handleTextBlur}
          className="w-full px-2 py-1.5 border border-gray-300 rounded font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent uppercase text-center"
          placeholder="#000000"
          maxLength={7}
        />
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
    <div className="w-full max-w-4xl mx-auto" style={{ maxHeight: '791px', maxWidth: '875px' }}>
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-xl shadow-lg px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 backdrop-blur rounded-lg">
              <Palette className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Theme Colors</h1>
              <p className="text-white/90 text-xs">Customize your brand</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleReset}
              disabled={saving}
              className="flex items-center gap-1 px-3 py-1.5 bg-white/10 backdrop-blur text-white border border-white/30 rounded-lg hover:bg-white/20 transition-all text-xs font-semibold disabled:opacity-50"
            >
              <RotateCcw size={14} />
              Reset
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-1 px-4 py-1.5 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 transition-all shadow-lg font-bold disabled:opacity-50 text-xs"
            >
              {saving ? (
                <>
                  <Loader2 className="animate-spin" size={14} />
                  Saving...
                </>
              ) : (
                <>
                  <Save size={14} />
                  Save
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Color Pickers Grid with Category Headers */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        {/* Typography Section */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 bg-gradient-to-r from-gray-50 to-gray-100">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">📝 Typography</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <ColorPicker
              label="Heading"
              description="Main headings"
              colorKey="heading"
              value={colors.heading}
            />
            <ColorPicker
              label="Subheading"
              description="Secondary titles"
              colorKey="subheading"
              value={colors.subheading}
            />
            <ColorPicker
              label="Text"
              description="Body text"
              colorKey="text"
              value={colors.text}
            />
          </div>
        </div>
        
        {/* Background Section */}
        <div className="border-b border-gray-200">
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">🎨 Backgrounds</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
            <ColorPicker
              label="Body"
              description="Page background"
              colorKey="body"
              value={colors.body}
            />
            <ColorPicker
              label="Background"
              description="Section background"
              colorKey="background"
              value={colors.background}
            />
          </div>
        </div>
        
        {/* Brand Section */}
        <div>
          <div className="px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50">
            <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide">✨ Brand Colors</h2>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <ColorPicker
              label="Button"
              description="Button background"
              colorKey="button"
              value={colors.button}
            />
            <ColorPicker
              label="Button Text"
              description="Button text"
              colorKey="buttonText"
              value={colors.buttonText}
            />
            <ColorPicker
              label="Primary"
              description="Main brand"
              colorKey="primary"
              value={colors.primary}
            />
            <ColorPicker
              label="Accent"
              description="Highlights"
              colorKey="accent"
              value={colors.accent}
            />
          </div>
        </div>
      </div>

      {/* Preview Info */}
      <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-600 rounded-lg mt-1">
            <Palette className="text-white" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-blue-900">
              Live Preview Active
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Colors are applied in real-time as you change them. Click "Save Colors" to apply these colors permanently to your entire website.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
