'use client';

import { useState, useEffect } from 'react';
import { FileText, Image, Type, Edit2, Save, X, Trash2, Plus, List, Eye, EyeOff, Link, Loader2, Palette, GripVertical, Copy, Settings, Layout, Footprints } from 'lucide-react';
import MediaLibrary from '../../components/MediaLibrary';
import ThemeManager from '../../components/ThemeManager';
import TypographyManager from '../../components/TypographyManager';
import LogoManager from '../../components/LogoManager';
import HeaderManager from '../../components/HeaderManager';
import MenuManager from '../../components/MenuManager';
import SettingsManager from '../../components/SettingsManager';
import FooterManager from '../../components/FooterManager';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('pages');
  const [sections, setSections] = useState([]);
  const [pages, setPages] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingPageIndex, setEditingPageIndex] = useState(null);
  const [viewingPageSections, setViewingPageSections] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editPageForm, setEditPageForm] = useState({});
  const [isAdding, setIsAdding] = useState(false);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [isAddingSectionInModal, setIsAddingSectionInModal] = useState(false);
  const [editingSectionInModal, setEditingSectionInModal] = useState(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);
  const [mediaLibraryTarget, setMediaLibraryTarget] = useState(null);
  const [showLinkSelector, setShowLinkSelector] = useState(false);
  const [linkSelectorTarget, setLinkSelectorTarget] = useState(null);
  const [linkSelectorTab, setLinkSelectorTab] = useState('pages');
  const [customUrl, setCustomUrl] = useState('');
  const [openInNewTab, setOpenInNewTab] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [newSection, setNewSection] = useState({
    heading: '',
    subheading: '',
    description: '',
    button: '',
    buttonLink: '',
    img: '',
    align: 'left',
    textAlign: 'left',
    bgType: 'none',
    bgImage: '',
    bgImageUrl: '',
    bgColor: '',
    bgThemeColor: '',
    paddingY: 'comfortable'
  });
  const [themeColors, setThemeColors] = useState({});
  const [newPage, setNewPage] = useState({
    name: '',
    slug: '',
    title: '',
    status: 'draft'
  });

  const menuItems = [
    { id: 'media', icon: Image, label: 'Media' },
    { id: 'pages', icon: FileText, label: 'Pages' },
    { id: 'theme', icon: Palette, label: 'Theme' },
    { id: 'typography', icon: Type, label: 'Typography' },
    { id: 'logo', icon: Image, label: 'Logo' },
    { id: 'header', icon: Layout, label: 'Header' },
    { id: 'footer', icon: Footprints, label: 'Footer' },
    { id: 'menus', icon: List, label: 'Menus' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  useEffect(() => {
    // Add dashboard-page class to body to prevent theme colors from applying
    document.body.classList.add('dashboard-page');
    
    // Load sections
    fetch('/api/sections')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded sections:', data);
        setSections(data);
      })
      .catch(err => {
        console.error('Error loading sections:', err);
        setSections([]);
      });
    
    // Load pages
    fetch('/api/pages')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded pages:', data);
        setPages(data);
        
        // After pages are loaded, validate menu references
        validateMenuReferences(data);
      })
      .catch(err => {
        console.error('Error loading pages:', err);
        setPages([]);
      });
    
    // Load theme colors
    fetch('/api/theme')
      .then(res => res.json())
      .then(data => {
        console.log('Loaded theme colors:', data);
        if (data.colors) {
          console.log('Setting theme colors:', data.colors);
          setThemeColors(data.colors);
        }
      })
      .catch(err => {
        console.error('Error loading theme colors:', err);
      });
    
    // Cleanup: remove class when leaving dashboard
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  // Sync sections with pages whenever pages change
  useEffect(() => {
    if (pages.length > 0 && sections.length > 0) {
      syncSectionsWithPages();
    }
  }, [pages]);

  const cleanSection = (section) => {
    // Remove empty fields and default values from section
    const cleaned = {};
    Object.keys(section).forEach(key => {
      const value = section[key];
      // Skip empty values (empty strings, null, undefined)
      if (value === '' || value === null || value === undefined) {
        return;
      }
      // Skip default hidden value (false means visible, which is the default)
      if (key === 'hidden' && value === false) {
        return;
      }
      // Skip default bgType
      if (key === 'bgType' && value === 'none') {
        return;
      }
      // Skip background fields if bgType is none
      if (section.bgType === 'none' && (key === 'bgImage' || key === 'bgImageUrl' || key === 'bgColor' || key === 'bgThemeColor')) {
        return;
      }
      // Skip unused background fields based on bgType
      if (section.bgType === 'image' && (key === 'bgColor' || key === 'bgThemeColor')) {
        return;
      }
      if (section.bgType === 'customColor' && (key === 'bgImage' || key === 'bgImageUrl' || key === 'bgThemeColor')) {
        return;
      }
      if (section.bgType === 'themeColor' && (key === 'bgImage' || key === 'bgImageUrl' || key === 'bgColor')) {
        return;
      }
      // Skip default align value if there's an image
      if (key === 'align' && value === 'left' && section.img) {
        return;
      }
      // Skip default textAlign value if there's no image
      if (key === 'textAlign' && value === 'left' && !section.img) {
        return;
      }
      // Skip align if there's no image (use textAlign instead)
      if (key === 'align' && !section.img) {
        return;
      }
      // Skip textAlign if there's an image (use align instead)
      if (key === 'textAlign' && section.img) {
        return;
      }
      cleaned[key] = value;
    });
    return cleaned;
  };

  const saveToJson = async (updatedSections) => {
    console.log('Saving sections:', updatedSections);
    
    // Ensure all sections have valid pageIds
    const sectionsWithValidPageIds = updatedSections.map(section => {
      // If section doesn't have a pageId, try to find it from current page context
      if (!section.pageId && pages.length > 0) {
        // Default to first page if no pageId
        return { ...section, pageId: pages[0].id };
      }
      return section;
    });
    
    // Group sections by pageId and update pages
    const updatedPages = pages.map(page => {
      const pageSections = sectionsWithValidPageIds
        .filter(s => s.pageId === page.id)
        .map(({ pageId, ...section }) => cleanSection(section));
      return { ...page, sections: pageSections };
    });
    
    console.log('Saving pages with sections:', updatedPages);
    
    const response = await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPages),
    });
    
    const result = await response.json();
    console.log('Save result:', result);
    return result;
  };

  const handleAdd = async () => {
    if (newSection.heading.trim()) {
      const updated = [...sections, newSection];

      setSections(updated);
      await saveToJson(updated);
      setNewSection({ heading: '', description: '', button: '', img: '', align: 'left' });
      setIsAdding(false);
    }
  };

  const handleEdit = (section, index) => {
    setEditingIndex(index);
    setEditForm({ 
      ...section,
      bgType: section.bgType || 'none',
      bgImage: section.bgImage || '',
      bgImageUrl: section.bgImageUrl || '',
      bgColor: section.bgColor || '',
      bgThemeColor: section.bgThemeColor || '',
      paddingY: section.paddingY || 'comfortable'
    });
  };

  const handleSave = async () => {
    const updated = sections.map((s, i) => i === editingIndex ? editForm : s);
    setSections(updated);
    await saveToJson(updated);
    setEditingIndex(null);
    setEditForm({});
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setEditForm({});
  };

  const handleDelete = async (index) => {
    if (window.confirm('Are you sure?')) {
      const updated = sections.filter((_, i) => i !== index);
      setSections(updated);
      await saveToJson(updated);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleNewInputChange = (e) => {
    const { name, value } = e.target;
    setNewSection(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectLink = (link) => {
    const target = openInNewTab ? '_blank' : '_self';
    if (linkSelectorTarget === 'newSection') {
      setNewSection(prev => ({ ...prev, buttonLink: link, buttonTarget: target }));
    } else if (linkSelectorTarget === 'editSection') {
      setEditForm(prev => ({ ...prev, buttonLink: link, buttonTarget: target }));
    }
    setShowLinkSelector(false);
    setLinkSelectorTarget(null);
    setCustomUrl('');
    setOpenInNewTab(false);
  };

  // Page management functions
  const savePages = async (updatedPages) => {
    await fetch('/api/pages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedPages),
    });
  };

  const handleAddPage = async () => {
    if (!newPage.name.trim()) {
      alert('Please enter a page name');
      return;
    }
    if (!newPage.slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    
    try {
      const pageWithId = {
        ...newPage,
        id: newPage.slug.replace(/\//g, '').toLowerCase() || Date.now().toString(),
        sections: []
      };
      const updated = [...pages, pageWithId];
      setPages(updated);
      
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Page created successfully!');
        setNewPage({ name: '', slug: '', title: '', status: 'draft' });
        setIsAddingPage(false);
      } else {
        alert('Failed to create page: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error creating page:', error);
      alert('Error creating page: ' + error.message);
    }
  };

  const handleDeletePage = async (index) => {
    if (window.confirm('Delete this page?')) {
      const updated = pages.filter((_, i) => i !== index);
      setPages(updated);
      await savePages(updated);
    }
  };

  const handleNewPageChange = (e) => {
    const { name, value } = e.target;
    setNewPage(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditPage = (page, index) => {
    setEditingPageIndex(index);
    setEditPageForm({ ...page });
  };

  // Function to validate and clean up menu references
  const validateMenuReferences = async (pagesData) => {
    try {
      // Get current menus
      const menusResponse = await fetch('/api/menus');
      const menus = await menusResponse.json();
      
      if (!menus || menus.length === 0) return;
      
      // Get all valid page slugs
      const validSlugs = pagesData.map(page => page.slug);
      
      // Check if any menu items reference invalid slugs
      let needsUpdate = false;
      const updatedMenus = menus.map(menu => {
        const validItems = menu.items.filter(item => {
          // Keep external links and valid internal links
          if (item.url.startsWith('http') || item.url.startsWith('#') || validSlugs.includes(item.url)) {
            return true;
          }
          // Remove invalid internal links
          needsUpdate = true;
          console.log(`Removing invalid menu item: ${item.label} (${item.url})`);
          return false;
        });
        
        return { ...menu, items: validItems };
      });
      
      // Save cleaned menus if needed
      if (needsUpdate) {
        await fetch('/api/menus', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedMenus),
        });
        console.log('Menu references validated and cleaned');
      }
    } catch (error) {
      console.error('Error validating menu references:', error);
    }
  };

  // Function to update section pageIds when page ID changes
  const updateSectionPageIds = async (oldPageId, newPageId) => {
    try {
      // Update sections in state
      const updatedSections = sections.map(section => 
        section.pageId === oldPageId 
          ? { ...section, pageId: newPageId }
          : section
      );
      setSections(updatedSections);
      
      // Save updated sections
      await saveToJson(updatedSections);
    } catch (error) {
      console.error('Error updating section pageIds:', error);
    }
  };

  // Function to sync sections with current pages (ensure no orphaned sections)
  const syncSectionsWithPages = () => {
    const validPageIds = pages.map(page => page.id);
    const syncedSections = sections.map(section => {
      // If section's pageId doesn't exist in current pages, assign to first page
      if (!validPageIds.includes(section.pageId)) {
        console.log(`Reassigning orphaned section to page: ${pages[0]?.id}`);
        return { ...section, pageId: pages[0]?.id || 'home' };
      }
      return section;
    });
    
    // Update sections if any changes were made
    if (JSON.stringify(syncedSections) !== JSON.stringify(sections)) {
      setSections(syncedSections);
    }
  };

  // Function to reload sections from API
  const reloadSections = async () => {
    try {
      const response = await fetch('/api/sections');
      const data = await response.json();
      console.log('Reloaded sections:', data);
      setSections(data);
    } catch (error) {
      console.error('Error reloading sections:', error);
    }
  };

  // Function to update menu references when page slug changes
  const updateMenuReferences = async (oldSlug, newSlug) => {
    try {
      // Get current menus
      const menusResponse = await fetch('/api/menus');
      const menus = await menusResponse.json();
      
      // Update any menu items that reference the old slug
      const updatedMenus = menus.map(menu => ({
        ...menu,
        items: menu.items.map(item => 
          item.url === oldSlug ? { ...item, url: newSlug } : item
        )
      }));
      
      // Save updated menus
      await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMenus),
      });
    } catch (error) {
      console.error('Error updating menu references:', error);
    }
  };

  const handleSavePage = async () => {
    if (!editPageForm.name || !editPageForm.name.trim()) {
      alert('Please enter a page name');
      return;
    }
    if (!editPageForm.slug || !editPageForm.slug.trim()) {
      alert('Please enter a slug');
      return;
    }
    
    try {
      const oldPage = pages[editingPageIndex];
      const updated = pages.map((p, i) => i === editingPageIndex ? editPageForm : p);
      setPages(updated);
      
      // Save pages
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      
      const result = await response.json();
      
      if (result.success) {
        // If page ID changed, update sections with new pageId
        if (oldPage.id !== editPageForm.id) {
          await updateSectionPageIds(oldPage.id, editPageForm.id);
        }
        
        // If slug changed, update menu items that reference this page
        if (oldPage.slug !== editPageForm.slug) {
          await updateMenuReferences(oldPage.slug, editPageForm.slug);
        }
        
        // Reload sections to get updated pageId references
        await reloadSections();
        
        alert('Page updated successfully!');
        setEditingPageIndex(null);
        setEditPageForm({});
      } else {
        alert('Failed to update page: ' + (result.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error updating page:', error);
      alert('Error updating page: ' + error.message);
    }
  };

  const handleCancelPageEdit = () => {
    setEditingPageIndex(null);
    setEditPageForm({});
  };

  const handlePageInputChange = (e) => {
    const { name, value } = e.target;
    setEditPageForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleViewPageSections = (pageId) => {
    setViewingPageSections(pageId);
  };

  const getPageSections = (pageId) => {
    return sections.filter(section => section.pageId === pageId);
  };

  const handleAddSectionToPage = async () => {
    if (!newSection.heading.trim()) {
      alert('Please enter a heading');
      return;
    }
    
    setIsSaving(true);
    
    try {
      const sectionWithPage = { ...newSection, pageId: viewingPageSections };
      const updated = [...sections, sectionWithPage];
      
      console.log('Updated sections array:', updated);
      
      setSections(updated);
      const saveResult = await saveToJson(updated);
      
      console.log('Save result:', saveResult);
      
      // Reload pages to get updated sections
      const pagesRes = await fetch('/api/pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
      
      // Reload sections
      const sectionsRes = await fetch('/api/sections');
      const sectionsData = await sectionsRes.json();
      setSections(sectionsData);
      
      console.log('Reloaded sections:', sectionsData);
      
      setNewSection({ 
        heading: '', 
        subheading: '', 
        description: '', 
        button: '', 
        buttonLink: '', 
        img: '', 
        align: 'left', 
        textAlign: 'left',
        bgType: 'none',
        bgImage: '',
        bgImageUrl: '',
        bgColor: '',
        bgThemeColor: '',
        paddingY: 'comfortable'
      });
      setIsAddingSectionInModal(false);
      
      alert('Section added successfully!');
    } catch (error) {
      console.error('Error adding section:', error);
      alert('Error adding section: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditSectionInModal = (section, index) => {
    setEditingSectionInModal(index);
    setEditForm({ 
      ...section,
      bgType: section.bgType || 'none',
      bgImage: section.bgImage || '',
      bgImageUrl: section.bgImageUrl || '',
      bgColor: section.bgColor || '',
      bgThemeColor: section.bgThemeColor || '',
      paddingY: section.paddingY || 'comfortable'
    });
  };

  const handleSaveSectionInModal = async () => {
    if (!editForm.heading || !editForm.heading.trim()) {
      alert('Please enter a heading');
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Saving section edit:', editForm);
      
      const updated = sections.map((s, i) => i === editingSectionInModal ? editForm : s);
      
      console.log('Updated sections:', updated);
      
      setSections(updated);
      const saveResult = await saveToJson(updated);
      
      console.log('Save result:', saveResult);
      
      // Reload pages and sections to reflect changes
      const pagesRes = await fetch('/api/pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
      
      const sectionsRes = await fetch('/api/sections');
      const sectionsData = await sectionsRes.json();
      setSections(sectionsData);
      
      console.log('Reloaded sections:', sectionsData);
      
      setEditingSectionInModal(null);
      setEditForm({});
      
      alert('Section updated successfully!');
    } catch (error) {
      console.error('Error saving section:', error);
      alert('Error saving section: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteSectionInModal = async (index) => {
    if (!window.confirm('Delete this section?')) {
      return;
    }
    
    setIsSaving(true);
    
    try {
      console.log('Deleting section at index:', index);
      
      const updated = sections.filter((_, i) => i !== index);
      
      console.log('Updated sections after delete:', updated);
      
      setSections(updated);
      const saveResult = await saveToJson(updated);
      
      console.log('Save result:', saveResult);
      
      // Reload pages and sections to reflect changes
      const pagesRes = await fetch('/api/pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
      
      const sectionsRes = await fetch('/api/sections');
      const sectionsData = await sectionsRes.json();
      setSections(sectionsData);
      
      console.log('Reloaded sections:', sectionsData);
      
      alert('Section deleted successfully!');
    } catch (error) {
      console.error('Error deleting section:', error);
      alert('Error deleting section: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleSectionVisibility = async (index) => {
    setIsSaving(true);
    
    try {
      const updated = sections.map((s, i) => {
        if (i === index) {
          return { ...s, hidden: !s.hidden };
        }
        return s;
      });
      
      setSections(updated);
      const saveResult = await saveToJson(updated);
      
      // Reload pages and sections to reflect changes
      const pagesRes = await fetch('/api/pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
      
      const sectionsRes = await fetch('/api/sections');
      const sectionsData = await sectionsRes.json();
      setSections(sectionsData);
      
      const section = sections[index];
      alert(`Section ${section.hidden ? 'shown' : 'hidden'} successfully!`);
    } catch (error) {
      console.error('Error toggling section visibility:', error);
      alert('Error toggling visibility: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDuplicateSection = async (index) => {
    setIsSaving(true);
    
    try {
      const sectionToDuplicate = sections[index];
      
      // Deep clone the section to preserve all properties
      const duplicatedSection = {
        heading: sectionToDuplicate.heading || '',
        subheading: sectionToDuplicate.subheading || '',
        description: sectionToDuplicate.description || '',
        button: sectionToDuplicate.button || '',
        buttonLink: sectionToDuplicate.buttonLink || '',
        buttonTarget: sectionToDuplicate.buttonTarget || '',
        img: sectionToDuplicate.img || '',
        align: sectionToDuplicate.align || 'left',
        textAlign: sectionToDuplicate.textAlign || 'left',
        bgType: sectionToDuplicate.bgType || 'none',
        bgImage: sectionToDuplicate.bgImage || '',
        bgImageUrl: sectionToDuplicate.bgImageUrl || '',
        bgColor: sectionToDuplicate.bgColor || '',
        bgThemeColor: sectionToDuplicate.bgThemeColor || '',
        paddingY: sectionToDuplicate.paddingY || 'comfortable',
        hidden: sectionToDuplicate.hidden || false,
        pageId: sectionToDuplicate.pageId
      };
      
      // Insert the duplicated section right after the original
      const updated = [
        ...sections.slice(0, index + 1),
        duplicatedSection,
        ...sections.slice(index + 1)
      ];
      
      setSections(updated);
      await saveToJson(updated);
      
      // Reload pages and sections to reflect changes
      const pagesRes = await fetch('/api/pages');
      const pagesData = await pagesRes.json();
      setPages(pagesData);
      
      const sectionsRes = await fetch('/api/sections');
      const sectionsData = await sectionsRes.json();
      setSections(sectionsData);
      
      alert('Section duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating section:', error);
      alert('Error duplicating section: ' + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectImageFromMedia = (url) => {
    console.log('Image selected:', url, 'Target:', mediaLibraryTarget);
    if (mediaLibraryTarget === 'newSection') {
      setNewSection(prev => ({ ...prev, img: url }));
      console.log('Updated newSection with image');
    } else if (mediaLibraryTarget === 'editSection') {
      setEditForm(prev => ({ ...prev, img: url }));
      console.log('Updated editForm with image');
    } else if (mediaLibraryTarget === 'newSectionBg') {
      setNewSection(prev => ({ ...prev, bgImage: url, bgImageUrl: '' }));
      console.log('Updated newSection with background image');
    } else if (mediaLibraryTarget === 'editSectionBg') {
      setEditForm(prev => ({ ...prev, bgImage: url, bgImageUrl: '' }));
      console.log('Updated editForm with background image');
    }
    // Don't close automatically - let user see the selection
    // setShowMediaLibrary(false);
    // setMediaLibraryTarget(null);
  };

  // Drag and Drop handlers
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      return;
    }

    // Reorder sections
    const reorderedSections = [...sections];
    const [draggedSection] = reorderedSections.splice(draggedIndex, 1);
    reorderedSections.splice(dropIndex, 0, draggedSection);

    setSections(reorderedSections);
    await saveToJson(reorderedSections);
    
    // Reload sections to reflect new order
    const sectionsRes = await fetch('/api/sections');
    const sectionsData = await sectionsRes.json();
    setSections(sectionsData);
    
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderContent = () => {
    if (activeTab === 'pages') {
      return (
        <div className="w-full max-w-6xl p-6 space-y-6">
          {/* Pages Management */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Pages</h2>
                <p className="text-sm text-gray-600 mt-1">Manage your website pages - Total: {pages.length}</p>
              </div>
              <button
                onClick={() => setIsAddingPage(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus size={18} />
                <span>Create Page</span>
              </button>
            </div>

            {isAddingPage && (
              <div className="p-4 bg-green-50 border-b border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Page</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={newPage.name}
                      onChange={handleNewPageChange}
                      placeholder="About Us"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                    <input
                      type="text"
                      name="slug"
                      value={newPage.slug}
                      onChange={handleNewPageChange}
                      placeholder="/about"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                    <input
                      type="text"
                      name="title"
                      value={newPage.title}
                      onChange={handleNewPageChange}
                      placeholder="About Us - Company"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select
                      name="status"
                      value={newPage.status}
                      onChange={handleNewPageChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
                <div className="flex space-x-2 mt-4">
                  <button
                    onClick={handleAddPage}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Page</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsAddingPage(false);
                      setNewPage({ name: '', slug: '', title: '', status: 'draft' });
                    }}
                    className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            <div className="divide-y divide-gray-200">
              {pages.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>No pages found. Create your first page!</p>
                </div>
              ) : (
                pages.map((page, index) => (
                  <div key={index} className="p-4 hover:bg-gray-50 transition-colors">
                    {editingPageIndex === index ? (
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Page</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Name *</label>
                            <input
                              type="text"
                              name="name"
                              value={editPageForm.name || ''}
                              onChange={handlePageInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                            <input
                              type="text"
                              name="slug"
                              value={editPageForm.slug || ''}
                              onChange={handlePageInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Page Title</label>
                            <input
                              type="text"
                              name="title"
                              value={editPageForm.title || ''}
                              onChange={handlePageInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select
                              name="status"
                              value={editPageForm.status || 'draft'}
                              onChange={handlePageInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              <option value="draft">Draft</option>
                              <option value="published">Published</option>
                            </select>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={handleSavePage}
                            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Save size={16} />
                            <span>Save Changes</span>
                          </button>
                          <button
                            onClick={handleCancelPageEdit}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                          >
                            <X size={16} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-semibold text-gray-900">{page.name}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded ${
                              page.status === 'published' 
                                ? 'bg-green-100 text-green-700' 
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {page.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">Slug: {page.slug}</p>
                          {page.title && <p className="text-xs text-gray-500 mt-1">Title: {page.title}</p>}
                        </div>
                        
                        {/* Quick Action Icons with Hover Labels - Right Corner */}
                        <div className="flex items-center gap-2">
                          <div className="relative group">
                            <button
                              onClick={() => {
                                if (page.slug) window.open(page.slug, '_blank');
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            >
                              <Eye size={18} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Preview Page
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => {
                                window.open(`/dashboard/sections?pageId=${page.id}`, '_blank');
                              }}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            >
                              <List size={18} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              View Sections
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => handleEditPage(page, index)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Edit Page
                            </span>
                          </div>
                          <div className="relative group">
                            <button
                              onClick={() => handleDeletePage(index)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                            <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs font-medium text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                              Delete Page
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* View Page Sections Modal */}
          {viewingPageSections && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => {
              // Only close if clicking directly on the overlay (not on modal content or color picker)
              if (e.target === e.currentTarget) {
                setViewingPageSections(null);
              }
            }}>
              <div className="bg-white rounded-lg shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900">
                      {pages.find(p => p.id === viewingPageSections)?.name} - Sections
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Total Sections: {getPageSections(viewingPageSections).length}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setIsAddingSectionInModal(true)}
                      className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      title="Add New Section to This Page"
                    >
                      <Plus size={18} />
                      <span>Add Section</span>
                    </button>
                    <button
                      onClick={() => setViewingPageSections(null)}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Close Modal"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  {/* Add Section Form */}
                  {isAddingSectionInModal && (
                    <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl shadow-lg">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <Plus className="text-green-600" size={24} />
                        Add New Section
                      </h4>
                      <div className="space-y-5">
                        {/* Heading & Subheading */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Heading *</label>
                            <input
                              type="text"
                              name="heading"
                              value={newSection.heading}
                              onChange={handleNewInputChange}
                              placeholder="Main heading"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Subheading</label>
                            <input
                              type="text"
                              name="subheading"
                              value={newSection.subheading}
                              onChange={handleNewInputChange}
                              placeholder="Optional subheading"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                          </div>
                        </div>

                        {/* Description */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                          <textarea
                            name="description"
                            value={newSection.description}
                            onChange={handleNewInputChange}
                            placeholder="Section description"
                            rows="4"
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                          />
                        </div>

                        {/* Design Section - Padding */}
                        <div className="border-t-2 border-gray-300 pt-5 mt-2">
                          <h5 className="text-lg font-bold text-gray-900 mb-4">Design Settings</h5>
                          
                          {/* Padding Y Option */}
                          <div className="mb-4">
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Section Padding (Vertical)</label>
                            <select
                              name="paddingY"
                              value={newSection.paddingY}
                              onChange={handleNewInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                            >
                              <option value="compact">Compact (py-8 / 2rem)</option>
                              <option value="comfortable">Comfortable (py-12 / 3rem)</option>
                              <option value="spacious">Spacious (py-20 / 5rem)</option>
                              <option value="extra-spacious">Extra Spacious (py-32 / 8rem)</option>
                            </select>
                          </div>

                          {/* Alignment Options */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {newSection.img && (
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Image Position</label>
                                <select
                                  name="align"
                                  value={newSection.align}
                                  onChange={handleNewInputChange}
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                                >
                                  <option value="left">Image Left - Content Right</option>
                                  <option value="right">Image Right - Content Left</option>
                                </select>
                              </div>
                            )}
                            <div>
                              <label className="block text-sm font-semibold text-gray-800 mb-2">Text Alignment</label>
                              <select
                                name="textAlign"
                                value={newSection.textAlign}
                                onChange={handleNewInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white"
                              >
                                <option value="left">Left Aligned</option>
                                <option value="center">Center Aligned</option>
                                <option value="right">Right Aligned</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* Button & Link */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Button Text</label>
                            <input
                              type="text"
                              name="button"
                              value={newSection.button}
                              onChange={handleNewInputChange}
                              placeholder="Button label"
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-800 mb-2">Button Link</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                name="buttonLink"
                                value={newSection.buttonLink}
                                onChange={handleNewInputChange}
                                placeholder="/page-url or https://..."
                                className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                              />
                              <button
                                onClick={() => {
                                  setLinkSelectorTarget('newSection');
                                  setOpenInNewTab(newSection.buttonTarget === '_blank');
                                  setShowLinkSelector(true);
                                }}
                                className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                                title="Select Page Link"
                              >
                                <Link size={18} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Image */}
                        <div>
                          <label className="block text-sm font-semibold text-gray-800 mb-2">Image</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              name="img"
                              value={newSection.img}
                              onChange={handleNewInputChange}
                              placeholder="Image URL"
                              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                            />
                            <button
                              onClick={() => {
                                setMediaLibraryTarget('newSection');
                                setShowMediaLibrary(true);
                              }}
                              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                              title="Choose from Media Library"
                            >
                              <Image size={18} />
                            </button>
                          </div>
                        </div>

                        {/* Background Section */}
                        <div className="border-t-2 border-gray-300 pt-5 mt-2">
                          <div className="flex items-center justify-between mb-3">
                            <label className="block text-sm font-semibold text-gray-800">Section Background</label>
                            {newSection.bgType !== 'none' && (
                              <button
                                type="button"
                                onClick={() => {
                                  setNewSection(prev => ({
                                    ...prev,
                                    bgType: 'none',
                                    bgImage: '',
                                    bgImageUrl: '',
                                    bgColor: '',
                                    bgThemeColor: ''
                                  }));
                                }}
                                className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                              >
                                Reset Background
                              </button>
                            )}
                          </div>
                          
                          {/* Background Type Dropdown */}
                          <div className="mb-4">
                            <select
                              name="bgType"
                              value={newSection.bgType}
                              onChange={handleNewInputChange}
                              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-white font-medium"
                            >
                              <option value="none">No Background</option>
                              <option value="image">Image Background</option>
                              <option value="customColor">Custom Color</option>
                              <option value="themeColor">Theme Color</option>
                            </select>
                          </div>

                          {/* Background Preview */}
                          {newSection.bgType !== 'none' && (
                            <div className="mb-4 p-4 rounded-lg border-2 border-gray-300 bg-white">
                              <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
                              <div 
                                className="w-full h-24 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                                style={
                                  newSection.bgType === 'image' && (newSection.bgImage || newSection.bgImageUrl)
                                    ? {
                                        backgroundImage: `url('${newSection.bgImage || newSection.bgImageUrl}')`,
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                      }
                                    : newSection.bgType === 'customColor' && newSection.bgColor
                                    ? { backgroundColor: newSection.bgColor }
                                    : newSection.bgType === 'themeColor' && newSection.bgThemeColor && themeColors[newSection.bgThemeColor]
                                    ? { backgroundColor: themeColors[newSection.bgThemeColor] }
                                    : { backgroundColor: '#f5f5f5' }
                                }
                              >
                                <span className="text-xs font-medium text-white bg-black/50 px-3 py-1 rounded">
                                  Section Background Preview
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Image Background Options */}
                          {newSection.bgType === 'image' && (
                            <div className="space-y-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Choose File</label>
                                <button
                                  onClick={() => {
                                    setMediaLibraryTarget('newSectionBg');
                                    setShowMediaLibrary(true);
                                  }}
                                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                >
                                  <Image size={18} />
                                  <span>Choose from Media Library</span>
                                </button>
                                {newSection.bgImage && (
                                  <p className="text-xs text-green-600 mt-2 font-medium">✓ Image selected</p>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-gray-300"></div>
                                <span className="text-xs font-semibold text-gray-500">OR</span>
                                <div className="flex-1 h-px bg-gray-300"></div>
                              </div>
                              
                              <div>
                                <label className="block text-xs font-semibold text-gray-700 mb-2">Image URL</label>
                                <input
                                  type="text"
                                  name="bgImageUrl"
                                  value={newSection.bgImageUrl}
                                  onChange={handleNewInputChange}
                                  placeholder="https://example.com/image.jpg"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                />
                              </div>
                            </div>
                          )}

                          {/* Custom Color Option */}
                          {newSection.bgType === 'customColor' && (
                            <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                              <label className="block text-xs font-semibold text-gray-700 mb-2">Pick Color</label>
                              <div className="flex gap-3 items-center">
                                <input
                                  type="color"
                                  name="bgColor"
                                  value={newSection.bgColor || '#ffffff'}
                                  onChange={handleNewInputChange}
                                  className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                />
                                <input
                                  type="text"
                                  name="bgColor"
                                  value={newSection.bgColor || '#ffffff'}
                                  onChange={handleNewInputChange}
                                  placeholder="#ffffff"
                                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono uppercase"
                                  maxLength={7}
                                />
                              </div>
                            </div>
                          )}

                          {/* Theme Color Option */}
                          {newSection.bgType === 'themeColor' && (
                            <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                              <label className="block text-xs font-semibold text-gray-700 mb-2">Select Theme Color</label>
                              <select
                                name="bgThemeColor"
                                value={newSection.bgThemeColor}
                                onChange={handleNewInputChange}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white font-medium"
                              >
                                <option value="">Choose a theme color...</option>
                                {Object.entries(themeColors).map(([colorKey, colorValue]) => (
                                  <option key={colorKey} value={colorKey}>
                                    bg-{colorKey} ({colorValue})
                                  </option>
                                ))}
                              </select>
                              {newSection.bgThemeColor && themeColors[newSection.bgThemeColor] && (
                                <div className="mt-3 p-3 bg-white rounded-lg border-2 border-indigo-300 flex items-center gap-3">
                                  <div
                                    className="w-12 h-12 rounded-md border-2 border-gray-300 shadow-sm"
                                    style={{ backgroundColor: themeColors[newSection.bgThemeColor] }}
                                  ></div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">bg-{newSection.bgThemeColor}</p>
                                    <p className="text-xs text-gray-600 font-mono">{themeColors[newSection.bgThemeColor]}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                          <button
                            onClick={handleAddSectionToPage}
                            className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all shadow-md hover:shadow-lg font-semibold"
                          >
                            <Save size={18} />
                            <span>Save Section</span>
                          </button>
                          <button
                            onClick={() => {
                              setIsAddingSectionInModal(false);
                              setNewSection({ 
                                heading: '', 
                                subheading: '', 
                                description: '', 
                                button: '', 
                                buttonLink: '', 
                                img: '', 
                                align: 'left', 
                                textAlign: 'left',
                                bgType: 'none',
                                bgImage: '',
                                bgImageUrl: '',
                                bgColor: '',
                                bgThemeColor: '',
                                paddingY: 'comfortable'
                              });
                            }}
                            className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                          >
                            <X size={18} />
                            <span>Cancel</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sections List */}
                  {getPageSections(viewingPageSections).length === 0 && !isAddingSectionInModal ? (
                    <div className="text-center py-12">
                      <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No sections found for this page</p>
                      <p className="text-sm text-gray-500 mt-2">Click "Add Section" to create your first section</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {sections.map((section, idx) => {
                        if (section.pageId !== viewingPageSections) return null;
                        
                        return editingSectionInModal === idx ? (
                          <div key={idx} className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-lg">
                            <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                              <Edit2 className="text-blue-600" size={24} />
                              Edit Section
                            </h4>
                            <div className="space-y-5">
                              {/* Heading & Subheading */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-800 mb-2">Heading *</label>
                                  <input
                                    type="text"
                                    name="heading"
                                    value={editForm.heading || ''}
                                    onChange={handleInputChange}
                                    placeholder="Main heading"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-800 mb-2">Subheading</label>
                                  <input
                                    type="text"
                                    name="subheading"
                                    value={editForm.subheading || ''}
                                    onChange={handleInputChange}
                                    placeholder="Optional subheading"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>
                              </div>

                              {/* Description */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Description</label>
                                <textarea
                                  name="description"
                                  value={editForm.description || ''}
                                  onChange={handleInputChange}
                                  placeholder="Section description"
                                  rows="4"
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                />
                              </div>

                              {/* Button & Link */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-semibold text-gray-800 mb-2">Button Text</label>
                                  <input
                                    type="text"
                                    name="button"
                                    value={editForm.button || ''}
                                    onChange={handleInputChange}
                                    placeholder="Button label"
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-semibold text-gray-800 mb-2">Button Link</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="text"
                                      name="buttonLink"
                                      value={editForm.buttonLink || ''}
                                      onChange={handleInputChange}
                                      placeholder="/page-url or https://..."
                                      className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    />
                                    <button
                                      onClick={() => {
                                        setLinkSelectorTarget('editSection');
                                        setOpenInNewTab(editForm.buttonTarget === '_blank');
                                        setShowLinkSelector(true);
                                      }}
                                      className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                                      title="Select Page Link"
                                    >
                                      <Link size={18} />
                                    </button>
                                  </div>
                                </div>
                              </div>

                              {/* Image */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Image</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    name="img"
                                    value={editForm.img || ''}
                                    onChange={handleInputChange}
                                    placeholder="Image URL"
                                    className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                  />
                                  <button
                                    onClick={() => {
                                      setMediaLibraryTarget('editSection');
                                      setShowMediaLibrary(true);
                                    }}
                                    className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg"
                                    title="Choose from Media Library"
                                  >
                                    <Image size={18} />
                                  </button>
                                </div>
                              </div>

                              {/* Background Section */}
                              <div className="border-t-2 border-gray-300 pt-5 mt-2">
                                <div className="flex items-center justify-between mb-3">
                                  <label className="block text-sm font-semibold text-gray-800">Section Background</label>
                                  {editForm.bgType && editForm.bgType !== 'none' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setEditForm(prev => ({
                                          ...prev,
                                          bgType: 'none',
                                          bgImage: '',
                                          bgImageUrl: '',
                                          bgColor: '',
                                          bgThemeColor: ''
                                        }));
                                      }}
                                      className="text-xs px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                    >
                                      Reset Background
                                    </button>
                                  )}
                                </div>
                                
                                {/* Background Type Dropdown */}
                                <div className="mb-4">
                                  <select
                                    name="bgType"
                                    value={editForm.bgType || 'none'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white font-medium"
                                  >
                                    <option value="none">No Background</option>
                                    <option value="image">Image Background</option>
                                    <option value="customColor">Custom Color</option>
                                    <option value="themeColor">Theme Color</option>
                                  </select>
                                </div>

                                {/* Background Preview */}
                                {editForm.bgType && editForm.bgType !== 'none' && (
                                  <div className="mb-4 p-4 rounded-lg border-2 border-gray-300 bg-white">
                                    <p className="text-xs font-semibold text-gray-700 mb-2">Preview:</p>
                                    <div 
                                      className="w-full h-24 rounded-lg border-2 border-gray-200 flex items-center justify-center"
                                      style={
                                        editForm.bgType === 'image' && (editForm.bgImage || editForm.bgImageUrl)
                                          ? {
                                              backgroundImage: `url('${editForm.bgImage || editForm.bgImageUrl}')`,
                                              backgroundSize: 'cover',
                                              backgroundPosition: 'center'
                                            }
                                          : editForm.bgType === 'customColor' && editForm.bgColor
                                          ? { backgroundColor: editForm.bgColor }
                                          : editForm.bgType === 'themeColor' && editForm.bgThemeColor && themeColors[editForm.bgThemeColor]
                                          ? { backgroundColor: themeColors[editForm.bgThemeColor] }
                                          : { backgroundColor: '#f5f5f5' }
                                      }
                                    >
                                      <span className="text-xs font-medium text-white bg-black/50 px-3 py-1 rounded">
                                        Section Background Preview
                                      </span>
                                    </div>
                                  </div>
                                )}

                                {/* Image Background Options */}
                                {editForm.bgType === 'image' && (
                                  <div className="space-y-3 p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-2">Choose File</label>
                                      <button
                                        onClick={() => {
                                          setMediaLibraryTarget('editSectionBg');
                                          setShowMediaLibrary(true);
                                        }}
                                        className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                                      >
                                        <Image size={18} />
                                        <span>Choose from Media Library</span>
                                      </button>
                                      {editForm.bgImage && (
                                        <p className="text-xs text-green-600 mt-2 font-medium">✓ Image selected</p>
                                      )}
                                    </div>
                                    
                                    <div className="flex items-center gap-3">
                                      <div className="flex-1 h-px bg-gray-300"></div>
                                      <span className="text-xs font-semibold text-gray-500">OR</span>
                                      <div className="flex-1 h-px bg-gray-300"></div>
                                    </div>
                                    
                                    <div>
                                      <label className="block text-xs font-semibold text-gray-700 mb-2">Image URL</label>
                                      <input
                                        type="text"
                                        name="bgImageUrl"
                                        value={editForm.bgImageUrl || ''}
                                        onChange={handleInputChange}
                                        placeholder="https://example.com/image.jpg"
                                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Custom Color Option */}
                                {editForm.bgType === 'customColor' && (
                                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Pick Color</label>
                                    <div className="flex gap-3 items-center">
                                      <input
                                        type="color"
                                        name="bgColor"
                                        value={editForm.bgColor || '#ffffff'}
                                        onChange={handleInputChange}
                                        className="w-20 h-12 rounded-lg border-2 border-gray-300 cursor-pointer"
                                      />
                                      <input
                                        type="text"
                                        name="bgColor"
                                        value={editForm.bgColor || '#ffffff'}
                                        onChange={handleInputChange}
                                        placeholder="#ffffff"
                                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-mono uppercase"
                                        maxLength={7}
                                      />
                                    </div>
                                  </div>
                                )}

                                {/* Theme Color Option */}
                                {editForm.bgType === 'themeColor' && (
                                  <div className="p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
                                    <label className="block text-xs font-semibold text-gray-700 mb-2">Select Theme Color</label>
                                    <select
                                      name="bgThemeColor"
                                      value={editForm.bgThemeColor || ''}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white font-medium"
                                    >
                                      <option value="">Choose a theme color...</option>
                                      {Object.entries(themeColors).map(([colorKey, colorValue]) => (
                                        <option key={colorKey} value={colorKey}>
                                          bg-{colorKey} ({colorValue})
                                        </option>
                                      ))}
                                    </select>
                                    {editForm.bgThemeColor && themeColors[editForm.bgThemeColor] && (
                                      <div className="mt-3 p-3 bg-white rounded-lg border-2 border-indigo-300 flex items-center gap-3">
                                        <div
                                          className="w-12 h-12 rounded-md border-2 border-gray-300 shadow-sm"
                                          style={{ backgroundColor: themeColors[editForm.bgThemeColor] }}
                                        ></div>
                                        <div>
                                          <p className="text-sm font-bold text-gray-900">bg-{editForm.bgThemeColor}</p>
                                          <p className="text-xs text-gray-600 font-mono">{themeColors[editForm.bgThemeColor]}</p>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>

                              {/* Alignment Options */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {editForm.img && (
                                  <div>
                                    <label className="block text-sm font-semibold text-gray-800 mb-2">Image Position</label>
                                    <select
                                      name="align"
                                      value={editForm.align || 'left'}
                                      onChange={handleInputChange}
                                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                    >
                                      <option value="left">Image Left - Content Right</option>
                                      <option value="right">Image Right - Content Left</option>
                                    </select>
                                  </div>
                                )}
                                <div>
                                  <label className="block text-sm font-semibold text-gray-800 mb-2">Text Alignment</label>
                                  <select
                                    name="textAlign"
                                    value={editForm.textAlign || 'left'}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                  >
                                    <option value="left">Left Aligned</option>
                                    <option value="center">Center Aligned</option>
                                    <option value="right">Right Aligned</option>
                                  </select>
                                </div>
                              </div>

                              {/* Padding Y Option */}
                              <div>
                                <label className="block text-sm font-semibold text-gray-800 mb-2">Section Padding (Vertical)</label>
                                <select
                                  name="paddingY"
                                  value={editForm.paddingY || 'comfortable'}
                                  onChange={handleInputChange}
                                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                                >
                                  <option value="compact">Compact (py-8 / 2rem)</option>
                                  <option value="comfortable">Comfortable (py-12 / 3rem)</option>
                                  <option value="spacious">Spacious (py-20 / 5rem)</option>
                                  <option value="extra-spacious">Extra Spacious (py-32 / 8rem)</option>
                                </select>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex gap-3 pt-4">
                                <button
                                  onClick={handleSaveSectionInModal}
                                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all shadow-md hover:shadow-lg font-semibold"
                                >
                                  <Save size={18} />
                                  <span>Save Changes</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setEditingSectionInModal(null);
                                    setEditForm({});
                                  }}
                                  className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
                                >
                                  <X size={18} />
                                  <span>Cancel</span>
                                </button>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div 
                            key={idx} 
                            draggable
                            onDragStart={(e) => handleDragStart(e, idx)}
                            onDragOver={(e) => handleDragOver(e, idx)}
                            onDrop={(e) => handleDrop(e, idx)}
                            onDragEnd={handleDragEnd}
                            className={`border-2 rounded-xl p-5 hover:shadow-xl transition-all ${
                              draggedIndex === idx ? 'opacity-50' : ''
                            } ${
                              section.hidden 
                                ? 'bg-gray-100 border-gray-300 opacity-60' 
                                : 'bg-white border-gray-200'
                            }`}
                          >
                            <div className="flex gap-3">
                              {/* Drag Handle */}
                              <div className="shrink-0 cursor-move hover:bg-gray-100 rounded p-1 transition-colors" title="Drag to reorder">
                                <GripVertical size={20} className="text-gray-400" />
                              </div>
                              
                              <div className="shrink-0">
                                {section.img && (
                                  <img 
                                    src={section.img} 
                                    alt={section.heading}
                                    className="w-28 h-28 object-cover rounded-xl shadow-md"
                                  />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-3">
                                  <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-700">
                                    #{sections.filter(s => s.pageId === viewingPageSections).indexOf(section) + 1}
                                  </span>
                                  {section.hidden && (
                                    <span className="text-xs font-semibold px-3 py-1 rounded-full bg-red-100 text-red-700 flex items-center gap-1">
                                      <EyeOff size={12} />
                                      Hidden
                                    </span>
                                  )}
                                  {section.img && (
                                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                      section.align === 'left' 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-purple-100 text-purple-700'
                                    }`}>
                                      {section.align === 'left' ? 'Image Left' : 'Image Right'}
                                    </span>
                                  )}
                                </div>
                                <h4 className="text-xl font-bold text-gray-900 mb-1">{section.heading}</h4>
                                {section.subheading && (
                                  <p className="text-sm font-medium text-gray-600 mb-2">{section.subheading}</p>
                                )}
                                {section.description && (
                                  <p className="text-sm text-gray-600 mt-2 line-clamp-2">{section.description}</p>
                                )}
                                <div className="flex flex-wrap gap-2 mt-3">
                                  {section.button && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                                      <Type size={12} />
                                      {section.button}
                                    </span>
                                  )}
                                  {section.buttonLink && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full font-medium">
                                      <Link size={12} />
                                      {section.buttonLink}
                                    </span>
                                  )}
                                  {section.buttonTarget === '_blank' && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-medium">
                                      <Eye size={12} />
                                      Opens in New Tab
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div className="flex flex-col gap-2 items-center">
                                {/* Visibility Control Label */}
                                <span className="text-xs font-semibold text-gray-600">Visibility</span>
                                <button
                                  onClick={() => handleToggleSectionVisibility(idx)}
                                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    section.hidden === true ? 'bg-green-500' : 'bg-gray-300'
                                  }`}
                                  title={section.hidden === true ? 'ON - Section is HIDDEN. Click to turn OFF and SHOW it.' : 'OFF - Section is SHOWING. Click to turn ON and HIDE it.'}
                                >
                                  <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                      section.hidden === true ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                                <span className="text-xs font-medium text-gray-700">
                                  {section.hidden === true ? 'ON' : 'OFF'}
                                </span>
                                <button
                                  onClick={() => handleDuplicateSection(idx)}
                                  className="p-3 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors shadow-sm hover:shadow-md"
                                  title="Duplicate Section"
                                >
                                  <Copy size={20} />
                                </button>
                                <button
                                  onClick={() => handleEditSectionInModal(section, idx)}
                                  className="p-3 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors shadow-sm hover:shadow-md"
                                  title="Edit Section"
                                >
                                  <Edit2 size={20} />
                                </button>
                                <button
                                  onClick={() => handleDeleteSectionInModal(idx)}
                                  className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors shadow-sm hover:shadow-md"
                                  title="Delete Section"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Link Selector Popup */}
          {showLinkSelector && (
            <div className="fixed inset-0 bg-black/60 z-[70] flex items-center justify-center p-4" onClick={() => {
              setShowLinkSelector(false);
              setLinkSelectorTarget(null);
              setCustomUrl('');
              setOpenInNewTab(false);
            }}>
              <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                      <Link className="text-blue-600" size={28} />
                      Select Button Link
                    </h3>
                    <button
                      onClick={() => {
                        setShowLinkSelector(false);
                        setLinkSelectorTarget(null);
                        setCustomUrl('');
                        setOpenInNewTab(false);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  
                  {/* Tabs */}
                  <div className="flex gap-2 border-b border-gray-200">
                    <button
                      onClick={() => setLinkSelectorTab('pages')}
                      className={`px-6 py-3 font-semibold transition-all ${
                        linkSelectorTab === 'pages'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Page Links
                    </button>
                    <button
                      onClick={() => setLinkSelectorTab('custom')}
                      className={`px-6 py-3 font-semibold transition-all ${
                        linkSelectorTab === 'custom'
                          ? 'text-blue-600 border-b-2 border-blue-600'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Custom URL
                    </button>
                  </div>
                  
                  {/* Open in New Tab Checkbox */}
                  <div className="mt-4 p-3 bg-blue-50 border-2 border-blue-200 rounded-lg">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={openInNewTab}
                        onChange={(e) => setOpenInNewTab(e.target.checked)}
                        className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer"
                      />
                      <span className="text-sm font-semibold text-gray-800">
                        Open link in new tab
                      </span>
                    </label>
                  </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                  {linkSelectorTab === 'pages' ? (
                    <div className="space-y-3">
                      {pages.length === 0 ? (
                        <div className="text-center py-12">
                          <FileText size={48} className="mx-auto mb-4 text-gray-400" />
                          <p className="text-gray-600">No pages created yet</p>
                        </div>
                      ) : (
                        pages.map((page, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSelectLink(page.slug)}
                            className="w-full p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border-2 border-blue-200 rounded-lg transition-all text-left group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-semibold text-gray-900 text-lg">{page.name}</h4>
                                <p className="text-sm text-blue-600 font-mono mt-1">{page.slug}</p>
                              </div>
                              <div className="text-blue-600 group-hover:translate-x-1 transition-transform">
                                <Link size={20} />
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">Enter Custom URL</label>
                        <input
                          type="text"
                          value={customUrl}
                          onChange={(e) => setCustomUrl(e.target.value)}
                          placeholder="https://example.com or /custom-page"
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Enter a full URL (https://...) or a relative path (/page)
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (customUrl.trim()) {
                            handleSelectLink(customUrl);
                          } else {
                            alert('Please enter a URL');
                          }
                        }}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-md hover:shadow-lg"
                      >
                        Use This URL
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Media Library Popup */}
          {showMediaLibrary && (
            <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => {
              setShowMediaLibrary(false);
              setMediaLibraryTarget(null);
            }}>
              <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-xl font-semibold text-gray-900">Select Image</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        // Check if any image is selected (either through checkbox or direct selection)
                        const hasSelection = (mediaLibraryTarget === 'newSection' && newSection.img) ||
                                           (mediaLibraryTarget === 'editSection' && editForm.img) ||
                                           (mediaLibraryTarget === 'newSectionBg' && newSection.bgImage) ||
                                           (mediaLibraryTarget === 'editSectionBg' && editForm.bgImage);
                        
                        if (hasSelection) {
                          setShowMediaLibrary(false);
                          setMediaLibraryTarget(null);
                        } else {
                          alert('Please check the checkbox and click on an image to select it');
                        }
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                      title="Insert Selected Image"
                    >
                      Insert Image
                    </button>
                    <button
                      onClick={() => {
                        setShowMediaLibrary(false);
                        setMediaLibraryTarget(null);
                      }}
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Close"
                    >
                      <X size={20} />
                    </button>
                  </div>
                </div>
                <div className="p-4 overflow-y-auto flex-1">
                  <MediaLibrary onSelect={handleSelectImageFromMedia} />
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }

    if (activeTab === 'media') {
      return (
        <div className="w-full max-w-7xl p-6">
          <MediaLibrary
            onSelect={(url) => {
              console.log('Selected image URL:', url);
              const updated = [...sections];
              if (updated[0]) {
                updated[0].img = url;
                setSections(updated);
                saveToJson(updated);
              }
            }}
          />
        </div>
      );
    }

    if (activeTab === 'theme') {
      return (
        <div className="w-full max-w-7xl p-6">
          <ThemeManager />
        </div>
      );
    }

    if (activeTab === 'typography') {
      return (
        <div className="w-full max-w-7xl p-6">
          <TypographyManager />
        </div>
      );
    }

    if (activeTab === 'logo') {
      return (
        <div className="w-full max-w-4xl p-6">
          <LogoManager />
        </div>
      );
    }

    if (activeTab === 'header') {
      return <HeaderManager />;
    }

    if (activeTab === 'footer') {
      return <FooterManager />;
    }

    if (activeTab === 'menus') {
      return <MenuManager />;
    }

    if (activeTab === 'settings') {
      return <SettingsManager />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar - Fixed width, no scroll */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col h-screen">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
        </div>

        {/* Navigation - Single column vertical layout */}
        <nav className="flex-1 p-3 overflow-y-auto">
          <div className="space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex flex-col items-center justify-center py-3 px-2 rounded-lg transition-all ${
                  activeTab === item.id
                    ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon size={24} />
                <span className="text-xs mt-2 font-medium text-center">{item.label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
              <span className="text-xs font-medium text-gray-700">Admin</span>
            </div>
            <button className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="min-h-full flex items-start justify-center p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
