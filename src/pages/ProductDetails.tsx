// pages/ProductDetails.tsx
import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { 
  ArrowLeft, Phone, Mail, MessageCircle, Tag, Check, 
  Package, Shield, Truck, Clock, Award, Zap, 
  Info, Star, ChevronRight, Lock,
  TrendingDown, Scale, Thermometer, Gauge, 
  Settings, Factory, Headphones, RotateCw, 
  ZoomIn, ZoomOut, AlertCircle, Loader2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api, type Product } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';

// Extended Product interface with size options
interface ProductWithSizes extends Omit<Product, 'price'> {
  sizeOptions: SizeOption[];
  material?: string;
  pressureRating?: string;
  temperatureRange?: string;
  standards?: string;
  application?: string;
  discountPercentage?: number;
}

interface SizeOption {
  size: string;
  price: number;
}

// Environment variables with fallbacks
const SALES_PHONE = import.meta.env.VITE_SALES_PHONE || '+919876543210';
const SALES_EMAIL = import.meta.env.VITE_SALES_EMAIL || 'sales@damodartraders.com';

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [product, setProduct] = useState<ProductWithSizes | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeOption | null>(null);
  const [showPrice, setShowPrice] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'description' | 'specs'>('description');
  const [isInteractiveView, setIsInteractiveView] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const priceDisplayRef = useRef<HTMLDivElement>(null);
  const imageContainerRef = useRef<HTMLDivElement>(null);
  const infoContainerRef = useRef<HTMLDivElement>(null);
  const dragStartPos = useRef({ x: 0, y: 0 });

  // Mouse event handlers for interactive preview
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isInteractiveView) return;
    setIsDragging(true);
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    e.preventDefault();
  }, [isInteractiveView]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !isInteractiveView) return;
    
    const sensitivity = 0.5;
    const deltaX = e.clientX - dragStartPos.current.x;
    const deltaY = e.clientY - dragStartPos.current.y;
    
    setRotation(prev => ({
      x: Math.max(-30, Math.min(30, prev.x - deltaY * sensitivity)),
      y: prev.y + deltaX * sensitivity,
    }));
    
    dragStartPos.current = { x: e.clientX, y: e.clientY };
  }, [isDragging, isInteractiveView]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Add global mouse up listener
  useEffect(() => {
    const handleGlobalMouseUp = () => setIsDragging(false);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, []);

  // Fetch product data with proper error handling
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) {
        setError('Product ID is required');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        console.log('Fetching product with ID:', id);
        
        // ✅ FIXED: Direct API call - api.products.getById returns Product | null
        const productData = await api.products.getById(id);
        
        if (!productData) {
          setError('Product not found');
          toast({
            title: 'Product Not Found',
            description: 'The requested product could not be found.',
            variant: 'destructive',
          });
          navigate('/products');
          return;
        }
        
        // Transform API response to ProductWithSizes interface
        const transformedProduct: ProductWithSizes = {
          id: productData.id || id,
          name: productData.name || `Product ${id}`,
          category: productData.category || 'Industrial',
          image: productData.image || 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          description: productData.description || 'Premium industrial product with high quality standards.',
          discountPercentage: productData.discount || 0,
          // Default size options if not provided
          sizeOptions: Array.isArray((productData as any).sizeOptions) 
            ? (productData as any).sizeOptions 
            : [{ size: 'Standard', price: productData.price || 0 }],
          material: (productData as any).material,
          pressureRating: (productData as any).pressureRating,
          temperatureRange: (productData as any).temperatureRange,
          standards: (productData as any).standards,
          application: (productData as any).application,
          external: productData.external,
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt,
        };
        
        console.log('Loaded product:', transformedProduct);
        setProduct(transformedProduct);
        setSelectedSize(transformedProduct.sizeOptions[0]);
        setShowPrice(false);
      } catch (error: any) {
        console.error('Error fetching product:', error);
        setError(error.message || 'Failed to load product');
        
        // Fallback for demo/development
        const fallbackProduct: ProductWithSizes = {
          id: id || 'demo-id',
          name: 'Industrial Control Valve',
          category: 'Valves & Fittings',
          image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          description: 'High-precision industrial control valve designed for accurate flow regulation in critical applications. Features corrosion-resistant construction and meets international quality standards including ISO 9001 and ASME B16.34. Ideal for process industries, power plants, and water treatment facilities.',
          discountPercentage: 15,
          sizeOptions: [
            { size: 'DN25 (1")', price: 1850 },
            { size: 'DN50 (2")', price: 2850 },
            { size: 'DN80 (3")', price: 4250 },
            { size: 'DN100 (4")', price: 5850 }
          ],
          material: 'Stainless Steel 316 with PTFE Lining',
          pressureRating: '300 PSI (20 bar)',
          temperatureRange: '-20°C to 180°C',
          standards: 'ISO 9001:2015, ASME B16.34, API 6D',
          application: 'Process Industries, Power Plants, Water Treatment, Oil & Gas',
          external: false,
        };
        
        setProduct(fallbackProduct);
        setSelectedSize(fallbackProduct.sizeOptions[0]);
        
        toast({
          title: 'Using Demo Data',
          description: 'Product loaded with demo information',
          variant: 'default',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate, toast]);

  // Animate elements on product load
  useEffect(() => {
    if (!product || !imageContainerRef.current || !infoContainerRef.current) return;

    const tl = gsap.timeline({ delay: 0.2 });

    tl.fromTo(
      imageContainerRef.current,
      { x: -50, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: 'power2.out' 
      }
    )
    .fromTo(
      infoContainerRef.current,
      { x: 50, opacity: 0 },
      { 
        x: 0, 
        opacity: 1, 
        duration: 0.8, 
        ease: 'power2.out' 
      },
      '-=0.5'
    );

    return () => {
      gsap.killTweensOf([imageContainerRef.current, infoContainerRef.current]);
    };
  }, [product]);

  // Reset price when size changes
  const handleSizeSelect = useCallback((size: SizeOption) => {
    setSelectedSize(size);
    setShowPrice(false);
    
    // Animate price display
    if (priceDisplayRef.current) {
      gsap.to(priceDisplayRef.current, {
        scale: 1.05,
        duration: 0.15,
        yoyo: true,
        repeat: 1,
        ease: 'power2.out',
      });
    }
  }, []);

  const togglePriceVisibility = useCallback(() => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to view exclusive pricing and discounts',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    if (!selectedSize) {
      toast({
        title: 'Select Size First',
        description: 'Please select a size option to view pricing',
        variant: 'destructive',
      });
      return;
    }
    
    const newShowPrice = !showPrice;
    setShowPrice(newShowPrice);
    
    // Show toast only when revealing price
    if (newShowPrice) {
      const discount = product?.discountPercentage || 0;
      const originalPrice = selectedSize.price;
      const discountedPrice = calculateDiscountedPrice(originalPrice, discount);
      
      toast({
        title: discount > 0 ? '🎉 Special Price Revealed!' : 'Price Details',
        description: discount > 0 
          ? `You save ₹${(originalPrice - discountedPrice).toFixed(2)} with ${discount}% discount!`
          : `Best price guaranteed for industrial quality`,
        className: discount > 0 ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0' : '',
        duration: 3000,
      });
    }
  }, [user, selectedSize, showPrice, product?.discountPercentage, toast, navigate]);

  // Interactive View Functions
  const toggleInteractiveView = useCallback(() => {
    setIsInteractiveView(prev => !prev);
    if (!isInteractiveView) {
      setRotation({ x: 0, y: 0 });
      setZoom(1);
    }
  }, [isInteractiveView]);

  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.2, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  }, []);

  const handleResetView = useCallback(() => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  // Calculate price with discount
  const calculateDiscountedPrice = useCallback((price: number, discount: number) => {
    return price * (1 - discount/100);
  }, []);

  // Generate specifications from product data
  const generateSpecifications = useCallback((product: ProductWithSizes) => {
    const specs = [
      { icon: Package, label: 'Material', value: product.material || 'High-Grade Industrial Material', color: 'text-blue-500' },
      { icon: Settings, label: 'Category', value: product.category || 'Industrial Components', color: 'text-purple-500' },
    ];

    if (product.pressureRating) {
      specs.push({ icon: Gauge, label: 'Pressure Rating', value: product.pressureRating, color: 'text-red-500' });
    }
    if (product.temperatureRange) {
      specs.push({ icon: Thermometer, label: 'Temperature Range', value: product.temperatureRange, color: 'text-orange-500' });
    }
    if (product.standards) {
      specs.push({ icon: Award, label: 'Standards', value: product.standards, color: 'text-amber-500' });
    }
    if (product.application) {
      specs.push({ icon: Factory, label: 'Application', value: product.application, color: 'text-emerald-500' });
    }

    return specs;
  }, []);

  // Generate features from product data
  const generateFeatures = useCallback((product: ProductWithSizes) => {
    const features = [
      { text: 'Industrial-grade construction', icon: Shield, color: 'text-blue-500' },
      { text: 'Long service life', icon: Award, color: 'text-amber-500' },
      { text: 'Corrosion resistant', icon: Zap, color: 'text-yellow-500' },
      { text: 'Quality certified', icon: Star, color: 'text-emerald-500' },
    ];
    
    if (product.material) {
      features.unshift({ text: `Premium ${product.material}`, icon: Package, color: 'text-purple-500' });
    }
    if (product.discountPercentage && product.discountPercentage > 0) {
      features.push({ text: `${product.discountPercentage}% discount available`, icon: TrendingDown, color: 'text-green-500' });
    }
    
    return features;
  }, []);

  // Add structured data for SEO with correct pricing
  const generateStructuredData = useCallback(() => {
    if (!product || !selectedSize) return null;
    
    const isPriceAvailable = user && selectedSize.price > 0;
    const discount = product.discountPercentage || 0;
    const finalPrice = calculateDiscountedPrice(selectedSize.price, discount);
    
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Product',
      'name': product.name,
      'description': product.description.substring(0, 160),
      'image': product.image,
      'sku': `DT-${product.id.slice(-8).toUpperCase()}`,
      'brand': {
        '@type': 'Brand',
        'name': 'Damodar Traders'
      },
      ...(isPriceAvailable && {
        'offers': {
          '@type': 'Offer',
          'availability': 'https://schema.org/InStock',
          'price': finalPrice,
          'priceCurrency': 'INR',
          'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      })
    };
    
    return (
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    );
  }, [product, selectedSize, user, calculateDiscountedPrice]);

  // Loading state
  if (isLoading) {
    return (
      <>
        <IndustrialBackground />
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading product details...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Error state
  if (error && !product) {
    return (
      <>
        <IndustrialBackground />
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Product</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link 
                to="/products" 
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
              >
                <ArrowLeft className="w-5 h-5" />
                Browse All Products
              </Link>
              <button 
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
              >
                <RotateCw className="w-5 h-5" />
                Try Again
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Product not found state
  if (!product) {
    return (
      <>
        <IndustrialBackground />
        <Navbar />
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white">
          <div className="text-center">
            <Package className="w-20 h-20 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">The requested product could not be found.</p>
            <Link 
              to="/products" 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-cyan-700 transition-all duration-300"
            >
              <ArrowLeft className="w-5 h-5" />
              Browse All Products
            </Link>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const discount = product.discountPercentage || 0;
  const specifications = generateSpecifications(product);
  const features = generateFeatures(product);
  const hasSizeOptions = product.sizeOptions && product.sizeOptions.length > 1;

  return (
    <>
      <Helmet>
        <title>{product.name} - Damodar Traders | Premium Industrial Products</title>
        <meta
          name="description"
          content={`${product.name} - ${product.description.substring(0, 155)}... Buy premium industrial products from Damodar Traders, your trusted supplier.`}
        />
        <meta property="og:title" content={`${product.name} - Damodar Traders`} />
        <meta property="og:description" content={product.description.substring(0, 155)} />
        <meta property="og:image" content={product.image} />
        <meta property="og:type" content="product" />
        <meta name="keywords" content={`${product.name}, ${product.category}, industrial supplies, Damodar Traders`} />
      </Helmet>
      
      {generateStructuredData()}

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-12">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Link
                to="/products"
                className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors mb-6 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back to Products
              </Link>
              
              <div className="flex flex-col lg:flex-row items-start justify-between gap-8">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm rounded-full mb-4">
                    <Package className="w-4 h-4" />
                    <span className="text-sm font-medium">{product.category}</span>
                  </div>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
                    {product.name}
                  </h1>
                  <p className="text-xl text-gray-300 max-w-3xl">
                    Premium Industrial Quality
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Product Code</div>
                    <div className="text-lg font-mono font-bold">DT-{product.id.slice(-8).toUpperCase()}</div>
                  </div>
                  <div className="h-12 w-px bg-white/20"></div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Category</div>
                    <div className="text-lg font-medium">{product.category}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Product Details */}
        <section className="py-12 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Product Image & Interactive View */}
              <div ref={imageContainerRef} className="opacity-0">
                <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
                  {/* Discount Badge */}
                  {discount > 0 && (
                    <div className="absolute top-6 left-6 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl blur-md opacity-70"></div>
                        <div className="relative bg-gradient-to-r from-red-600 to-pink-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-bold">
                          <Tag className="w-4 h-4" />
                          {discount}% OFF
                        </div>
                      </div>
                    </div>
                  )}

                  {/* External API indicator */}
                  {product.external && (
                    <div className="absolute top-6 right-32 z-20">
                      <div className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs font-medium">
                        External Data
                      </div>
                    </div>
                  )}

                  {/* Interactive View Toggle Button */}
                  <div className="absolute top-6 right-6 z-20">
                    <button
                      onClick={toggleInteractiveView}
                      className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-all duration-300 ${
                        isInteractiveView 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white' 
                          : 'bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white'
                      }`}
                      aria-label={isInteractiveView ? 'Switch to image view' : 'Switch to 3D preview'}
                    >
                      <RotateCw className="w-4 h-4" />
                      {isInteractiveView ? 'Image View' : '3D Preview (Demo)'}
                    </button>
                  </div>

                  {/* Interactive Preview Container */}
                  {isInteractiveView ? (
                    <div 
                      className="relative h-96 w-full bg-gradient-to-br from-gray-100 to-gray-300 overflow-hidden cursor-grab active:cursor-grabbing"
                      onMouseDown={handleMouseDown}
                      onMouseMove={handleMouseMove}
                      onMouseUp={handleMouseUp}
                      onMouseLeave={handleMouseUp}
                    >
                      {/* Interactive Product Visualization */}
                      <div 
                        className="absolute inset-0 flex flex-col items-center justify-center"
                        style={{
                          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
                          transition: isDragging ? 'none' : 'transform 0.3s ease',
                        }}
                      >
                        {/* Demo Indicator */}
                        <div className="text-center mb-6 z-10">
                          <div className="text-4xl mb-2">🔧</div>
                          <h3 className="text-xl font-bold text-gray-800">3D Preview Demo</h3>
                          <p className="text-gray-600 mt-2">Interactive product visualization</p>
                        </div>
                        
                        <div className="relative w-64 h-64">
                          {/* Main product shape */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-2xl shadow-2xl">
                            {/* Visual effect layers */}
                            <div className="absolute inset-4 bg-gradient-to-br from-blue-300 to-cyan-300 rounded-xl opacity-70"></div>
                            <div className="absolute inset-8 bg-gradient-to-br from-blue-200 to-cyan-200 rounded-lg opacity-50"></div>
                            
                            {/* Product details */}
                            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg"></div>
                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-24 h-6 bg-gradient-to-r from-gray-700 to-gray-800 rounded-md"></div>
                            <div className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-24 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full"></div>
                            <div className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-24 bg-gradient-to-b from-gray-800 to-gray-900 rounded-full"></div>
                          </div>
                          
                          {/* Shadow */}
                          <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-48 h-8 bg-gradient-to-t from-gray-800/20 to-transparent blur-md rounded-full"></div>
                        </div>
                      </div>

                      {/* Interactive Controls */}
                      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3">
                        <button
                          onClick={handleZoomOut}
                          className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors shadow-lg"
                          title="Zoom Out"
                          aria-label="Zoom Out"
                        >
                          <ZoomOut className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={handleResetView}
                          className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors shadow-lg"
                          title="Reset View"
                          aria-label="Reset View"
                        >
                          <RotateCw className="w-5 h-5 text-gray-700" />
                        </button>
                        <button
                          onClick={handleZoomIn}
                          className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors shadow-lg"
                          title="Zoom In"
                          aria-label="Zoom In"
                        >
                          <ZoomIn className="w-5 h-5 text-gray-700" />
                        </button>
                      </div>

                      {/* Instructions */}
                      <div className="absolute bottom-4 left-4 right-4">
                        <p className="text-sm text-center text-gray-600 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full">
                          Drag to rotate • Use buttons to zoom • Demo Preview
                        </p>
                      </div>
                    </div>
                  ) : (
                    /* Regular Image View */
                    <div className="relative h-96 flex items-center justify-center p-8">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-contain transition-transform duration-300 hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                        }}
                      />
                      {product.external && (
                        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded">
                          Sample Image
                        </div>
                      )}
                    </div>
                  )}

                  {/* Image Gallery */}
                  <div className="flex gap-3 p-6 border-t border-gray-200">
                    <button
                      onClick={toggleInteractiveView}
                      className={`w-16 h-16 rounded-lg border-2 flex items-center justify-center transition-colors ${
                        isInteractiveView
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-transparent bg-gray-100 hover:border-blue-300'
                      }`}
                      aria-label={isInteractiveView ? 'Switch to image view' : 'Switch to 3D preview'}
                    >
                      <div className={`w-12 h-12 rounded-md flex items-center justify-center ${
                        isInteractiveView
                          ? 'bg-gradient-to-br from-blue-400 to-cyan-400'
                          : 'bg-gradient-to-br from-gray-300 to-gray-400'
                      }`}>
                        <RotateCw className={`w-5 h-5 ${isInteractiveView ? 'text-white' : 'text-gray-600'}`} />
                      </div>
                    </button>
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-transparent hover:border-blue-500 transition-colors flex items-center justify-center"
                        aria-label={`View image ${num}`}
                      >
                        <div className="w-12 h-12 bg-gradient-to-br from-gray-300 to-gray-400 rounded-md"></div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div ref={infoContainerRef} className="opacity-0">
                <div className="bg-white rounded-3xl shadow-xl border border-gray-200 p-8">
                  {/* Price Section */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-2xl font-bold text-gray-900">Pricing Details</h3>
                      {!user && (
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                          <Lock className="w-3 h-3" />
                          Login Required
                        </div>
                      )}
                    </div>

                    {selectedSize && showPrice && user ? (
                      <div className="space-y-4">
                        <div className="flex items-end gap-4">
                          {discount > 0 ? (
                            <>
                              <div>
                                <div className="text-sm text-gray-500 mb-1">Original Price</div>
                                <div className="text-2xl text-gray-400 line-through">
                                  ₹{selectedSize.price.toFixed(2)}
                                </div>
                              </div>
                              <ChevronRight className="w-6 h-6 text-gray-400" />
                              <div>
                                <div className="text-sm text-gray-500 mb-1">Discounted Price</div>
                                <div className="text-4xl font-bold text-green-600">
                                  ₹{calculateDiscountedPrice(selectedSize.price, discount).toFixed(2)}
                                </div>
                              </div>
                            </>
                          ) : (
                            <div>
                              <div className="text-sm text-gray-500 mb-1">Price</div>
                              <div className="text-4xl font-bold text-blue-600">
                                ₹{selectedSize.price.toFixed(2)}
                              </div>
                            </div>
                          )}
                        </div>

                        {discount > 0 && (
                          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-100">
                            <div className="flex items-center gap-3">
                              <TrendingDown className="w-5 h-5 text-green-600" />
                              <div>
                                <div className="font-bold text-green-700">
                                  Save ₹{(selectedSize.price - calculateDiscountedPrice(selectedSize.price, discount)).toFixed(2)}
                                </div>
                                <div className="text-sm text-green-600">
                                  {discount}% discount applied
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div ref={priceDisplayRef} className="price-display bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-2xl border-2 border-dashed border-blue-200">
                        <div className="text-center mb-4">
                          <div className="text-2xl font-bold text-gray-900 mb-2">
                            {user ? '💰 Exclusive Pricing' : '🔒 Login to View Prices'}
                          </div>
                          <p className="text-gray-600">
                            {user 
                              ? `Reveal the original and discounted price for ${selectedSize?.size || 'this product'}`
                              : 'Please login to access exclusive pricing and discounts'
                            }
                          </p>
                        </div>
                        <button
                          onClick={togglePriceVisibility}
                          disabled={!selectedSize}
                          className={`w-full py-4 font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group ${
                            user
                              ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white hover:from-blue-700 hover:to-cyan-700'
                              : 'bg-gradient-to-r from-amber-600 to-orange-600 text-white hover:from-amber-700 hover:to-orange-700'
                          } ${!selectedSize ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                          {user ? (
                            <>
                              <Zap className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              {selectedSize ? 'Show Original & Discounted Price' : 'Select Size First'}
                            </>
                          ) : (
                            <>
                              <Lock className="w-5 h-5 group-hover:scale-110 transition-transform" />
                              Login to View Prices
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Size Options */}
                  {hasSizeOptions && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Scale className="w-5 h-5 text-blue-500" />
                        Select Size
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {product.sizeOptions.map((sizeOption, index) => (
                          <button
                            key={index}
                            onClick={() => handleSizeSelect(sizeOption)}
                            className={`relative p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2 ${
                              selectedSize?.size === sizeOption.size
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                            aria-label={`Select size ${sizeOption.size}`}
                            aria-pressed={selectedSize?.size === sizeOption.size}
                          >
                            {selectedSize?.size === sizeOption.size && (
                              <div className="absolute top-2 right-2">
                                <Check className="w-4 h-4 text-blue-500" />
                              </div>
                            )}
                            <div className="text-lg font-bold text-gray-900">{sizeOption.size}</div>
                            {sizeOption.price === 0 ? (
                              <div className="text-sm text-gray-500">Contact for price</div>
                            ) : user && showPrice ? (
                              <div className="text-sm font-medium text-blue-600">
                                ₹{sizeOption.price.toFixed(2)}
                              </div>
                            ) : user && !showPrice ? (
                              <div className="text-sm text-gray-500">Click to view price</div>
                            ) : (
                              <div className="text-sm text-amber-600 flex items-center gap-1">
                                <Lock className="w-3 h-3" />
                                Login to view
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Features */}
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Key Features</h3>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <feature.icon className={`w-5 h-5 ${feature.color} flex-shrink-0`} />
                          <span className="text-sm font-medium text-gray-700">{feature.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <a 
                        href={`tel:${SALES_PHONE}`}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Call Now for Quote
                      </a>
                      <a
                        href={`mailto:${SALES_EMAIL}?subject=Inquiry about ${encodeURIComponent(product.name)}&body=Product: ${encodeURIComponent(product.name)}%0D%0ASize: ${selectedSize ? encodeURIComponent(selectedSize.size) : 'Standard'}%0D%0A%0D%0APlease send me detailed pricing and specifications.`}
                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center justify-center gap-2 group"
                      >
                        <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Email Inquiry
                      </a>
                    </div>
                    <Link 
                      to="/contact"
                      className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <Headphones className="w-5 h-5" />
                      Request Custom Quote
                    </Link>
                  </div>

                  {/* Login Prompt for Non-logged in Users */}
                  {!user && (
                    <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="font-bold text-amber-800">Login Required for Pricing</div>
                          <div className="text-sm text-amber-700">
                            Create an account or login to view prices, request quotes, and access exclusive discounts.
                          </div>
                        </div>
                        <Link
                          to="/login"
                          className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all"
                        >
                          Login Now
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-12">
              <div className="flex flex-wrap gap-2 border-b border-gray-200 mb-8">
                <button
                  onClick={() => setSelectedTab('description')}
                  className={`px-6 py-3 font-medium rounded-t-lg transition-all duration-300 flex items-center gap-2 ${
                    selectedTab === 'description'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                  aria-label="View product description"
                  aria-pressed={selectedTab === 'description'}
                >
                  <Info className="w-5 h-5" />
                  Description
                </button>
                <button
                  onClick={() => setSelectedTab('specs')}
                  className={`px-6 py-3 font-medium rounded-t-lg transition-all duration-300 flex items-center gap-2 ${
                    selectedTab === 'specs'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                  aria-label="View product specifications"
                  aria-pressed={selectedTab === 'specs'}
                >
                  <Settings className="w-5 h-5" />
                  Specifications
                </button>
              </div>

              {/* Tab Content */}
              <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-8">
                {selectedTab === 'description' && (
                  <motion.div
                    key="description"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Product Description</h3>
                    <div className="prose max-w-none text-gray-600 text-lg leading-relaxed">
                      {product.description}
                    </div>
                    
                    {/* Additional Info */}
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
                      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl">
                        <Package className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900">Premium Quality</div>
                        <div className="text-sm text-gray-600">Industrial Grade</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl">
                        <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900">Warranty</div>
                        <div className="text-sm text-gray-600">1 Year Standard</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl">
                        <Truck className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900">Free Shipping</div>
                        <div className="text-sm text-gray-600">Orders above ₹10,000</div>
                      </div>
                      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                        <Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                        <div className="font-bold text-gray-900">Delivery</div>
                        <div className="text-sm text-gray-600">3-7 Business Days</div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {selectedTab === 'specs' && (
                  <motion.div
                    key="specs"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                  >
                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Specifications</h3>
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {specifications.map((spec, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-2xl border border-gray-200 hover:border-blue-300 transition-all duration-300"
                        >
                          <div className="flex items-center gap-3 mb-3">
                            <div className={`p-2 rounded-lg bg-white ${spec.color.replace('text-', 'bg-')} bg-opacity-20`}>
                              <spec.icon className={`w-5 h-5 ${spec.color}`} />
                            </div>
                            <div className="text-sm font-medium text-gray-500">{spec.label}</div>
                          </div>
                          <div className="text-lg font-bold text-gray-900">{spec.value}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>
            </div>

            {/* CTA Section */}
            <motion.div
              className="mt-12"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-3xl overflow-hidden">
                <div className="px-8 py-12 text-center">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    Ready to Order {product.name}?
                  </h3>
                  <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
                    Get the best price for bulk orders. Contact our sales team for custom quotes and volume discounts.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <a 
                      href={`tel:${SALES_PHONE}`}
                      className="px-8 py-4 bg-white text-blue-600 rounded-xl font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                    >
                      <Phone className="w-5 h-5" />
                      Call Sales Team
                    </a>
                    <Link 
                      to="/contact"
                      className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      <MessageCircle className="w-5 h-5" />
                      Request Custom Quote
                    </Link>
                  </div>
                  <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">24/7</div>
                      <div className="text-blue-200 text-sm">Support</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">98%</div>
                      <div className="text-blue-200 text-sm">Satisfaction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">2H</div>
                      <div className="text-blue-200 text-sm">Response Time</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-white">5000+</div>
                      <div className="text-blue-200 text-sm">Products</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default ProductDetails;