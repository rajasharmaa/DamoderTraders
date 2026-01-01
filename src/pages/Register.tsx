// pages/Register.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import IndustrialBackground from '@/components/IndustrialBackground';
import { User, Mail, Phone, Lock, Check, X, ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register, checkEmailExists, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false,
  });
  const [emailStatus, setEmailStatus] = useState<'checking' | 'available' | 'taken' | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Pre-fill email from URL or login page
  useEffect(() => {
    const emailFromUrl = searchParams.get('email');
    if (emailFromUrl) {
      setFormData(prev => ({ ...prev, email: emailFromUrl }));
      // Auto-check email availability when pre-filled
      setTimeout(() => {
        if (emailFromUrl.includes('@')) {
          checkEmailAvailability(emailFromUrl);
        }
      }, 500);
    }
  }, [searchParams]);

  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes('@')) return;
    
    setIsCheckingEmail(true);
    setEmailStatus('checking');
    try {
      const exists = await checkEmailExists(email);
      setEmailStatus(exists ? 'taken' : 'available');
      
      if (exists) {
        toast({
          title: 'Email Already Registered',
          description: 'This email is already registered. Please login instead.',
          variant: 'destructive',
          action: (
            <button 
              onClick={() => navigate(`/login?email=${encodeURIComponent(email)}`)}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Login Instead
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'email') {
      setEmailStatus(null);
      if (value.includes('@')) {
        // Debounce email check
        const timer = setTimeout(() => {
          checkEmailAvailability(value);
        }, 1000);
        return () => clearTimeout(timer);
      }
    }
    
    if (name === 'password') {
      setPasswordStrength({
        length: value.length >= 6,
        uppercase: /[A-Z]/.test(value),
        lowercase: /[a-z]/.test(value),
        number: /\d/.test(value),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(value),
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if email is available
    if (emailStatus === 'taken') {
      toast({
        title: 'Email Already Registered',
        description: 'This email is already registered. Please use a different email or login.',
        variant: 'destructive',
        action: (
          <button 
            onClick={() => navigate(`/login?email=${encodeURIComponent(formData.email)}`)}
            className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
          >
            Login Instead
          </button>
        ),
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Passwords Do Not Match',
        description: 'Please make sure both passwords match.',
        variant: 'destructive',
      });
      return;
    }

    // Check password strength
    const strengthScore = Object.values(passwordStrength).filter(v => v).length;
    if (strengthScore < 3) {
      toast({
        title: 'Weak Password',
        description: 'Please choose a stronger password with at least 6 characters including uppercase, lowercase, and numbers.',
        variant: 'destructive',
      });
      return;
    }

    // Check email format
    if (!formData.email.includes('@') || !formData.email.includes('.')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    // Check name
    if (formData.name.trim().length < 2) {
      toast({
        title: 'Invalid Name',
        description: 'Please enter your full name.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await register({
        name: formData.name.trim(),
        email: formData.email.toLowerCase().trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });
      
      toast({
        title: '🎉 Registration Successful!',
        description: 'Welcome to Damodar Traders. Your account has been created successfully.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });
      
      // Redirect to login with email pre-filled
      navigate(`/login?email=${encodeURIComponent(formData.email)}&registered=true`);
    } catch (error: any) {
      if (error.message === 'EMAIL_ALREADY_EXISTS') {
        setEmailStatus('taken');
        toast({
          title: 'Email Already Registered',
          description: 'This email is already registered. Please login instead.',
          variant: 'destructive',
          action: (
            <button 
              onClick={() => navigate(`/login?email=${encodeURIComponent(formData.email)}`)}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Login Now
            </button>
          ),
        });
      } else if (error.message.includes('User already exists')) {
        setEmailStatus('taken');
        toast({
          title: 'Account Already Exists',
          description: 'An account with this email already exists. Please login or use a different email.',
          variant: 'destructive',
          action: (
            <button 
              onClick={() => navigate(`/login?email=${encodeURIComponent(formData.email)}`)}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Login Now
            </button>
          ),
        });
      } else {
        toast({
          title: 'Registration Failed',
          description: error.message || 'Please check your information and try again.',
          variant: 'destructive',
        });
      }
    }
  };

  const strengthScore = Object.values(passwordStrength).filter(v => v).length;
  const strengthColor = strengthScore >= 4 ? 'bg-green-500' : 
                       strengthScore >= 3 ? 'bg-yellow-500' : 
                       strengthScore >= 2 ? 'bg-orange-500' : 'bg-red-500';

  const isFormValid = () => {
    return (
      formData.name.trim().length >= 2 &&
      formData.email.includes('@') &&
      formData.email.includes('.') &&
      formData.password.length >= 6 &&
      formData.password === formData.confirmPassword &&
      emailStatus !== 'taken' &&
      strengthScore >= 3
    );
  };

  return (
    <>
      <Helmet>
        <title>Register - Damodar Traders</title>
        <meta name="description" content="Create your Damodar Traders account" />
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
            <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
            <p className="text-gray-600 mt-2">Register for a new account</p>
          </div>

          {searchParams.get('email') && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-blue-600" />
                <div>
                  <h3 className="font-medium text-blue-900">Email Pre-filled</h3>
                  <p className="text-sm text-blue-700">
                    You're registering with: <span className="font-semibold">{searchParams.get('email')}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Name Field */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter your full name"
                  />
                </div>
                {formData.name && formData.name.trim().length < 2 && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Please enter a valid name
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address *
                  </label>
                  {formData.email && (
                    <button
                      type="button"
                      onClick={() => checkEmailAvailability(formData.email)}
                      disabled={isCheckingEmail}
                      className="text-xs text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                    >
                      {isCheckingEmail ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" />
                          Checking...
                        </>
                      ) : (
                        'Check Availability'
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
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:border-blue-500 outline-none transition-all ${
                      emailStatus === 'taken' 
                        ? 'border-red-300 focus:ring-red-500' 
                        : emailStatus === 'available'
                        ? 'border-green-300 focus:ring-green-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Enter your email"
                  />
                </div>
                
                {/* Email Status */}
                {emailStatus && (
                  <div className={`mt-2 p-2 rounded-lg flex items-center gap-2 text-sm ${
                    emailStatus === 'checking'
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : emailStatus === 'available'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {emailStatus === 'checking' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Checking email availability...
                      </>
                    ) : emailStatus === 'available' ? (
                      <>
                        <Check className="w-4 h-4" />
                        Email is available for registration
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4" />
                        Email already registered. Please login instead.
                      </>
                    )}
                  </div>
                )}
                
                {formData.email && !formData.email.includes('@') && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Please enter a valid email address
                  </p>
                )}
              </div>

              {/* Phone Field */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    placeholder="Enter your phone number"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
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
                    placeholder="Create a password"
                  />
                </div>
                
                {/* Password Strength Meter */}
                {formData.password && (
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-700">Password Strength</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded ${strengthColor} text-white`}>
                        {strengthScore >= 4 ? 'Strong' : 
                         strengthScore >= 3 ? 'Good' : 
                         strengthScore >= 2 ? 'Fair' : 'Weak'}
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${strengthScore * 20}%` }}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {[
                        { key: 'length', label: 'At least 6 characters' },
                        { key: 'uppercase', label: 'Uppercase letter' },
                        { key: 'lowercase', label: 'Lowercase letter' },
                        { key: 'number', label: 'Number' },
                        { key: 'special', label: 'Special character' },
                      ].map((req) => (
                        <div key={req.key} className="flex items-center gap-2">
                          {passwordStrength[req.key as keyof typeof passwordStrength] ? (
                            <Check className="w-4 h-4 text-green-500" />
                          ) : (
                            <X className="w-4 h-4 text-gray-400" />
                          )}
                          <span className={`text-xs ${passwordStrength[req.key as keyof typeof passwordStrength] ? 'text-green-600 font-medium' : 'text-gray-500'}`}>
                            {req.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {formData.password && formData.password.length < 6 && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Password must be at least 6 characters
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                      formData.confirmPassword && formData.password !== formData.confirmPassword
                        ? 'border-red-300 ring-red-200'
                        : 'border-gray-300'
                    }`}
                    placeholder="Confirm your password"
                  />
                </div>
                {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <X className="w-4 h-4" />
                    Passwords do not match
                  </p>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={authLoading || !isFormValid() || emailStatus === 'taken'}
                className={`w-full py-3 text-white font-medium rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  emailStatus === 'taken'
                    ? 'bg-gradient-to-r from-red-600 to-pink-600'
                    : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                }`}
              >
                {authLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating Account...
                  </div>
                ) : emailStatus === 'taken' ? (
                  <>
                    <X className="w-5 h-5" />
                    Email Already Registered
                  </>
                ) : (
                  <>
                    <User className="w-5 h-5" />
                    Create Account
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Already have account section */}
          <div className="mt-8 p-4 bg-gradient-to-r from-gray-50 to-white rounded-xl border border-gray-200">
            <p className="text-center text-gray-600 mb-4">
              Already have an account?
            </p>
            <div className="flex flex-col gap-3">
              <Link
                to="/login"
                className="w-full py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 text-center flex items-center justify-center gap-2"
              >
                <Lock className="w-5 h-5" />
                Login to Existing Account
              </Link>
              
              {formData.email && emailStatus !== 'taken' && (
                <button
                  onClick={async () => {
                    if (!formData.email.includes('@')) {
                      toast({
                        title: 'Invalid Email',
                        description: 'Please enter a valid email address first.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    
                    setIsCheckingEmail(true);
                    try {
                      const exists = await checkEmailExists(formData.email);
                      if (exists) {
                        toast({
                          title: 'Account Exists',
                          description: 'An account already exists with this email. Redirecting to login...',
                          className: 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0',
                        });
                        navigate(`/login?email=${encodeURIComponent(formData.email)}`);
                      } else {
                        toast({
                          title: 'No Account Found',
                          description: 'No account found with this email. You can continue registration.',
                          className: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0',
                        });
                        setEmailStatus('available');
                      }
                    } catch (error) {
                      console.error('Error checking email:', error);
                    } finally {
                      setIsCheckingEmail(false);
                    }
                  }}
                  disabled={isCheckingEmail}
                  className="w-full py-2 text-blue-600 font-medium hover:text-blue-800 transition-colors text-sm flex items-center justify-center gap-2"
                >
                  {isCheckingEmail ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Checking account...
                    </>
                  ) : (
                    'Check if account already exists'
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Form Validation Summary */}
          {!isFormValid() && (
            <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <h3 className="font-medium text-amber-900 mb-2 flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Complete these requirements:
              </h3>
              <ul className="text-sm text-amber-800 space-y-1">
                {formData.name.trim().length < 2 && (
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Enter a valid name (minimum 2 characters)
                  </li>
                )}
                {(!formData.email.includes('@') || !formData.email.includes('.')) && (
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Enter a valid email address
                  </li>
                )}
                {emailStatus === 'taken' && (
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Email is already registered
                  </li>
                )}
                {formData.password.length < 6 && (
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Password must be at least 6 characters
                  </li>
                )}
                {strengthScore < 3 && formData.password.length >= 6 && (
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Password must be stronger (include uppercase, lowercase, and numbers)
                  </li>
                )}
                {formData.password !== formData.confirmPassword && (
                  <li className="flex items-center gap-2">
                    <X className="w-4 h-4" />
                    Passwords must match
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Terms and Privacy */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our{' '}
              <Link to="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
              {' '}and{' '}
              <Link to="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Register;