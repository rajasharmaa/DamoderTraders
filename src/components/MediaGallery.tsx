// components/MediaGallery.tsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { api } from '@/lib/api';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Note: Inertia plugin is not included in standard GSAP
// Remove inertia properties or install the plugin

const MediaGallery = () => {
  const [popularProducts, setPopularProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const animationsInitializedRef = useRef(false);
  const scrollTriggersRef = useRef<ScrollTrigger[]>([]);
  const tweensRef = useRef<gsap.core.Tween[]>([]);
  const timelinesRef = useRef<gsap.core.Timeline[]>([]);

  useEffect(() => {
    const fetchPopularProducts = async () => {
      try {
        setIsLoading(true);
        // First try to get popular products from API
        let data = await api.products.getPopular();
        
        // If no popular products, get all products and pick random ones
        if (!data || data.length === 0) {
          data = await api.products.getAll();
        }
        
        // If no data, use fallback
        if (!data || data.length === 0) {
          setPopularProducts(getFallbackProducts());
        } else {
          // Shuffle array and take up to 8 products
          const shuffled = [...data].sort(() => 0.5 - Math.random());
          setPopularProducts(shuffled.slice(0, 9));
        }
      } catch (error) {
        console.warn('Using fallback products for gallery');
        setPopularProducts(getFallbackProducts());
      } finally {
        setIsLoading(false);
      }
    };

    fetchPopularProducts();
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
    
    // Only run GSAP animations on desktop
    if (window.innerWidth > 768 && galleryRef.current) {
      // Get unique IDs for this component's elements
      const galleryId = `gallery-${Date.now()}`;
      galleryRef.current.id = galleryId;
      
      // Gallery header animation
      const headerTween = gsap.from(`#${galleryId} .gallery-header`, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: `#${galleryId}`,
          start: 'top 80%',
          end: 'bottom 20%',
          once: true,
          markers: false,
          id: 'gallery-header-anim',
        },
      });
      tweensRef.current.push(headerTween);

      // Product cards stagger animation
      const cards = gsap.utils.toArray(`#${galleryId} .media-card`);
      const cardsTween = gsap.from(cards, {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)',
        scrollTrigger: {
          trigger: `#${galleryId}`,
          start: 'top 75%',
          end: 'bottom 25%',
          once: true,
          toggleActions: 'play none none none',
          id: 'cards-stagger-anim',
        },
      });
      tweensRef.current.push(cardsTween);

      // View more button animation
      const buttonTween = gsap.from(`#${galleryId} .view-more-btn`, {
        y: 30,
        opacity: 0,
        duration: 0.8,
        delay: 0.5,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: `#${galleryId}`,
          start: 'top 70%',
          end: 'bottom 30%',
          once: true,
          id: 'button-anim',
        },
      });
      tweensRef.current.push(buttonTween);

      // Store all scroll triggers
      scrollTriggersRef.current = ScrollTrigger.getAll().filter(trigger => 
        trigger.vars.id?.includes('anim')
      );

      // Add subtle floating animation to cards (no ScrollTrigger)
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

      // Setup hover effects for desktop WITHOUT inertia
      setupHoverEffects(galleryId);
    } else {
      // Mobile: Simple fade in for cards
      cardsRef.current.forEach((card, index) => {
        if (card) {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          
          // Use requestAnimationFrame for smoother animations
          requestAnimationFrame(() => {
            setTimeout(() => {
              if (card) {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
              }
            }, index * 100);
          });
        }
      });
    }
  };

  const setupHoverEffects = (galleryId: string) => {
    // Track mouse movement for smooth hover effect
    let mouseX = 0, mouseY = 0;
    let lastX = 0, lastY = 0;
    let velocityX = 0, velocityY = 0;
    let animationFrame: number;
    
    const updateMousePosition = (e: MouseEvent) => {
      const newX = e.clientX;
      const newY = e.clientY;
      
      // Calculate velocity based on mouse movement
      velocityX = newX - lastX;
      velocityY = newY - lastY;
      
      lastX = newX;
      lastY = newY;
      mouseX = newX;
      mouseY = newY;
    };
    
    document.addEventListener("mousemove", updateMousePosition);

    // Add hover effects to cards within this gallery only
    const cards = document.querySelectorAll(`#${galleryId} .media-card`);
    cards.forEach(card => {
      const image = card.querySelector('img');
      let hoverTimeline: gsap.core.Timeline | null = null;
      
      const mouseEnterHandler = () => {
        const productId = (card as HTMLElement).dataset.productId;
        if (productId) setHoveredProduct(productId);
        
        // Card shadow with specific scope
        const shadowTween = gsap.to(card, {
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
          duration: 0.3,
          ease: 'power2.out'
        });
        tweensRef.current.push(shadowTween);
        
        // Image scale with smooth animation (no inertia plugin)
        if (image) {
          // Kill any existing timeline
          if (hoverTimeline) {
            hoverTimeline.kill();
          }
          
          hoverTimeline = gsap.timeline();
          
          // Scale up
          hoverTimeline.to(image, {
            duration: 0.5,
            scale: 1.1,
            ease: 'power2.out',
            x: velocityX * 0.5, // Simulated inertia effect
            y: velocityY * 0.5,
          });
          
          // Add slight rotation for dynamic effect
          hoverTimeline.to(image, {
            duration: 0.4,
            rotate: (Math.random() - 0.5) * 15,
            yoyo: true,
            repeat: 1,
            ease: 'power1.inOut'
          }, '<');
          
          timelinesRef.current.push(hoverTimeline);
        }
      };
      
      const mouseLeaveHandler = () => {
        const productId = (card as HTMLElement).dataset.productId;
        if (productId === hoveredProduct) setHoveredProduct(null);
        
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
        
        // Kill hover timeline
        if (hoverTimeline) {
          hoverTimeline.kill();
          hoverTimeline = null;
        }
      };
      
      card.addEventListener('mouseenter', mouseEnterHandler);
      card.addEventListener('mouseleave', mouseLeaveHandler);
      
      // Store handlers for cleanup
      (card as any)._mouseEnterHandler = mouseEnterHandler;
      (card as any)._mouseLeaveHandler = mouseLeaveHandler;
      (card as any)._mouseMoveHandler = updateMousePosition;
    });
    
    // Animation loop for smooth updates (optional)
    const animate = () => {
      // You can use velocityX and velocityY here for continuous effects
      animationFrame = requestAnimationFrame(animate);
    };
    animate();
    
    // Store animation frame for cleanup
    (document as any)._galleryAnimationFrame = animationFrame;
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

    // Remove all event listeners from cards
    if (galleryRef.current) {
      const cards = galleryRef.current.querySelectorAll('.media-card');
      cards.forEach(card => {
        if ((card as any)._mouseEnterHandler) {
          card.removeEventListener('mouseenter', (card as any)._mouseEnterHandler);
        }
        if ((card as any)._mouseLeaveHandler) {
          card.removeEventListener('mouseleave', (card as any)._mouseLeaveHandler);
        }
        if ((card as any)._mouseMoveHandler) {
          document.removeEventListener('mousemove', (card as any)._mouseMoveHandler);
        }
      });
    }
    
    // Cancel animation frame
    if ((document as any)._galleryAnimationFrame) {
      cancelAnimationFrame((document as any)._galleryAnimationFrame);
    }
  };

  // Handle window resize for responsive animations
  useEffect(() => {
    let resizeTimeout: NodeJS.Timeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        cleanupAnimations();
        animationsInitializedRef.current = false;
        
        // Remove hover effects on mobile
        if (galleryRef.current) {
          const cards = galleryRef.current.querySelectorAll('.media-card');
          cards.forEach(card => {
            (card as HTMLElement).style.transform = '';
            (card as HTMLElement).style.boxShadow = '';
            gsap.set(card, { clearProps: 'all' });
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
      
      // Remove any remaining GSAP animations
      if (galleryRef.current && galleryRef.current.id) {
        gsap.killTweensOf(`#${galleryRef.current.id} .media-card`);
        gsap.killTweensOf(`#${galleryRef.current.id} .gallery-header`);
        gsap.killTweensOf(`#${galleryRef.current.id} .view-more-btn`);
      }
    };
  }, [isLoading]);

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
            {popularProducts.map((product, index) => (
              <Link 
                key={product._id} 
                to={product._id.includes('fallback') ? '/products' : `/products/${product._id}`}
                className="block"
              >
                <div 
                  ref={el => cardsRef.current[index] = el}
                  data-product-id={product._id}
                  className={`media-card group relative overflow-hidden ${hoveredProduct === product._id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {/* Product Image */}
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
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