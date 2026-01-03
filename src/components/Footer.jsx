'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Youtube, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const [footerSettings, setFooterSettings] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [menuItems2, setMenuItems2] = useState([]);
  const [menuItems3, setMenuItems3] = useState([]);
  const [menuItems4, setMenuItems4] = useState([]);
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if dark mode is active
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    checkDarkMode();
    
    // Listen for dark mode changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    loadFooterSettings();
  }, []);

  useEffect(() => {
    // Apply custom footer colors as CSS variables if they exist
    if (footerSettings) {
      const root = document.documentElement;
      
      if (footerSettings.bgType === 'customColor' && footerSettings.bgColor) {
        root.style.setProperty('--footer-bg-color', footerSettings.bgColor);
      } else {
        root.style.removeProperty('--footer-bg-color');
      }
      
      if (footerSettings.textColor) {
        root.style.setProperty('--footer-text-color', footerSettings.textColor);
      } else {
        root.style.removeProperty('--footer-text-color');
      }
      
      if (footerSettings.secondaryTextColor) {
        root.style.setProperty('--footer-secondary-text-color', footerSettings.secondaryTextColor);
      } else {
        root.style.removeProperty('--footer-secondary-text-color');
        // Also remove the class from elements if no custom color
        document.querySelectorAll('[class*="--footer-secondary-text-color"]').forEach(el => {
          el.classList.remove('[color:var(--footer-secondary-text-color)]');
        });
      }
    }
  }, [footerSettings]);

  const loadFooterSettings = async () => {
    try {
      // Load footer settings
      const settingsResponse = await fetch('/api/settings');
      const settingsData = await settingsResponse.json();
      
      if (settingsData.footer) {
        setFooterSettings(settingsData.footer);
        
        // Load menu items if menu is selected
        if (settingsData.footer.selectedMenu) {
          const menusResponse = await fetch('/api/menus');
          const menusData = await menusResponse.json();
          const selectedMenu = menusData.find(m => m.id === settingsData.footer.selectedMenu);
          setMenuItems(selectedMenu?.items || []);
          
          // Load menu 2
          if (settingsData.footer.selectedMenu2) {
            const selectedMenu2 = menusData.find(m => m.id === settingsData.footer.selectedMenu2);
            setMenuItems2(selectedMenu2?.items || []);
          }
          
          // Load menu 3
          if (settingsData.footer.selectedMenu3) {
            const selectedMenu3 = menusData.find(m => m.id === settingsData.footer.selectedMenu3);
            setMenuItems3(selectedMenu3?.items || []);
          }
          
          // Load menu 4
          if (settingsData.footer.selectedMenu4) {
            const selectedMenu4 = menusData.find(m => m.id === settingsData.footer.selectedMenu4);
            setMenuItems4(selectedMenu4?.items || []);
          }
        }
      }
      
      // Load logo - use custom footer logo if enabled, otherwise use header logo
      if (settingsData.footer?.useCustomFooterLogo && settingsData.footer?.footerLogo?.url) {
        setLogo(settingsData.footer.footerLogo);
      } else {
        const logoResponse = await fetch('/api/logo');
        const logoData = await logoResponse.json();
        if (logoData.logo && logoData.logo.url) {
          setLogo(logoData.logo);
        }
      }
    } catch (error) {
      console.error('Error loading footer settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Don't render if footer is disabled or not configured
  if (loading || !footerSettings || !footerSettings.enabled) {
    return null;
  }

  const getSocialIcon = (platform) => {
    const icons = {
      facebook: Facebook,
      twitter: Twitter,
      instagram: Instagram,
      linkedin: Linkedin,
      youtube: Youtube
    };
    return icons[platform] || Facebook;
  };

  const renderLogo = () => (
    logo?.url ? (
      <img
        src={logo.url}
        alt="Footer Logo"
        style={{
          width: logo.width === 'auto' ? 'auto' : `${logo.width}px`,
          height: logo.height === 'auto' ? 'auto' : `${logo.height}px`,
          objectFit: 'contain'
        }}
      />
    ) : (
      <div className="text-2xl font-bold">Your Logo</div>
    )
  );

  // Footer colors - use custom settings or defaults with dark mode support
  // In dark mode, ignore custom colors and use dark mode defaults
  const hasCustomBg = !isDarkMode && footerSettings.bgType === 'customColor' && footerSettings.bgColor;
  const hasCustomText = !isDarkMode && footerSettings.textColor;
  const hasCustomSecondary = !isDarkMode && footerSettings.secondaryTextColor;
  
  // Background style for image only
  const footerStyle = footerSettings.bgType === 'image' && footerSettings.bgImage
    ? {
        backgroundImage: `url('${footerSettings.bgImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }
    : {};
  
  // CSS classes for footer background and text
  const footerBgClass = hasCustomBg 
    ? '[background-color:var(--footer-bg-color)]' 
    : 'bg-gray-800 dark:bg-gray-900';
  
  const footerTextClass = hasCustomText 
    ? '[color:var(--footer-text-color)]' 
    : 'text-white';
  
  // Only use custom color class if custom color is actually set
  const secondaryTextClass = hasCustomSecondary 
    ? '[color:var(--footer-secondary-text-color)]' 
    : 'text-gray-300 dark:text-gray-400';
  
  console.log('Footer colors:', { hasCustomBg, hasCustomText, hasCustomSecondary, secondaryTextClass });

  // Layout 1: Center - Logo → Menu → Copyright
  if (footerSettings.layout === 'layout1') {
    return (
      <footer style={footerStyle} className={`${footerBgClass} ${footerTextClass}`}>
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col items-center text-center space-y-6 md:space-y-8">
            {/* Logo */}
            <div className="shrink-0">
              {renderLogo()}
            </div>

            {/* Menu */}
            {menuItems.length > 0 && (
              <nav className="flex flex-wrap justify-center gap-4 md:gap-6">
                {menuItems.map((item) => (
                  <Link
                    key={item.id}
                    href={item.url || '#'}
                    className={`${secondaryTextClass} hover:opacity-80 transition-opacity text-sm md:text-base`}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            )}

            {/* Copyright */}
            <div className={`border-t border-gray-700 dark:border-gray-600 pt-4 md:pt-6 w-full text-center text-xs md:text-sm ${secondaryTextClass}`}>
              {footerSettings.copyright}
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Layout 2: Two Columns - Logo/Info (Left) + Menus (Right in 2 columns)
  if (footerSettings.layout === 'layout2') {
    return (
      <footer style={footerStyle} className={`${footerBgClass} ${footerTextClass}`}>
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-12 mb-6 md:mb-8">
            {/* Left Side: Logo + Company Info */}
            <div className="space-y-3 md:space-y-4 md:max-w-md">
              <div className="mb-3 md:mb-4">{renderLogo()}</div>
              {footerSettings.companyName && (
                <h3 className="text-lg md:text-xl font-bold">{footerSettings.companyName}</h3>
              )}
              {footerSettings.companyDescription && (
                <p className={`text-sm leading-relaxed ${secondaryTextClass}`}>
                  {footerSettings.companyDescription}
                </p>
              )}
              {footerSettings.address && (
                <p className={`text-sm ${secondaryTextClass}`}>{footerSettings.address}</p>
              )}
            </div>

            {/* Right Side: Menus Side by Side */}
            <div className="grid grid-cols-2 gap-8 md:gap-12">
              {/* Menu 1 */}
              {menuItems.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">
                    {footerSettings.menuTitle1 || 'Quick Links'}
                  </h3>
                  <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url || '#'}
                        className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Menu 2 (Optional) */}
              {menuItems2.length > 0 && (
                <div>
                  <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4">
                    {footerSettings.menuTitle2 || 'More Links'}
                  </h3>
                  <nav className="flex flex-col gap-2">
                    {menuItems2.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url || '#'}
                        className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}
            </div>
          </div>

          {/* Copyright */}
          <div className={`border-t border-gray-700 dark:border-gray-600 pt-4 md:pt-6 text-center text-xs md:text-sm ${secondaryTextClass}`}>
            {footerSettings.copyright}
          </div>
        </div>
      </footer>
    );
  }

  // Layout 3: Horizontal - Logo Left, Social + Menu Right (stacked), Copyright Bottom
  if (footerSettings.layout === 'layout3') {
    const activeSocials = footerSettings.socialLinks || [];
    
    return (
      <footer style={footerStyle} className={`${footerBgClass} ${footerTextClass}`}>
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8">
          {/* Main Row: Logo Left + Social/Menu Right */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
            {/* Left: Logo */}
            <div className="shrink-0">
              {renderLogo()}
            </div>

            {/* Right: Social Media + Menu (stacked vertically) */}
            <div className="flex flex-col md:items-end gap-4 w-full md:w-auto">
              {/* Social Media Icons */}
              {activeSocials.length > 0 && (
                <div className="flex gap-5 md:gap-8 items-center">
                  {activeSocials.map((social) => {
                    const Icon = getSocialIcon(social.platform);
                    return (
                      <a
                        key={social.platform}
                        href={social.url || '#'}
                        target={social.url ? "_blank" : "_self"}
                        rel={social.url ? "noopener noreferrer" : undefined}
                        className="flex items-center justify-center transition-opacity hover:opacity-80 text-gray-300 dark:text-gray-400"
                        title={social.platform}
                        {...getSecondaryTextProps()}
                      >
                        <Icon size={20} className="md:w-6 md:h-6" />
                      </a>
                    );
                  })}
                </div>
              )}

              {/* Menu Items Horizontal - Below Social */}
              {menuItems.length > 0 && (
                <nav className="flex flex-wrap md:justify-end gap-4 md:gap-6">
                  {menuItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url || '#'}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>

          {/* Bottom: Copyright */}
          <div className={`border-t border-gray-700 dark:border-gray-600 pt-4 md:pt-6 text-center text-xs md:text-sm ${secondaryTextClass}`}>
            {footerSettings.copyright}
          </div>
        </div>
      </footer>
    );
  }

  // Layout 4: Three Equal Columns - Info + Menu (2 cols) + Contact
  if (footerSettings.layout === 'layout4') {
    const activeSocials = footerSettings.socialLinks || [];
    
    return (
      <footer style={footerStyle} className={`${footerBgClass} ${footerTextClass}`}>
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-6 md:mb-8">
            {/* Column 1: Logo + Company Info */}
            <div className="space-y-3">
              <div className="mb-3">{renderLogo()}</div>
              {footerSettings.companyName && (
                <h3 className="text-lg font-bold">{footerSettings.companyName}</h3>
              )}
              {footerSettings.companyDescription && (
                <p className={`text-sm leading-relaxed ${secondaryTextClass}`}>
                  {footerSettings.companyDescription}
                </p>
              )}
            </div>

            {/* Column 2: Two Menu Columns Side by Side */}
            <div className="grid grid-cols-2 gap-8">
              {/* Menu Column 1 */}
              {menuItems.length > 0 && (
                <div>
                  <h3 className="text-base font-bold mb-3">
                    {footerSettings.menuTitle1 || 'Quick Links'}
                  </h3>
                  <nav className="flex flex-col gap-2">
                    {menuItems.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url || '#'}
                        className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}

              {/* Menu Column 2 */}
              {menuItems2.length > 0 && (
                <div>
                  <h3 className="text-base font-bold mb-3">
                    {footerSettings.menuTitle2 || 'More Links'}
                  </h3>
                  <nav className="flex flex-col gap-2">
                    {menuItems2.map((item) => (
                      <Link
                        key={item.id}
                        href={item.url || '#'}
                        className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </nav>
                </div>
              )}
            </div>

            {/* Column 3: Get In Touch */}
            <div className="space-y-3">
              <h3 className="text-base font-bold mb-3">Get In Touch</h3>
              <div className="space-y-2.5">
                {footerSettings.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className="shrink-0 mt-0.5 text-gray-300 dark:text-gray-400" {...getSecondaryTextProps()} />
                    <a 
                      href={`mailto:${footerSettings.email}`}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 text-sm break-all ${secondaryTextClass}`}
                    >
                      {footerSettings.email}
                    </a>
                  </div>
                )}
                {footerSettings.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} className="shrink-0 mt-0.5 text-gray-300 dark:text-gray-400" {...getSecondaryTextProps()} />
                    <a 
                      href={`tel:${footerSettings.phone}`}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 text-sm ${secondaryTextClass}`}
                    >
                      {footerSettings.phone}
                    </a>
                  </div>
                )}
                {footerSettings.address && (
                  <p className={`text-sm leading-relaxed ${secondaryTextClass}`}>
                    {footerSettings.address}
                  </p>
                )}
                {activeSocials.length > 0 && (
                  <div className="flex gap-5 mt-4">
                    {activeSocials.map((social) => {
                      const Icon = getSocialIcon(social.platform);
                      return (
                        <a
                          key={social.platform}
                          href={social.url || '#'}
                          target={social.url ? "_blank" : "_self"}
                          rel={social.url ? "noopener noreferrer" : undefined}
                          className="flex items-center justify-center text-gray-300 dark:text-gray-400"
                          {...getSecondaryTextProps()}
                        >
                          <Icon size={20} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className={`border-t border-gray-700 dark:border-gray-600 pt-4 md:pt-6 text-center text-xs md:text-sm ${secondaryTextClass}`}>
            {footerSettings.copyright}
          </div>
        </div>
      </footer>
    );
  }

  // Layout 5: Four Columns - Info + Dynamic Menus (1-4) + Contact
  if (footerSettings.layout === 'layout5') {
    const activeSocials = footerSettings.socialLinks || [];
    const menuCount = footerSettings.menuCount || 2;
    const totalColumns = 2 + menuCount; // Info + Menus + Contact
    
    return (
      <footer style={footerStyle} className={`${footerBgClass} ${footerTextClass}`}>
        <div className="container mx-auto px-4 md:px-6 py-8 md:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-6 md:mb-8">
            {/* Column 1: Logo + Company Info */}
            <div className="space-y-3">
              <div className="mb-3">{renderLogo()}</div>
              {footerSettings.companyName && (
                <h3 className="text-lg font-bold">{footerSettings.companyName}</h3>
              )}
              {footerSettings.companyDescription && (
                <p className={`text-sm leading-relaxed ${secondaryTextClass}`}>
                  {footerSettings.companyDescription}
                </p>
              )}
            </div>

            {/* Menu 1 */}
            {menuItems.length > 0 && (
              <div>
                <h3 className="text-base font-bold mb-3">
                  {footerSettings.menuTitle1 || 'Menu'}
                </h3>
                <nav className="flex flex-col gap-2">
                  {menuItems.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url || '#'}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Menu 2 */}
            {menuCount >= 2 && menuItems2.length > 0 && (
              <div>
                <h3 className="text-base font-bold mb-3">
                  {footerSettings.menuTitle2 || 'More Links'}
                </h3>
                <nav className="flex flex-col gap-2">
                  {menuItems2.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url || '#'}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Menu 3 */}
            {menuCount >= 3 && menuItems3.length > 0 && (
              <div>
                <h3 className="text-base font-bold mb-3">
                  {footerSettings.menuTitle3 || 'Resources'}
                </h3>
                <nav className="flex flex-col gap-2">
                  {menuItems3.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url || '#'}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Menu 4 */}
            {menuCount >= 4 && menuItems4.length > 0 && (
              <div>
                <h3 className="text-base font-bold mb-3">
                  {footerSettings.menuTitle4 || 'Support'}
                </h3>
                <nav className="flex flex-col gap-2">
                  {menuItems4.map((item) => (
                    <Link
                      key={item.id}
                      href={item.url || '#'}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 transition-opacity text-sm ${secondaryTextClass}`}
                    >
                      {item.label}
                    </Link>
                  ))}
                </nav>
              </div>
            )}

            {/* Last Column: Get In Touch */}
            <div className="space-y-3">
              <h3 className="text-base font-bold mb-3">Get In Touch</h3>
              <div className="space-y-2.5">
                {footerSettings.email && (
                  <div className="flex items-start gap-2.5">
                    <Mail size={16} className="shrink-0 mt-0.5 text-gray-300 dark:text-gray-400" {...getSecondaryTextProps()} />
                    <a 
                      href={`mailto:${footerSettings.email}`}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 text-sm break-all ${secondaryTextClass}`}
                    >
                      {footerSettings.email}
                    </a>
                  </div>
                )}
                {footerSettings.phone && (
                  <div className="flex items-start gap-2.5">
                    <Phone size={16} className="shrink-0 mt-0.5 text-gray-300 dark:text-gray-400" {...getSecondaryTextProps()} />
                    <a 
                      href={`tel:${footerSettings.phone}`}
                      className={`text-gray-300 dark:text-gray-400 hover:opacity-80 text-sm ${secondaryTextClass}`}
                    >
                      {footerSettings.phone}
                    </a>
                  </div>
                )}
                {footerSettings.address && (
                  <p className={`text-sm leading-relaxed ${secondaryTextClass}`}>
                    {footerSettings.address}
                  </p>
                )}
                {activeSocials.length > 0 && (
                  <div className="flex gap-5 mt-4 flex-wrap">
                    {activeSocials.map((social) => {
                      const Icon = getSocialIcon(social.platform);
                      return (
                        <a
                          key={social.platform}
                          href={social.url || '#'}
                          target={social.url ? "_blank" : "_self"}
                          rel={social.url ? "noopener noreferrer" : undefined}
                          className="flex items-center justify-center text-gray-300 dark:text-gray-400"
                          {...getSecondaryTextProps()}
                        >
                          <Icon size={18} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className={`border-t border-gray-700 dark:border-gray-600 pt-4 md:pt-6 text-center text-xs md:text-sm ${secondaryTextClass}`}>
            {footerSettings.copyright}
          </div>
        </div>
      </footer>
    );
  }

  // Default fallback
  return null;
}






