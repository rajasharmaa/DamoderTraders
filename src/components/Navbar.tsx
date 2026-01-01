// components/Navbar.tsx
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Sparkles, User, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProductsOpen, setIsProductsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setShowUserMenu(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProductsMenu = () => {
    setIsProductsOpen(!isProductsOpen);
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <nav 
        className={`sticky top-0 z-50 transition-all duration-500 ${
          scrolled 
            ? 'bg-gradient-to-b from-white/95 to-white/85 backdrop-blur-xl shadow-2xl border-b border-blue-100/50' 
            : 'bg-gradient-to-b from-white/90 to-white/80 backdrop-blur-lg shadow-lg'
        }`}
        style={{
          transform: scrolled ? 'translateY(0)' : 'translateY(0)',
          boxShadow: scrolled 
            ? '0 10px 40px rgba(59, 130, 246, 0.15), 0 0 0 1px rgba(59, 130, 246, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8)' 
            : '0 8px 30px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.05)'
        }}
      >
        {/* Decorative top accent */}
        <div className="h-1 bg-gradient-to-r from-blue-500 via-sky-400 to-blue-600 shadow-lg" />
        
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-20 relative">
            {/* Enhanced 3D Logo with depth */}
            <Link 
              to="/" 
              className="flex items-center group relative"
              style={{
                transformStyle: 'preserve-3d',
                perspective: '1000px'
              }}
            >
              <div className="relative">
                {/* Logo shadow with enhanced glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-sky-400/20 to-blue-600/20 blur-xl -z-10 translate-y-1 group-hover:translate-y-2 group-hover:scale-110 transition-all duration-500" />
                
                {/* Logo container with improved 3D */}
                <div className="relative bg-gradient-to-br from-white via-blue-50 to-white rounded-xl p-1.5 shadow-2xl border border-white/80 transform group-hover:rotate-y-5 transition-all duration-500">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-sky-400/10 to-transparent rounded-lg" />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/50 to-transparent rounded-lg" />
                  <img
                    src="/logo.png"
                    alt="Damodar Traders"
                    className="h-14 w-auto relative z-10 drop-shadow-lg"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/150x40/1e40af/ffffff?text=Damodar+Traders';
                      e.currentTarget.className = 'h-12 w-auto bg-gradient-to-r from-blue-600 to-blue-800 text-white px-4 py-3 rounded-xl font-bold shadow-lg';
                    }}
                  />
                </div>
                
                {/* Enhanced 3D edge effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 via-sky-400/30 to-blue-400/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
              </div>
              
              {/* Enhanced animated sparkle */}
              <div className="absolute -right-2 -top-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                <div className="relative">
                  <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" fill="currentColor" />
                  <div className="absolute inset-0 bg-yellow-400/20 blur-sm animate-ping rounded-full" />
                </div>
              </div>
            </Link>

            {/* Desktop Navigation with enhanced 3D buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                to="/" 
                className={`relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-500 group ${
                  isActive('/') 
                    ? 'text-blue-700 bg-gradient-to-b from-blue-50 to-white shadow-lg border border-blue-200/50' 
                    : 'text-blue-600 hover:text-blue-800'
                }`}
                style={{
                  transformStyle: 'preserve-3d'
                }}
              >
                {isActive('/') && (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-xl" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
                  </>
                )}
                <span className="relative z-10 flex items-center gap-2">
                  Home
                  {isActive('/') && (
                    <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full animate-pulse" />
                  )}
                </span>
                <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
              
              {/* Enhanced Products Dropdown with 3D */}
              <div className="relative group">
                <button className="relative px-4 py-2.5 rounded-xl font-semibold text-blue-600 hover:text-blue-800 transition-all duration-500 group flex items-center gap-2">
                  <span className="relative z-10">Products</span>
                  <ChevronDown 
                    size={16} 
                    className="relative z-10 transition-transform duration-500 group-hover:rotate-180 group-hover:scale-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/10 to-sky-400/10 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                </button>
                
                {/* Enhanced 3D Dropdown Menu */}
                <div className="absolute top-full left-0 mt-3 w-56 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl shadow-2xl rounded-2xl py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-500 z-50 border border-white/50 transform group-hover:translate-y-0 -translate-y-2">
                  {/* Dropdown arrow with glow */}
                  <div className="absolute -top-2 left-6 w-4 h-4 bg-white transform rotate-45 border-t border-l border-white/50 shadow-lg" />
                  <div className="absolute -top-3 left-5 w-6 h-6 bg-gradient-to-r from-blue-500/10 to-sky-400/10 blur-sm" />
                  
                  <div className="relative space-y-1 p-2">
                    <Link 
                      to="/categories" 
                      className="block px-4 py-3 rounded-lg text-blue-700 hover:text-blue-900 hover:bg-gradient-to-r from-blue-50/80 to-sky-50/80 transition-all duration-300 font-medium group/item transform hover:translate-x-1"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full animate-pulse" />
                        All Categories
                      </div>
                    </Link>
                    {['Pipes', 'Fittings', 'Valves', 'Other Products'].map((category) => (
                      <Link 
                        key={category}
                        to={`/products?category=${category.toLowerCase().replace(' ', '')}`}
                        className="block px-4 py-3 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-gradient-to-r from-blue-50/50 to-transparent transition-all duration-300 group/item transform hover:translate-x-1"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-1.5 h-1.5 bg-blue-400/50 rounded-full group-hover/item:bg-gradient-to-r from-blue-500 to-sky-400 transition-all duration-300" />
                          {category}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
              
              {['about', 'contact'].map((item) => (
                <Link 
                  key={item}
                  to={`/${item}`}
                  className={`relative px-4 py-2.5 rounded-xl font-semibold transition-all duration-500 group ${
                    isActive(`/${item}`) 
                      ? 'text-blue-700 bg-gradient-to-b from-blue-50 to-white shadow-lg border border-blue-200/50' 
                      : 'text-blue-600 hover:text-blue-800'
                  }`}
                >
                  {isActive(`/${item}`) && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-transparent rounded-xl" />
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-1 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full" />
                    </>
                  )}
                  <span className="relative z-10 capitalize">
                    {item === 'contact' ? 'Contact Us' : 'About Us'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              ))}

              {/* Enhanced User Account Section with 3D */}
              {user ? (
                <div className="relative pl-4 border-l border-blue-200/30">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="relative group flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all duration-500 hover:bg-gradient-to-b from-blue-50/50 to-transparent"
                  >
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -inset-1 bg-gradient-to-br from-blue-500/30 to-sky-400/30 rounded-full blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium text-blue-700 text-sm">Welcome back</div>
                      <div className="font-bold text-blue-800">{user.name?.split(' ')[0]}</div>
                    </div>
                    <ChevronDown 
                      size={16} 
                      className={`text-blue-600 transition-transform duration-500 ${showUserMenu ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {/* Enhanced User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute top-full right-0 mt-3 w-64 bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl shadow-2xl rounded-2xl py-3 z-50 border border-white/50">
                      {/* Menu arrow */}
                      <div className="absolute -top-2 right-6 w-4 h-4 bg-white transform rotate-45 border-t border-l border-white/50" />
                      
                      <div className="p-3 border-b border-blue-100/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg">
                            <User className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="font-bold text-blue-900">{user.name}</div>
                            <div className="text-sm text-blue-600">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-2 space-y-1">
                        <Link 
                          to="/account" 
                          className="flex items-center gap-3 px-4 py-3 rounded-lg text-blue-700 hover:text-blue-900 hover:bg-gradient-to-r from-blue-50/80 to-sky-50/80 transition-all duration-300 font-medium group/item"
                          onClick={() => setShowUserMenu(false)}
                        >
                          <User className="w-5 h-5" />
                          My Account
                        </Link>
                        
                        <button 
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-rose-600 hover:text-rose-800 hover:bg-gradient-to-r from-rose-50/80 to-pink-50/80 transition-all duration-300 font-medium group/item"
                        >
                          <LogOut className="w-5 h-5" />
                          Logout
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-4 pl-4 border-l border-blue-200/30">
                  <Link 
                    to="/login" 
                    className="relative px-4 py-2.5 rounded-xl font-semibold text-blue-600 hover:text-blue-800 transition-all duration-500 group"
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-b from-blue-50/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Link>
                  <Link 
                    to="/register" 
                    className="relative px-5 py-2.5 rounded-xl font-bold text-white transition-all duration-500 group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #3b82f6 100%)',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
                    }}
                  >
                    <span className="relative z-10">Register</span>
                    <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/30 to-sky-400/30 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
                  </Link>
                </div>
              )}
            </div>

            {/* Enhanced Mobile Menu Button with 3D effect */}
            <button
              className="md:hidden relative p-3 rounded-xl bg-gradient-to-b from-white to-blue-50/50 shadow-lg border border-blue-100 text-blue-600 hover:text-blue-800 transition-all duration-500 hover:shadow-xl group"
              onClick={toggleMobileMenu}
              style={{
                transformStyle: 'preserve-3d'
              }}
            >
              {isMobileMenuOpen ? (
                <X size={24} className="transform rotate-180 transition-transform duration-500" />
              ) : (
                <Menu size={24} className="transform group-hover:scale-110 transition-transform duration-300" />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-white/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-400/20 to-sky-400/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
            </button>
          </div>
        </div>

        {/* Enhanced Mobile Navigation with 3D glass effect */}
        <div 
          className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} bg-gradient-to-b from-white/95 to-white/90 backdrop-blur-xl shadow-2xl border-t border-blue-100/50`}
          style={{
            transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-10px)',
            opacity: isMobileMenuOpen ? 1 : 0,
            transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div className="container mx-auto px-4 py-6">
            <div className="space-y-3">
              <Link 
                to="/" 
                className={`block py-3 px-4 rounded-xl font-semibold transition-all duration-500 ${
                  isActive('/') 
                    ? 'text-blue-700 bg-gradient-to-r from-blue-50/80 to-white shadow-inner border border-blue-200/50' 
                    : 'text-blue-600 hover:text-blue-800 hover:bg-gradient-to-r from-blue-50/50 to-transparent'
                }`}
                onClick={toggleMobileMenu}
              >
                <div className="flex items-center gap-3">
                  {isActive('/') && <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full animate-pulse" />}
                  Home
                </div>
              </Link>
              
              {/* Enhanced Products in Mobile */}
              <div className="rounded-xl border border-blue-200/30 bg-gradient-to-b from-blue-50/20 to-transparent p-1">
                <button 
                  className="w-full flex items-center justify-between py-3 px-4 rounded-lg font-semibold text-blue-700 hover:text-blue-900 transition-colors bg-gradient-to-r from-blue-50/50 to-transparent group"
                  onClick={toggleProductsMenu}
                >
                  <div className="flex items-center gap-3">
                    <ChevronDown 
                      size={16} 
                      className={`transition-transform duration-500 ${isProductsOpen ? 'rotate-180' : ''}`} 
                    />
                    <span>Products</span>
                  </div>
                  <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-sky-400 rounded-full group-hover:scale-125 transition-transform duration-300" />
                </button>
                <div 
                  className={`pl-8 space-y-2 mt-2 transition-all duration-500 overflow-hidden ${
                    isProductsOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <Link 
                    to="/categories" 
                    className="block py-2.5 px-4 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-gradient-to-r from-blue-50/50 to-transparent transition-all duration-300"
                    onClick={toggleMobileMenu}
                  >
                    All Categories
                  </Link>
                  {['Pipes', 'Fittings', 'Valves', 'Other Products'].map((category) => (
                    <Link 
                      key={category}
                      to={`/products?category=${category.toLowerCase().replace(' ', '')}`}
                      className="block py-2.5 px-4 rounded-lg text-blue-600 hover:text-blue-800 hover:bg-gradient-to-r from-blue-50/50 to-transparent transition-all duration-300"
                      onClick={toggleMobileMenu}
                    >
                      {category}
                    </Link>
                  ))}
                </div>
              </div>
              
              {['about', 'contact'].map((item) => (
                <Link 
                  key={item}
                  to={`/${item}`}
                  className={`block py-3 px-4 rounded-xl font-semibold transition-all duration-500 ${
                    isActive(`/${item}`) 
                      ? 'text-blue-700 bg-gradient-to-r from-blue-50/80 to-white shadow-inner border border-blue-200/50' 
                      : 'text-blue-600 hover:text-blue-800 hover:bg-gradient-to-r from-blue-50/50 to-transparent'
                  }`}
                  onClick={toggleMobileMenu}
                >
                  {item === 'contact' ? 'Contact Us' : 'About Us'}
                </Link>
              ))}
              
              {/* Enhanced Mobile Auth Links */}
              {user ? (
                <div className="rounded-xl border border-blue-200/30 bg-gradient-to-b from-blue-50/20 to-transparent p-1 space-y-2">
                  <div className="p-3 bg-gradient-to-r from-blue-50/50 to-transparent rounded-lg mb-2">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-sky-400 flex items-center justify-center shadow-lg">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="font-bold text-blue-900">{user.name?.split(' ')[0]}</div>
                        <div className="text-sm text-blue-600">{user.email}</div>
                      </div>
                    </div>
                  </div>
                  
                  <Link 
                    to="/account" 
                    className="block py-3 px-4 rounded-lg font-semibold text-blue-600 hover:text-blue-800 hover:bg-gradient-to-r from-blue-50/50 to-transparent transition-all duration-300"
                    onClick={toggleMobileMenu}
                  >
                    My Account
                  </Link>
                  <button 
                    onClick={() => {
                      handleLogout();
                      toggleMobileMenu();
                    }}
                    className="w-full text-left block py-3 px-4 rounded-lg font-semibold text-rose-500 hover:text-rose-700 hover:bg-gradient-to-r from-rose-50/50 to-transparent transition-all duration-300 border border-rose-200/50"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="rounded-xl border border-blue-200/30 bg-gradient-to-b from-blue-50/20 to-transparent p-1 space-y-2">
                  <Link 
                    to="/login" 
                    className="block py-3 px-4 rounded-lg font-semibold text-blue-600 hover:text-blue-800 hover:bg-gradient-to-r from-blue-50/50 to-transparent transition-all duration-300"
                    onClick={toggleMobileMenu}
                  >
                    Login
                  </Link>
                  <Link 
                    to="/register" 
                    className="block py-3 px-4 rounded-lg font-bold text-white text-center shadow-lg hover:shadow-xl transition-all duration-500"
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #0ea5e9 50%, #3b82f6 100%)',
                      boxShadow: '0 4px 20px rgba(59, 130, 246, 0.4)'
                    }}
                    onClick={toggleMobileMenu}
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Close dropdown when clicking outside */}
      {showUserMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </>
  );
};

export default Navbar;