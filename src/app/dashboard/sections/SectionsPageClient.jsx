'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Edit2, Trash2, Eye, EyeOff, Save, X, Image as ImageIcon, Link, AlignLeft, AlignCenter, AlignRight, GripVertical, Layers, Palette, Copy } from 'lucide-react';
import MediaLibrary from '../../../components/MediaLibrary';
import RichTextEditor from '../../../components/RichTextEditor';

export default function SectionsPageClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageId = searchParams.get('pageId');
  
  const [page, setPage] = useState(null);
  const [pages, setPages] = useState([]);
  const [sections, setSections] = useState([]);
  const [allSections, setAllSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectionIndex, setSelectedSectionIndex] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryTarget, setMediaLibraryTarget] = useState(null);
  const [showLinkSelector, setShowLinkSelector] = useState(false);
  const [linkSelectorTab, setLinkSelectorTab] = useState('pages');
  const [customUrl, setCustomUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('features');
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [showColorModal, setShowColorModal] = useState(false);
  const [featureDraft, setFeatureDraft] = useState({ index: null, icon: '', title: '', text: '' });
  const [newSection, setNewSection] = useState({
    heading: '',
    subheading: '',
    description: '',
    button: '',
    buttonLink: '',
    buttonTarget: '_self',
    img: '',
    align: 'left',
    textAlign: 'left',
    hidden: false,
    bgType: 'default',
    bgColor: '',
    bgThemeColor: '',
    bgImage: '',
    bgImageUrl: '',
    // Show toggles for optional elements
    showSubheading: true,
    showDescription: true,
    // Features list (icon,title,text)
    features: [],
      featuresLayout: 'grid-2',
  });

  // Add dashboard-page class to body to prevent theme colors
  useEffect(() => {
    document.body.classList.add('dashboard-page');
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  useEffect(() => {
    loadData();
  }, [pageId]);

  const loadData = async () => {
    try {
      // Load pages
      const pagesRes = await fetch('/api/pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
      const currentPage = pagesData.find(p => p.id === pageId);
      setPage(currentPage);

      // Load sections
      const sectionsRes = await fetch('/api/sections');
      const sectionsData = await sectionsRes.json();
      setAllSections(sectionsData);
      const pageSections = sectionsData.filter(s => s.pageId === pageId);
      setSections(pageSections);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // ... rest of the component logic would go here
  // For now, just return a simple loading state
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Page not found</h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200 p-4 sticky top-0 z-10">
        <div className="max-w-full mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{page.name} - Sections</h1>
              <p className="text-sm text-gray-600">
                {sections.length} {sections.length === 1 ? 'section' : 'sections'}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="p-8">
        <p className="text-gray-600">Sections page content will be implemented here.</p>
      </div>
    </div>
  );
}