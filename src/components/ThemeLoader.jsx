'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ThemeLoader() {
  const pathname = usePathname();
  
  useEffect(() => {
    // Don't run on dashboard pages
    if (pathname?.startsWith('/dashboard')) {
      return;
    }
    
    // Ensure we're in the browser
    if (typeof window === 'undefined') {
      return;
    }
    
    // Load initial theme immediately
    loadTheme();
    
    // Poll for theme changes every 30 seconds (only on website pages)
    const interval = setInterval(() => {
      // Double check we're not on dashboard
      if (!pathname?.startsWith('/dashboard')) {
        loadTheme();
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [pathname]);

  const loadTheme = async () => {
    try {
      // Add cache-busting timestamp to prevent browser caching
      const timestamp = new Date().getTime();
      
      // Load colors
      const colorsRes = await fetch(`/api/theme?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!colorsRes.ok) {
        throw new Error(`Theme API returned ${colorsRes.status}`);
      }
      
      const colorsData = await colorsRes.json();
      
      if (colorsData.colors) {
        applyColors(colorsData.colors);
      }
      
      // Load typography
      const typographyRes = await fetch(`/api/typography?t=${timestamp}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!typographyRes.ok) {
        throw new Error(`Typography API returned ${typographyRes.status}`);
      }
      
      const typographyData = await typographyRes.json();
      
      if (typographyData.typography) {
        applyTypography(typographyData.typography);
      } else {
        // No typography - clear custom typography variables
        clearTypography();
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  };

  const applyColors = (colors) => {
    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  };

  const applyTypography = (typography) => {
    try {
      if (!typography) {
        clearTypography();
        return;
      }
      
      const root = document.documentElement;
      
      // Apply heading styles
      if (typography.heading?.family) {
        root.style.setProperty('--font-heading-family', typography.heading.family);
      }
      if (typography.heading?.size) {
        root.style.setProperty('--font-heading-size', typography.heading.size);
      }
      if (typography.heading?.weight) {
        root.style.setProperty('--font-heading-weight', typography.heading.weight);
      }
      
      // Apply subheading styles
      if (typography.subheading?.family) {
        root.style.setProperty('--font-subheading-family', typography.subheading.family);
      }
      if (typography.subheading?.size) {
        root.style.setProperty('--font-subheading-size', typography.subheading.size);
      }
      if (typography.subheading?.weight) {
        root.style.setProperty('--font-subheading-weight', typography.subheading.weight);
      }
      
      // Apply text styles
      if (typography.text?.family) {
        root.style.setProperty('--font-text-family', typography.text.family);
      }
      if (typography.text?.size) {
        root.style.setProperty('--font-text-size', typography.text.size);
      }
      if (typography.text?.weight) {
        root.style.setProperty('--font-text-weight', typography.text.weight);
      }
    } catch (error) {
      console.error('Error applying typography:', error);
      clearTypography();
    }
  };

  const clearTypography = () => {
    const root = document.documentElement;
    
    // Set typography variables to 'inherit' to let Tailwind classes work
    root.style.setProperty('--font-heading-family', 'inherit');
    root.style.setProperty('--font-heading-size', 'inherit');
    root.style.setProperty('--font-heading-weight', 'inherit');
    
    root.style.setProperty('--font-subheading-family', 'inherit');
    root.style.setProperty('--font-subheading-size', 'inherit');
    root.style.setProperty('--font-subheading-weight', 'inherit');
    
    root.style.setProperty('--font-text-family', 'inherit');
    root.style.setProperty('--font-text-size', 'inherit');
    root.style.setProperty('--font-text-weight', 'inherit');
  };

  return null;
}
