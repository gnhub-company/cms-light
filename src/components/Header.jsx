'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import DarkModeToggle from './DarkModeToggle';

export default function Header() {
  const [logo, setLogo] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [settings, setSettings] = useState({});
  const [variation, setVariation] = useState('background');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load logo
    fetch('/api/logo')
      .then(res => res.json())
      .then(data => {
        if (data.logo && data.logo.url) {
          setLogo(data.logo);
        }
      })
      .catch(err => console.error('Error loading logo:', err));

    // Load settings first, then load the selected menu
    fetch('/api/settings')
      .then(res => res.json())
      .then(settingsData => {
        setSettings(settingsData);
        
        // Load menus and find the selected one
        fetch('/api/menus')
          .then(res => res.json())
          .then(menusData => {
            const menuId = settingsData.selectedMenuId;
            
            // Find the selected menu or default to main menu
            const selectedMenu = menuId 
              ? menusData.find(m => m.id === menuId)
              : menusData.find(m => m.name.toLowerCase().includes('main')) || menusData.find(m => m.items && m.items.length > 0) || menusData[0];
            
            if (selectedMenu && selectedMenu.items) {
              setMenuItems(selectedMenu.items);
            }
          })
          .catch(err => console.error('Error loading menu:', err));
      })
      .catch(err => console.error('Error loading settings:', err));

    // Load header variation
    fetch('/api/header-variation')
      .then(res => res.json())
      .then(data => {
        setVariation(data.variation || 'background');
      })
      .catch(err => console.error('Error loading header variation:', err));
  }, []);



  const renderLogo = () => (
    logo && logo.url ? (
      <img
        src={logo.url}
        alt={settings.siteTitle || "Logo"}
        style={{
          width: logo.width === 'auto' ? 'auto' : `${logo.width}px`,
          height: logo.height === 'auto' ? 'auto' : `${logo.height}px`,
          maxHeight: '60px',
          objectFit: 'contain'
        }}
      />
    ) : (
      <span className={`text-2xl font-bold ${variation === 'transparent' ? 'text-white' : 'text-gray-900'}`}>
        {settings.siteTitle || "Your Brand"}
      </span>
    )
  );

  const renderNavigation = () => (
    <>
      {menuItems.map((item) => {
        const hasChildren = item.children && item.children.length > 0;

        return (
          <div key={item.id} className="relative group">
            <Link
              href={item.url}
              className={`font-medium transition-colors ${
                variation === 'transparent' 
                  ? 'text-white hover:text-blue-300' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              {item.label}
            </Link>
            
            {hasChildren && (
              <div className="absolute left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                {item.children.map((child) => {
                  const hasGrandChildren = child.children && child.children.length > 0;
                  
                  return (
                    <div key={child.id} className="relative group/submenu">
                      <Link
                        href={child.url}
                        className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 first:rounded-t-lg last:rounded-b-lg"
                      >
                        {child.label}
                        {hasGrandChildren && <span className="float-right">›</span>}
                      </Link>
                      
                      {hasGrandChildren && (
                        <div className="absolute left-full top-0 ml-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover/submenu:opacity-100 group-hover/submenu:visible transition-all duration-200">
                          {child.children.map((grandChild) => (
                            <Link
                              key={grandChild.id}
                              href={grandChild.url}
                              className="block px-4 py-2 text-gray-700 hover:bg-gray-100 hover:text-blue-600 first:rounded-t-lg last:rounded-b-lg"
                            >
                              {grandChild.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </>
  );

  // Transparent Header
  if (variation === 'transparent') {
    return (
      <>
        <header className="absolute top-0 left-0 right-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                {renderLogo()}
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {renderNavigation()}
                <DarkModeToggle />
              </nav>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 text-white hover:text-blue-300 transition-colors"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-lg">
              <nav className="px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </header>
      </>
    );
  }

  // Center Aligned Header
  if (variation === 'center') {
    return (
      <>
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
            <div className="flex md:flex-col items-center justify-between md:gap-4">
              <Link href="/" className="flex items-center">
                {renderLogo()}
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {renderNavigation()}
                <DarkModeToggle />
              </nav>
              <div className="flex md:hidden items-center gap-2">`n                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-blue-600"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
          </div>
          {mobileMenuOpen && (
            <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
              <nav className="px-4 py-4 space-y-2">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url}
                    className="block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          )}
        </header>
      </>
    );
  }

  // Floating Header
  if (variation === 'floating') {
    return (
      <>
        <header className="sticky top-4 z-50 px-4 md:px-6">
          <div className="max-w-7xl mx-auto bg-white/90 backdrop-blur-md shadow-lg rounded-2xl border border-gray-200 px-4 md:px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                {renderLogo()}
              </Link>
              <nav className="hidden md:flex items-center gap-6">
                {renderNavigation()}
                <DarkModeToggle />
              </nav>
              <div className="flex md:hidden items-center gap-2">`n                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-gray-700 hover:text-blue-600"
                >
                  {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>
            {mobileMenuOpen && (
              <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
                <nav className="space-y-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url}
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}
          </div>
        </header>
      </>
    );
  }

  // Left Side Header
  if (variation === 'leftside') {
    return (
      <>
        <header className="fixed left-0 top-0 bottom-0 w-64 bg-white shadow-lg border-r border-gray-200 z-50">
          <div className="flex flex-col h-full p-6">
            <Link href="/" className="flex items-center justify-center mb-8">
              {renderLogo()}
            </Link>
            <nav className="flex flex-col gap-2 flex-1">
              {menuItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                
                return (
                  <div key={item.id}>
                    <Link
                      href={item.url}
                      className="text-gray-700 hover:text-blue-600 font-medium transition-colors py-2 px-4 rounded-lg hover:bg-gray-100 block"
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="text-gray-600 hover:text-blue-600 text-sm transition-colors py-1 px-4 rounded-lg hover:bg-gray-50 block"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
            <div className="mt-auto pt-4 border-t border-gray-200 flex justify-center">
              <DarkModeToggle />
            </div>
          </div>
        </header>
        <div className="ml-64"></div>
      </>
    );
  }

  // Fullscreen Overlay Header
  if (variation === 'fullscreen') {
    return (
      <>
        <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                {renderLogo()}
              </Link>
              <div className="flex items-center gap-2">
                <DarkModeToggle />
                <button
                  onClick={() => setMobileMenuOpen(true)}
                  className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Fullscreen Menu Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-6 right-6 p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            <nav className="flex flex-col items-center gap-8">
              {menuItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                
                return (
                  <div key={item.id} className="text-center">
                    <Link
                      href={item.url}
                      className="text-4xl font-bold text-gray-900 hover:text-blue-600 transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <div className="mt-4 space-y-2">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="block text-xl text-gray-600 hover:text-blue-600 transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </>
    );
  }

  // Default: Background Header
  return (
    <>
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center">
              {renderLogo()}
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              {renderNavigation()}
              <DarkModeToggle />
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <nav className="px-4 py-4 space-y-2">
              {menuItems.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                
                return (
                  <div key={item.id}>
                    <Link
                      href={item.url}
                      className="block py-2 px-4 text-gray-700 hover:bg-gray-100 hover:text-blue-600 rounded-lg font-medium transition-colors"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                    {hasChildren && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            href={child.url}
                            className="block py-2 px-4 text-gray-600 hover:bg-gray-50 hover:text-blue-600 rounded-lg text-sm transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        )}
      </header>
    </>
  );
}

