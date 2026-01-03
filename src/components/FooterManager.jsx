'use client';

import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import MediaLibrary from './MediaLibrary';
import { showDemoMessage, DEMO_MODE } from '../utils/demoMode';

export default function FooterManager() {
  const [settings, setSettings] = useState({
    enabled: false,
    layout: 'layout1', // layout1, layout2, layout3, layout4, layout5
    selectedMenu: '',
    selectedMenu2: '', // For layouts with multiple menus
    selectedMenu3: '', // For layout 4 & 5
    selectedMenu4: '', // For layout 5
    menuTitle1: 'Quick Links', // Custom title for menu 1
    menuTitle2: 'More Links', // Custom title for menu 2
    menuTitle3: 'Resources', // Custom title for menu 3
    menuTitle4: 'Support', // Custom title for menu 4
    menuCount: 2, // Number of menus for layout 4 & 5
    companyName: '',
    companyDescription: '',
    email: '',
    phone: '',
    address: '',
    socialLinks: [], // Start with empty array
    copyright: `© ${new Date().getFullYear()} All rights reserved.`,
    footerLogo: { url: '', width: '150', height: 'auto' }, // Separate footer logo
    useCustomFooterLogo: false, // Toggle to use custom footer logo
    bgType: 'default', // default, customColor, image
    bgColor: '#1F2937', // Default dark gray
    bgImage: '',
    textColor: '#FFFFFF',
    secondaryTextColor: '#9CA3AF'
  });
  const [menus, setMenus] = useState([]);
  const [logo, setLogo] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [showLayoutOptions, setShowLayoutOptions] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      // Load footer settings from /api/settings
      const settingsResponse = await fetch('/api/settings');
      const settingsData = await settingsResponse.json();
      
      console.log('Loaded settings data:', JSON.stringify(settingsData, null, 2));
      
      if (settingsData.footer) {
        // Ensure socialLinks exists as array and menuCount has default
        const footerSettings = {
          ...settingsData.footer,
          socialLinks: settingsData.footer.socialLinks || [],
          menuCount: settingsData.footer.menuCount || 2,
          selectedMenu3: settingsData.footer.selectedMenu3 || '',
          selectedMenu4: settingsData.footer.selectedMenu4 || '',
          menuTitle3: settingsData.footer.menuTitle3 || 'Resources',
          menuTitle4: settingsData.footer.menuTitle4 || 'Support',
          footerLogo: settingsData.footer.footerLogo || { url: '', width: '150', height: 'auto' },
          useCustomFooterLogo: settingsData.footer.useCustomFooterLogo || false
        };
        console.log('Setting footer settings:', JSON.stringify(footerSettings, null, 2));
        setSettings(footerSettings);
      } else {
        console.log('No footer settings found, using defaults');
        // If no footer settings exist, keep the default settings but log it
      }
      
      // Load menus from /api/menus
      const menusResponse = await fetch('/api/menus');
      const menusData = await menusResponse.json();
      console.log('Loaded menus:', menusData);
      setMenus(Array.isArray(menusData) ? menusData : []);
      
      // Load logo from /api/logo (for preview only)
      const logoResponse = await fetch('/api/logo');
      const logoData = await logoResponse.json();
      console.log('Loaded logo:', logoData);
      if (logoData.logo && logoData.logo.url) {
        setLogo(logoData.logo);
      }
    } catch (error) {
      console.error('Error loading footer data:', error);
    }
  };

  const handleSave = async () => {
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    setSaving(true);
    setMessage('');
    
    try {
      // Get current settings
      const response = await fetch('/api/settings');
      const currentSettings = await response.json();
      
      console.log('Current settings before footer save:', JSON.stringify(currentSettings, null, 2));
      console.log('Footer settings to save:', JSON.stringify(settings, null, 2));
      
      // Update with footer settings
      const updatedSettings = {
        ...currentSettings,
        footer: settings
      };

      console.log('Updated settings with footer:', JSON.stringify(updatedSettings, null, 2));

      // Save back to API
      const saveResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings)
      });

      const result = await saveResponse.json();
      
      if (result.success) {
        setMessage('Footer settings saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('Error saving footer settings');
      }
    } catch (error) {
      setMessage('Error saving footer settings');
      console.error('Error:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleSelectImageFromMedia = (url) => {
    setSettings({
      ...settings,
      footerLogo: { ...settings.footerLogo, url: url }
    });
    setShowMediaLibrary(false);
  };

  return (
    <div style={{ width: '875px', height: '791px', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Header - 60px */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg px-4 py-2" style={{ height: '60px', flexShrink: 0 }}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 backdrop-blur rounded-lg">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Footer Settings</h1>
              <p className="text-white/90 text-xs leading-tight">Customize footer layout</p>
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
              className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-white"
            />
            <span className="text-white text-sm font-semibold">Enable</span>
          </label>
        </div>
      </div>

      {/* Content Area - Fills remaining space (731px) */}
      <div className="bg-white border border-gray-200" style={{ flex: 1, overflow: 'auto' }}>
        {settings.enabled && (
          <div className="p-5">
            {/* Two Column Layout for Better Organization */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* LEFT COLUMN - Layout & Basic Settings */}
              <div className="space-y-3">
                {/* Footer Layout Selection */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Footer Layout
                  </label>
                  <select
                    value={settings.layout}
                    onChange={(e) => setSettings({ ...settings, layout: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="layout1">Center Aligned</option>
                    <option value="layout2">Two Columns</option>
                    <option value="layout3">Horizontal</option>
                    <option value="layout4">Three Columns</option>
                    <option value="layout5">Four Columns</option>
                  </select>
                </div>

                {/* Background Options */}
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                  <label className="block text-xs font-semibold text-purple-900 mb-2">
                    Footer Background
                  </label>
                  <select
                    value={settings.bgType || 'default'}
                    onChange={(e) => setSettings({ ...settings, bgType: e.target.value })}
                    className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm mb-2"
                  >
                    <option value="default">Default (Dark Gray)</option>
                    <option value="customColor">Custom Color</option>
                    <option value="image">Background Image</option>
                  </select>

                  {settings.bgType === 'customColor' && (
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-purple-900 mb-1">Background Color</label>
                        <input
                          type="color"
                          value={settings.bgColor || '#1F2937'}
                          onChange={(e) => setSettings({ ...settings, bgColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-purple-300 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-purple-900 mb-1">Text Color</label>
                        <input
                          type="color"
                          value={settings.textColor || '#FFFFFF'}
                          onChange={(e) => setSettings({ ...settings, textColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-purple-300 cursor-pointer"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-purple-900 mb-1">Secondary Text Color</label>
                        <input
                          type="color"
                          value={settings.secondaryTextColor || '#9CA3AF'}
                          onChange={(e) => setSettings({ ...settings, secondaryTextColor: e.target.value })}
                          className="w-full h-10 rounded-lg border border-purple-300 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}

                  {settings.bgType === 'image' && (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.bgImage || ''}
                          onChange={(e) => setSettings({ ...settings, bgImage: e.target.value })}
                          placeholder="Background image URL"
                          className="flex-1 px-2 py-1.5 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-xs"
                        />
                        <button
                          onClick={() => setShowMediaLibrary(true)}
                          className="px-2 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs"
                        >
                          <Upload size={12} />
                        </button>
                      </div>
                      {settings.bgImage && (
                        <div className="relative h-20 rounded border border-purple-200 overflow-hidden">
                          <img src={settings.bgImage} alt="Background" className="w-full h-full object-cover" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Copyright */}
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                  <label className="block text-xs font-semibold text-gray-900 mb-2">
                    Copyright Text
                  </label>
                  <input
                    type="text"
                    value={settings.copyright}
                    onChange={(e) => setSettings({ ...settings, copyright: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="© 2024 Your Company"
                  />
                </div>

                {/* Footer Logo Settings */}
                <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-indigo-900">
                      Footer Logo
                    </p>
                    <label className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.useCustomFooterLogo}
                        onChange={(e) => setSettings({ ...settings, useCustomFooterLogo: e.target.checked })}
                        className="w-3 h-3 text-indigo-600 rounded"
                      />
                      <span className="text-xs text-indigo-900">Custom</span>
                    </label>
                  </div>
                  
                  {settings.useCustomFooterLogo ? (
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={settings.footerLogo?.url || ''}
                          onChange={(e) => setSettings({ 
                            ...settings, 
                            footerLogo: { ...(settings.footerLogo || {}), url: e.target.value }
                          })}
                          placeholder="Logo URL"
                          className="flex-1 px-2 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                        />
                        <button
                          onClick={() => setShowMediaLibrary(true)}
                          className="px-2 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-1 text-xs"
                        >
                          <Upload size={12} />
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          value={settings.footerLogo?.width || '150'}
                          onChange={(e) => setSettings({ 
                            ...settings, 
                            footerLogo: { ...(settings.footerLogo || {}), width: e.target.value }
                          })}
                          placeholder="Width"
                          className="px-2 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                        />
                        <input
                          type="text"
                          value={settings.footerLogo?.height || 'auto'}
                          onChange={(e) => setSettings({ 
                            ...settings, 
                            footerLogo: { ...(settings.footerLogo || {}), height: e.target.value }
                          })}
                          placeholder="Height"
                          className="px-2 py-1.5 border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                        />
                      </div>
                      {settings.footerLogo?.url && (
                        <div className="bg-white p-2 rounded border border-indigo-200">
                          <img
                            src={settings.footerLogo.url}
                            alt="Footer Logo"
                            style={{
                              width: settings.footerLogo.width === 'auto' ? 'auto' : `${settings.footerLogo.width}px`,
                              height: settings.footerLogo.height === 'auto' ? 'auto' : `${settings.footerLogo.height}px`,
                              maxHeight: '40px',
                              objectFit: 'contain'
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    logo?.url && (
                      <div className="bg-white p-2 rounded border border-indigo-200">
                        <p className="text-xs text-gray-600 mb-1">Using header logo</p>
                        <img
                          src={logo.url}
                          alt="Header Logo"
                          style={{
                            width: logo.width === 'auto' ? 'auto' : `${logo.width}px`,
                            height: logo.height === 'auto' ? 'auto' : `${logo.height}px`,
                            maxHeight: '40px',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN - Content Settings */}
              <div className="space-y-3">
                {/* Company Information */}
                {(settings.layout === 'layout2' || settings.layout === 'layout4' || settings.layout === 'layout5') && (
                  <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                    <h3 className="text-xs font-semibold text-green-900 mb-2">Company Info</h3>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={settings.companyName}
                        onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Company Name"
                      />
                      <textarea
                        value={settings.companyDescription}
                        onChange={(e) => setSettings({ ...settings, companyDescription: e.target.value })}
                        className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Brief description..."
                        rows="2"
                      />
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                {(settings.layout === 'layout4' || settings.layout === 'layout5') && (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <h3 className="text-xs font-semibold text-purple-900 mb-2">Contact Info</h3>
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Email"
                      />
                      <input
                        type="tel"
                        value={settings.phone}
                        onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Phone"
                      />
                      <input
                        type="text"
                        value={settings.address}
                        onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                        className="w-full px-3 py-2 border border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-sm"
                        placeholder="Address"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* FULL WIDTH SECTIONS - Menus & Social Media */}
            <div className="mt-4 space-y-4">
              {/* Social Media Links */}
            {(settings.layout === 'layout3' || settings.layout === 'layout4' || settings.layout === 'layout5') && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Social Media</h3>
                
                {/* Add Social Media Button */}
                <div className="mb-3">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const newSocial = {
                          platform: e.target.value,
                          url: '',
                          icon: e.target.value
                        };
                        setSettings({
                          ...settings,
                          socialLinks: [...(settings.socialLinks || []), newSocial]
                        });
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="">+ Add Platform</option>
                    {!settings.socialLinks?.find(s => s.platform === 'facebook') && (
                      <option value="facebook">Facebook</option>
                    )}
                    {!settings.socialLinks?.find(s => s.platform === 'twitter') && (
                      <option value="twitter">Twitter</option>
                    )}
                    {!settings.socialLinks?.find(s => s.platform === 'instagram') && (
                      <option value="instagram">Instagram</option>
                    )}
                    {!settings.socialLinks?.find(s => s.platform === 'linkedin') && (
                      <option value="linkedin">LinkedIn</option>
                    )}
                    {!settings.socialLinks?.find(s => s.platform === 'youtube') && (
                      <option value="youtube">YouTube</option>
                    )}
                  </select>
                </div>

                {/* Social Media Links List */}
                <div className="space-y-2">
                  {(settings.socialLinks || []).map((social, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="w-20 text-xs font-medium text-gray-700 capitalize">
                        {social.platform}
                      </span>
                      <input
                        type="url"
                        value={social.url}
                        onChange={(e) => {
                          const newSocialLinks = [...settings.socialLinks];
                          newSocialLinks[index].url = e.target.value;
                          setSettings({ ...settings, socialLinks: newSocialLinks });
                        }}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                        placeholder={`URL`}
                      />
                      <button
                        onClick={() => {
                          const newSocialLinks = settings.socialLinks.filter((_, i) => i !== index);
                          setSettings({ ...settings, socialLinks: newSocialLinks });
                        }}
                        className="px-2 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs"
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Menu Selection */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Footer Menus</h3>
              
              {/* Menu Count Selector for Layout 4 & 5 */}
              {(settings.layout === 'layout4' || settings.layout === 'layout5') && (
                <div className="mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Number of menus
                  </label>
                  <select
                    value={settings.menuCount}
                    onChange={(e) => setSettings({ ...settings, menuCount: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="1">1 Menu</option>
                    <option value="2">2 Menus</option>
                    <option value="3">3 Menus</option>
                    <option value="4">4 Menus</option>
                  </select>
                </div>
              )}

              <div className="space-y-3">
                {/* Menu 1 */}
                <div className="p-2 border border-gray-200 rounded-lg bg-white">
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">
                    Menu 1
                  </label>
                  <select
                    value={settings.selectedMenu}
                    onChange={(e) => setSettings({ ...settings, selectedMenu: e.target.value })}
                    className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-1.5 text-xs"
                  >
                    <option value="">-- Select --</option>
                    {menus.map((menu) => (
                      <option key={menu.id} value={menu.id}>
                        {menu.name}
                      </option>
                    ))}
                  </select>
                  {settings.selectedMenu && (
                    <input
                      type="text"
                      value={settings.menuTitle1}
                      onChange={(e) => setSettings({ ...settings, menuTitle1: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                      placeholder="Title"
                    />
                  )}
                </div>

                {/* Menu 2 */}
                {(settings.layout === 'layout2' || (settings.layout === 'layout4' && settings.menuCount >= 2) || (settings.layout === 'layout5' && settings.menuCount >= 2)) && (
                  <div className="p-2 border border-gray-200 rounded-lg bg-white">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Menu 2
                    </label>
                    <select
                      value={settings.selectedMenu2}
                      onChange={(e) => setSettings({ ...settings, selectedMenu2: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-1.5 text-xs"
                    >
                      <option value="">-- Select --</option>
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                    {settings.selectedMenu2 && (
                      <input
                        type="text"
                        value={settings.menuTitle2}
                        onChange={(e) => setSettings({ ...settings, menuTitle2: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                        placeholder="Title"
                      />
                    )}
                  </div>
                )}

                {/* Menu 3 */}
                {((settings.layout === 'layout4' && settings.menuCount >= 3) || (settings.layout === 'layout5' && settings.menuCount >= 3)) && (
                  <div className="p-2 border border-gray-200 rounded-lg bg-white">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Menu 3
                    </label>
                    <select
                      value={settings.selectedMenu3}
                      onChange={(e) => setSettings({ ...settings, selectedMenu3: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-1.5 text-xs"
                    >
                      <option value="">-- Select --</option>
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                    {settings.selectedMenu3 && (
                      <input
                        type="text"
                        value={settings.menuTitle3}
                        onChange={(e) => setSettings({ ...settings, menuTitle3: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                        placeholder="Title"
                      />
                    )}
                  </div>
                )}

                {/* Menu 4 */}
                {(settings.layout === 'layout5' && settings.menuCount >= 4) && (
                  <div className="p-2 border border-gray-200 rounded-lg bg-white">
                    <label className="block text-xs font-medium text-gray-700 mb-1.5">
                      Menu 4
                    </label>
                    <select
                      value={settings.selectedMenu4}
                      onChange={(e) => setSettings({ ...settings, selectedMenu4: e.target.value })}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 mb-1.5 text-xs"
                    >
                      <option value="">-- Select --</option>
                      {menus.map((menu) => (
                        <option key={menu.id} value={menu.id}>
                          {menu.name}
                        </option>
                      ))}
                    </select>
                    {settings.selectedMenu4 && (
                      <input
                        type="text"
                        value={settings.menuTitle4}
                        onChange={(e) => setSettings({ ...settings, menuTitle4: e.target.value })}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-xs"
                        placeholder="Title"
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
            </div>
          </div>
        )}
      </div>

      {/* Save Button - Fixed at bottom */}
      <div className="border-t border-gray-200 p-4 bg-gray-50" style={{ flexShrink: 0 }}>
        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 transition-all shadow-md font-semibold text-sm"
          >
            {saving ? 'Saving...' : 'Save Footer Settings'}
          </button>
          {message && (
            <span className={`text-sm font-medium ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
              {message}
            </span>
          )}
        </div>
      </div>

      {/* Media Library Modal */}
      {showMediaLibrary && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowMediaLibrary(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h3 className="text-xl font-semibold text-gray-900">Select Footer Logo</h3>
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
