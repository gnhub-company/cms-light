'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navigation({ menuId }) {
  const [menuItems, setMenuItems] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadMenu();
  }, [menuId]);

  const loadMenu = async () => {
    try {
      const response = await fetch('/api/menus');
      const menus = await response.json();
      const menu = menus.find(m => m.id === menuId);
      setMenuItems(menu?.items || []);
    } catch (error) {
      console.log('Menu not found');
    }
  };

  const getTopLevel = () => menuItems.filter(item => !item.parentId && item.visible);
  const getChildren = (parentId) => menuItems.filter(item => item.parentId === parentId && item.visible);

  if (!mounted) return null;

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex space-x-8">
          {getTopLevel().map(item => (
            <li key={item.id} className="relative group">
              <Link href={item.url} className="block py-4 hover:text-blue-600">
                {item.label}
              </Link>
              {getChildren(item.id).length > 0 && (
                <ul className="absolute left-0 hidden group-hover:block bg-white shadow-lg min-w-[200px]">
                  {getChildren(item.id).map(child => (
                    <li key={child.id}>
                      <Link href={child.url} className="block px-4 py-2 hover:bg-gray-100">
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
