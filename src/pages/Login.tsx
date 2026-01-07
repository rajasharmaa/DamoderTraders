// src/pages/Login.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import IndustrialBackground from '@/components/IndustrialBackground';
import { Lock, Mail, ArrowLeft, UserPlus, Check, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading, rememberMe, setRememberMe, error: authError } = useAuth();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [localRememberMe, setLocalRememberMe] = useState(rememberMe);
  const [showPassword, setShowPassword] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTime, setLockTime] = useState(0);

  useEffect(() => {
    setLocalRememberMe(rememberMe);
    
    // Check if account is locked from localStorage
    const lockInfo = localStorage.getItem('login_lock');
    if (lockInfo) {
      const { timestamp, attempts } = JSON.parse(lockInfo);
      const now = Date.now();
      const lockDuration = 5 * 60 * 1000; // 5 minutes
      
      if (now - timestamp < lockDuration) {
        setIsLocked(true);
        setLockTime(Math.ceil((lockDuration - (now - timestamp)) / 1000 / 60));
        setAttempts(attempts);
      } else {
        localStorage.removeItem('login_lock');
      }
    }
  }, [rememberMe]);

  useEffect(() => {
    // Update lock timer
    if (isLocked && lockTime > 0) {
      const timer = setInterval(() => {
        setLockTime(prev => {
          if (prev <= 1) {
            setIsLocked(false);
            localStorage.removeItem('login_lock');
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 60000); // Update every minute
      
      return () => clearInterval(timer);
    }
  }, [isLocked, lockTime]);

  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleRememberMeToggle = () => {
    const newValue = !localRememberMe;
    setLocalRememberMe(newValue);
    setRememberMe(newValue);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const incrementAttempts = () => {
    const newAttempts = attempts + 1;
    setAttempts(newAttempts);
    
    // Lock account after 5 failed attempts
    if (newAttempts >= 5) {
      setIsLocked(true);
      setLockTime(5); // 5 minutes
      localStorage.setItem('login_lock', JSON.stringify({
        timestamp: Date.now(),
        attempts: newAttempts
      }));
    }
    
    return newAttempts;
  };

  const resetAttempts = () => {
    setAttempts(0);
    localStorage.removeItem('login_lock');
  };

  const getErrorMessage = (errorMessage: string): { title: string; description: string; showRegister?: boolean } => {
    const errors = {
      'Invalid email or password.': {
        title: 'Invalid Credentials',
        description: 'The email or password you entered is incorrect. Please try again.',
      },
      'EMAIL_NOT_FOUND': {
        title: 'Account Not Found',
        description: 'No account found with this email address.',
        showRegister: true
      },
      'LOGIN_TIMEOUT': {
        title: 'Connection Timeout',
        description: 'The server is taking too long to respond. Please check your internet connection.',
      },
      'SESSION_NOT_ESTABLISHED': {
        title: 'Session Error',
        description: 'Login succeeded but session could not be established. Please try again.',
      },
      'Failed to fetch': {
        title: 'Connection Error',
        description: 'Cannot connect to server. Please check your internet connection.',
      },
      'NetworkError': {
        title: 'Network Error',
        description: 'Unable to connect to the server. Please check your network connection.',
      },
      'Rate limit': {
        title: 'Too Many Attempts',
        description: 'Too many login attempts. Please wait a moment before trying again.',
      },
      'SESSION_EXPIRED': {
        title: 'Session Expired',
        description: 'Your session has expired. Please log in again.',
      },
      'FORBIDDEN': {
        title: 'Access Denied',
        description: 'Access denied. Your account may be restricted.',
      },
      'AUTHENTICATION_FAILED': {
        title: 'Authentication Failed',
        description: 'Unable to verify your credentials. Please try again.',
      }
    };

    // Find matching error
    for (const [key, value] of Object.entries(errors)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }

    // Default error
    return {
      title: 'Login Failed',
      description: 'An unexpected error occurred. Please try again.',
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Check if account is locked
    if (isLocked) {
      toast({
        title: 'Account Temporarily Locked',
        description: `Too many failed attempts. Please wait ${lockTime} minutes before trying again.`,
        variant: 'destructive',
        duration: 5000,
      });
      return;
    }
    
    // Validation
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

    // Password strength check
    if (formData.password.length < 6) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 6 characters long',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await login(formData.email, formData.password, localRememberMe);
      
      // Reset attempts on successful login
      resetAttempts();
      
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
      const errorMessage = err.message || 'Login failed. Please try again.';
      const errorDetails = getErrorMessage(errorMessage);
      
      // Increment failed attempts
      const newAttempts = incrementAttempts();
      
      setError(errorDetails.description);
      
      // Show appropriate toast
      const toastConfig: any = {
        title: errorDetails.title,
        description: errorDetails.description,
        variant: 'destructive' as const,
        duration: 5000,
      };
      
      // Add register option for email not found
      if (errorDetails.showRegister) {
        toastConfig.action = (
          <button 
            onClick={() => navigate(`/register?email=${encodeURIComponent(formData.email)}`)}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Register Now
          </button>
        );
      }
      
      toast(toastConfig);
      
      // Show remaining attempts warning
      if (newAttempts >= 3 && newAttempts < 5) {
        setTimeout(() => {
          toast({
            title: 'Warning',
            description: `${5 - newAttempts} attempts remaining before account is locked for 5 minutes.`,
            variant: 'destructive',
            duration: 4000,
          });
        }, 1000);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleDemoLogin = () => {
    if (isLocked) {
      toast({
        title: 'Account Locked',
        description: `Demo login disabled. Please wait ${lockTime} minutes.`,
        variant: 'destructive',
      });
      return;
    }
    
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

  const handleForgotPassword = () => {
    if (!formData.email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address first',
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
    
    navigate(`/forgot-password?email=${encodeURIComponent(formData.email)}`);
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

          {/* Security Warning */}
          {attempts > 0 && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-start gap-2">
                <Shield className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm text-yellow-800 font-medium">
                    {attempts} failed {attempts === 1 ? 'attempt' : 'attempts'}
                  </p>
                  {attempts >= 3 && attempts < 5 && (
                    <p className="text-xs text-yellow-700 mt-1">
                      {5 - attempts} {attempts === 4 ? 'attempt' : 'attempts'} remaining before temporary lock
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Account Locked Warning */}
          {isLocked && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Account Temporarily Locked</h3>
                  <p className="text-sm text-red-700 mt-1">
                    Too many failed login attempts. Please try again in {lockTime} {lockTime === 1 ? 'minute' : 'minutes'}.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && !isLocked && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-shake">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-red-800">Login Failed</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
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
                  disabled={isLocked}
                  className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    isLocked 
                      ? 'border-gray-300 cursor-not-allowed opacity-60' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
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
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-800 transition-colors disabled:text-gray-400"
                  disabled={isLocked}
                >
                  Forgot Password?
                </button>
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
                  disabled={isLocked}
                  className={`w-full pl-10 pr-12 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                    isLocked 
                      ? 'border-gray-300 cursor-not-allowed opacity-60' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLocked}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 disabled:text-gray-300"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleRememberMeToggle}
                disabled={isLocked}
                className="flex items-center gap-3 group cursor-pointer disabled:cursor-not-allowed"
              >
                <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${
                  isLocked ? 'opacity-60' : 'group-hover:scale-105'
                } ${
                  localRememberMe 
                    ? 'bg-blue-600 border-blue-600 shadow-sm' 
                    : 'bg-white border-gray-300 group-hover:border-blue-400'
                }`}>
                  {localRememberMe && <Check className="w-3 h-3 text-white" />}
                </div>
                <span className={`text-sm select-none transition-colors ${
                  isLocked ? 'text-gray-500' : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  Remember me on this device
                </span>
              </button>
              
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={isLocked}
                className="text-sm text-blue-600 hover:text-blue-800 transition-colors underline disabled:text-gray-400"
              >
                Try Demo
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked || !formData.email.trim() || !formData.password.trim()}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl active:scale-[0.98] transform"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Logging in...</span>
                </div>
              ) : isLocked ? (
                <>
                  <Lock className="w-5 h-5" />
                  <span>Account Locked</span>
                </>
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
              className={`inline-block w-full py-3.5 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-semibold rounded-xl transition-all duration-300 text-center shadow-lg transform ${
                isLocked 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'hover:from-gray-800 hover:to-gray-600 hover:shadow-xl hover:scale-[1.02]'
              }`}
            >
              <UserPlus className="w-5 h-5 inline mr-2" />
              Create New Account
            </Link>
          </div>

          {localRememberMe && !isLocked && (
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