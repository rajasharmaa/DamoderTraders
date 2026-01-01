// pages/Contact.tsx
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Clock, Send, User, MessageSquare,
  Building, Globe, Headphones, CheckCircle, ArrowRight,
  Facebook, Twitter, Instagram, Linkedin, Sparkles, Lock
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import IndustrialBackground from '@/components/IndustrialBackground';
import { Link, useNavigate } from 'react-router-dom';

const Contact = () => {
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  // Prefill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
      }));
    }
  }, [user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if user is logged in
    if (!user) {
      toast({
        title: 'Login Required',
        description: 'Please login to send messages or inquiries',
        variant: 'destructive',
      });
      navigate('/login');
      return;
    }
    
    setIsSubmitting(true);

    try {
      const inquiryData = {
        ...formData,
        userId: user?.id || null,
      };
      
      await api.inquiries.create(inquiryData);
      toast({
        title: '🎉 Message Sent Successfully!',
        description: 'Thank you for reaching out! Our team will contact you within 24 hours.',
        className: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0',
      });
      setFormData({ 
        name: user?.name || '', 
        email: user?.email || '', 
        phone: user?.phone || '', 
        subject: '', 
        message: '' 
      });
    } catch (error: any) {
      toast({
        title: '⚠️ Submission Failed',
        description: error.message || 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactCards = [
    {
      icon: MapPin,
      title: 'Visit Our Office',
      content: '1st floor, 37 Ellora plaza, 3, Maharani Rd, Indore, Madhya Pradesh 452007',
      gradient: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      action: 'Get Directions',
      link: 'https://maps.google.com/?q=Damodar+Traders+Indore'
    },
    {
      icon: Phone,
      title: 'Call Us',
      content: '+91 98765 43210\n+91 22 1234 5678',
      gradient: 'from-purple-500 to-pink-500',
      bg: 'bg-purple-50',
      action: 'Call Now',
      link: 'tel:+919876543210'
    },
    {
      icon: Mail,
      title: 'Email Us',
      content: 'info@damodartraders.com\nsales@damodartraders.com',
      gradient: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      action: 'Send Email',
      link: 'mailto:info@damodartraders.com'
    },
    {
      icon: Clock,
      title: 'Business Hours',
      content: 'Mon-Fri: 9:00 AM - 6:00 PM\nSaturday: 10:00 AM - 4:00 PM',
      gradient: 'from-emerald-500 to-green-500',
      bg: 'bg-emerald-50',
      action: 'View Details',
      link: '#hours'
    },
  ];

  const socialLinks = [
    { icon: Facebook, label: 'Facebook', href: '#', color: 'hover:bg-blue-600' },
    { icon: Twitter, label: 'Twitter', href: '#', color: 'hover:bg-sky-500' },
    { icon: Instagram, label: 'Instagram', href: '#', color: 'hover:bg-pink-600' },
    { icon: Linkedin, label: 'LinkedIn', href: '#', color: 'hover:bg-blue-700' },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - Damodar Traders | Get in Touch</title>
        <meta
          name="description"
          content="Contact Damodar Traders for inquiries, quotes, or any assistance. Located in Indore, MP. Call +91 98765 43210 or email info@damodartraders.com"
        />
      </Helmet>

      <IndustrialBackground />
      <Navbar />

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-24 pb-20 lg:py-32">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl"></div>
          </div>
          
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full mb-6">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">We're Here to Help</span>
              </div>
              
              <h1 className="text-4xl md:text-6xl font-bold mb-6">
                Let's <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Connect</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto mb-10">
                Have questions or ready to place an order? Our team is here to assist you 
                with exceptional service and expert guidance.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="tel:+919876543210"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-300 flex items-center gap-2 group"
                >
                  <Phone className="w-5 h-5" />
                  Call Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </a>
                <a 
                  href="#contact-form"
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm rounded-lg font-semibold hover:bg-white/20 transition-all duration-300 flex items-center gap-2"
                >
                  <MessageSquare className="w-5 h-5" />
                  Send Message
                </a>
              </div>

              {/* Login Notice for Non-logged in Users */}
              {!user && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="mt-6 inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 backdrop-blur-sm rounded-full border border-amber-500/30"
                >
                  <Lock className="w-4 h-4 text-amber-300" />
                  <span className="text-sm text-amber-200">Login required to send messages</span>
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>

        {/* Contact Cards */}
        <section className="py-16 bg-gradient-to-b from-white to-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Multiple Ways to <span className="text-blue-600">Connect</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Choose your preferred method to get in touch with our team
              </p>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {contactCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`${card.bg} p-6 rounded-2xl border border-gray-200 hover:border-transparent hover:shadow-xl transition-all duration-300 group`}
                >
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${card.gradient} mb-4`}>
                    <card.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{card.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 whitespace-pre-line">{card.content}</p>
                  <a 
                    href={card.link}
                    className="inline-flex items-center gap-1 text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors"
                  >
                    {card.action}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </a>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Form Section */}
        <section id="contact-form" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12">
              {/* Form Column */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
              >
                <div className="relative bg-gradient-to-br from-gray-50 to-white rounded-3xl p-8 shadow-2xl border border-gray-100">
                  <div className="absolute -top-6 -left-6 w-24 h-24 bg-blue-500/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                      <MessageSquare className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold text-gray-900">Send Us a Message</h2>
                      <p className="text-gray-600">We typically respond within 2 hours</p>
                    </div>
                  </div>

                  {/* Login Requirement Notice */}
                  {!user && (
                    <div className="mb-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl border border-amber-200">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-amber-600" />
                        <div>
                          <div className="font-bold text-amber-800">Login Required</div>
                          <div className="text-sm text-amber-700">
                            Please login to send messages, inquiries, or request quotes.
                          </div>
                        </div>
                        <Link
                          to="/login"
                          className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium hover:from-amber-700 hover:to-orange-700 transition-all text-sm"
                        >
                          Login Now
                        </Link>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <User className="w-4 h-4" />
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={!user}
                          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                            !user ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                          }`}
                          placeholder="John Doe"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Mail className="w-4 h-4" />
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          disabled={!user}
                          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                            !user ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                          }`}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Phone className="w-4 h-4" />
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          required
                          disabled={!user}
                          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                            !user ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                          }`}
                          placeholder="+91 98765 43210"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                          <Headphones className="w-4 h-4" />
                          Subject *
                        </label>
                        <select
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                          disabled={!user}
                          className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all appearance-none ${
                            !user ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                          }`}
                        >
                          <option value="">Select a subject</option>
                          <option value="product_inquiry">Product Inquiry</option>
                          <option value="quote_request">Quote Request</option>
                          <option value="technical_support">Technical Support</option>
                          <option value="general_question">General Question</option>
                          <option value="complaint">Complaint</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                        <MessageSquare className="w-4 h-4" />
                        Your Message *
                      </label>
                      <textarea
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        rows={5}
                        disabled={!user}
                        className={`w-full px-4 py-3 bg-white border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all resize-none ${
                          !user ? 'border-gray-200 bg-gray-50 cursor-not-allowed' : 'border-gray-300'
                        }`}
                        placeholder={user ? "Tell us about your requirements..." : "Please login to send a message..."}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting || !user}
                      className={`w-full py-4 text-white font-semibold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group ${
                        user 
                          ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700'
                          : 'bg-gradient-to-r from-gray-400 to-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {!user ? (
                        <>
                          <Lock className="w-5 h-5" />
                          Login to Send Message
                        </>
                      ) : isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 group-hover:translate-y-[-2px] transition-transform" />
                          Send Message
                        </>
                      )}
                    </button>
                  </form>

                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      By submitting, you agree to our Privacy Policy
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* Info Column */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="space-y-8"
              >
                {/* Response Time Card */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-green-500 rounded-lg">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Quick Response Time</h3>
                      <p className="text-emerald-600 font-medium">Typically within 2 hours</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-gray-700">24/7 Customer Support</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-gray-700">Technical Expert Assistance</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-emerald-500" />
                      <span className="text-gray-700">Multilingual Support</span>
                    </div>
                  </div>
                </div>

                {/* Social Media */}
                <div className="bg-gradient-to-r from-gray-50 to-white rounded-2xl p-6 border border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">Connect Socially</h3>
                  <p className="text-gray-600 mb-6">Follow us for updates and industry insights</p>
                  <div className="flex gap-3">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        className={`p-3 bg-gray-100 rounded-xl ${social.color} transition-all duration-300 group`}
                        aria-label={social.label}
                      >
                        <social.icon className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" />
                      </a>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border border-blue-100">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">98%</div>
                      <div className="text-sm text-gray-600">Response Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">2h</div>
                      <div className="text-sm text-gray-600">Avg. Response</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">1500+</div>
                      <div className="text-sm text-gray-600">Happy Clients</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">12+</div>
                      <div className="text-sm text-gray-600">Years Experience</div>
                    </div>
                  </div>
                </div>

                {/* Login Card for Non-logged in Users */}
                {!user && (
                  <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg">
                        <Lock className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Account Required</h3>
                        <p className="text-amber-600 font-medium">Login to access all features</p>
                      </div>
                    </div>
                    <p className="text-gray-600 mb-4 text-sm">
                      Create an account or login to:
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-700">Send inquiries & messages</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-700">Request quotes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-700">View prices & discounts</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-sm text-gray-700">Track your orders</span>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Link
                        to="/login"
                        className="flex-1 py-2 bg-gradient-to-r from-amber-600 to-orange-600 text-white rounded-lg font-medium text-center hover:from-amber-700 hover:to-orange-700 transition-all"
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="flex-1 py-2 bg-gray-900 text-white rounded-lg font-medium text-center hover:bg-gray-800 transition-all"
                      >
                        Register
                      </Link>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Map & Location */}
        <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Find Our <span className="text-blue-600">Location</span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Visit our office or warehouse to see our products firsthand
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-3 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-2xl"
              >
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3679.223583988378!2d75.8641808!3d22.7167381!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd11bc280595%3A0xffd5a99f38fa3a02!2sDamodar%20Traders!5e0!3m2!1sen!2sin!4v1646812345678!5m2!1sen!2sin"
                  width="100%"
                  height="400"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Damodar Traders Location"
                  className="w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/20 to-transparent pointer-events-none"></div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white rounded-2xl p-8 shadow-xl border border-gray-200"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg">
                    <Building className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Main Office</h3>
                    <p className="text-gray-600">Corporate Headquarters</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-blue-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Address</h4>
                      <p className="text-gray-600 text-sm">
                        1st floor, 37 Ellora plaza, 3, Maharani Rd, 
                        Indore, Madhya Pradesh 452007
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Contact</h4>
                      <p className="text-gray-600 text-sm">+91 98765 43210</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-gray-900">Email</h4>
                      <p className="text-gray-600 text-sm">info@damodartraders.com</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-2">Business Hours</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Monday - Friday</span>
                        <span className="font-medium">9:00 AM - 6:00 PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Saturday</span>
                        <span className="font-medium">10:00 AM - 4:00 PM</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Sunday</span>
                        <span className="font-medium text-red-500">Closed</span>
                      </div>
                    </div>
                  </div>
                </div>

                <a
                  href="https://maps.google.com/?q=Damodar+Traders+Indore"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 w-full py-3 bg-gradient-to-r from-gray-900 to-gray-700 text-white font-medium rounded-xl hover:from-gray-800 hover:to-gray-600 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Globe className="w-5 h-5" />
                  Open in Google Maps
                </a>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-600">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl font-bold text-white mb-6">
                Need Immediate Assistance?
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto">
                Our dedicated support team is ready to help you with any urgent inquiries 
                or technical assistance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="tel:+919876543210"
                  className="px-8 py-4 bg-white text-blue-600 rounded-lg font-bold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                >
                  <Phone className="w-5 h-5" />
                  Call Emergency Support
                </a>
                <a 
                  href="mailto:support@damodartraders.com"
                  className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg font-bold hover:bg-white/10 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  <Mail className="w-5 h-5" />
                  Email Urgent Inquiry
                </a>
              </div>
              <p className="text-blue-200 text-sm mt-6">
                📞 Emergency support available 24/7 for critical requirements
              </p>
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
};

export default Contact;