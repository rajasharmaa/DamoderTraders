// components/MediaGallery.tsx
import { useState, useEffect, useRef, useCallback, useId } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '@/lib/api';

// Register GSAP plugins (check if already registered)

const MediaGallery = () => {
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationsInitializedRef = useRef(false);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);
  const mouseMoveRef = useRef<((e: MouseEvent) => void) | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const hoverTimelinesRef = useRef<WeakMap<HTMLElement, gsap.core.Timeline>>(new WeakMap());
  const velocityRef = useRef({ x: 0, y: 0 });
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Use React's useId for unique component ID (SSR safe)
  const componentId = useId().replace(/:/g, '-');
  
  // SSR-safe ID generation (client-side only)
  const galleryIdRef = useRef('');
  useEffect(() => {
    if (!galleryIdRef.current) {
      galleryIdRef.current = `gallery-${componentId}-${Math.random().toString(36).substr(2, 9)}`;
    }
  }, [componentId]);

  // Fetch products with abort controller
  useEffect(() => {
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchPopularProducts = async () => {
      try {
        setIsLoading(true);
        
        // Check if component is still mounted
        if (signal.aborted) return;
        
        // First try to get popular products from API
        let data = await api.products.getPopular();
        
        // If no popular products, get all products and pick random ones
        if (!data || data.length === 0) {
          data = await api.products.getAll();
        }
        
        // Check abort again before state update
        if (signal.aborted) return;
        
        // If no data, use fallback
        if (!data || data.length === 0) {
          setPopularProducts(getFallbackProducts());
        } else {
          // Shuffle array and take up to 8 products
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setPopularProducts(shuffled.slice(0, 9));
        }
      } catch (error) {
        if (signal.aborted) return;
        console.warn('Using fallback products for gallery');
        setPopularProducts(getFallbackProducts());
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchPopularProducts();
    
    // Cleanup function
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Set card ref callback with proper cleanup
  const setCardRef = useCallback((productId: string) => {
    return (el: HTMLDivElement | null) => {
      if (!el) {
        // Clean up when element unmounts
        cardsRef.current = cardsRef.current.filter(card => 
          card?.dataset.productId !== productId
        );
        return;
      }
      
      // Find existing card with same product ID
      const existingIndex = cardsRef.current.findIndex(
        card => card?.dataset.productId === productId
      );
      
      if (existingIndex > -1) {
        cardsRef.current[existingIndex] = el;
      } else {
        cardsRef.current.push(el);
        el.dataset.productId = productId;
      }
    };
  }, []);

  // Event delegation for hover effects
  const handleGalleryMouseEnter = useCallback((e: MouseEvent) => {
    const card = (e.target as Element).closest('.media-card');
    if (!card || !galleryRef.current?.contains(card)) return;
    
    const image = card.querySelector('img');
    if (!image) return;
    
    // Kill any existing timeline for this card
    const existingTimeline = hoverTimelinesRef.current.get(card as HTMLElement);
    if (existingTimeline) {
      existingTimeline.kill();
    }
    
    // Card shadow
    const shadowTween = gsap.to(card, {
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
      duration: 0.3,
      ease: 'power2.out'
    });
    tweensRef.current.push(shadowTween);
    
    // Image animation with velocity
    const timeline = gsap.timeline();
    
    // Scale up with simulated inertia
    timeline.to(image, {
      duration: 0.5,
      scale: 1.1,
      ease: 'power2.out',
      x: velocityRef.current.x * 0.5,
      y: velocityRef.current.y * 0.5,
    });
    
    // Add slight rotation for dynamic effect
    timeline.to(image, {
      duration: 0.4,
      rotate: (Math.random() - 0.5) * 15,
      yoyo: true,
      repeat: 1,
      ease: 'power1.inOut'
    }, '<');
    
    hoverTimelinesRef.current.set(card as HTMLElement, timeline);
    timelinesRef.current.push(timeline);
  }, []);

  const handleGalleryMouseLeave = useCallback((e: MouseEvent) => {
    const card = (e.target as Element).closest('.media-card');
    if (!card || !galleryRef.current?.contains(card)) return;
    
    const image = card.querySelector('img');
    
    // Reset card shadow
    const resetShadowTween = gsap.to(card, {
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
      duration: 0.3,
      ease: 'power2.out'
    });
    tweensRef.current.push(resetShadowTween);
    
    // Reset image
    if (image) {
      const resetImageTween = gsap.to(image, {
        scale: 1,
        x: 0,
        y: 0,
        rotate: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      tweensRef.current.push(resetImageTween);
    }
    
    // Kill and remove timeline
    const existingTimeline = hoverTimelinesRef.current.get(card as HTMLElement);
    if (existingTimeline) {
      existingTimeline.kill();
      hoverTimelinesRef.current.delete(card as HTMLElement);
    }
  }, []);

  // Initialize animations after products are loaded
  useEffect(() => {
    if (!isLoading && galleryRef.current && !animationsInitializedRef.current) {
      initAnimations();
      animationsInitializedRef.current = true;
    }
  }, [isLoading]);

  const initAnimations = () => {
    // Clean up any existing animations specific to this component
    cleanupAnimations();
    
    // Set gallery ID if not set
    if (galleryRef.current && !galleryRef.current.id) {
      galleryRef.current.id = galleryIdRef.current;
    }
    
    // Only run GSAP animations on desktop
    if (window.innerWidth > 768 && galleryRef.current) {
      // Setup mouse tracking for hover velocity
      setupMouseTracking();
      
      // Setup event delegation for hover effects
      const gallery = galleryRef.current;
      gallery.addEventListener('mouseenter', handleGalleryMouseEnter, true);
      gallery.addEventListener('mouseleave', handleGalleryMouseLeave, true);
      
      // Gallery header animation
      const headerTrigger = ScrollTrigger.create({
        trigger: `#${galleryIdRef.current} .gallery-header`,
        start: 'top 80%',
        end: 'bottom 20%',
        once: true,
        markers: false,
        id: `${galleryIdRef.current}-header`,
        onEnter: () => {
          const tween = gsap.from(`#${galleryIdRef.current} .gallery-header`, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => {
              // Clean up after completion
              tweensRef.current = tweensRef.current.filter(t => t !== tween);
              tween.kill();
            }
          });
          tweensRef.current.push(tween);
        }
      });
      scrollTriggersRef.current.push(headerTrigger);

      // Product cards stagger animation
      const cardsTrigger = ScrollTrigger.create({
        trigger: `#${galleryIdRef.current}`,
        start: 'top 75%',
        end: 'bottom 25%',
        once: true,
        toggleActions: 'play none none none',
        id: `${galleryIdRef.current}-cards`,
        onEnter: () => {
          const cards = gsap.utils.toArray(`#${galleryIdRef.current} .media-card`);
          const tween = gsap.from(cards, {
            y: 50,
            opacity: 0,
            duration: 0.6,
            stagger: 0.1,
            ease: 'back.out(1.7)',
            onComplete: () => {
              // Clean up after completion
              tweensRef.current = tweensRef.current.filter(t => t !== tween);
              tween.kill();
            }
          });
          tweensRef.current.push(tween);
        }
      });
      scrollTriggersRef.current.push(cardsTrigger);

      // View more button animation
      const buttonTrigger = ScrollTrigger.create({
        trigger: `#${galleryIdRef.current}`,
        start: 'top 70%',
        end: 'bottom 30%',
        once: true,
        id: `${galleryIdRef.current}-button`,
        onEnter: () => {
          const tween = gsap.from(`#${galleryIdRef.current} .view-more-btn`, {
            y: 30,
            opacity: 0,
            duration: 0.8,
            delay: 0.5,
            ease: 'power2.out',
            onComplete: () => {
              // Clean up after completion
              tweensRef.current = tweensRef.current.filter(t => t !== tween);
              tween.kill();
            }
          });
          tweensRef.current.push(tween);
        }
      });
      scrollTriggersRef.current.push(buttonTrigger);

      // Add subtle floating animation to cards (no ScrollTrigger)
      const cards = gsap.utils.toArray(`#${galleryIdRef.current} .media-card`);
      cards.forEach((card: any, index: number) => {
        const floatTween = gsap.to(card, {
          y: -5,
          duration: 2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: index * 0.1,
          paused: false,
        });
        tweensRef.current.push(floatTween);
      });
    } else {
      // Mobile: Use GSAP for consistent transforms
      cardsRef.current.forEach((card, index) => {
        if (card) {
          // Reset to default state
          gsap.set(card, { 
            y: 0,
            x: 0,
            rotate: 0,
            scale: 1,
            opacity: 0
          });
          
          // Animate in with GSAP
          const tween = gsap.to(card, {
            y: 0,
            opacity: 1,
            duration: 0.5,
            delay: index * 0.1,
            ease: 'power2.out'
          });
          tweensRef.current.push(tween);
        }
      });
    }
  };

  const setupMouseTracking = () => {
    const updateMousePosition = (e: MouseEvent) => {
      // Store velocity for hover effects
      velocityRef.current.x = e.movementX;
      velocityRef.current.y = e.movementY;
    };
    
    // Only add listener if not already added
    if (!mouseMoveRef.current) {
      mouseMoveRef.current = updateMousePosition;
      document.addEventListener("mousemove", mouseMoveRef.current);
    }
    
    // Start animation loop only if needed for effects
    const animate = () => {
      // Optional: Use velocity for continuous effects
      // Currently not used but kept for future extensibility
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    // Only start loop if we're actually using it
    if (animationFrameRef.current === null) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
  };

  const cleanupAnimations = () => {
    // Kill all tweens created by this component
    tweensRef.current.forEach(tween => {
      if (tween && tween.kill) {
        tween.kill();
      }
    });
    tweensRef.current = [];

    // Kill all timelines
    timelinesRef.current.forEach(timeline => {
      if (timeline && timeline.kill) {
        timeline.kill();
      }
    });
    timelinesRef.current = [];

    // Kill only our scroll triggers
    scrollTriggersRef.current.forEach(trigger => {
      if (trigger && trigger.kill) {
        trigger.kill();
      }
    });
    scrollTriggersRef.current = [];

    // Remove mouse move listener
    if (mouseMoveRef.current) {
      document.removeEventListener("mousemove", mouseMoveRef.current);
      mouseMoveRef.current = null;
    }

    // Cancel animation frame
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // Remove event delegation listeners
    if (galleryRef.current) {
      galleryRef.current.removeEventListener('mouseenter', handleGalleryMouseEnter, true);
      galleryRef.current.removeEventListener('mouseleave', handleGalleryMouseLeave, true);
      
      // Clear hover timelines
      const cards = galleryRef.current.querySelectorAll('.media-card');
      cards.forEach(card => {
        hoverTimelinesRef.current.delete(card as HTMLElement);
      });
    }
  };

  // Handle window resize for responsive animations
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cleanupAnimations();
        animationsInitializedRef.current = false;
        
        // Remove hover effects on mobile
        if (galleryRef.current) {
          const cards = galleryRef.current.querySelectorAll('.media-card');
          cards.forEach(card => {
            gsap.set(card, { 
              clearProps: 'boxShadow,rotate,x,y,scale' 
            });
          });
        }
        
        // Reinitialize animations after a short delay
        if (!isLoading) {
          setTimeout(() => {
            initAnimations();
            animationsInitializedRef.current = true;
          }, 150);
        }
      }, 250);
    };

    window.addEventListener('resize', handleResize);
    
    // Cleanup on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimeout);
      cleanupAnimations();
      
      // Cancel API request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Remove any remaining GSAP animations for this gallery
      if (galleryRef.current && galleryRef.current.id) {
        gsap.killTweensOf(`#${galleryRef.current.id} .media-card`);
        gsap.killTweensOf(`#${galleryRef.current.id} .gallery-header`);
        gsap.killTweensOf(`#${galleryIdRef.current} .view-more-btn`);
      }
    };
  }, [isLoading, handleGalleryMouseEnter, handleGalleryMouseLeave]);

  // Fallback products
  const getFallbackProducts = () => {
    const fallbackProducts = [
      {
        _id: 'fallback-1',
        name: 'GI Elbow 90°',
        category: 'fittings',
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 25,
      },
      {
        _id: 'fallback-2',
        name: 'CI Foot Valve',
        category: 'valves',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 20,
      },
      {
        _id: 'fallback-3',
        name: 'GI Pipe 2"',
        category: 'pipes',
        image: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 15,
      },
      {
        _id: 'fallback-4',
        name: 'Ball Valve',
        category: 'valves',
        image: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 10,
      },
      {
        _id: 'fallback-5',
        name: 'Pipe Coupling',
        category: 'fittings',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 12,
      },
      {
        _id: 'fallback-6',
        name: 'Gate Valve',
        category: 'valves',
        image: 'https://images.unsplash.com/photo-1581092580497-e0d4cb184827?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 18,
      },
      {
        _id: 'fallback-7',
        name: 'Tee Fitting',
        category: 'fittings',
        image: 'https://images.unsplash.com/photo-1581092580497-e0d4cb184827?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 8,
      },
      {
        _id: 'fallback-8',
        name: 'Reducer Fitting',
        category: 'fittings',
        image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
        discount: 14,
      },
    ];
    
    // Shuffle fallback products
    return [...fallbackProducts].sort(() => 0.5 - Math.random()).slice(0, 8);
  };

  return (
    <div ref={galleryRef} className="media-gallery-section">
      <div className="gallery-header">
        <div className="line-left" />
        <div className="gallery-title">Popular Products</div>
        <div className="line-right" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <>
          <div className="media-grid">
            {popularProducts.map((product) => (
              <Link 
                key={product._id} 
                to={product._id.includes('fallback') ? '/products' : `/products/${product._id}`}
                className="block"
              >
                <div 
                  ref={setCardRef(product._id)}
                  data-product-id={product._id}
                  className="media-card group relative overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-48 object-cover will-change-transform transform-gpu origin-center"
                    />
                    
                    {/* Discount Badge */}
                    {product.discount > 0 && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        {product.discount}% OFF
                      </div>
                    )}
                    
                    {/* Quick View Overlay */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-medium text-sm bg-primary/80 px-4 py-2 rounded-full">
                        View Details
                      </span>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="mt-4 p-2">
                    <h3 className="text-sm font-medium text-foreground mb-1 truncate group-hover:text-primary transition-colors duration-300">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <p className="text-xs text-muted-foreground capitalize">
                        {product.category}
                      </p>
                      <span className="text-xs text-primary font-medium">
                        {product.discount > 0 ? 'Special Offer' : 'In Stock'}
                      </span>
                    </div>
                    
                    {/* Category Tag */}
                    <div className="mt-3">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium capitalize ${
                        product.category === 'fittings' ? 'bg-blue-100 text-blue-800' :
                        product.category === 'valves' ? 'bg-green-100 text-green-800' :
                        product.category === 'pipes' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {product.category}
                      </span>
                    </div>
                  </div>
                  
                  {/* Hover Effect Border */}
                  <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/30 rounded-lg transition-all duration-300 pointer-events-none" />
                  
                  {/* Floating Animation Indicator */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              </Link>
            ))}
          </div>
          
          {/* View More Button */}
          <div className="text-center mt-12">
            <Link 
              to="/categories" 
              className="view-more-btn inline-flex items-center gap-2 px-8 py-3 bg-primary text-white rounded-full font-medium text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
            >
              View All Products
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
            
            <p className="text-muted-foreground mt-4 text-sm">
              Explore our complete range of industrial pipes, fittings, and valves
            </p>
            
            {/* Category Quick Links */}
            <div className="flex flex-wrap justify-center gap-4 mt-9 mb-5">
              {['Pipes', 'Fittings', 'Valves', 'Other'].map((category) => (
                <Link
                  key={category}
                  to={`/products?category=${category.toLowerCase()}`}
                  className="inline-flex items-center gap-1 px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-primary/30 hover:text-primary transition-all duration-300"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  {category}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MediaGallery;