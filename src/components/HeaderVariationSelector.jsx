'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

const headerVariations = [
  {
    id: 'transparent',
    name: 'Transparent',
    preview: (
      <div className="w-full h-full border-2 border-white/40 rounded-md p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="w-6 h-1 bg-white/60 rounded"></div>
          <div className="flex gap-1">
            <div className="w-4 h-0.5 bg-white/60 rounded"></div>
            <div className="w-4 h-0.5 bg-white/60 rounded"></div>
            <div className="w-4 h-0.5 bg-white/60 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'background',
    name: 'Background Header',
    preview: (
      <div className="w-full h-full bg-white/20 border-2 border-white/40 rounded-md p-2 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <div className="w-6 h-1 bg-white/80 rounded"></div>
          <div className="flex gap-1">
            <div className="w-4 h-0.5 bg-white/80 rounded"></div>
            <div className="w-4 h-0.5 bg-white/80 rounded"></div>
            <div className="w-4 h-0.5 bg-white/80 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'center',
    name: 'Center Aligned',
    preview: (
      <div className="w-full h-full border-2 border-white/40 rounded-md p-2 flex flex-col items-center gap-1">
        <div className="w-6 h-1 bg-white/60 rounded"></div>
        <div className="flex gap-1">
          <div className="w-4 h-0.5 bg-white/60 rounded"></div>
          <div className="w-4 h-0.5 bg-white/60 rounded"></div>
          <div className="w-4 h-0.5 bg-white/60 rounded"></div>
        </div>
      </div>
    )
  },
  {
    id: 'floating',
    name: 'Floating',
    preview: (
      <div className="w-full h-full p-1 flex items-center justify-center">
        <div className="w-[90%] h-[80%] bg-white/20 border-2 border-white/40 rounded-lg p-1.5 flex items-center justify-between">
          <div className="w-5 h-0.5 bg-white/60 rounded"></div>
          <div className="flex gap-1">
            <div className="w-3 h-0.5 bg-white/60 rounded"></div>
            <div className="w-3 h-0.5 bg-white/60 rounded"></div>
            <div className="w-3 h-0.5 bg-white/60 rounded"></div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'leftside',
    name: 'Left Side Header',
    preview: (
      <div className="w-full h-full border-2 border-white/40 rounded-md p-2 flex gap-2">
        <div className="w-1/4 flex flex-col gap-1 items-center justify-center border-r border-white/30">
          <div className="w-3 h-3 bg-white/60 rounded"></div>
          <div className="w-6 h-0.5 bg-white/60 rounded"></div>
          <div className="w-6 h-0.5 bg-white/60 rounded"></div>
          <div className="w-6 h-0.5 bg-white/60 rounded"></div>
        </div>
        <div className="flex-1"></div>
      </div>
    )
  },
  {
    id: 'fullscreen',
    name: 'Fullscreen Overlay',
    preview: (
      <div className="w-full h-full bg-white/10 border-2 border-white/40 rounded-md p-2 flex flex-col">
        <div className="flex justify-end mb-1">
          <div className="w-2 h-2 border border-white/60 rounded flex items-center justify-center">
            <X className="w-1 h-1 text-white/60" />
          </div>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-1">
          <div className="w-8 h-0.5 bg-white/60 rounded"></div>
          <div className="w-8 h-0.5 bg-white/60 rounded"></div>
          <div className="w-8 h-0.5 bg-white/60 rounded"></div>
        </div>
      </div>
    )
  }
];

export default function HeaderVariationSelector({ isOpen, onClose, currentVariation, onSelect }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-5xl mx-4 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-2xl shadow-2xl overflow-hidden">
        {/* Animated background particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 3}s`
              }}
            />
          ))}
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Content */}
        <div className="relative p-8">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            Header Variations
          </h2>

          <div className="grid grid-cols-3 gap-6">
            {headerVariations.map((variation) => (
              <button
                key={variation.id}
                onClick={() => {
                  onSelect(variation.id);
                  onClose();
                }}
                className={`group relative aspect-[4/3] rounded-xl overflow-hidden transition-all duration-300 ${
                  currentVariation === variation.id
                    ? 'ring-4 ring-white scale-105'
                    : 'hover:scale-105 hover:ring-2 hover:ring-white/50'
                }`}
              >
                {/* Preview */}
                <div className="w-full h-full bg-gradient-to-br from-blue-700 to-blue-800 p-4">
                  {variation.preview}
                </div>

                {/* Label */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                  <p className="text-white text-sm font-medium text-center">
                    {variation.name}
                  </p>
                </div>

                {/* Selected indicator */}
                {currentVariation === variation.id && (
                  <div className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
