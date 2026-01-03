'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';

export default function DarkModeToggle() {
  const [isDark, setIsDark] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Load user's dark mode preference from localStorage FIRST
    const savedMode = localStorage.getItem('darkMode');
    console.log('Saved dark mode preference:', savedMode);
    if (savedMode !== null) {
      const isDarkMode = savedMode === 'true';
      setIsDark(isDarkMode);
      console.log('Setting initial isDark state to:', isDarkMode);
    }
    
    // Then check if dark mode is enabled in settings
    fetch('/api/dark-mode')
      .then(res => res.json())
      .then(data => {
        console.log('Dark mode API response:', data);
        setEnabled(data.enabled || false);
      })
      .catch(err => console.error('Error loading dark mode settings:', err));
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    console.log('Dark mode state changed:', isDark);
    
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('darkMode', 'true');
      console.log('Dark mode ENABLED - dark class added to html');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('darkMode', 'false');
      console.log('Dark mode DISABLED - dark class removed from html');
    }

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event('darkModeChange'));
  }, [isDark, mounted]);

  const toggleDarkMode = () => {
    console.log('Toggle clicked! Current state:', isDark, '-> New state:', !isDark);
    setIsDark(!isDark);
  };

  // Don't render if not mounted or not enabled
  if (!mounted || !enabled) {
    console.log('DarkModeToggle not rendering. Mounted:', mounted, 'Enabled:', enabled);
    return null;
  }

  console.log('DarkModeToggle rendering. isDark:', isDark);

  return (
    <button
      onClick={toggleDarkMode}
      className="hidden md:block p-2 rounded-lg transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
      aria-label="Toggle dark mode"
    >
      {isDark ? (
        <Sun className="w-5 h-5 text-yellow-500" />
      ) : (
        <Moon className="w-5 h-5 text-gray-700" />
      )}
    </button>
  );
}
