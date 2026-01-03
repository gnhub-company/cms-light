'use client';

import { useState, useEffect } from 'react';
import { Save, Globe, Mail, Phone, MapPin, Image, ExternalLink, Settings, CheckCircle, AlertCircle, Sparkles, Layout } from 'lucide-react';
import HeaderVariationSelector from '@/components/HeaderVariationSelector';
import { showDemoMessage, DEMO_MODE } from '../../../utils/demoMode';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    siteTitle: '',
    tagline: '',
    favicon: '',
    url: '',
    email: '',
    contactNumber: '',
    address: '',
    googleMapLink: ''
  });
  const [headerVariation, setHeaderVariation] = useState('background');
  const [showHeaderSelector, setShowHeaderSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadSettings();
    loadHeaderVariation();
    
    // Add dashboard-page class to prevent theme colors
    document.body.classList.add('dashboard-page');
    
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  const loadHeaderVariation = async () => {
    try {
      const response = await fetch('/api/header-variation');
      const data = await response.json();
      setHeaderVariation(data.variation || 'background');
    } catch (error) {
      console.log('No header variation found');
    }
  };

  const handleHeaderVariationSelect = async (newVariation) => {
    setHeaderVariation(newVariation);
    
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    try {
      await fetch('/api/header-variation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variation: newVariation }),
      });
      setMessage({ type: 'success', text: 'Header style updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error saving header variation:', error);
      setMessage({ type: 'error', text: 'Failed to update header style.' });
    }
  };

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      if (data && Object.keys(data).length > 0) {
        setSettings({
          siteTitle: data.siteTitle || '',
          tagline: data.tagline || '',
          favicon: data.favicon || '',
          url: data.url || '',
          email: data.email || '',
          contactNumber: data.contactNumber || '',
          address: data.address || '',
          googleMapLink: data.googleMapLink || ''
        });
      }
    } catch (error) {
      console.log('No existing settings found');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      // Get current settings to preserve footer and other configurations
      const currentResponse = await fetch('/api/settings');
      const currentSettings = await currentResponse.json();
      
      console.log('Current settings before dashboard settings save:', JSON.stringify(currentSettings, null, 2));
      
      // Merge new general settings with existing settings (preserving footer, etc.)
      const updatedSettings = {
        ...currentSettings,
        ...settings // This will update general settings while preserving footer
      };
      
      console.log('Updated settings for dashboard save:', JSON.stringify(updatedSettings, null, 2));
      
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });

      const result = await response.json();
      
      if (result.success) {
        setMessage({ type: 'success', text: 'Settings saved successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings.' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm('Are you sure you want to reset all settings?')) {
      setSettings({
        siteTitle: '',
        tagline: '',
        favicon: '',
        url: '',
        email: '',
        contactNumber: '',
        address: '',
        googleMapLink: ''
      });
      setMessage({ type: 'success', text: 'Settings reset successfully!' });
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header with gradient */}
        <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Settings className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#1f2937' }}>
                  General Settings
                </h1>
                <p className="text-xs text-gray-500">Configure your website information</p>
              </div>
            </div>
            {message.text && (
              <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <AlertCircle className="w-4 h-4" />
                )}
                <span className="font-medium">{message.text}</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Card with creative design */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <form onSubmit={handleSubmit} className="p-5">
            <div className="space-y-3">
              {/* Site Title */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Globe className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Site Title
                </label>
                <input
                  type="text"
                  name="siteTitle"
                  value={settings.siteTitle || ''}
                  onChange={handleChange}
                  placeholder="My Website"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>

              {/* Tagline */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  </div>
                  Tagline
                </label>
                <input
                  type="text"
                  name="tagline"
                  value={settings.tagline || ''}
                  onChange={handleChange}
                  placeholder="Your slogan"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>

              {/* Favicon */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-pink-50 flex items-center justify-center group-hover:bg-pink-100 transition-colors">
                    <Image className="w-3.5 h-3.5 text-pink-600" />
                  </div>
                  Favicon URL
                </label>
                <input
                  type="url"
                  name="favicon"
                  value={settings.favicon || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/favicon.ico"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>

              {/* Site URL */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  Site URL
                </label>
                <input
                  type="url"
                  name="url"
                  value={settings.url || ''}
                  onChange={handleChange}
                  placeholder="https://www.example.com"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>

              {/* Email */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                    <Mail className="w-3.5 h-3.5 text-blue-600" />
                  </div>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email || ''}
                  onChange={handleChange}
                  placeholder="contact@example.com"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>

              {/* Contact Number */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-green-600" />
                  </div>
                  Contact Number
                </label>
                <input
                  type="tel"
                  name="contactNumber"
                  value={settings.contactNumber || ''}
                  onChange={handleChange}
                  placeholder="+1 (555) 123-4567"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>

              {/* Address */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-red-600" />
                  </div>
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={settings.address || ''}
                  onChange={handleChange}
                  placeholder="123 Main Street, City, State, ZIP"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>

              {/* Google Map Link */}
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-1">
                  <div className="w-6 h-6 rounded-md bg-orange-50 flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                    <MapPin className="w-3.5 h-3.5 text-orange-600" />
                  </div>
                  Google Map Link
                </label>
                <input
                  type="url"
                  name="googleMapLink"
                  value={settings.googleMapLink || ''}
                  onChange={handleChange}
                  placeholder="https://maps.google.com/?q=location"
                  className="w-full px-3 py-2 text-sm border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-300"
                />
              </div>
              </div>

            {/* Header Style Section */}
            <div className="mt-4 pt-4 border-t-2 border-gray-100">
              <div className="group">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 mb-2">
                  <div className="w-6 h-6 rounded-md bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
                    <Layout className="w-3.5 h-3.5 text-indigo-600" />
                  </div>
                  Header Style
                </label>
                <button
                  type="button"
                  onClick={() => setShowHeaderSelector(true)}
                  className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-lg hover:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all bg-gradient-to-r from-blue-50 to-purple-50 hover:from-blue-100 hover:to-purple-100 font-medium text-gray-700"
                >
                  Current: {headerVariation.charAt(0).toUpperCase() + headerVariation.slice(1).replace(/([A-Z])/g, ' $1')} - Click to Change
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t-2 border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-5 py-2 text-sm bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-5 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all font-semibold border-2 border-gray-200 hover:border-gray-300"
              >
                Reset All
              </button>
            </div>
          </form>
        </div>

        {/* Header Variation Selector Modal */}
        <HeaderVariationSelector
          isOpen={showHeaderSelector}
          onClose={() => setShowHeaderSelector(false)}
          currentVariation={headerVariation}
          onSelect={handleHeaderVariationSelect}
        />
      </div>
    </div>
  );
}
