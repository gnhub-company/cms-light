"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import ThemeLoader from "../components/ThemeLoader";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { ChevronDown } from "lucide-react";

export default function Home() {
  const [sections, setSections] = useState([]);
  const [openFaqIndex, setOpenFaqIndex] = useState({});
  const [loading, setLoading] = useState(true);
  const [videoPlaying, setVideoPlaying] = useState({});
  const [isDarkMode, setIsDarkMode] = useState(false);
  const videoRefs = useRef({});

  useEffect(() => {
    fetch("/api/pages")
      .then(res => res.json())
      .then(data => {
        // Find home page (slug = "/")
        const homePage = data.find(p => p.slug === "/" || p.id === "home");
        if (homePage && homePage.sections) {
          setSections(homePage.sections);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading sections:", err);
        setLoading(false);
      });
  }, []);

  // Detect dark mode changes
  useEffect(() => {
    const checkDarkMode = () => {
      const hasDarkClass = document.documentElement.classList.contains('dark');
      console.log('Dark mode check:', hasDarkClass);
      setIsDarkMode(hasDarkClass);
    };
    
    checkDarkMode();
    
    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      console.log('HTML class changed, checking dark mode...');
      checkDarkMode();
    });
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome</h1>
          <p className="text-gray-600">No sections added yet</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <ThemeLoader />
      <Header />
      <div>
        {sections.map((item, index) => {
        // Skip hidden sections (hidden: true means hide, hidden: false or undefined means show)
        if (item.hidden === true) {
          return null;
        }
        
        const hasImage = item.img;
        const isRight = item.align === "right";
        const textAlign = item.textAlign || "left";

        // Determine background styling
        let backgroundStyle = {};
        let backgroundClass = "";
        const hasVideoBackground = item.bgType === "video" && item.bgVideoUrl;
        const hasImageBackground = item.bgType === "image" && (item.bgImage || item.bgImageUrl);

        if (item.bgType === "image") {
          // Use bgImage or bgImageUrl
          const bgImageUrl = item.bgImage || item.bgImageUrl;
          if (bgImageUrl) {
            backgroundStyle = {
              backgroundImage: `url('${bgImageUrl}')`,
              backgroundSize: item.bgImageSize || "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat"
            };
          } else {
            // Fallback if no image URL
            backgroundClass = "bg-background";
          }
        } else if (item.bgType === "customColor" && item.bgColor) {
          backgroundStyle = { backgroundColor: item.bgColor };
        } else if (item.bgType === "themeColor" && item.bgThemeColor) {
          // Use theme color class like bg-accent, bg-heading, etc.
          backgroundClass = `bg-${item.bgThemeColor}`;
        } else {
          // Default background
          // backgroundClass = "bg-background";
        }

        // Determine padding class based on paddingY value
        const paddingClass = 
          item.paddingY === "compact" ? "py-8" :
          item.paddingY === "comfortable" ? "py-12" :
          item.paddingY === "spacious" ? "py-20" :
          item.paddingY === "extra-spacious" ? "py-32" :
          "py-12"; // default to comfortable

        // Build section style and ensure customHeight applies to the section (so video backgrounds inherit the height)
        const sectionStyle = hasImageBackground ? { ...backgroundStyle, backgroundAttachment: 'scroll' } : (Object.keys(backgroundStyle).length > 0 ? { ...backgroundStyle } : {});
        
        // Override background for dark mode
        if (isDarkMode && !hasImageBackground && !hasVideoBackground) {
          if (item.bgType === "customColor" || item.bgType === "themeColor" || !item.bgType) {
            sectionStyle.backgroundColor = '#1a1a1a';
          }
        }
        
        if (item.customHeight) {
          sectionStyle.minHeight = `${item.customHeight}px`;
        } else if (hasImage) {
          sectionStyle.minHeight = '500px';
        } else {
          sectionStyle.minHeight = '400px';
        }

        // Features layout class (section-level)
        const featuresGridClass = item.featuresLayout === 'grid-3' ? 'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6' : (item.featuresLayout === 'stacked' ? 'grid grid-cols-1 gap-4 mt-6' : 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6');

        // Generate unique section ID for custom colors
        const sectionId = `section-${index}`;
        const hasCustomColors = item.customHeadingColor || item.customSubheadingColor || item.customTextColor;

        return (
          <section 
            key={index}
            id={sectionId}
            className={`w-full ${paddingClass} ${backgroundClass} ${hasVideoBackground || hasImageBackground ? 'relative overflow-hidden' : ''}`}
            style={Object.keys(sectionStyle).length > 0 ? sectionStyle : undefined}
          >
            {/* Custom Colors Style Tag */}
            {hasCustomColors && (
              <style dangerouslySetInnerHTML={{
                __html: `
                  #${sectionId} .text-heading {
                    color: ${item.customHeadingColor || 'var(--color-heading)'} !important;
                  }
                  #${sectionId} .text-subheading {
                    color: ${item.customSubheadingColor || 'var(--color-subheading)'} !important;
                  }
                  #${sectionId} .text-text,
                  #${sectionId} .text-text * {
                    color: ${item.customTextColor || 'var(--color-text)'} !important;
                  }
                `
              }} />
            )}
            {/* Video Background */}
            {hasVideoBackground && (
              <>
                <video
                  src={item.bgVideoUrl}
                  autoPlay={item.bgVideoAutoplay !== false}
                  loop={item.bgVideoLoop !== false}
                  muted={item.bgVideoMuted !== false}
                  controls={item.bgVideoControls === true}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover z-0"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div 
                  className="absolute inset-0 bg-black z-0" 
                  style={{ opacity: (item.bgVideoOverlay || 50) / 100 }}
                ></div>
              </>
            )}
            {/* Image Background Overlay */}
            {hasImageBackground && item.bgImageOverlay > 0 && (
              <div 
                className="absolute inset-0 bg-black z-0" 
                style={{ opacity: (item.bgImageOverlay || 0) / 100 }}
              ></div>
            )}
            {/* Dark Mode Overlay for Background Images */}
            {isDarkMode && hasImageBackground && (
              <div 
                className="absolute inset-0 bg-black z-0" 
                style={{ opacity: 0.7 }}
              ></div>
            )}
            {hasImage ? (
              // Layout with image - 2 columns
              <div className={`max-w-7xl mx-auto px-4 md:px-6 ${hasVideoBackground || hasImageBackground ? 'relative z-10' : ''}`} style={{ minHeight: item.customHeight ? `${item.customHeight}px` : '500px' }}>
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6 md:gap-10 h-full">
                  {/* Image */}
                  <div className={`w-full order-1 ${isRight ? "md:order-2" : "md:order-1"}`}>
                    <div className="relative w-full" style={{ height: item.customHeight ? `${Math.min(item.customHeight * 0.8, 600)}px` : '320px' }}>
                      <Image
                        src={item.img}
                        alt={item.heading}
                        fill
                        className={`rounded-xl shadow-md ${
                          item.imgFit === 'contain' ? 'object-contain' :
                          item.imgFit === 'fill' ? 'object-fill' :
                          item.imgFit === 'none' ? 'object-none' :
                          'object-cover'
                        }`}
                        unoptimized
                      />
                    </div>
                  </div>

                  {/* Content */}
                  <div className={`space-y-4 md:space-y-5 order-2 ${isRight ? "md:order-1" : "md:order-2"} ${
                    textAlign === 'center' ? 'text-center' :
                    textAlign === 'right' ? 'text-right' :
                    'text-left'
                  }`}>
                  <div>
                    {item.subheading && (
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-subheading mb-2">{item.subheading}</h3>
                    )}
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-heading">{item.heading}</h2>
                  </div>
                  {item.description && item.showDescription !== false && (
                    <div 
                      className="text-sm sm:text-base md:text-lg leading-relaxed text-text rich-text-content"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {item.features && item.features.length > 0 && (
                    <div className={item.featuresLayout === 'stacked' ? 'space-y-4 mt-6' : featuresGridClass}>
                      {item.features.map((feature, featIdx) => {
                        // Check if icon is a URL (image) - more robust detection
                        const isIconImage = feature.icon && (
                          feature.icon.startsWith('http://') || 
                          feature.icon.startsWith('https://') || 
                          feature.icon.startsWith('/') ||
                          feature.icon.includes('cloudinary.com') ||
                          feature.icon.includes('pexels.com') ||
                          /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(feature.icon)
                        );
                        
                        if (item.featuresLayout === 'stacked') {
                          // Horizontal layout: icon left, content right
                          return (
                            <div key={featIdx} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-start gap-4">
                              <div className="flex-shrink-0">
                                {isIconImage ? (
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                    <img src={feature.icon} alt={feature.title || 'Feature icon'} className="w-full h-full object-cover" />
                                  </div>
                                ) : feature.icon ? (
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 flex items-center justify-center text-3xl md:text-4xl">{feature.icon}</div>
                                ) : null}
                              </div>
                              <div className="flex-1">
                                {feature.title && (
                                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                )}
                                {feature.text && (
                                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.text}</p>
                                )}
                              </div>
                            </div>
                          );
                        } else {
                          // Grid layout: icon/image top, content below
                          return (
                            <div key={featIdx} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                              <div className="flex items-center justify-center mb-4">
                                {isIconImage ? (
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                    <img src={feature.icon} alt={feature.title || 'Feature icon'} className="w-full h-full object-cover" />
                                  </div>
                                ) : feature.icon && (
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 flex items-center justify-center text-3xl md:text-4xl">{feature.icon}</div>
                                )}
                              </div>
                              {feature.title && (
                                <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                              )}
                              {feature.text && (
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.text}</p>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                  {item.faqs && item.faqs.length > 0 && (
                    <div className="space-y-2 md:space-y-3 mt-4 md:mt-6">
                      {item.faqs.map((faq, faqIdx) => (
                        <div key={faqIdx} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => setOpenFaqIndex(prev => ({ ...prev, [`${index}-${faqIdx}`]: !prev[`${index}-${faqIdx}`] }))}
                            className="w-full px-4 md:px-5 py-3 md:py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 pr-3 md:pr-4">{faq.question}</span>
                            <ChevronDown 
                              size={16} 
                              className={`text-gray-600 shrink-0 transition-transform sm:w-5 sm:h-5 ${openFaqIndex[`${index}-${faqIdx}`] ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {openFaqIndex[`${index}-${faqIdx}`] && (
                            <div className="px-4 md:px-5 py-3 md:py-4 border-t border-gray-200 bg-gray-50">
                              <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.button && (
                    <a
                      href={item.buttonLink || '#'}
                      target={item.buttonTarget || '_self'}
                      rel={item.buttonTarget === '_blank' ? 'noopener noreferrer' : undefined}
                      className="inline-block px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg text-white font-semibold rounded-xl bg-button hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {item.button}
                    </a>
                  )}
                </div>
                </div>
              </div>
            ) : (
              // Layout without image - full width with text alignment
              <div className={`w-full mx-auto px-4 md:px-6 ${hasVideoBackground || hasImageBackground ? 'relative z-10' : ''}`} style={{ minHeight: item.customHeight ? `${item.customHeight}px` : '400px', display: 'flex', alignItems: 'center', justifyContent: textAlign === 'center' ? 'center' : textAlign === 'right' ? 'flex-end' : 'flex-start' }}>
                <div className={`space-y-4 md:space-y-5 w-full ${
                  textAlign === 'center' ? 'text-center mx-auto' :
                  textAlign === 'right' ? 'text-right ml-auto' :
                  'text-left'
                }`} style={{ maxWidth: item.contentMaxWidth ? `${item.contentMaxWidth}px` : '1200px' }}>
                  <div>
                    {item.subheading && item.showSubheading !== false && (
                      <h3 className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl font-semibold text-subheading mb-2">{item.subheading}</h3>
                    )}
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight text-heading">{item.heading}</h2>
                  </div>
                  {item.description && item.showDescription !== false && (
                    <div 
                      className="text-sm sm:text-base md:text-lg leading-relaxed text-text rich-text-content"
                      dangerouslySetInnerHTML={{ __html: item.description }}
                    />
                  )}
                  {item.features && item.features.length > 0 && (
                    <div className={item.featuresLayout === 'stacked' ? 'space-y-4 mt-6' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-6'}>
                      {item.features.map((feature, featIdx) => {
                        // Check if icon is a URL (image) - more robust detection
                        const isIconImage = feature.icon && (
                          feature.icon.startsWith('http://') || 
                          feature.icon.startsWith('https://') || 
                          feature.icon.startsWith('/') ||
                          feature.icon.includes('cloudinary.com') ||
                          feature.icon.includes('pexels.com') ||
                          /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(feature.icon)
                        );
                        
                        if (item.featuresLayout === 'stacked') {
                          // Horizontal layout: icon left, content right
                          return (
                            <div key={featIdx} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-start gap-4">
                              <div className="flex-shrink-0">
                                {isIconImage ? (
                                  <img src={feature.icon} alt={feature.title || 'Feature icon'} className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-lg" />
                                ) : feature.icon ? (
                                  <div className="text-3xl md:text-4xl">{feature.icon}</div>
                                ) : null}
                              </div>
                              <div className="flex-1">
                                {feature.title && (
                                  feature.url ? (
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2"><a href={feature.url} target={feature.url.startsWith('http') ? '_blank' : '_self'} rel={feature.url.startsWith('http') ? 'noopener noreferrer' : undefined}>{feature.title}</a></h3>
                                  ) : (
                                    <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                  )
                                )}
                                {feature.text && (
                                  <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.text}</p>
                                )}
                              </div>
                            </div>
                          );
                        } else {
                          // Grid layout: icon/image top, content below
                          return (
                            <div key={featIdx} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                              {isIconImage ? (
                                <div className="mb-3"><img src={feature.icon} alt={feature.title} className="w-full h-28 object-cover rounded-md" /></div>
                              ) : feature.icon && (
                                <div className="text-3xl md:text-4xl mb-3">{feature.icon}</div>
                              )}
                              {feature.title && (
                                feature.url ? (
                                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2"><a href={feature.url} target={feature.url.startsWith('http') ? '_blank' : '_self'} rel={feature.url.startsWith('http') ? 'noopener noreferrer' : undefined}>{feature.title}</a></h3>
                                ) : (
                                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                                )
                              )}
                              {feature.text && (
                                <p className="text-sm md:text-base text-gray-600 leading-relaxed">{feature.text}</p>
                              )}
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}
                  {item.faqs && item.faqs.length > 0 && (
                    <div className="space-y-2 md:space-y-3 mt-4 md:mt-6">
                      {item.faqs.map((faq, faqIdx) => (
                        <div key={faqIdx} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
                          <button
                            onClick={() => setOpenFaqIndex(prev => ({ ...prev, [`${index}-${faqIdx}`]: !prev[`${index}-${faqIdx}`] }))}
                            className="w-full px-4 md:px-5 py-3 md:py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
                          >
                            <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 pr-3 md:pr-4">{faq.question}</span>
                            <ChevronDown 
                              size={16} 
                              className={`text-gray-600 shrink-0 transition-transform sm:w-5 sm:h-5 ${openFaqIndex[`${index}-${faqIdx}`] ? 'rotate-180' : ''}`}
                            />
                          </button>
                          {openFaqIndex[`${index}-${faqIdx}`] && (
                            <div className="px-4 md:px-5 py-3 md:py-4 border-t border-gray-200 bg-gray-50">
                              <p className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">{faq.answer}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {item.button && (
                    <a
                      href={item.buttonLink || '#'}
                      target={item.buttonTarget || '_self'}
                      rel={item.buttonTarget === '_blank' ? 'noopener noreferrer' : undefined}
                      className="inline-block px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 md:py-4 text-sm sm:text-base md:text-lg text-white font-semibold rounded-xl bg-button hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      {item.button}
                    </a>
                  )}
                </div>
              </div>
            )}
          </section>
        );
        })}
      </div>
      <Footer />
    </>
  );
}
