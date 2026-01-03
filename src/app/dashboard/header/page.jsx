'use client';

import { useState, useEffect } from 'react';
import { Layout, CheckCircle, AlertCircle } from 'lucide-react';
import HeaderVariationSelector from '@/components/HeaderVariationSelector';

export default function HeaderSettingsPage() {
  const [headerVariation, setHeaderVariation] = useState('background');
  const [showHeaderSelector, setShowHeaderSelector] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Prevent hydration mismatch
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
    <div className="h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-4 px-4 overflow-auto">
      <div className="max-w-4xl mx-auto">
        {/* Header with gradient */}
        <div className="mb-4 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
                <Layout className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold" style={{ color: '#1f2937' }}>
                  Header Settings
                </h1>
                <p className="text-xs text-gray-500">Choose your header layout style</p>
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

        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
          {/* Decorative top bar */}
          <div className="h-1.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
          
          <div className="p-6">
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Current Header Style</h2>
              <p className="text-sm text-gray-600">
                Click the button below to change your website's header layout
              </p>
            </div>

            {/* Current Selection Display */}
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Header Style:</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {headerVariations.find(v => v.id === headerVariation)?.name || 'Background Header'}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    {headerVariations.find(v => v.id === headerVariation)?.description}
                  </p>
                </div>
                <button
                  onClick={() => setShowHeaderSelector(true)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-semibold shadow-md hover:shadow-lg transform hover:scale-105"
                >
                  Change Style
                </button>
              </div>
            </div>

            {/* Available Styles Preview */}
            <div>
              <h3 className="text-md font-semibold text-gray-900 mb-3">Available Header Styles</h3>
              <div className="grid grid-cols-2 gap-4">
                {headerVariations.map((variation) => (
                  <div
                    key={variation.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      headerVariation === variation.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                    }`}
                    onClick={() => setShowHeaderSelector(true)}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-900">{variation.name}</h4>
                        <p className="text-xs text-gray-600 mt-1">{variation.description}</p>
                      </div>
                      {headerVariation === variation.id && (
                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0">
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

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Tip:</strong> You can also change the header style by clicking on the header itself on your website's frontend.
              </p>
            </div>
          </div>
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
