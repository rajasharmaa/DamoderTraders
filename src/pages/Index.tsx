import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Helmet } from 'react-helmet';
import { 
  ArrowRight, CheckCircle, Award, Shield, Truck, 
  HeadphonesIcon, Users, Clock, Sparkles, ChevronDown,
  Star, TrendingUp, Package, Factory, MapPin, Phone,
  Bolt, Zap, Cog, Wrench, HardHat, Search, Filter
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import ShopSlider from '@/components/ShopSlider';
import MediaGallery from '@/components/MediaGallery';
import TypewriterText from '@/components/TypewriterText';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

const Index = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Categories data from Categories.tsx
  const categories = [
    {
      id: 'pipes',
      name: 'Pipes',
      description: 'High-quality CI and GI pipes engineered for superior durability and corrosion resistance',
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxeQl5GgAkQTVUEQfgVCC2GvzBOUDvsMK55cIGsS6t59dz9KPatCZj6YNbOeTs8DlyLPi801Ts7Lnho4MkojaGNbIUnVkvtH-Bh_1F_OUjaxgcSDykp5PXie3x0fWuCo4-H3eLW=s680-w680-h510-rw',
      productCount: 300,
      trending: true,
      features: ['Corrosion Resistant', 'High Pressure Rating', 'ISO Certified']
    },
    {
      id: 'fittings',
      name: 'Fittings',
      description: 'Precision-engineered pipe fittings ensuring leak-proof connections and optimal flow',
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxM5cDX9e7dc25tQx64RbEFEHS99bZUPu--qlW7M3gXic5dwVK3TogesNi99QoD_YDcj5adkZv6QuDppRvoWVYkFVQZvXZFNhS8_qdyXP0z3RybKiKj7vlXDEwnpsk3eSpYbwE=s680-w680-h510-rw',
      productCount: 200,
      features: ['Leak-Proof', 'Precision Threaded', 'Various Sizes']
    },
    {
      id: 'valves',
      name: 'Valves',
      description: 'Reliable flow control solutions with superior sealing and minimal maintenance',
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxf2yKpYhH4OjxzGS0QA7SdmAcepmUeFxCU1ykO51xMJHK5aCq785xlRqjbzaj7JKs-cvua90nRBvDmOBrI41FV_Gz7W2qqiB3L7RLlcPxBHtC3G8iiwDVGRo3owlCjLpS9gDHT=s680-w680-h510-rw',
      productCount: 150,
      trending: true,
      features: ['100% Leak Tested', 'Easy Operation', 'Long Service Life']
    },
    {
      id: 'other',
      name: 'Industrial Components',
      description: 'Comprehensive range of industrial hardware and specialized components',
      image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwn-ALSotNBoN0R2Id7UwLtd8u6cY3IPPtqJ0kTTNYorJ9ImXGo0ZyYWEQpSpQ3NSOWh0NmNMkDGUI1wgyYeRoZf0097YJJmShkUgWBolfwujatAt2tEkk17pY3UIi9esM9HrTk=s680-w680-h510-rw',
      productCount: 50,
      features: ['High Strength', 'Customizable', 'Bulk Available']
    },
  ];

  // Typewriter texts for different sections
  const heroTypewriterTexts = [
    "Industrial Excellence in Every Pipe",
    "Quality Pipe Fittings Since 2011",
    "Trusted by 1500+ Industries",
    "ISO Certified Solutions"
  ];

  const featuresTypewriterTexts = [
    "Why Choose Damodar Traders",
    "Unmatched Quality Standards",
    "Reliable Industrial Solutions",
    "Customer-First Approach"
  ];

  const productTypewriterTexts = [
    "Our Industrial Solutions",
    "Premium Quality Products",
    "Industry-Grade Materials",
    "Expert Engineering Solutions"
  ];

  // Statistics data
  const stats = [
    { icon: Users, value: '1500+', label: 'Happy Clients', color: 'text-blue-600' },
    { icon: Package, value: '5000+', label: 'Products', color: 'text-green-600' },
    { icon: Clock, value: '12+', label: 'Years Experience', color: 'text-purple-600' },
    { icon: Award, value: '25+', label: 'Industry Awards', color: 'text-amber-600' },
  ];

  // Features data
  const features = [
    { icon: Shield, title: 'Quality Certified', description: 'ISO 9001 certified products with BIS approval' },
    { icon: Truck, title: 'Fast Delivery', description: 'Pan-India delivery within 3-7 business days' },
    { icon: HeadphonesIcon, title: '24/7 Support', description: 'Round-the-clock customer service and technical support' },
    { icon: Award, title: 'Industry Leader', description: 'Trusted by top industrial companies since 2011' },
  ];

  const filteredCategories = categories.filter(category => {
    const matchesSearch = 
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'trending') {
      return matchesSearch && category.trending;
    }
    
    return matchesSearch;
  });

  useEffect(() => {
    if (hasAnimated.current) return;
    hasAnimated.current = true;

    // Enhanced GSAP animations
    if (window.innerWidth > 768) {
      // Hero section parallax effect
      gsap.fromTo(heroRef.current, 
        { y: 0 },
        { 
          y: -50,
          scrollTrigger: {
            trigger: heroRef.current,
            start: 'top top',
            end: 'bottom top',
            scrub: true
          }
        }
      );

      // Hero content animations
      const tl = gsap.timeline();
      
      tl.from('#head', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out'
      })
      .from('#head1', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power2.out'
      }, '-=0.5')
      .from('.pera1', {
        y: 30,
        opacity: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: 'power2.out'
      }, '-=0.3')
      .from('.hero-cta', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        ease: 'back.out(1.7)'
      }, '-=0.2');

      // Stats counter animation
      stats.forEach((_, index) => {
        gsap.from(`.stat-${index}`, {
          y: 30,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%',
            once: true
          }
        });
      });

      // Features animation
      features.forEach((_, index) => {
        gsap.from(`.feature-${index}`, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 70%',
            once: true
          }
        });
      });

      // Categories animation
      categories.forEach((_, index) => {
        gsap.from(`.category-${index}`, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          delay: index * 0.1,
          scrollTrigger: {
            trigger: categoriesRef.current,
            start: 'top 75%',
            once: true
          }
        });
      });

      // CTA section animation
      gsap.from(ctaRef.current, {
        y: 50,
        opacity: 0,
        duration: 0.8,
        scrollTrigger: {
          trigger: ctaRef.current,
          start: 'top 80%',
          once: true
        }
      });

    } else {
      // Mobile animations
      const elements = document.querySelectorAll('#head, #head1, .pera1, .hero-cta');
      elements.forEach((el) => {
        gsap.from(el, {
          y: 20,
          opacity: 0,
          duration: 0.5,
          stagger: 0.1
        });
      });
    }

    // Scroll indicator animation
    gsap.to('.scroll-indicator', {
      y: 10,
      duration: 1.5,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut'
    });

    // Floating elements animation
    gsap.to('.floating-element', {
      y: 10,
      duration: 2,
      repeat: -1,
      yoyo: true,
      ease: 'sine.inOut',
      stagger: 0.2
    });

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  // Handle scroll for dynamic effects
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>Damodar Traders - Premium CI & GI Pipe Fittings | Industrial Solutions</title>
        <meta
          name="description"
          content="Leading manufacturer of high-quality CI & GI pipe fittings, industrial valves, and pipe solutions since 2011. ISO certified with 1500+ satisfied clients."
        />
        <meta
          name="keywords"
          content="pipe fittings, CI pipes, GI pipes, industrial valves, foot valves, pipe manufacturers, industrial suppliers"
        />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 overflow-hidden">
        {/* Hero Section */}
        <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Since 2011</span>
              </div>
              
              <h1 id="head" className="text-5xl md:text-7xl font-bold mb-6">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  Damodar Traders
                </span>
              </h1>
              
              {/* Typewriter Text for Hero Section */}
              <div id="head1" className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 h-16 flex items-center justify-center">
                <TypewriterText 
                  texts={heroTypewriterTexts}
                  speed={60}
                  delay={2000}
                  cursorColor="text-blue-600"
                  className="text-center"
                />
              </div>
              
              <div className="max-w-3xl mx-auto space-y-6">
                <p className="pera1 text-lg md:text-xl text-gray-600 leading-relaxed">
                  Established in 2011, <span className="font-semibold text-gray-800">Damodar Traders</span> has grown to become a trusted leader in industrial pipe fittings and solutions. Our commitment to quality, innovation, and customer satisfaction has made us the preferred choice for industries across India.
                </p>
                
                <p className="pera1 text-lg md:text-xl text-gray-600 leading-relaxed">
                  Under the visionary leadership of <span className="font-semibold text-gray-800">Damodar Prasad Sharma</span>, we deliver superior quality products that meet international standards, ensuring reliability and durability for all industrial applications.
                </p>
              </div>
              
              <div className="hero-cta flex flex-col sm:flex-row gap-4 justify-center mt-12">
                <Link
                  to="/products"
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <span>Explore Products</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Link>
                
                <Link
                  to="/contact"
                  className="group px-8 py-4 bg-white/10 backdrop-blur-sm border-2 border-blue-600 text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  <span>Get Quote</span>
                  <Phone className="w-5 h-5" />
                </Link>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 scroll-indicator">
            <ChevronDown className="w-6 h-6 text-blue-600 animate-bounce" />
          </div>
        </section>

        {/* Statistics Section */}
        <section className="py-16 bg-gradient-to-b from-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat, index) => (
                <div key={index} className={`stat-${index} text-center p-6 bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why Choose Us */}
        <section ref={featuresRef} className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              {/* Typewriter Text for Features Section */}
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 h-20 flex items-center justify-center">
                <TypewriterText 
                  texts={featuresTypewriterTexts}
                  speed={70}
                  delay={2500}
                  cursorColor="text-blue-600"
                  className="text-center"
                />
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                We combine traditional craftsmanship with modern technology to deliver exceptional quality
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className={`feature-${index} p-8 bg-gradient-to-b from-white to-gray-50 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-2xl transition-all duration-500 group`}>
                  <div className="inline-flex p-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                  <div className="mt-6 pt-6 border-t border-gray-200/50">
                    <div className="flex items-center gap-2 text-sm text-blue-600 font-medium">
                      <CheckCircle className="w-4 h-4" />
                      <span>Learn More</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Product Categories Section - From Categories.tsx */}
        <section ref={categoriesRef} className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              {/* Typewriter Text for Products Section */}
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 h-20 flex items-center justify-center">
                <TypewriterText 
                  texts={productTypewriterTexts}
                  speed={65}
                  delay={2200}
                  cursorColor="text-blue-600"
                  className="text-center"
                />
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Discover our comprehensive range of industrial products engineered for performance, 
                durability, and reliability in demanding environments.
              </p>
            </div>

            {/* Search & Filter Section */}
            <div className="mb-12">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
                <div className="w-full md:w-auto">
                  <h2 className="text-2xl font-semibold text-gray-900">Browse Categories</h2>
                  <p className="text-gray-600">Find exactly what you need</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                  {/* Filter Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setActiveFilter('all')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        activeFilter === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      All Products
                    </button>
                    <button
                      onClick={() => setActiveFilter('trending')}
                      className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                        activeFilter === 'trending'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <TrendingUp size={16} />
                      Trending
                    </button>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="relative flex-1 md:min-w-[400px]">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="text"
                      placeholder="Search categories by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-gray-200 bg-white/80 backdrop-blur-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                    />
                    <Filter className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Categories Grid */}
            <div className="grid sm:grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredCategories.map((category, index) => (
                <div key={category.id} className={`category-${index}`}>
                  <Link to={`/products?category=${category.id}`}>
                    <div className="group relative bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-500 h-full">
                      {/* Trending Badge */}
                      {category.trending && (
                        <div className="absolute top-4 left-4 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                          <TrendingUp size={14} />
                          Trending
                        </div>
                      )}
                      
                      {/* Product Count */}
                      <div className="absolute top-4 right-4 z-10 bg-black/70 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium">
                        {category.productCount} Products
                      </div>
                      
                      {/* Image Container */}
                      <div className="h-64 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-1"></div>
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      </div>
                      
                      {/* Content */}
                      <div className="p-6 relative">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                            {category.name}
                          </h3>
                        </div>
                        
                        <p className="text-gray-600 mb-6 leading-relaxed">
                          {category.description}
                        </p>
                        
                        {/* Features */}
                        {category.features && (
                          <div className="flex flex-wrap gap-2 mb-6">
                            {category.features.map((feature, idx) => (
                              <span
                                key={idx}
                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-200"
                              >
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}
                        
                        {/* CTA */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <span className="text-sm font-medium text-blue-600 group-hover:underline transition-all">
                            Explore Collection
                          </span>
                          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <ArrowRight className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                      
                      {/* Hover Effect */}
                      <div className="absolute inset-0 border-2 border-transparent group-hover:border-blue-300 rounded-2xl transition-all duration-500 pointer-events-none"></div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {filteredCategories.length === 0 && (
              <div className="text-center py-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3">No Categories Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any categories matching "{searchQuery}". Try searching with different keywords.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  View All Categories
                </button>
              </div>
            )}
            
            {/* View All Categories Button */}
            <div className="text-center mt-16">
              <Link
                to="/categories"
                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-bold rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <span>View All Categories</span>
                <ChevronDown className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Shop Slider Section */}
        <ShopSlider />

        {/* Media Gallery */}
        <MediaGallery />

        {/* Testimonial/Client Section */}
        <section className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Trusted by <span className="text-blue-600">Industry Leaders</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Join 1500+ satisfied customers who rely on our quality products
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-lg">
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 text-amber-600 mb-4">
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                    <Star className="w-5 h-5 fill-current" />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">4.9/5</div>
                  <div className="text-sm text-gray-600">Customer Rating</div>
                </div>
                
                <div className="text-center">
                  <TrendingUp className="w-12 h-12 text-green-600 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">98%</div>
                  <div className="text-sm text-gray-600">Repeat Business</div>
                </div>
                
                <div className="text-center">
                  <Factory className="w-12 h-12 text-blue-600 mx-auto mb-4" />
                  <div className="text-4xl font-bold text-gray-900 mb-2">500+</div>
                  <div className="text-sm text-gray-600">Corporate Clients</div>
                </div>
              </div>
              
              <div className="mt-12 text-center">
                <p className="text-lg text-gray-700 italic max-w-3xl mx-auto">
                  "Damodar Traders has been our trusted supplier for over 5 years. Their product quality and service reliability are unmatched in the industry."
                </p>
                <div className="mt-6">
                  <p className="font-bold text-gray-900">Rajesh Mehta</p>
                  <p className="text-sm text-gray-600">CEO, Mehta Industries</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section ref={ctaRef} className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-600"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80')] opacity-10 mix-blend-overlay"></div>
          
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Typewriter for CTA */}
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 h-24 flex items-center justify-center">
              <TypewriterText 
                texts={[
                  "Ready to Transform Your Industrial Needs?",
                  "Get Customized Solutions Today",
                  "Request Your Free Quote Now",
                  "Partner with Industry Experts"
                ]}
                speed={60}
                delay={2000}
                cursorColor="text-white"
                className="text-center"
              />
            </h2>
            
            <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
              Get in touch with our experts for customized solutions, bulk orders, and special requirements
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/contact"
                className="px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
              >
                <Phone className="w-5 h-5" />
                <span>Request Quote</span>
              </Link>
              
              <Link
                to="/products"
                className="px-8 py-4 bg-transparent border-2 border-white text-white font-bold rounded-xl hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-3"
              >
                <Package className="w-5 h-5" />
                <span>Browse Catalog</span>
              </Link>
            </div>
            
            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">12+</div>
                <div className="text-sm text-blue-200">Years Experience</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">ISO</div>
                <div className="text-sm text-blue-200">9001 Certified</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">Pan-India</div>
                <div className="text-sm text-blue-200">Delivery</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">24/7</div>
                <div className="text-sm text-blue-200">Support</div>
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="floating-element absolute top-1/4 left-10 w-4 h-4 bg-white/20 rounded-full"></div>
          <div className="floating-element absolute top-1/3 right-20 w-6 h-6 bg-white/20 rounded-full"></div>
          <div className="floating-element absolute bottom-1/4 left-1/3 w-8 h-8 bg-white/10 rounded-full"></div>
        </section>

        {/* Location Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold text-gray-900 mb-6">
                  Visit Our <span className="text-blue-600">Showroom</span>
                </h2>
                <div className="space-y-4 text-gray-600">
                  <p className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>1st floor, 37 Ellora plaza, 3, Maharani Rd, Indore, Madhya Pradesh 452007</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>+91 9876543210</span>
                  </p>
                  <p className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-blue-600 flex-shrink-0" />
                    <span>Monday - Friday: 9:00 AM - 6:00 PM | Saturday: 9:00 AM - 4:00 PM</span>
                  </p>
                </div>
                
                <div className="mt-8">
                  <a
                    href="https://www.google.com/maps/place/Damodar+Traders/@22.717964,75.857387,17z/data=!3m1!4b1!4m6!3m5!1s0x3962fd11bc280595:0xffd5a99f38fa3a02!8m2!3d22.717964!4d75.857387!16s%2Fg%2F11jvmtyg2s?entry=ttu"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors mr-4"
                  >
                    <MapPin className="w-5 h-5" />
                    Open in Google Maps
                  </a>
                  
                  <a
                    href="https://www.google.com/local/place/fid/0x3962fd11bc280595:0xffd5a99f38fa3a02/photosphere?iu=https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxMYYROxGkLdrdwf-Msjmu_4OEc3HiJ_kIS5fcvVaKRsOzSGeV9GY6ssYxRVIW9-mdFaO5gDEaxJAZjNimcjkGhhQoVuPrKkln6GrPPU6I6j43aK3BHYCgkgyd_Zdqd-0VDD4xr%3Dw160-h106-k-no-pi0-ya339.9-ro-0-fo100&ik=CAoSF0NJSE0wb2dLRUlDQWdJRFNuZTd2clFF"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <span>360° Virtual Tour</span>
                  </a>
                </div>
              </div>
              
              <div className="relative rounded-2xl overflow-hidden shadow-2xl group">
                {/* Image Container with Hover Effect */}
                <div className="aspect-video bg-gray-200 overflow-hidden">
                  <img 
                    src="https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxMYYROxGkLdrdwf-Msjmu_4OEc3HiJ_kIS5fcvVaKRsOzSGeV9GY6ssYxRVIW9-mdFaO5gDEaxJAZjNimcjkGhhQoVuPrKkln6GrPPU6I6j43aK3BHYCgkgyd_Zdqd-0VDD4xr=w160-h106-k-no-pi0-ya339.9-ro-0-fo100"
                    alt="Damodar Traders Showroom - 360° View"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent"></div>
                
                {/* Info Badge */}
                <div className="absolute top-4 right-4">
                  <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    LIVE VIEW
                  </div>
                </div>
                
                {/* Google Street View Badge */}
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 010-5 2.5 2.5 0 010 5z"/>
                    </svg>
                    <span className="font-semibold text-gray-900">Google Street View</span>
                  </div>
                </div>
                
                {/* Showroom Name */}
                <div className="absolute bottom-6 right-6 text-white">
                  <div className="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl">
                    <Factory className="w-5 h-5" />
                    <span className="font-semibold">Damodar Traders Showroom</span>
                  </div>
                </div>
                
                {/* Interactive Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/70 backdrop-blur-sm rounded-full p-4">
                    <div className="animate-pulse text-white">
                      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mt-12 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-8">
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                    <MapPin className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Easy to Find</h3>
                  <p className="text-sm text-gray-600">Located in prime commercial area with ample parking</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Virtual Tour</h3>
                  <p className="text-sm text-gray-600">Explore our showroom from anywhere in 360° view</p>
                </div>
                
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                    <Clock className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">Flexible Timings</h3>
                  <p className="text-sm text-gray-600">Open 6 days a week, appointments available</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Index;