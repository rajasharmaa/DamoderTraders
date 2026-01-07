// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import IndustrialBackground from '@/components/IndustrialBackground';
import { Lock, Mail, ArrowLeft, UserPlus, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, rememberMe, setRememberMe } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [localRememberMe, setLocalRememberMe] = useState(rememberMe);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setLocalRememberMe(rememberMe);
  }, [rememberMe]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRememberMeToggle = () => {
    const newValue = !localRememberMe;
    setLocalRememberMe(newValue);
    setRememberMe(newValue);
    console.log('Remember me toggled:', newValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!formData.email.trim() || !formData.password.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidEmail(formData.email)) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      console.log('Attempting login with:', { 
        email: formData.email, 
        rememberMe: localRememberMe 
      });
      
      const response = await login(formData.email, formData.password, localRememberMe);
      
      console.log('Login response:', response);
      
      toast({
        title: 'Login Successful!',
        description: localRememberMe 
          ? 'Welcome back! You will stay logged in on this device.' 
          : 'Welcome back to Damodar Traders.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
        duration: 3000,
      });
      
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (err: any) {
      console.error('Login error details:', err);
      
      let errorMessage = err.message || 'Login failed. Please try again.';
      let showRegisterOption = false;
      
      if (err.message === 'Invalid email or password.') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message.includes('account') || err.message.includes('Account')) {
        errorMessage = 'No account found with this email.';
        showRegisterOption = true;
      }
      
      setError(errorMessage);
      
      toast({
        title: 'Login Failed',
        description: errorMessage,
        variant: 'destructive',
        duration: 5000,
        action: showRegisterOption ? (
          <button 
            onClick={() => navigate(`/register?email=${encodeURIComponent(formData.email)}`)}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Register Now
          </button>
        ) : undefined,
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleDemoLogin = () => {
    setFormData({
      email: 'demo@damodartraders.com',
      password: 'Demo@123'
    });
    toast({
      title: 'Demo Credentials Loaded',
      description: 'You can now click Login to try the demo',
      duration: 3000,
    });
  };

  return (
    <>
      <Helmet>
        <title>Login - Damodar Traders</title>
        <meta name="description" content="Login to your Damodar Traders account" />
      </Helmet>

      <IndustrialBackground />

      <div className="min-h-screen flex items-center justify-center px-5 py-10">
        <motion.div
          className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border border-gray-200"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-6">
            <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>

          <div className="text-center mb-8">
            <Link to="/">
              <img
                src="/logo.png"
                alt="Damodar Traders"
                className="h-12 mx-auto mb-4"
                onError={(e) => {
                  e.currentTarget.src = 'https://via.placeholder.com/150x50?text=Damodar+Traders';
                }}
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
            <p className="text-gray-600 mt-2">Login to your account</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-shake">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-10 pr-12 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all hover:border-gray-400"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleRememberMeToggle}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all group-hover:scale-105 ${
                  localRememberMe 
                    ? 'bg-blue-600 border-blue-600 shadow-sm' 
                    : 'bg-white border-gray-300 group-hover:border-blue-400'
                }`}>
                  {localRememberMe && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className="text-sm text-gray-700 select-none group-hover:text-gray-900 transition-colors">
                  Remember me on this device
                </span>
              </button>
              
              <button
                type="button"
                onClick={handleDemoLogin}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors underline"
              >
                Try Demo
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transform"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Login to Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600 mb-4">
              Don't have an account?
            </p>
            <Link
              to="/register"
              className="inline-block w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 text-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Create New Account
            </Link>
          </div>

          {localRememberMe && (
            <div className="mt-6 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-xs text-blue-800 text-center">
                <span className="font-semibold">Note:</span> "Remember me" stores a secure token on this device. 
                Do not use on shared or public computers.
              </p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
              <Link to="/terms" className="hover:text-blue-600 transition-colors text-center">
                Terms of Service
              </Link>
              <Link to="/privacy" className="hover:text-blue-600 transition-colors text-center">
                Privacy Policy
              </Link>
            </div>
            <p className="text-xs text-gray-400 text-center mt-4">
              © {new Date().getFullYear()} Damodar Traders. All rights reserved.
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;