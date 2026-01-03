'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function DarkModeLoader() {
  const pathname = usePathname();

  useEffect(() => {
    // Don't apply dark mode on dashboard pages
    if (pathname?.startsWith('/dashboard')) {
      document.documentElement.classList.remove('dark');
      console.log('✓ Dashboard page - dark mode disabled');
      return;
    }

    // Force apply dark mode immediately on every render for website pages
    const savedMode = localStorage.getItem('darkMode');
    
    if (savedMode === 'true') {
      document.documentElement.classList.add('dark');
      console.log('✓ Dark mode applied on route:', pathname);
    } else {
      document.documentElement.classList.remove('dark');
      console.log('✓ Light mode applied on route:', pathname);
    }

    // Listen for dark mode changes
    const handleDarkModeChange = () => {
      // Don't apply on dashboard
      if (window.location.pathname.startsWith('/dashboard')) {
        return;
      }
      
      const mode = localStorage.getItem('darkMode');
      if (mode === 'true') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    window.addEventListener('darkModeChange', handleDarkModeChange);
    window.addEventListener('storage', handleDarkModeChange);
    
    return () => {
      window.removeEventListener('darkModeChange', handleDarkModeChange);
      window.removeEventListener('storage', handleDarkModeChange);
    };
  }, [pathname]);

  // Also run on every render to be extra sure (but not on dashboard)
  useEffect(() => {
    if (pathname?.startsWith('/dashboard')) {
      return;
    }
    
    const savedMode = localStorage.getItem('darkMode');
    if (savedMode === 'true' && !document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.add('dark');
      console.log('✓ Dark mode re-applied (safety check)');
    }
  });

  return null;
}
