'use client';

import { useState, useEffect } from 'react';
import { Layout, CheckCircle, AlertCircle } from 'lucide-react';
import HeaderVariationSelector from '@/components/HeaderVariationSelector';

export default function HeaderManager() {
  const [headerVariation, setHeaderVariation] = useState('background');
  const [showHeaderSelector, setShowHeaderSelector] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadHeaderVariation();
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

  if (!mounted) {
    return null;
  }

  const headerVariations = [
    { id: 'transparent', name: 'Transparent', description: 'Overlay header with transparent background' },
    { id: 'background', name: 'Background Header', description: 'Traditional header with white background' },
    { id: 'center', name: 'Center Aligned', description: 'Logo and menu centered' },
    { id: 'floating', name: 'Floating', description: 'Rounded container with backdrop blur' },
    { id: 'leftside', name: 'Left Side Header', description: 'Vertical sidebar navigation' },
    { id: 'fullscreen', name: 'Fullscreen Overlay', description: 'Hamburger menu with full-screen overlay' }
  ];

  return (
    <div style={{ width: '875px', height: '791px', display: 'flex', flexDirection: 'column' }}>
      {/* Compact Header - 60px */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-lg px-4 py-2" style={{ height: '60px', flexShrink: 0 }}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 backdrop-blur rounded-lg">
              <Layout className="text-white" size={18} />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">Header Settings</h1>
              <p className="text-white/90 text-xs leading-tight">Choose header layout</p>
            </div>
          </div>
          {message.text && (
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs ${
              message.type === 'success' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle size={14} />
              ) : (
                <AlertCircle size={14} />
              )}
              <span className="font-medium">{message.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content Area - Fills remaining space (731px) */}
      <div className="bg-white border border-gray-200" style={{ flex: 1, overflow: 'auto' }}>
        <div className="p-5">
          <div className="mb-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-gray-600">Active Style:</p>
                <p className="text-lg font-bold text-gray-900 mt-1">
                  {headerVariations.find(v => v.id === headerVariation)?.name || 'Background Header'}
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {headerVariations.find(v => v.id === headerVariation)?.description}
                </p>
              </div>
              <button
                onClick={() => setShowHeaderSelector(true)}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-semibold shadow-md text-sm"
              >
                Change Style
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Available Styles</h3>
            <div className="grid grid-cols-2 gap-3">
              {headerVariations.map((variation) => (
                <div
                  key={variation.id}
                  className={`p-3 rounded-lg border-2 transition-all cursor-pointer ${
                    headerVariation === variation.id
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                  }`}
                  onClick={() => setShowHeaderSelector(true)}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900 text-sm">{variation.name}</h4>
                      <p className="text-xs text-gray-600 mt-1">{variation.description}</p>
                    </div>
                    {headerVariation === variation.id && (
                      <div className="w-5 h-5 bg-indigo-600 rounded-full flex items-center justify-center shrink-0">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
            <p className="text-xs text-indigo-800">
              <strong>Tip:</strong> Click on the header on your website to change styles.
            </p>
          </div>
        </div>
      </div>

      <HeaderVariationSelector
        isOpen={showHeaderSelector}
        onClose={() => setShowHeaderSelector(false)}
        currentVariation={headerVariation}
        onSelect={handleHeaderVariationSelect}
      />
    </div>
  );
}
