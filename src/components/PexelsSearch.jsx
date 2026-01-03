'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Loader2, Eye, Download } from 'lucide-react';

export default function PexelsSearch({ onSelect, onSaveToCloudinary }) {
  const [query, setQuery] = useState('nature');
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [saving, setSaving] = useState(null);
  const observerTarget = useRef(null);

  const search = async (newQuery, pageNum = 1) => {
    setLoading(true);
    const q = newQuery || query;
    try {
      const res = await fetch(`/api/pexels/search?query=${q}&page=${pageNum}`);
      const data = await res.json();
      
      if (pageNum === 1) {
        setImages(data.photos || []);
      } else {
        const existingIds = new Set(images.map(img => img.id));
        const newPhotos = (data.photos || []).filter(photo => !existingIds.has(photo.id));
        setImages(prev => [...prev, ...newPhotos]);
      }
      
      setHasMore(data.photos && data.photos.length > 0);
      setPage(pageNum + 1);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
    setLoading(false);
  };

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      search(query, page);
    }
  }, [loading, hasMore, query, page]);

  useEffect(() => {
    search('nature', 1);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [loadMore, hasMore, loading]);

  const handleSearch = () => {
    setPage(1);
    search(query, 1);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSaveToCloudinary = async (img, e) => {
    e.stopPropagation();
    setSaving(img.id);
    try {
      await onSaveToCloudinary(img.src.original);
    } catch (error) {
      console.error('Error saving to cloudinary:', error);
    }
    setSaving(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:border-purple-500 transition-colors"
            placeholder="Search free stock photos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
        </div>
        <button
          className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all font-medium shadow-lg hover:shadow-xl"
          onClick={handleSearch}
          disabled={loading}
        >
          Search
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img, index) => (
          <div
            key={`${img.id}-${index}`}
            className="group relative aspect-square overflow-hidden rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
            onClick={() => onSelect(img.src.original)}
          >
            <img
              src={img.src.medium}
              alt={img.alt || 'Pexels photo'}
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient- from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <p className="text-white text-xs font-medium truncate">
                  Photo by {img.photographer}
                </p>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="absolute top-2 right-2 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setPreviewImage(img);
                }}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors"
                title="Preview"
              >
                <Eye size={18} className="text-purple-600" />
              </button>
              <button
                onClick={(e) => handleSaveToCloudinary(img, e)}
                disabled={saving === img.id}
                className="bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
                title="Save to My Uploads"
              >
                {saving === img.id ? (
                  <Loader2 size={18} className="text-blue-600 animate-spin" />
                ) : (
                  <Download size={18} className="text-blue-600" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin text-purple-600" size={32} />
        </div>
      )}

      <div ref={observerTarget} className="h-4" />

      {!hasMore && images.length > 0 && (
        <p className="text-center text-gray-500 py-4">No more images to load</p>
      )}

      {/* Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img
              src={previewImage.src.large2x}
              alt={previewImage.alt || 'Preview'}
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <p className="text-white text-sm font-medium">Photo by {previewImage.photographer}</p>
              <a 
                href={previewImage.photographer_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-purple-300 text-xs hover:underline"
              >
                View on Pexels
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
