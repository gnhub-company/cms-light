'use client';

import { useState, useEffect } from 'react';
import { Home, Trash2, ChevronDown, ChevronUp, Plus, GripVertical, Edit2, Save, X, Menu } from 'lucide-react';
import { showDemoMessage, DEMO_MODE } from '../utils/demoMode';

export default function MenuManager() {
  const [menus, setMenus] = useState([]);
  const [currentMenuId, setCurrentMenuId] = useState('menu_main');
  const [menuItems, setMenuItems] = useState([]);
  const [pages, setPages] = useState([]);
  const [customLink, setCustomLink] = useState({ label: '', url: '' });
  const [message, setMessage] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [mounted, setMounted] = useState(false);
  const [draggedItem, setDraggedItem] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [editForm, setEditForm] = useState({ label: '', url: '' });
  const [addingSubmenu, setAddingSubmenu] = useState(null);
  const [submenuForm, setSubmenuForm] = useState({ label: '', url: '' });
  const [newMenuName, setNewMenuName] = useState('');
  const [headerMenuId, setHeaderMenuId] = useState('');

  useEffect(() => {
    setMounted(true);
    loadPages();
    loadHeaderMenuSetting();
  }, []);

  const loadHeaderMenuSetting = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setHeaderMenuId(data.selectedMenuId || '');
    } catch (error) {
      console.log('No header menu setting found');
    }
  };

  useEffect(() => {
    if (mounted) {
      loadMenuItems();
    }
  }, [currentMenuId, mounted]);

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
      setMenus(data.length > 0 ? data : [{ id: 'menu_main', name: 'Main Menu', items: [] }]);
      
      const currentMenu = data.find(m => m.id === currentMenuId) || data[0] || { items: [] };
      
      // Convert nested structure (with children arrays) to flat structure for editing
      const flattenItems = (items, parentId = null) => {
        let flat = [];
        items.forEach(item => {
          flat.push({
            id: item.id,
            label: item.label,
            url: item.url,
            parentId: parentId
          });
          if (item.children && item.children.length > 0) {
            flat = flat.concat(flattenItems(item.children, item.id));
          }
        });
        return flat;
      };
      
      const items = flattenItems(currentMenu.items || []);
      setMenuItems(items);
      
      const expanded = {};
      items.forEach(item => {
        if (getChildren(item.id, items).length > 0) {
          expanded[item.id] = true;
        }
      });
      setExpandedItems(expanded);
    } catch (error) {
      setMenuItems([]);
      setMenus([{ id: 'menu_main', name: 'Main Menu', items: [] }]);
    }
  };

  const saveMenuItems = async (items) => {
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    try {
      // Convert flat structure to nested structure with children arrays
      const buildNestedStructure = (items) => {
        const topLevel = items.filter(item => !item.parentId);
        
        const addChildren = (parent) => {
          const children = items.filter(item => item.parentId === parent.id);
          if (children.length > 0) {
            parent.children = children.map(child => {
              const nestedChild = {
                id: child.id,
                label: child.label,
                url: child.url
              };
              // Recursively add children
              const grandChildren = items.filter(item => item.parentId === child.id);
              if (grandChildren.length > 0) {
                nestedChild.children = grandChildren.map(gc => addChildren(gc));
              }
              return nestedChild;
            });
          }
          return parent;
        };
        
        return topLevel.map(item => {
          const nestedItem = {
            id: item.id,
            label: item.label,
            url: item.url
          };
          return addChildren(nestedItem);
        });
      };
      
      const updatedMenus = menus.map(menu => {
        if (menu.id === currentMenuId) {
          return { ...menu, items: buildNestedStructure(items) };
        }
        return menu;
      });
      
      setMenus(updatedMenus);
      
      await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedMenus),
      });
    } catch (error) {
      console.error('Error saving menu:', error);
    }
  };

  const addNewMenu = async () => {
    if (!newMenuName.trim()) {
      showMessage('Please enter a menu name');
      return;
    }

    const newMenu = {
      id: `menu_${Date.now()}`,
      name: newMenuName,
      items: []
    };

    const updatedMenus = [...menus, newMenu];
    setMenus(updatedMenus);
    setCurrentMenuId(newMenu.id);
    setMenuItems([]);
    setNewMenuName('');

    await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMenus),
    });

    showMessage('Menu created successfully!');
  };

  const deleteMenu = async (menuId) => {
    // Prevent deletion of the first menu (primary menu)
    if (menus.length > 0 && menuId === menus[0].id) {
      showMessage('Cannot delete the primary menu');
      return;
    }

    if (menus.length === 1) {
      showMessage('Cannot delete the last menu');
      return;
    }

    if (!window.confirm('Delete this menu?')) {
      return;
    }

    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }

    const updatedMenus = menus.filter(m => m.id !== menuId);
    setMenus(updatedMenus);

    if (currentMenuId === menuId) {
      setCurrentMenuId(updatedMenus[0].id);
    }

    await fetch('/api/menus', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedMenus),
    });

    showMessage('Menu deleted!');
  };

  const switchMenu = (menuId) => {
    setCurrentMenuId(menuId);
  };

  const setAsHeaderMenu = async (menuId) => {
    if (DEMO_MODE) {
      showDemoMessage();
      return;
    }
    
    try {
      // Load current settings
      const response = await fetch('/api/settings');
      const currentSettings = await response.json();
      
      console.log('Current settings before menu update:', JSON.stringify(currentSettings, null, 2));
      
      // Update ONLY the selectedMenuId while preserving all other settings including footer
      const updatedSettings = {
        ...currentSettings,
        selectedMenuId: menuId
      };
      
      console.log('Updated settings for menu:', JSON.stringify(updatedSettings, null, 2));
      
      // Save settings
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSettings),
      });
      
      setHeaderMenuId(menuId);
      showMessage('Header menu updated! Refresh to see changes.');
    } catch (error) {
      console.error('Error setting header menu:', error);
      showMessage('Failed to update header menu');
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
      showMessage('Please fill in both fields');
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
    showMessage('Deleted!');
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

  const makeTopLevel = async (itemId) => {
    const updated = menuItems.map(item =>
      item.id === itemId ? { ...item, parentId: null } : item
    );
    await saveMenuItems(updated);
    setMenuItems(updated);
    showMessage('Moved to top level!');
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

  const addSubmenu = (parentId) => {
    setAddingSubmenu(parentId);
    setSubmenuForm({ label: '', url: '' });
  };

  const saveSubmenu = async (parentId) => {
    if (!submenuForm.label || !submenuForm.url) {
      showMessage('Please fill in both fields');
      return;
    }

    const item = {
      id: `item_${Date.now()}`,
      label: submenuForm.label,
      url: submenuForm.url,
      parentId
    };

    const updated = [...menuItems, item];
    await saveMenuItems(updated);
    setMenuItems(updated);
    setExpandedItems(prev => ({ ...prev, [parentId]: true }));
    setAddingSubmenu(null);
    setSubmenuForm({ label: '', url: '' });
    showMessage('Submenu added!');
  };

  const startEdit = (item) => {
    setEditingItem(item.id);
    setEditForm({ label: item.label, url: item.url });
  };

  const saveEdit = async () => {
    if (!editForm.label || !editForm.url) {
      showMessage('Please fill in both fields');
      return;
    }

    const updated = menuItems.map(item =>
      item.id === editingItem ? { ...item, label: editForm.label, url: editForm.url } : item
    );
    await saveMenuItems(updated);
    setMenuItems(updated);
    setEditingItem(null);
    setEditForm({ label: '', url: '' });
    showMessage('Menu item updated!');
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditForm({ label: '', url: '' });
  };

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const toggleExpand = (id) => {
    setExpandedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, targetItem, position) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) {
      setDraggedItem(null);
      return;
    }
    await reorderItems(draggedItem.id, targetItem.id, position);
    setDraggedItem(null);
  };

  const renderMenuItem = (item, level = 0) => {
    const children = getChildren(item.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedItems[item.id];
    const isEditing = editingItem === item.id;

    return (
      <div key={item.id} className="mb-2">
        {isEditing ? (
          <div className={`p-3 bg-blue-50 rounded border-2 border-blue-300 ${level > 0 ? 'ml-8' : ''}`}>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Label"
                value={editForm.label}
                onChange={(e) => setEditForm(prev => ({ ...prev, label: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="URL"
                value={editForm.url}
                onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={saveEdit}
                  className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm"
                >
                  <Save size={14} />
                  Save
                </button>
                <button
                  onClick={cancelEdit}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            draggable
            onDragStart={(e) => handleDragStart(e, item)}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, item, 'before')}
            className={`flex items-center gap-2 p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-move ${
              level > 0 ? 'ml-8' : ''
            }`}
          >
            <GripVertical size={16} className="text-gray-400" />
            {hasChildren && (
              <button onClick={() => toggleExpand(item.id)} className="text-gray-600">
                {isExpanded ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
              </button>
            )}
            <span className="flex-1 text-sm font-medium">{item.label}</span>
            <button
              onClick={() => startEdit(item)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 size={20} />
            </button>
            <button
              onClick={() => addSubmenu(item.id)}
              className="text-purple-600 hover:text-purple-700 text-xs px-2 py-1 bg-purple-50 rounded"
            >
              + Sub
            </button>
            {item.parentId && (
              <button
                onClick={() => makeTopLevel(item.id)}
                className="text-green-600 hover:text-green-700 text-xs px-2 py-1 bg-green-50 rounded"
              >
                ↑ Top
              </button>
            )}
            <button
              onClick={() => deleteItem(item.id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 size={20} />
            </button>
          </div>
        )}
        
        {/* Add Submenu Form */}
        {addingSubmenu === item.id && (
          <div className={`mt-2 p-3 bg-purple-50 rounded border-2 border-purple-300 ${level > 0 ? 'ml-8' : ''}`}>
            <h4 className="text-sm font-semibold mb-2 text-purple-900">Add Submenu</h4>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Submenu Label"
                value={submenuForm.label}
                onChange={(e) => setSubmenuForm(prev => ({ ...prev, label: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              />
              <input
                type="text"
                placeholder="Submenu URL"
                value={submenuForm.url}
                onChange={(e) => setSubmenuForm(prev => ({ ...prev, url: e.target.value }))}
                className="w-full p-2 border rounded text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => saveSubmenu(item.id)}
                  className="flex items-center gap-1 px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm"
                >
                  <Save size={14} />
                  Add
                </button>
                <button
                  onClick={() => {
                    setAddingSubmenu(null);
                    setSubmenuForm({ label: '', url: '' });
                  }}
                  className="flex items-center gap-1 px-3 py-1 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 text-sm"
                >
                  <X size={14} />
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
        
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-1">
            {children.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  if (!mounted) return null;

  return (
    <div className="w-full max-w-6xl p-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Menu Manager</h2>
          
          {/* Menu Selector */}
          <div className="flex items-center gap-3">
            <select
              value={currentMenuId}
              onChange={(e) => switchMenu(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none font-medium"
            >
              {menus.map(menu => (
                <option key={menu.id} value={menu.id}>
                  {menu.name} {headerMenuId === menu.id ? '(Header)' : ''}
                </option>
              ))}
            </select>
            
            <button
              onClick={() => setAsHeaderMenu(currentMenuId)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                headerMenuId === currentMenuId
                  ? 'bg-green-100 text-green-700 border-2 border-green-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
              title={headerMenuId === currentMenuId ? 'This is the header menu' : 'Set as header menu'}
            >
              {headerMenuId === currentMenuId ? '✓ Header Menu' : 'Set as Header'}
            </button>
            
            {menus.length > 1 && currentMenuId !== menus[0]?.id && (
              <button
                onClick={() => deleteMenu(currentMenuId)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete Current Menu"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </div>
        
        {/* Add New Menu */}
        <div className="mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border-2 border-green-200">
          <div className="flex items-center gap-3">
            <Menu size={20} className="text-green-600" />
            <input
              type="text"
              placeholder="New Menu Name (e.g., Footer Menu)"
              value={newMenuName}
              onChange={(e) => setNewMenuName(e.target.value)}
              className="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none"
            />
            <button
              onClick={addNewMenu}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={18} />
              Create Menu
            </button>
          </div>
        </div>
        
        {message && (
          <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
            {message}
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Add Custom Link - First Column */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border-2 border-blue-200">
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center gap-2">
              <Plus size={18} className="text-blue-600" />
              Add Custom Link
            </h3>
            <input
              type="text"
              placeholder="Label (e.g., Contact)"
              value={customLink.label}
              onChange={(e) => setCustomLink(prev => ({ ...prev, label: e.target.value }))}
              className="w-full p-2 border-2 border-gray-300 rounded-lg mb-2 text-sm focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="URL (e.g., /contact)"
              value={customLink.url}
              onChange={(e) => setCustomLink(prev => ({ ...prev, url: e.target.value }))}
              className="w-full p-2 border-2 border-gray-300 rounded-lg mb-3 text-sm focus:border-blue-500 focus:outline-none"
            />
            <button
              onClick={addCustomLink}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 rounded-lg hover:from-blue-700 hover:to-purple-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
            >
              <Plus size={14} className="inline mr-1" />
              Add to Menu
            </button>
            
            {/* Add Pages Section Below */}
            <div className="mt-6 pt-4 border-t-2 border-blue-200">
              <h3 className="font-semibold mb-3 text-gray-800 flex items-center gap-2">
                <Home size={18} className="text-green-600" />
                Add Pages
              </h3>
              {pages.length === 0 ? (
                <p className="text-sm text-gray-500">No published pages</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {pages.map(page => (
                    <button
                      key={page.id}
                      onClick={() => addPageToMenu(page)}
                      className="w-full text-left p-2 bg-white rounded-lg hover:bg-green-50 text-sm border border-gray-200 hover:border-green-300 transition-all"
                    >
                      <Home size={14} className="inline mr-2 text-green-600" />
                      {page.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Menu Structure - Spans 2 Columns */}
          <div className="lg:col-span-2 bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <h3 className="font-semibold mb-4 text-gray-800 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <GripVertical size={18} className="text-gray-600" />
                Menu Structure
              </span>
              <span className="text-xs text-gray-500 font-normal">
                {menuItems.length} item{menuItems.length !== 1 ? 's' : ''}
              </span>
            </h3>
            {menuItems.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <GripVertical size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">No menu items yet</p>
                <p className="text-sm mt-2">Add pages or custom links to get started</p>
              </div>
            ) : (
              <div className="space-y-2">
                {getTopLevel().map(item => renderMenuItem(item))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
