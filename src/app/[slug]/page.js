"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import ThemeLoader from "../../components/ThemeLoader";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import ContactForm from "../../components/ContactForm";
import { ChevronDown } from "lucide-react";

export default function DynamicPage() {
  const pathname = usePathname();
  const [page, setPage] = useState(null);
  const [loading, setLoading] = useState(true);
  const [openFaqIndex, setOpenFaqIndex] = useState({});
  const [videoPlaying, setVideoPlaying] = useState({});
  const videoRefs = useRef({});

  useEffect(() => {
    fetch("/api/pages")
      .then(res => res.json())
      .then(data => {
        const currentPage = data.find(p => p.slug === pathname);
        setPage(currentPage);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading page:", err);
        setLoading(false);
      });
  }, [pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600">Page not found</p>
        </div>
      </div>
    );
  }

  const sections = page.sections || [];

  return (
    <>
      <ThemeLoader />
      <Header />
      <div>
        {sections.length === 0 ? (
        <div className="flex items-center justify-center min-h-screen bg-body">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4 text-heading">{page.name}</h1>
            <p className="text-text">No sections added yet</p>
          </div>
        </div>
      ) : (
        sections.map((item, index) => {
          // Skip hidden sections (hidden: true means hide, hidden: false or undefined means show)
          if (item.hidden === true) {
            return null;
          }
          
          const hasImage = item.img;
          const isRight = item.align === "right";
          const textAlign = item.textAlign || "left";

          // show flags removed — always show subheading/description when present
          // (legacy properties are ignored)

          // Determine background styling
          let backgroundStyle = {};
          let backgroundClass = "";

          if (item.bgType === "image") {
            // Use bgImage or bgImageUrl
            const bgImageUrl = item.bgImage || item.bgImageUrl;
            if (bgImageUrl) {
              backgroundStyle = {
                backgroundImage: `url('${bgImageUrl}')`,
                backgroundSize: "cover",
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

          // Determine minHeight behavior — consolidated later when rendering so it applies to video backgrounds as well

          // If an image is present and a customHeight is set, we'll also set the image container height below
          const imageContainerStyle = {};
          if (item.customHeight) {
            imageContainerStyle.height = `${item.customHeight}px`;
          }

          // Features layout class (section-level)
          const featuresGridClass = item.featuresLayout === 'grid-3' ? 'grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mt-6' : (item.featuresLayout === 'stacked' ? 'grid grid-cols-1 gap-4 mt-6' : 'grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6');

          const hasVideoBackground = item.bgType === 'video' && item.bgVideoUrl;
          const hasImageBackground = item.bgType === 'image' && (item.bgImage || item.bgImageUrl);

          // Generate unique section ID for custom colors
          const sectionId = `section-${index}`;
          const hasCustomColors = item.customHeadingColor || item.customSubheadingColor || item.customTextColor;

          // Build section style and ensure customHeight applies to the section (so video backgrounds inherit the height)
          const sectionStyle = hasImageBackground ? { ...backgroundStyle, backgroundAttachment: 'scroll' } : (Object.keys(backgroundStyle).length > 0 ? { ...backgroundStyle } : {});
          if (item.customHeight) {
            sectionStyle.minHeight = `${item.customHeight}px`;
          } else if (hasImage) {
            sectionStyle.minHeight = '500px';
          } else {
            sectionStyle.minHeight = '400px';
          }

          // Check if this is a contact form section
          const isContactSection = item.sectionType === 'contact';

          return (
            <section 
              key={index}
              id={sectionId}
              className={`w-full ${paddingClass} ${backgroundClass} ${hasVideoBackground || hasImageBackground ? 'relative overflow-hidden' : ''}`.trim()}
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
                  {item.bgVideoWidth === 'container' ? (
                    <div className="absolute inset-0 flex items-center justify-center z-0">
                      <div className="w-full max-w-6xl h-full overflow-hidden">
                        <video
                          ref={(el) => { if (el) videoRefs.current[index] = el }}
                          src={item.bgVideoUrl}
                          autoPlay={item.bgVideoAutoplay !== false}
                          loop={item.bgVideoLoop !== false}
                          muted={item.bgVideoMuted !== false}
                          controls={item.bgVideoControls === true}
                          playsInline
                          onPlay={() => setVideoPlaying(prev => ({ ...prev, [index]: true }))}
                          onPause={() => setVideoPlaying(prev => ({ ...prev, [index]: false }))}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <video
                      ref={(el) => { if (el) videoRefs.current[index] = el }}
                      src={item.bgVideoUrl}
                      autoPlay={item.bgVideoAutoplay !== false}
                      loop={item.bgVideoLoop !== false}
                      muted={item.bgVideoMuted !== false}
                      controls={item.bgVideoControls === true}
                      playsInline
                      onPlay={() => setVideoPlaying(prev => ({ ...prev, [index]: true }))}
                      onPause={() => setVideoPlaying(prev => ({ ...prev, [index]: false }))}
                      className="absolute inset-0 w-full h-full object-cover z-0"
                    />
                  )}

                  <div 
                    className="absolute inset-0 bg-black z-0" 
                    style={{ opacity: (item.bgVideoOverlay || 50) / 100 }}
                  ></div>

                  {/* Centered play button overlay */}
                  {item.bgVideoShowPlayButton !== false && !videoPlaying[index] && (
                    <button
                      onClick={() => {
                        const v = videoRefs.current[index];
                        if (v) { v.play(); setVideoPlaying(prev => ({ ...prev, [index]: true })); }
                      }}
                      className="absolute z-10 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 rounded-full bg-black/40 hover:bg-black/50 p-4 text-white"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    </button>
                  )}
                </>
              )} 

              {hasImageBackground && item.bgImageOverlay > 0 && (
                <div 
                  className="absolute inset-0 bg-black z-0" 
                  style={{ opacity: (item.bgImageOverlay || 0) / 100 }}
                ></div>
              )}

              {isContactSection ? (
                // Contact Form Section
                <div className="max-w-6xl mx-auto px-6 relative z-10">
                  {(item.heading || item.subheading) && (
                    <div className={`mb-8 ${textAlign === 'center' ? 'text-center' : textAlign === 'right' ? 'text-right' : 'text-left'}`}>
                      {item.subheading && (
                        <h3 className="text-xl md:text-2xl font-semibold mb-3 text-subheading">
                          {item.subheading}
                        </h3>
                      )}
                      {item.heading && (
                        <h2 className="text-4xl md:text-5xl font-bold leading-tight text-heading">
                          {item.heading}
                        </h2>
                      )}
                      {item.description && (
                        <div className="text-lg leading-relaxed text-text mt-4 rich-text-content" dangerouslySetInnerHTML={{ __html: item.description }} />
                      )}
                    </div>
                  )}
                  <ContactForm
                    showMap={item.showMap !== false}
                    mapUrl={item.mapUrl || ''}
                    contactInfo={{
                      email: item.contactEmail || '',
                      phone: item.contactPhone || '',
                      address: item.contactAddress || ''
                    }}
                    formTitle={item.formTitle || 'Send us a message'}
                    submitButtonText={item.submitButtonText || 'Send Message'}
                  />
                </div>
              ) : hasImage ? (
                // Layout with image - 2 columns
                <div className="max-w-6xl mx-auto grid md:grid-cols-2 items-center gap-10 px-6">
                  {/* Image */}
                  <div className={`w-full ${item.customHeight ? '' : 'h-80'} relative ${isRight ? "md:order-2" : "md:order-1"}`} style={Object.keys(imageContainerStyle).length > 0 ? imageContainerStyle : undefined}>
                    <Image
                      src={item.img}
                      alt={item.heading}
                      fill
                      className="object-cover rounded-xl shadow-md"
                      unoptimized
                    />
                  </div>

                  {/* Content */}
                  <div className={`space-y-5 ${isRight ? "md:order-1" : "md:order-2"} ${
                    textAlign === 'center' ? 'text-center md:col-span-2' :
                    textAlign === 'right' ? 'text-right' :
                    'text-left'
                  }`}>
                    <div>
                      {item.subheading && item.showSubheading !== false && (
                        <h3 className="text-xl md:text-2xl font-semibold mb-3 text-subheading">
                          {item.subheading}
                        </h3>
                      )}

                      <h2 className="text-4xl md:text-5xl font-bold leading-tight text-heading">
                        {item.heading}
                      </h2>
                    </div>

                    {item.description && item.showDescription !== false && (
                      <div className="text-lg leading-relaxed text-text rich-text-content" dangerouslySetInnerHTML={{ __html: item.description }} />
                    )}

                    {item.features && item.features.length > 0 && (
                      <div className={item.featuresLayout === 'stacked' ? 'space-y-4' : featuresGridClass}>
                        {item.features.map((f, i) => {
                          // Check if icon is a URL (image) - more robust detection
                          const isIconImage = f.icon && (
                            f.icon.startsWith('http://') || 
                            f.icon.startsWith('https://') || 
                            f.icon.startsWith('/') ||
                            f.icon.includes('cloudinary.com') ||
                            f.icon.includes('pexels.com') ||
                            /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f.icon)
                          );

                          if (item.featuresLayout === 'stacked') {
                            // Horizontal layout: icon left, content right
                            return (
                              <div key={i} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  {isIconImage ? (
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                      <img src={f.icon} alt={f.title || 'Feature icon'} className="w-full h-full object-cover" />
                                    </div>
                                  ) : f.icon ? (
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 flex items-center justify-center text-3xl md:text-4xl">{f.icon}</div>
                                  ) : null}
                                </div>
                                <div className="flex-1">
                                  {f.title && (f.url ? <h4 className="font-semibold text-lg text-heading"><a href={f.url} target={f.url && f.url.startsWith('http') ? '_blank' : '_self'} rel={f.url && f.url.startsWith('http') ? 'noopener noreferrer' : undefined}>{f.title}</a></h4> : <h4 className="font-semibold text-lg text-heading">{f.title}</h4>)}
                                  {f.text && <p className="text-gray-600 mt-1">{f.text}</p>}
                                </div>
                              </div>
                            );
                          } else {
                            // Grid layout: icon/image top, content below
                            return (
                              <div key={i} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-center mb-4">
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                    {isIconImage ? (
                                      <img src={f.icon} alt={f.title || 'Feature icon'} className="w-full h-full object-cover" />
                                    ) : f.icon ? (
                                      <span className="text-3xl md:text-4xl">{f.icon}</span>
                                    ) : null}
                                  </div>
                                </div>
                                <div>
                                  {f.title && (f.url ? <h4 className="font-semibold text-lg text-heading"><a href={f.url} target={f.url && f.url.startsWith('http') ? '_blank' : '_self'} rel={f.url && f.url.startsWith('http') ? 'noopener noreferrer' : undefined}>{f.title}</a></h4> : <h4 className="font-semibold text-lg text-heading">{f.title}</h4>)}
                                  {f.text && <p className="text-gray-600 mt-1">{f.text}</p>}
                                </div>
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
                        className="inline-block px-8 py-4 text-white text-lg font-semibold rounded-xl bg-button hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {item.button}
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                // Layout without image - full width with text alignment
                <div className="max-w-6xl mx-auto px-6">
                  <div className={`space-y-5 ${
                    textAlign === 'center' ? 'text-center w-full' :
                    textAlign === 'right' ? 'text-right ml-auto max-w-4xl' :
                    'text-left max-w-4xl'
                  }`}>
                    <div>
                      {item.subheading && item.showSubheading !== false && (
                        <h3 className="text-xl md:text-2xl font-semibold mb-3 text-subheading">
                          {item.subheading}
                        </h3>
                      )}

                      <h2 className="text-4xl md:text-5xl font-bold leading-tight text-heading">
                        {item.heading}
                      </h2>
                    </div>

                    {item.description && item.showDescription !== false && (
                      <div className="text-lg leading-relaxed text-text rich-text-content" dangerouslySetInnerHTML={{ __html: item.description }} />
                    )}

                    {item.features && item.features.length > 0 && (
                      <div className={item.featuresLayout === 'stacked' ? 'space-y-4' : featuresGridClass}>
                        {item.features.map((f, i) => {
                          // Check if icon is a URL (image) - more robust detection
                          const isIconImage = f.icon && (
                            f.icon.startsWith('http://') || 
                            f.icon.startsWith('https://') || 
                            f.icon.startsWith('/') ||
                            f.icon.includes('cloudinary.com') ||
                            f.icon.includes('pexels.com') ||
                            /\.(jpg|jpeg|png|gif|svg|webp)$/i.test(f.icon)
                          );

                          if (item.featuresLayout === 'stacked') {
                            // Horizontal layout: icon left, content right
                            return (
                              <div key={i} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow flex items-start gap-4">
                                <div className="flex-shrink-0">
                                  {isIconImage ? (
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                      <img src={f.icon} alt={f.title || 'Feature icon'} className="w-full h-full object-cover" />
                                    </div>
                                  ) : f.icon ? (
                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-slate-50 flex items-center justify-center text-3xl md:text-4xl">{f.icon}</div>
                                  ) : null}
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold text-lg text-heading">{f.title}</h4>
                                  {f.text && <p className="text-gray-600 mt-1">{f.text}</p>}
                                </div>
                              </div>
                            );
                          } else {
                            // Grid layout: icon/image top, content below
                            return (
                              <div key={i} className="p-4 md:p-6 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                                <div className="flex items-center justify-center mb-4">
                                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden bg-slate-50 flex items-center justify-center">
                                    {isIconImage ? (
                                      <img src={f.icon} alt={f.title || 'Feature icon'} className="w-full h-full object-cover" />
                                    ) : f.icon ? (
                                      <span className="text-3xl md:text-4xl">{f.icon}</span>
                                    ) : null}
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-semibold text-lg text-heading">{f.title}</h4>
                                  {f.text && <p className="text-gray-600 mt-1">{f.text}</p>}
                                </div>
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
                        className="inline-block px-8 py-4 text-white text-lg font-semibold rounded-xl bg-button hover:opacity-90 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                      >
                        {item.button}
                      </a>
                    )}
                  </div>
                </div>
              )}
            </section>
          );
          })
        )}
      </div>
      <Footer />
    </>
  );
}
