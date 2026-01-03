'use client';

import { useState, useEffect } from 'react';
import { Home, Trash2, ChevronDown, ChevronUp, Plus, GripVertical } from 'lucide-react';
import { showDemoMessage, DEMO_MODE } from '../../../utils/demoMode';

export default function MenuManager() {
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [customLink, setCustomLink] = useState({ label: '', url: '' });
  const [message, setMessage] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [mounted, setMounted] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);

  useEffect(() => {
    setMounted(true);
    document.body.classList.add('dashboard-page');
    loadMenuItems();
    loadPages();
    
    return () => {
      document.body.classList.remove('dashboard-page');
    };
  }, []);

  const loadPages = async () => {
    try {
      const response = await fetch('/api/pages');
      const data = await response.json();
      setPages(data.filter(p => p.status === 'published'));
    } catch (error) {
      console.log('No pages found');
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await fetch('/api/menus');
      const data = await response.json();
      // Use first menu or create default
      const menu = data[0] || { items: [] };
      const items = (menu.items || []).map(item => ({
        ...item,
        parentId: item.parentId || null // Default to null if not specified
      }));
      setMenuItems(items);
      // Expand all items by default
      const expanded = {};
      items.forEach(item => {
        if (getChildren(item.id, items).length > 0) {
          expanded[item.id] = true;
        }
      });
      setExpandedItems(expanded);
    } catch (error) {
      setMenuItems([]);
    }
  };

  const saveMenuItems = async (items) => {
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    try {
      const response = await fetch('/api/menus');
      const data = await response.json();
      const menus = data.length > 0 ? data : [{ id: 'menu_main', name: 'Main Menu', items: [] }];
      
      // Clean up items - only store non-default values
      const cleanedItems = items.map(item => {
        const cleaned = {
          id: item.id,
          label: item.label,
          url: item.url
        };
        
        // Only add parentId if it exists (default is null/no parent)
        if (item.parentId) {
          cleaned.parentId = item.parentId;
        }
        
        return cleaned;
      });
      
      menus[0].items = cleanedItems;
      
      await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menus),
      });
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const addPageToMenu = async (page) => {
    const item = {
      id: `item_${Date.now()}`,
      label: page.name,
      url: page.slug,
      parentId: null
    };

    const updated = [...menuItems, item];
    await saveMenuItems(updated);
    setMenuItems(updated);
    showMessage('Page added!');
  };

  const addCustomLink = async () => {
    if (!customLink.label || !customLink.url) {
      alert('Please fill in both label and URL');
      return;
    }

    const item = {
      id: `item_${Date.now()}`,
      label: customLink.label,
      url: customLink.url,
      parentId: null
    };

    const updated = [...menuItems, item];
    await saveMenuItems(updated);
    setMenuItems(updated);
    setCustomLink({ label: '', url: '' });
    showMessage('Link added!');
  };

  const deleteItem = async (id) => {
    const updated = menuItems.filter(item => item.id !== id && item.parentId !== id);
    await saveMenuItems(updated);
    setMenuItems(updated);
  };



  const makeSubmenu = async (itemId, parentId) => {
    const updated = menuItems.map(item =>
      item.id === itemId ? { ...item, parentId } : item
    );
    await saveMenuItems(updated);
    setMenuItems(updated);
    setExpandedItems(prev => ({ ...prev, [parentId]: true }));
    showMessage('Moved to submenu!');
  };

  const showMessage = (text) => {
    setMessage(text);
    setTimeout(() => setMessage(''), 2000);
  };

  const getTopLevel = () => menuItems.filter(item => !item.parentId);
  const getChildren = (parentId, items = menuItems) => items.filter(item => item.parentId === parentId);

  const reorderItems = async (draggedId, targetId, position) => {
    const draggedIndex = menuItems.findIndex(item => item.id === draggedId);
    const targetIndex = menuItems.findIndex(item => item.id === targetId);
    
    if (draggedIndex === -1 || targetIndex === -1) return;
    
    const newItems = [...menuItems];
    const [removed] = newItems.splice(draggedIndex, 1);
    const newTargetIndex = newItems.findIndex(item => item.id === targetId);
    
    if (position === 'before') {
      newItems.splice(newTargetIndex, 0, removed);
    } else {
      newItems.splice(newTargetIndex + 1, 0, removed);
    }
    
    await saveMenuItems(newItems);
    setMenuItems(newItems);
    showMessage('Menu reordered!');
  };

  const addSubmenu = async (parentId, label, url) => {
    const item = {
      id: `item_${Date.now()}`,
      label,
      url,
      parentId
    };

    const updated = [...menuItems, item];
    await saveMenuItems(updated);
    setMenuItems(updated);
    setExpandedItems(prev => ({ ...prev, [parentId]: true }));
    showMessage('Submenu added!');
  };

  const MenuItem = ({ item, level = 0 }) => {
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedItems[item.id] !== false;
    const [showSubmenuForm, setShowSubmenuForm] = useState(false);
    const [submenuData, setSubmenuData] = useState({ label: '', url: '' });
    const [dragOver, setDragOver] = useState(null);

    const handleAddSubmenu = () => {
      if (!submenuData.label || !submenuData.url) {
        alert('Please fill in both label and URL');
        return;
      }
      addSubmenu(item.id, submenuData.label, submenuData.url);
      setSubmenuData({ label: '', url: '' });
      setShowSubmenuForm(false);
    };

    const handleDragStart = (e) => {
      setDraggedItem(item.id);
      e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      
      const rect = e.currentTarget.getBoundingClientRect();
      const midpoint = rect.top + rect.height / 2;
      const position = e.clientY < midpoint ? 'before' : 'after';
      setDragOver(position);
    };

    const handleDragLeave = () => {
      setDragOver(null);
    };

    const handleDrop = (e) => {
      e.preventDefault();
      if (draggedItem && draggedItem !== item.id) {
        reorderItems(draggedItem, item.id, dragOver);
      }
      setDragOver(null);
      setDraggedItem(null);
    };

    const handleDragEnd = () => {
      setDraggedItem(null);
      setDragOver(null);
    };

    return (
      <div className={`${level > 0 ? 'ml-8 mt-1' : 'mt-2'}`}>
        <div 
          draggable
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onDragEnd={handleDragEnd}
          className={`flex items-center justify-between p-3 border rounded cursor-move transition-all bg-white ${
            draggedItem === item.id ? 'opacity-50' : ''
          } ${dragOver === 'before' ? 'border-t-4 border-t-blue-500' : ''} ${
            dragOver === 'after' ? 'border-b-4 border-b-blue-500' : ''}`}
        >
          <div className="flex items-center gap-3 flex-1">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing" />
            {hasChildren ? (
              <button
                onClick={() => setExpandedItems(prev => ({ ...prev, [item.id]: !isExpanded }))}
                className="text-gray-600"
              >
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            ) : (
              <Home className="w-4 h-4 text-gray-400" />
            )}
            <div className="flex-1">
              <div className="font-medium text-sm">{item.label}</div>
              <div className="text-xs text-gray-500">{item.url}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowSubmenuForm(!showSubmenuForm)}
              className="p-1 hover:bg-blue-100 rounded"
              title="Add submenu"
            >
              <Plus className="w-4 h-4 text-blue-600" />
            </button>
            <button
              onClick={() => deleteItem(item.id)}
              className="p-1 hover:bg-red-100 rounded"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        </div>

        {/* Submenu Form */}
        {showSubmenuForm && (
          <div className="ml-8 mt-2 p-3 bg-blue-50 border border-blue-200 rounded">
            <div className="text-xs font-semibold text-gray-700 mb-2">Add Submenu</div>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Label"
                value={submenuData.label}
                onChange={(e) => setSubmenuData({...submenuData, label: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="URL"
                value={submenuData.url}
                onChange={(e) => setSubmenuData({...submenuData, url: e.target.value})}
                className="w-full px-2 py-1 border rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddSubmenu}
                  className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowSubmenuForm(false);
                    setSubmenuData({ label: '', url: '' });
                  }}
                  className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-xs hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {hasChildren && isExpanded && (
          <div>
            {children.map(child => (
              <MenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Menus</h1>
          {message && (
            <div className="px-4 py-2 bg-green-100 text-green-800 rounded">
              {message}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - Pages */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3 text-gray-700">Pages</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {pages.length === 0 ? (
                <p className="text-sm text-gray-500">No pages available</p>
              ) : (
                pages.map(page => (
                  <div key={page.id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                    <span className="text-sm">{page.name}</span>
                    <button
                      onClick={() => addPageToMenu(page)}
                      className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Middle Column - Custom Links */}
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-3 text-gray-700">Custom Links</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Label</label>
                <input
                  type="text"
                  placeholder="Menu Label"
                  value={customLink.label}
                  onChange={(e) => setCustomLink({...customLink, label: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">URL</label>
                <input
                  type="text"
                  placeholder="/page-url"
                  value={customLink.url}
                  onChange={(e) => setCustomLink({...customLink, url: e.target.value})}
                  className="w-full px-3 py-2 border rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={addCustomLink}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add to Menu
              </button>
            </div>
          </div>

          {/* Right Column - Menu Structure */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow p-4">
            <h3 className="font-semibold mb-4 text-gray-700">Menu Structure</h3>
            {menuItems.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No menu items yet</p>
                <p className="text-sm mt-1">Add pages or custom links from the left</p>
              </div>
            ) : (
              <div className="space-y-1">
                {getTopLevel().map(item => (
                  <MenuItem key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
