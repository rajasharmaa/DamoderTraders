// pages/Products.tsx
import { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Package, Filter, Layers, Wrench, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';

interface Product {
  _id: string;
  name: string;
  category: string;
  image: string;
  description: string;
}

const Products = () => {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'all');
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Define categoryOptions here, before useMemo hooks
  const categoryOptions = [
    { value: 'all', label: 'All Products', icon: Package, color: 'bg-gray-900 text-white' },
    { value: 'pipes', label: 'Pipes', icon: Layers, color: 'bg-blue-600 text-white' },
    { value: 'fittings', label: 'Fittings', icon: Wrench, color: 'bg-emerald-600 text-white' },
    { value: 'valves', label: 'Valves', icon: Filter, color: 'bg-red-600 text-white' },
    { value: 'other', label: 'Accessories', icon: Zap, color: 'bg-amber-600 text-white' },
  ];

  // Filter products based on search and category
  const filteredProducts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) return [];
    
    return allProducts.filter(product => {
      const matchesSearch = searchQuery.trim() === '' || 
        (product.name && product.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || 
        (product.category && product.category.toLowerCase() === selectedCategory.toLowerCase());
      
      return matchesSearch && matchesCategory;
    });
  }, [allProducts, searchQuery, selectedCategory]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    if (!allProducts || allProducts.length === 0) {
      return {
        all: 0,
        pipes: 0,
        fittings: 0,
        valves: 0,
        other: 0
      };
    }
    
    const counts: Record<string, number> = { all: allProducts.length };
    
    categoryOptions.forEach(option => {
      if (option.value !== 'all') {
        counts[option.value] = allProducts.filter(
          product => product.category && product.category.toLowerCase() === option.value
        ).length;
      }
    });
    
    return counts;
  }, [allProducts, categoryOptions]); // Add categoryOptions to dependencies

  const getCategoryColor = (category: string) => {
    const option = categoryOptions.find(opt => opt.value === category.toLowerCase());
    return option?.color || 'bg-gray-600 text-white';
  };

  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setIsLoading(true);
        let data: any[] = [];
        
        // Try to fetch all products
        try {
          const response = await api.products.getAll();
          data = Array.isArray(response) ? response : [];
        } catch (fetchError) {
          console.error('Error fetching products:', fetchError);
          data = [];
        }
        
        // Log for debugging
        console.log('Fetched products data:', data);
        
        // Check if data exists and is an array
        if (!data || !Array.isArray(data)) {
          console.warn('Invalid data format received:', data);
          data = [];
        }
        
        // Safely map products with null checks
        const enhancedProducts = (data || []).map((product: any) => ({
          _id: product?._id || product?.id || `product-${Math.random().toString(36).substr(2, 9)}`,
          name: product?.name || 'Unnamed Product',
          category: product?.category || 'other',
          image: product?.image || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
          description: product?.description || 'Premium industrial product with superior quality and durability.',
        }));
        
        setAllProducts(enhancedProducts);
        
        if (enhancedProducts.length === 0) {
          console.warn('No products loaded. Check API connection or data.');
        }
        
      } catch (error: any) {
        console.error('Unexpected error in fetchAllProducts:', error);
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again later.',
          variant: 'destructive',
        });
        setAllProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllProducts();
  }, [toast]);

  return (
    <>
      <Helmet>
        <title>
          {categoryParam
            ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1)} Products - Damodar Traders`
            : 'Premium Industrial Products - Damodar Traders'}
        </title>
        <meta
          name="description"
          content="Browse our premium catalog of industrial pipes, fittings, valves, and accessories. Superior quality products for industrial excellence."
        />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Hero Section */}
        <motion.div 
          className="pt-16 pb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 text-gray-900">
            Industrial{' '}
            <span className="text-primary">
              {categoryParam ? categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1) : 'Products'}
            </span>
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover our comprehensive range of premium industrial products for superior performance and durability.
          </p>
        </motion.div>

        {/* Search Section */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-2 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
              <input
                type="text"
                placeholder="Search industrial products, pipes, valves, fittings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-6 py-4 rounded-xl text-lg focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Category Filters */}
        <motion.div
          className="mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <div className="flex flex-wrap justify-center gap-3">
            {categoryOptions.map((option) => {
              const Icon = option.icon;
              const count = categoryCounts[option.value] || 0;
              
              return (
                <button
                  key={option.value}
                  onClick={() => setSelectedCategory(option.value)}
                  className={`px-5 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 ${
                    selectedCategory === option.value 
                      ? option.color + ' shadow-lg' 
                      : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                  }`}
                >
                  <Icon size={20} />
                  <span>{option.label}</span>
                  <span className={`text-sm px-2.5 py-0.5 rounded-full ${
                    selectedCategory === option.value 
                      ? 'bg-white/20' 
                      : 'bg-gray-100'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Results Info */}
        <motion.div 
          className="mb-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center">
            <h3 className="text-2xl font-bold text-gray-900">
              {filteredProducts.length} Products Available
            </h3>
          </div>
        </motion.div>

        {/* Loading State */}
        {isLoading ? (
          <motion.div 
            className="flex flex-col items-center justify-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary border-t-transparent" />
            <p className="mt-6 text-lg text-gray-600">Loading products...</p>
          </motion.div>
        ) : (
          <>
            {/* Products Grid */}
            {!allProducts || allProducts.length === 0 ? (
              <motion.div 
                className="text-center py-24"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Available</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-10 text-lg">
                  Currently, there are no products in our catalog. Please check back later or contact us for more information.
                </p>
                <Link
                  to="/contact"
                  className="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300 inline-block"
                >
                  Contact Us
                </Link>
              </motion.div>
            ) : filteredProducts.length === 0 ? (
              <motion.div 
                className="text-center py-24"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <div className="w-24 h-24 mx-auto mb-8 rounded-full bg-gray-100 flex items-center justify-center">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Products Found</h3>
                <p className="text-gray-600 max-w-md mx-auto mb-10 text-lg">
                  We couldn't find any products matching your criteria. Try a different search term or browse all categories.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="px-8 py-3.5 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300"
                >
                  Browse All Products
                </button>
              </motion.div>
            ) : (
              <motion.div 
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ staggerChildren: 0.05 }}
              >
                {filteredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{ y: -5 }}
                  >
                    <Link to={`/products/${product._id}`}>
                      <div className="bg-white rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 h-full flex flex-col group">
                        {/* Product Image */}
                        <div className="relative h-56 overflow-hidden">
                          <img 
                            src={product.image} 
                            alt={product.name} 
                            loading="lazy" 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent"></div>
                          
                          {/* Category Badge */}
                          <div className={`absolute top-4 left-4 px-4 py-2 rounded-full text-xs font-semibold ${getCategoryColor(product.category)}`}>
                            {product.category?.charAt(0).toUpperCase() + product.category?.slice(1) || 'Accessories'}
                          </div>
                        </div>

                        {/* Product Content */}
                        <div className="p-6 flex-1 flex flex-col">
                          <h3 className="font-bold text-gray-900 text-lg mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                            {product.name}
                          </h3>
                          
                          <p className="text-gray-600 text-sm mb-6 line-clamp-3 flex-1 leading-relaxed">
                            {product.description}
                          </p>

                          {/* View Details CTA */}
                          <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100">
                            <div className="text-primary font-semibold text-sm">
                              View Details →
                            </div>
                            <div className="text-xs text-gray-500">
                              Industrial Grade
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {/* CTA Section */}
            {filteredProducts.length > 0 && (
              <motion.div
                className="mt-20 p-10 rounded-2xl bg-gray-50 border border-gray-200 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-3xl font-bold text-gray-900 mb-6">
                  Need Custom Industrial Solutions?
                </h3>
                
                <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
                  We specialize in custom manufacturing and bulk orders for industrial applications. 
                  Contact us for personalized solutions and competitive pricing.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-5 justify-center">
                  <Link
                    to="/contact"
                    className="px-10 py-4 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-all duration-300"
                  >
                    Request Custom Quote
                  </Link>
                  <Link
                    to="/categories"
                    className="px-10 py-4 bg-white border-2 border-primary text-primary rounded-xl font-semibold hover:bg-primary/5 transition-all duration-300"
                  >
                    Browse More Categories
                  </Link>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>

      <Footer />
    </>
  );
};

export default Products;