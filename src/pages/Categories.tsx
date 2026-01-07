// pages/Categories.tsx
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Search, TrendingUp, Shield, Clock, Zap, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';

interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  productCount: number;
  trending?: boolean;
  features?: string[];
}

const defaultCategories: Category[] = [
  {
    id: 'pipes',
    name: 'Pipes',
    description: 'High-quality CI and GI pipes engineered for superior durability and corrosion resistance',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxeQl5GgAkQTVUEQfgVCC2GvzBOUDvsMK55cIGsS6t59dz9KPatCZj6YNbOeTs8DlyLPi801Ts7Lnho4MkojaGNbIUnVkvtH-Bh_1F_OUjaxgcSDykp5PXie3x0fWuCo4-H3eLW=s680-w680-h510-rw',
    productCount: 0,
    trending: true,
    features: ['Corrosion Resistant', 'High Pressure Rating', 'ISO Certified']
  },
  {
    id: 'fittings',
    name: 'Fittings',
    description: 'Precision-engineered pipe fittings ensuring leak-proof connections and optimal flow',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxM5cDX9e7dc25tQx64RbEFEHS99bZUPu--qlW7M3gXic5dwVK3TogesNi99QoD_YDcj5adkZv6QuDppRvoWVYkFVQZvXZFNhS8_qdyXP0z3RybKiKj7vlXDEwnpsk3eSpYbwE=s680-w680-h510-rw',
    productCount: 0,
    features: ['Leak-Proof', 'Precision Threaded', 'Various Sizes']
  },
  {
    id: 'valves',
    name: 'Valves',
    description: 'Reliable flow control solutions with superior sealing and minimal maintenance',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSxf2yKpYhH4OjxzGS0QA7SdmAcepmUeFxCU1ykO51xMJHK5aCq785xlRqjbzaj7JKs-cvua90nRBvDmOBrI41FV_Gz7W2qqiB3L7RLlcPxBHtC3G8iiwDVGRo3owlCjLpS9gDHT=s680-w680-h510-rw',
    productCount: 0,
    trending: true,
    features: ['100% Leak Tested', 'Easy Operation', 'Long Service Life']
  },
  {
    id: 'other',
    name: 'Industrial Components',
    description: 'Comprehensive range of industrial hardware and specialized components',
    image: 'https://lh3.googleusercontent.com/gps-cs-s/AG0ilSwn-ALSotNBoN0R2Id7UwLtd8u6cY3IPPtqJ0kTTNYorJ9ImXGo0ZyYWEQpSpQ3NSOWh0NmNMkDGUI1wgyYeRoZf0097YJJmShkUgWBolfwujatAt2tEkk17pY3UIi9esM9HrTk=s680-w680-h510-rw',
    productCount: 0,
    features: ['High Strength', 'Customizable', 'Bulk Available']
  },
];

// Helper function to normalize category names from backend
const normalizeCategory = (category: string): string => {
  const cat = category?.toLowerCase() || '';
  
  if (cat.includes('pipe') || cat === 'pipes') return 'pipes';
  if (cat.includes('fitting') || cat.includes('joint') || cat.includes('connector') || cat === 'fittings') return 'fittings';
  if (cat.includes('valve') || cat === 'valves') return 'valves';
  
  return 'other';
};

const Categories = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const { toast } = useToast();

  // Scroll to top on component mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Fetch categories and product counts
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        const products = await api.products.getAll();
        
        const categoryCounts: Record<string, number> = {};
        
        // Count products by normalized category
        products.forEach((product: any) => {
          const category = normalizeCategory(product.category || '');
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });
        
        // Update categories with actual product counts
        const updatedCategories = defaultCategories.map(cat => ({
          ...cat,
          productCount: categoryCounts[cat.id] || 0,
        }));
        
        setCategories(updatedCategories);
      } catch (error: any) {
        console.error('Error fetching categories:', error);
        // Keep default categories if API fails
        setCategories(defaultCategories);
        
        toast({
          title: 'Error Loading Data',
          description: 'Using cached categories. Some product counts may be outdated.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []); // Empty dependency array - runs once on mount

  // Memoize filtered categories for performance
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesSearch = 
        category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (activeFilter === 'trending') {
        return matchesSearch && category.trending;
      }
      
      return matchesSearch;
    });
  }, [categories, searchQuery, activeFilter]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  // Fallback image handler
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=680&h=510&fit=crop';
    e.currentTarget.alt = 'Industrial equipment placeholder';
  };

  return (
    <>
      <Helmet>
        <title>Product Categories - Damodar Traders | Premium Industrial Supplies</title>
        <meta
          name="description"
          content="Explore our premium industrial product categories. High-quality pipes, fittings, valves, and industrial components for demanding applications."
        />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16 pt-4">
        {/* Hero Section */}
        <motion.div 
          className="text-center pt-8 pb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-600 px-4 py-2 rounded-full text-sm font-medium mb-4">
            <TrendingUp size={16} />
            Premium Industrial Solutions
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 text-gray-900">
            Industrial <span className="text-blue-600">Product</span> Categories
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Discover our comprehensive range of industrial products engineered for performance, 
            durability, and reliability in demanding environments.
          </p>
          
          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto mt-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[
              { icon: Shield, label: 'Quality Certified', value: '100%' },
              { icon: Clock, label: 'Years Experience', value: '25+' },
              { icon: Zap, label: 'Products', value: '500+' },
              { icon: TrendingUp, label: 'Satisfaction', value: '98%' },
            ].map((stat) => (
              <motion.div
                key={stat.label}
                
                className="bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="text-left">
                    <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* Search & Filter Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
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
              </div>
            </div>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="mt-4 text-gray-600">Loading premium categories...</p>
          </div>
        ) : (
          <>
            {/* Categories Grid */}
            <motion.div 
              className="grid sm:grid-cols-1 lg:grid-cols-2 gap-8"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              {filteredCategories.map((category) => (
                <motion.div
                  key={category.id}
                  
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
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
                        {category.productCount} {category.productCount === 1 ? 'Product' : 'Products'}
                      </div>
                      
                      {/* Image Container */}
                      <div className="h-64 overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent z-1"></div>
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                          onError={handleImageError}
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
                </motion.div>
              ))}
            </motion.div>

            {filteredCategories.length === 0 && (
              <motion.div 
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-gray-900">No Categories Found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  We couldn't find any categories matching "{searchQuery}". Try searching with different keywords.
                </p>
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-6 px-6 py-3 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                >
                  View All Categories
                </button>
              </motion.div>
            )}
            
            {/* CTA Section */}
            <motion.div
              className="mt-16 p-8 rounded-2xl bg-gradient-to-r from-blue-50 via-blue-100/50 to-blue-50 border border-blue-200 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Can't Find What You're Looking For?</h3>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                We source specialized industrial products. Contact us for custom requirements or bulk orders.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-all hover:gap-3"
              >
                Contact Our Experts
                <ArrowRight size={20} />
              </Link>
            </motion.div>
          </>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Categories;