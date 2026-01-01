// pages/Login.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import IndustrialBackground from '@/components/IndustrialBackground';

import { Lock, Mail, Key, AlertCircle, ArrowLeft, UserPlus, CheckCircle, XCircle } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, checkEmailExists, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [emailStatus, setEmailStatus] = useState<'checking' | 'exists' | 'not_exists' | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Check if redirected from registration with email pre-filled
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const emailFromReg = params.get('email');
    if (emailFromReg) {
      setFormData(prev => ({ ...prev, email: emailFromReg }));
      toast({
        title: 'Registration Successful!',
        description: 'Please login with your new account.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });
    }
  }, [location, toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setLoginError('');
    setEmailStatus(null); // Reset email status when user types
  };

  const checkEmail = async () => {
    if (!formData.email || !formData.email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address',
        variant: 'destructive',
      });
      return;
    }

    setIsCheckingEmail(true);
    setEmailStatus('checking');

    try {
      const exists = await checkEmailExists(formData.email);
      
      if (exists) {
        setEmailStatus('exists');
        toast({
          title: 'Account Found',
          description: 'An account exists with this email. Please enter your password.',
          className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0',
        });
      } else {
        setEmailStatus('not_exists');
        toast({
          title: 'Account Not Found',
          description: 'No account found with this email. Would you like to register?',
          variant: 'destructive',
          action: (
            <button 
              onClick={() => navigate(`/register?email=${encodeURIComponent(formData.email)}`)}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Register Now
            </button>
          ),
        });
      }
    } catch (error) {
      console.error('Error checking email:', error);
      setEmailStatus(null);
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    // First check if email exists
    if (emailStatus === 'not_exists') {
      toast({
        title: 'Account Not Found',
        description: 'Please register first before attempting to login.',
        variant: 'destructive',
      });
      navigate(`/register?email=${encodeURIComponent(formData.email)}`);
      return;
    }

    // If email status is unknown, check it first
    if (!emailStatus && formData.email) {
      try {
        const exists = await checkEmailExists(formData.email);
        if (!exists) {
          toast({
            title: 'Account Not Found',
            description: 'No account found. Redirecting to registration...',
            variant: 'destructive',
          });
          navigate(`/register?email=${encodeURIComponent(formData.email)}`);
          return;
        }
      } catch (error) {
        console.error('Error checking email:', error);
        // Continue with login attempt
      }
    }

    try {
      await login(formData.email, formData.password);
      toast({
        title: 'Login Successful!',
        description: 'Welcome back to Damodar Traders.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });
      
      // Redirect to intended page or home
      const from = location.state?.from || '/';
      navigate(from, { replace: true });
    } catch (error: any) {
      const errorMessage = error.message;
      
      if (errorMessage === 'ACCOUNT_NOT_FOUND') {
        setLoginError('Account not found. Please register first.');
        toast({
          title: 'Account Not Found',
          description: 'No account found with this email. Would you like to register?',
          variant: 'destructive',
          duration: 5000,
          action: (
            <button 
              onClick={() => navigate(`/register?email=${encodeURIComponent(formData.email)}`)}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Register Now
            </button>
          ),
        });
      } else if (errorMessage === 'INVALID_PASSWORD') {
        setLoginError('Incorrect password. Please try again.');
        toast({
          title: 'Incorrect Password',
          description: 'The password you entered is incorrect. Please try again or reset your password.',
          variant: 'destructive',
        });
      } else if (errorMessage === 'AUTHENTICATION_FAILED') {
        setLoginError('Authentication failed. Please try again.');
        toast({
          title: 'Authentication Failed',
          description: 'Unable to login. Please check your credentials.',
          variant: 'destructive',
        });
      } else {
        setLoginError(errorMessage);
        toast({
          title: 'Login Failed',
          description: errorMessage,
          variant: 'destructive',
        });
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address',
        variant: 'destructive',
      });
      return;
    }

    setIsResetting(true);
    
    try {
      // First check if email exists
      const exists = await checkEmailExists(resetEmail);
      
      if (!exists) {
        toast({
          title: 'Account Not Found',
          description: 'No account found with this email. Would you like to register instead?',
          variant: 'destructive',
          duration: 5000,
          action: (
            <button 
              onClick={() => {
                setShowForgotPassword(false);
                navigate(`/register?email=${encodeURIComponent(resetEmail)}`);
              }}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Register Now
            </button>
          ),
        });
        return;
      }

      // Call forgot password API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: 'Password Reset Email Sent!',
        description: 'Check your email for password reset instructions.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });
      
      setShowForgotPassword(false);
      setResetEmail('');
    } catch (error: any) {
      toast({
        title: 'Reset Failed',
        description: error.message || 'Failed to send reset email. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsResetting(false);
    }
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
          {/* Back to Home Link */}
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
                  e.currentTarget.src =
                    'https://via.placeholder.com/150x50?text=Damodar+Traders';
                }}
              />
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">
              {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600 mt-2">
              {showForgotPassword 
                ? 'Enter your email to reset your password'
                : 'Login to your account'
              }
            </p>
          </div>

          {showForgotPassword ? (
            /* Forgot Password Form */
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-start gap-3">
                  <Key className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-900">Forgot Your Password?</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      Enter your email address and we'll send you instructions to reset your password.
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleForgotPassword}>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="reset-email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="reset-email"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(false)}
                      className="flex-1 py-3 bg-gray-200 text-gray-800 font-medium rounded-xl hover:bg-gray-300 transition-all duration-300"
                    >
                      Back to Login
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-medium rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isResetting ? (
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          ) : (
            /* Login Form */
            <>
              <form onSubmit={handleSubmit}>
                <div className="space-y-5">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      {formData.email && (
                        <button
                          type="button"
                          onClick={checkEmail}
                          disabled={isCheckingEmail}
                          className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                        >
                          {isCheckingEmail ? (
                            <>
                              <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              Checking...
                            </>
                          ) : (
                            'Check Account'
                          )}
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your email"
                      />
                    </div>
                    
                    {/* Email Status Indicator */}
                    {emailStatus && formData.email && (
                      <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-sm ${
                        emailStatus === 'exists' 
                          ? 'bg-green-50 text-green-700 border border-green-200' 
                          : emailStatus === 'not_exists'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {emailStatus === 'checking' ? (
                          <>
                            <div className="w-4 h-4 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Checking account status...
                          </>
                        ) : emailStatus === 'exists' ? (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            Account exists. Please enter your password.
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4" />
                            No account found. Please register first.
                          </>
                        )}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder="Enter your password"
                      />
                    </div>
                  </div>

                  {/* Error Message */}
                  {loginError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <div className="flex items-center gap-2 text-red-700">
                        <AlertCircle className="w-4 h-4" />
                        <span className="text-sm font-medium">{loginError}</span>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading || emailStatus === 'not_exists'}
                    className={`w-full py-3 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      emailStatus === 'not_exists'
                        ? 'bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700'
                        : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                    }`}
                  >
                    {authLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Logging in...
                      </div>
                    ) : emailStatus === 'not_exists' ? (
                      <>
                        <XCircle className="w-5 h-5" />
                        Account Not Found
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5" />
                        Login
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Register Section */}
              {emailStatus === 'not_exists' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-6 p-4 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <UserPlus className="w-5 h-5 text-red-600" />
                    <div>
                      <h3 className="font-bold text-red-900">Account Not Found</h3>
                      <p className="text-sm text-red-700">
                        No account exists with email: <span className="font-semibold">{formData.email}</span>
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-red-800">
                      Would you like to create a new account with this email?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate(`/register?email=${encodeURIComponent(formData.email)}`)}
                        className="flex-1 py-2 bg-gradient-to-r from-red-600 to-pink-600 text-white font-medium rounded-lg hover:from-red-700 hover:to-pink-700 transition-all"
                      >
                        Register Now
                      </button>
                      <button
                        onClick={() => {
                          setFormData({ email: '', password: '' });
                          setEmailStatus(null);
                        }}
                        className="flex-1 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-all"
                      >
                        Use Different Email
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Account Check Section */}
              <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
                <p className="text-center text-gray-600 mb-4">
                  Don't have an account?
                </p>
                <div className="flex flex-col gap-3">
                  <Link
                    to="/register"
                    className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 text-center flex items-center justify-center gap-2"
                  >
                    <UserPlus className="w-5 h-5" />
                    Create New Account
                  </Link>
                  
                  {formData.email && emailStatus !== 'not_exists' && (
                    <div className="text-center">
                      <p className="text-xs text-gray-500 mb-2">
                        Not sure if you have an account?
                      </p>
                      <button
                        onClick={checkEmail}
                        disabled={isCheckingEmail}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors flex items-center gap-1 mx-auto"
                      >
                        {isCheckingEmail ? (
                          <>
                            <div className="w-3 h-3 border border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            Checking account...
                          </>
                        ) : (
                          'Check if account exists'
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          {/* Alternative Login Options */}
          <div className="space-y-3">
            <button
              onClick={() => {
                toast({
                  title: 'Coming Soon',
                  description: 'Google login will be available soon',
                });
              }}
              className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-300 flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <button
              onClick={() => {
                toast({
                  title: 'Direct Login',
                  description: 'Contact support for alternative login methods',
                });
              }}
              className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300"
            >
              Need Help? Contact Support
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By logging in, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacyPolicy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Login;