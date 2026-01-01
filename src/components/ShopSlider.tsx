// components/ShopSlider.tsx - Updated to showcase shop & godown
import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const ShopSlider = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoplay, setIsAutoplay] = useState(true);
  const autoplayIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const startXRef = useRef(0);
  const endXRef = useRef(0);

  // Shop and Godown photos - replace with your actual images
  const shopPhotos = [
    {
      image: '/images/shop/shop-1.jpg', // Replace with your shop image
      caption: 'Damodar Traders Showroom - Main Entrance',
      description: 'Our well-stocked showroom in Indore showcasing quality pipe fittings'
    },
    {
      image: '/images/shop/shop-2.jpg', // Replace with your shop image
      caption: 'Product Display Area',
      description: 'Organized display of CI & GI pipe fittings for easy customer selection'
    },
    {
      image: '/images/shop/godown-1.jpg', // Replace with your godown image
      caption: 'Warehouse Storage Facility',
      description: 'Spacious godown with organized storage of industrial pipes and fittings'
    },
    {
      image: '/images/shop/godown-2.jpg', // Replace with your godown image
      caption: 'Quality Inspection Area',
      description: 'Dedicated section for quality checks and product verification'
    },
    {
      image: '/images/shop/shop-3.jpg', // Replace with your shop image
      caption: 'Customer Consultation Zone',
      description: 'Comfortable area for client meetings and product discussions'
    },
    {
      image: '/images/shop/godown-3.jpg', // Replace with your godown image
      caption: 'Bulk Storage Section',
      description: 'Secure storage for large quantity orders and bulk purchases'
    }
  ];

  // Fallback images if your images are not available
  const fallbackPhotos = [
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxM5cDX9e7dc25tQx64RbEFEHS99bZUPu--qlW7M3gXic5dwVK3TogesNi99QoD_YDcj5adkZv6QuDppRvoWVYkFVQZvXZFNhS8_qdyXP0z3RybKiKj7vlXDEwnpsk3eSpYbwE=s680-w680-h510-rw',
      caption: 'Modern Showroom Facility',
      description: 'Clean and organized showroom for customer convenience'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwc1FKdBlaURp-rlb3HYocKpZXSKW3R_s7suUQPBMNm6i5uQUsuWeTW7uqXO4o9xaSblkbum3W6hxGe_yGVQk3EZRjcfIAXDKRaEieQDESUXHUf39J_2frUcMlySBWVGNdbxoFq=s680-w680-h510-rw',
      caption: 'Professional Team at Work',
      description: 'Our experienced staff assisting customers with their requirements'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxeQl5GgAkQTVUEQfgVCC2GvzBOUDvsMK55cIGsS6t59dz9KPatCZj6YNbOeTs8DlyLPi801Ts7Lnho4MkojaGNbIUnVkvtH-Bh_1F_OUjaxgcSDykp5PXie3x0fWuCo4-H3eLW=s680-w680-h510-rw',
      caption: 'Warehouse Management',
      description: 'Efficient storage and inventory management system'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwn-ALSotNBoN0R2Id7UwLtd8u6cY3IPPtqJ0kTTNYorJ9ImXGo0ZyYWEQpSpQ3NSOWh0NmNMkDGUI1wgyYeRoZf0097YJJmShkUgWBolfwujatAt2tEkk17pY3UIi9esM9HrTk=s680-w680-h510-rw',
      caption: 'Quality Control Process',
      description: 'Rigorous quality checks ensuring product excellence'
    },
    {
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSzIePw8s7UKj1qUXGWEbABTkzpqj74YoaDZ3V2z_9PR_kASfwBNSFC4umANLaksgGb12TblTRU03dbooRmT29U-7SmdBL4bcMs1OsNl0igHz3eCx6oozgJygHQpJ0j9exy6Z4Iwfw=s680-w680-h510-rw',
      caption: 'Customer Service Area',
      description: 'Dedicated space for customer support and inquiries'
    }
  ];

  // Check if images exist, use fallback if not
  const [photos, setPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkImages = async () => {
      setIsLoading(true);
      
      try {
        // You can check if images exist by trying to load them
        // For now, we'll use a simple approach - check if the first image loads
        const testImage = new Image();
        testImage.src = shopPhotos[0].image;
        
        testImage.onload = () => {
          // If first image loads, assume all shop images exist
          setPhotos(shopPhotos);
          setIsLoading(false);
        };
        
        testImage.onerror = () => {
          // If shop images don't exist, use fallback
          setPhotos(fallbackPhotos);
          setIsLoading(false);
        };
      } catch (error) {
        console.warn('Using fallback shop photos');
        setPhotos(fallbackPhotos);
        setIsLoading(false);
      }
    };

    checkImages();
  }, []);

  useEffect(() => {
    if (isAutoplay && photos.length > 1 && !isLoading) {
      startAutoplay();
    } else {
      pauseAutoplay();
    }

    return () => {
      pauseAutoplay();
    };
  }, [isAutoplay, photos.length, isLoading]);

  const startAutoplay = () => {
    pauseAutoplay();
    autoplayIntervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000); // 5 seconds per slide for shop showcase
  };

  const pauseAutoplay = () => {
    if (autoplayIntervalRef.current) {
      clearInterval(autoplayIntervalRef.current);
      autoplayIntervalRef.current = null;
    }
  };

  const resetAutoplay = () => {
    pauseAutoplay();
    if (isAutoplay) {
      startAutoplay();
    }
  };

  const nextSlide = () => {
    if (photos.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % photos.length);
  };

  const prevSlide = () => {
    if (photos.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const goToSlide = (index: number) => {
    if (photos.length === 0) return;
    setCurrentSlide(index);
  };

  const toggleAutoplay = () => {
    setIsAutoplay(!isAutoplay);
  };

  // Touch swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    startXRef.current = e.touches[0].clientX;
    pauseAutoplay();
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    endXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const threshold = 50;
    if (startXRef.current - endXRef.current > threshold) {
      nextSlide();
    } else if (endXRef.current - startXRef.current > threshold) {
      prevSlide();
    }
    resetAutoplay();
  };

  if (isLoading) {
    return (
      <div className="shop-slider-section">
        <div className="shop-slider-title">Our Shop & Facilities</div>
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </div>
    );
  }

  if (photos.length === 0) {
    return null;
  }

  return (
    <div className="shop-slider-section">
      <div className="shop-slider-title">Our Shop & Facilities</div>
      
      <div className="shop-slider-container">
        <div 
          className="shop-slider" 
          style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {photos.map((photo, index) => (
            <div key={index} className="shop-slide group">
              <img
                src={photo.image}
                alt={photo.caption}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="slide-overlay absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="slide-content absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="max-w-3xl mx-auto">
                  <h3 className="text-2xl font-bold mb-2">{photo.caption}</h3>
                  <p className="text-white/90">{photo.description}</p>
                  <div className="flex items-center mt-4 text-sm">
                    <span className="flex items-center bg-white/20 px-3 py-1 rounded-full">
                      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Damodar Traders, Indore
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {photos.length > 1 && (
          <>
            <button 
              className="slider-btn absolute left-5 top-1/2 -translate-y-1/2 z-20" 
              onClick={() => {
                prevSlide();
                resetAutoplay();
              }}
              aria-label="Previous slide"
            >
              <ChevronLeft />
            </button>
            <button 
              className="slider-btn absolute right-5 top-1/2 -translate-y-1/2 z-20" 
              onClick={() => {
                nextSlide();
                resetAutoplay();
              }}
              aria-label="Next slide"
            >
              <ChevronRight />
            </button>

            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
              {photos.map((_, index) => (
                <button
                  key={index}
                  className={`slider-dot ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => {
                    goToSlide(index);
                    resetAutoplay();
                  }}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>

            <div 
              className="autoplay-control absolute bottom-8 right-8 z-20" 
              onClick={toggleAutoplay}
              aria-label={isAutoplay ? 'Pause slideshow' : 'Play slideshow'}
            >
              {isAutoplay ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Play</span>
                </>
              )}
            </div>

            <div className="absolute top-4 right-4 z-20">
              <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium text-gray-700">
                  {currentSlide + 1} / {photos.length}
                </span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Shop Info Section */}
      <div className="mt-12 grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Showroom</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Visit our well-equipped showroom in Indore to see our complete range of CI & GI pipe fittings and industrial valves.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Warehouse</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Our spacious godown ensures ample stock availability for immediate delivery and bulk orders.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800">Quality Control</h3>
          </div>
          <p className="text-gray-600 text-sm">
            Dedicated inspection area ensures every product meets our stringent quality standards before dispatch.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopSlider;