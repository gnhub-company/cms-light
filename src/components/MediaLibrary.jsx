'use client';

import { useState, useEffect } from 'react';
import { Upload, Trash2, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import PexelsSearch from './PexelsSearch';

export default function MediaLibrary({ onSelect }) {
  const [cloudImages, setCloudImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('pexels');

  async function fetchCloud() {
    try {
      const res = await fetch('/api/cloudinary/list');
      const data = await res.json();
      setCloudImages(data);
    } catch (error) {
      console.error('Error fetching cloudinary images:', error);
    }
  }

  async function uploadFile() {
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await fetch('/api/cloudinary/upload', { method: 'POST', body: formData });
      await res.json();
      setFile(null);
      await fetchCloud();
      // Switch to My Uploads tab to show the newly uploaded image
      setActiveTab('cloudinary');
    } catch (error) {
      console.error('Error uploading file:', error);
    }
    setUploading(false);
  }

  async function deleteImage(public_id) {
    if (!confirm('Delete this image?')) return;
    try {
      await fetch('/api/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ public_id }),
      });
      fetchCloud();
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  }

  useEffect(() => {
    fetchCloud();
  }, []);

  const handleImageSelect = (url) => {
    setSelected(url);
    onSelect(url);
  };

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('pexels')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'pexels'
              ? 'text-purple-600 border-b-2 border-purple-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Pexels Search
        </button>
        <button
          onClick={() => setActiveTab('cloudinary')}
          className={`px-6 py-3 font-medium transition-all ${
            activeTab === 'cloudinary'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Uploads
        </button>
      </div>

      {/* Selected Image Preview */}
      {selected && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-4">
          <div className="flex items-center gap-4">
            <CheckCircle2 className="text-green-600 shrink-0" size={24} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-green-900 mb-1">Image Selected</p>
              <p className="text-xs text-green-700 truncate">{selected}</p>
            </div>
            <img src={selected} alt="Selected" className="w-16 h-16 object-cover rounded-lg shadow-md" />
            <button
              onClick={async () => {
                setUploading(true);
                try {
                  const response = await fetch('/api/cloudinary/save-from-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ imageUrl: selected }),
                  });
                  
                  if (response.ok) {
                    await fetchCloud();
                    alert('Image saved to My Uploads!');
                    setActiveTab('cloudinary');
                  } else {
                    alert('Failed to save image');
                  }
                } catch (error) {
                  console.error('Error saving image:', error);
                  alert('Error saving image');
                }
                setUploading(false);
              }}
              disabled={uploading}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Saving...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Save to Uploads
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Pexels Tab */}
      {activeTab === 'pexels' && (
        <div>
          <PexelsSearch 
            onSelect={handleImageSelect}
            onSaveToCloudinary={async (imageUrl) => {
              try {
                // Download image and upload to Cloudinary
                const response = await fetch('/api/cloudinary/save-from-url', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ imageUrl }),
                });
                
                if (response.ok) {
                  await fetchCloud();
                  alert('Image saved to My Uploads!');
                } else {
                  alert('Failed to save image');
                }
              } catch (error) {
                console.error('Error saving image:', error);
                alert('Error saving image');
              }
            }}
          />
        </div>
      )}

      {/* Cloudinary Tab */}
      {activeTab === 'cloudinary' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-dashed border-blue-300 rounded-xl p-6">
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="p-4 bg-blue-100 rounded-full">
                <Upload className="text-blue-600" size={32} />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">Upload Your Images</h3>
                <p className="text-sm text-gray-600">Upload to Cloudinary for permanent storage</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <input
                  type="file"
                  accept="image/*"
                  onChange={e => setFile(e.target.files[0])}
                  className="flex-1 text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
                <button
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={uploadFile}
                  disabled={!file || uploading}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Uploading...
                    </>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Cloudinary Images Grid */}
          {cloudImages.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {cloudImages.map(img => (
                <div
                  key={img.public_id}
                  className="group relative aspect-square overflow-hidden rounded-xl cursor-pointer shadow-md hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
                  onClick={() => handleImageSelect(img.secure_url)}
                >
                  <img
                    src={img.secure_url}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <button
                      className="p-3 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(img.public_id);
                      }}
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                  {selected === img.secure_url && (
                    <div className="absolute top-2 right-2">
                      <div className="bg-green-500 rounded-full p-2 shadow-lg">
                        <CheckCircle2 className="text-white" size={16} />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <ImageIcon className="mx-auto text-gray-400 mb-4" size={64} />
              <p className="text-gray-600 font-medium">No images uploaded yet</p>
              <p className="text-sm text-gray-500 mt-1">Upload your first image to get started</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
